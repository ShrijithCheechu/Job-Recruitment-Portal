from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .models import Interview
from .serializers import InterviewSerializer
from applications.models import Application, ApplicationStatusHistory
from notifications.models import Notification

class ScheduleInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, app_id):
        try:
            app = Application.objects.get(id=app_id)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        if app.job.recruiter != request.user and request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        scheduled_at = data.get('scheduled_at')
        if not scheduled_at:
            return Response({'error': 'Please provide scheduled_at datetime.'}, status=status.HTTP_400_BAD_REQUEST)

        interview = Interview.objects.create(
            application=app,
            job=app.job,
            recruiter=request.user,
            candidate=app.candidate,
            scheduled_at=scheduled_at,
            duration_minutes=data.get('duration_minutes', 45),
            mode=data.get('mode', 'Video'),
            meeting_link=data.get('meeting_link', 'https://meet.google.com/xyz-rec-portal'),
            notes=data.get('notes', '')
        )

        old_status = app.status
        app.status = 'Interview Scheduled'
        app.save()

        ApplicationStatusHistory.objects.create(
            application=app,
            old_status=old_status,
            new_status='Interview Scheduled',
            changed_by=request.user,
            comment=f"Interview scheduled for {scheduled_at} ({interview.mode})"
        )

        Notification.objects.create(
            user=app.candidate,
            title='Interview Scheduled!',
            message=f"You have been invited for an interview for {app.job.title} on {scheduled_at}.",
            notification_type='interview',
            link="/candidate/interviews"
        )

        return Response(InterviewSerializer(interview).data, status=status.HTTP_201_CREATED)

class InterviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'candidate':
            interviews = Interview.objects.filter(candidate=request.user).order_by('-scheduled_at')
        elif request.user.role == 'recruiter':
            interviews = Interview.objects.filter(recruiter=request.user).order_by('-scheduled_at')
        else:
            interviews = Interview.objects.all().order_by('-scheduled_at')
        return Response(InterviewSerializer(interviews, many=True).data)

class InterviewStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk)
        except Interview.DoesNotExist:
            return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status') # Confirmed, Rescheduled, Cancelled, Completed
        reason = request.data.get('reason', '')

        if new_status:
            interview.status = new_status
            if reason:
                interview.reschedule_reason = reason
            interview.save()

            # Notify other party
            notify_target = interview.recruiter if request.user == interview.candidate else interview.candidate
            Notification.objects.create(
                user=notify_target,
                title=f'Interview {new_status}',
                message=f"Interview for {interview.job.title} has been updated to {new_status}. {reason}",
                notification_type='interview'
            )

        return Response(InterviewSerializer(interview).data)

class InterviewIcsExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk)
        except Interview.DoesNotExist:
            return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)

        start_dt = interview.scheduled_at.strftime('%Y%m%dT%H%M%SZ')
        ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RemoteJob.io//Recruitment Portal//EN
BEGIN:VEVENT
SUMMARY:Interview for {interview.job.title}
DESCRIPTION:{interview.notes}\\nMeeting Link: {interview.meeting_link}
DTSTART:{start_dt}
DURATION:PT{interview.duration_minutes}M
LOCATION:{interview.meeting_link}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

        response = HttpResponse(ics_content, content_type='text/calendar')
        response['Content-Disposition'] = f'attachment; filename="interview-{interview.id}.ics"'
        return response
