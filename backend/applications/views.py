from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Application, ApplicationStatusHistory, IdentityRevealLog
from .serializers import ApplicationSerializer
from jobs.models import Job
from profiles.models import Resume, CandidateProfile
from matching.matcher import calculate_compatibility_score
from notifications.models import Notification
from adminpanel.models import AuditLog

class ApplyToJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        if request.user.role != 'candidate':
            return Response({'error': 'Only candidates can apply to jobs.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            job = Job.objects.get(id=job_id, status='Published')
        except Job.DoesNotExist:
            return Response({'error': 'Job not found or no longer accepting applications.'}, status=status.HTTP_404_NOT_FOUND)

        if Application.objects.filter(job=job, candidate=request.user).exists():
            return Response({'error': 'You have already applied for this job.'}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        resume_id = request.data.get('resume_id')
        resume = None
        if resume_id:
            resume = Resume.objects.filter(id=resume_id, candidate=profile).first()
        if not resume:
            resume = Resume.objects.filter(candidate=profile, is_default=True).first() or Resume.objects.filter(candidate=profile).first()

        candidate_skills = profile.skills or []
        if resume and resume.skills:
            candidate_skills = list(set(candidate_skills + resume.skills))

        match_score, matching_skills, missing_skills = calculate_compatibility_score(
            candidate_skills, job.job_skills.all()
        )

        cover_letter = request.data.get('cover_letter', '')

        app = Application.objects.create(
            job=job,
            candidate=request.user,
            resume=resume,
            cover_letter=cover_letter,
            status='Applied',
            match_score=match_score,
            matching_skills=matching_skills,
            missing_skills=missing_skills,
            identity_revealed=not job.is_blind # if not blind, immediately revealed
        )

        ApplicationStatusHistory.objects.create(
            application=app,
            old_status='None',
            new_status='Applied',
            changed_by=request.user,
            comment='Application submitted successfully.'
        )

        # Notify recruiter
        Notification.objects.create(
            user=job.recruiter,
            title='New Application Received',
            message=f"A new candidate applied for {job.title} with a {match_score}% compatibility match.",
            notification_type='application',
            link=f"/recruiter/jobs/{job.id}"
        )

        # Notify candidate
        Notification.objects.create(
            user=request.user,
            title='Application Sent',
            message=f"You successfully applied for {job.title} at {job.company_name_override or 'Company'}.",
            notification_type='application',
            link="/candidate/applications"
        )

        return Response(ApplicationSerializer(app, context={'request': request}).data, status=status.HTTP_201_CREATED)

class CandidateApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'candidate':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        apps = Application.objects.filter(candidate=request.user).select_related('job').order_by('-applied_at')
        return Response(ApplicationSerializer(apps, many=True, context={'request': request}).data)

class JobApplicationsPipelineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if job.recruiter != request.user and request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        status_filter = request.GET.get('status', '').strip()
        apps = Application.objects.filter(job=job).select_related('candidate', 'resume')
        if status_filter:
            apps = apps.filter(status=status_filter)

        apps = apps.order_by('-match_score', '-applied_at')
        return Response(ApplicationSerializer(apps, many=True, context={'request': request}).data)

class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        if app.job.recruiter != request.user and request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        comment = request.data.get('comment', '')
        rating = request.data.get('rating')
        notes = request.data.get('notes')

        if rating is not None:
            app.recruiter_rating = rating
        if notes is not None:
            app.recruiter_notes = notes

        if new_status and new_status != app.status:
            old_status = app.status
            app.status = new_status

            # If moved to Shortlisted, automatically reveal candidate per BLD-06
            if new_status == 'Shortlisted' and not app.identity_revealed:
                app.identity_revealed = True
                app.revealed_at = timezone.now()
                app.revealed_by = request.user
                IdentityRevealLog.objects.create(
                    application=app,
                    revealed_by=request.user,
                    reason=f"Candidate shortlisted for {app.job.title}."
                )

            app.save()

            ApplicationStatusHistory.objects.create(
                application=app,
                old_status=old_status,
                new_status=new_status,
                changed_by=request.user,
                comment=comment or f"Status updated to {new_status}"
            )

            # Notify candidate
            Notification.objects.create(
                user=app.candidate,
                title='Application Status Update',
                message=f"Your application for {app.job.title} has moved to '{new_status}'.",
                notification_type='status',
                link="/candidate/applications"
            )

        app.save()
        return Response(ApplicationSerializer(app, context={'request': request}).data)

class RevealCandidateIdentityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        if app.job.recruiter != request.user and request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('reason', 'Shortlisted for interview and detailed screening.')
        app.identity_revealed = True
        app.revealed_at = timezone.now()
        app.revealed_by = request.user
        app.save()

        IdentityRevealLog.objects.create(
            application=app,
            revealed_by=request.user,
            reason=reason
        )

        AuditLog.objects.create(
            actor=request.user,
            action="Revealed Blind Candidate Identity",
            target_model="Application",
            target_id=str(app.id),
            details={"candidate_email": app.candidate.email, "job": app.job.title}
        )

        Notification.objects.create(
            user=app.candidate,
            title='Identity Revealed for Review',
            message=f"The hiring team for {app.job.title} liked your skills and unlocked your full profile!",
            notification_type='reveal',
            link="/candidate/applications"
        )

        return Response({
            'message': 'Candidate identity revealed successfully.',
            'application': ApplicationSerializer(app, context={'request': request}).data
        })

class WithdrawApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            app = Application.objects.get(pk=pk, candidate=request.user)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        if app.status in ['Offered', 'Hired', 'Withdrawn']:
            return Response({'error': f'Cannot withdraw application in status {app.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = app.status
        app.status = 'Withdrawn'
        app.save()

        ApplicationStatusHistory.objects.create(
            application=app,
            old_status=old_status,
            new_status='Withdrawn',
            changed_by=request.user,
            comment='Application withdrawn by candidate.'
        )

        return Response({'message': 'Application withdrawn successfully.'})
