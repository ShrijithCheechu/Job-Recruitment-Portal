from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import Job, Category, Skill, JobSkill, SavedJob
from .serializers import JobSerializer, CategorySerializer, SkillSerializer
from profiles.models import RecruiterProfile
from adminpanel.models import AuditLog

class JobListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        category_slug = request.GET.get('category', '').strip()
        work_mode = request.GET.get('work_mode', '').strip()
        job_type = request.GET.get('job_type', '').strip()
        featured = request.GET.get('featured', '').strip()

        jobs = Job.objects.filter(status='Published')

        if query:
            jobs = jobs.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(company_name_override__icontains=query) |
                Q(location__icontains=query) |
                Q(job_skills__name__icontains=query)
            ).distinct()

        if category_slug and category_slug != 'all' and category_slug != 'featured':
            jobs = jobs.filter(category__slug=category_slug)

        if featured == 'true' or category_slug == 'featured':
            jobs = jobs.filter(featured=True)

        if work_mode:
            jobs = jobs.filter(work_mode__iexact=work_mode)

        if job_type:
            jobs = jobs.filter(job_type__iexact=job_type)

        jobs = jobs.order_by('-featured', '-created_at')
        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'recruiter' and request.user.role != 'admin':
            return Response({'error': 'Only recruiters can post jobs.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        title = data.get('title')
        description = data.get('description')
        if not title or not description:
            return Response({'error': 'Title and description are required.'}, status=status.HTTP_400_BAD_REQUEST)

        recruiter_profile = getattr(request.user, 'recruiter_profile', None)
        category_id = data.get('category_id')
        category = Category.objects.filter(id=category_id).first() if category_id else None

        job = Job.objects.create(
            recruiter=request.user,
            company=recruiter_profile,
            company_name_override=data.get('company_name', recruiter_profile.company_name if recruiter_profile else ''),
            company_logo_override=data.get('company_logo', ''),
            title=title,
            category=category,
            category_name=category.name if category else data.get('category_name', 'Tech'),
            description=description,
            requirements=data.get('requirements', ''),
            benefits=data.get('benefits', ''),
            work_mode=data.get('work_mode', 'Remote'),
            job_type=data.get('job_type', 'Full-time'),
            experience_level=data.get('experience_level', 'Mid Level'),
            location=data.get('location', 'Lalitpur, Nepal'),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            is_blind=data.get('is_blind', True),
            featured=data.get('featured', False),
            deadline=data.get('deadline'),
            status='Published'
        )

        skills_data = data.get('skills', [])
        for s in skills_data:
            skill_name = s.get('name') if isinstance(s, dict) else str(s)
            is_required = s.get('is_required', True) if isinstance(s, dict) else True
            if skill_name:
                JobSkill.objects.create(job=job, name=skill_name.strip(), is_required=is_required)

        AuditLog.objects.create(
            actor=request.user,
            action="Created Job Posting",
            target_model="Job",
            target_id=str(job.id),
            details={"title": job.title}
        )

        return Response(JobSerializer(job, context={'request': request}).data, status=status.HTTP_201_CREATED)

class JobDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(JobSerializer(job, context={'request': request}).data)

    def put(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if job.recruiter != request.user and request.user.role != 'admin':
            return Response({'error': 'Unauthorized to edit this job.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        job.title = data.get('title', job.title)
        job.description = data.get('description', job.description)
        job.requirements = data.get('requirements', job.requirements)
        job.work_mode = data.get('work_mode', job.work_mode)
        job.job_type = data.get('job_type', job.job_type)
        job.location = data.get('location', job.location)
        job.status = data.get('status', job.status)
        job.is_blind = data.get('is_blind', job.is_blind)
        job.save()

        if 'skills' in data:
            job.job_skills.all().delete()
            for s in data['skills']:
                skill_name = s.get('name') if isinstance(s, dict) else str(s)
                is_req = s.get('is_required', True) if isinstance(s, dict) else True
                JobSkill.objects.create(job=job, name=skill_name.strip(), is_required=is_req)

        return Response(JobSerializer(job, context={'request': request}).data)

    def delete(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if job.recruiter != request.user and request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        job.status = 'Closed'
        job.save()
        return Response({'message': 'Job successfully closed/archived.'})

class SaveJobToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        saved = SavedJob.objects.filter(candidate=request.user, job=job).first()
        if saved:
            saved.delete()
            return Response({'saved': False, 'message': 'Job removed from saved list.'})
        else:
            SavedJob.objects.create(candidate=request.user, job=job)
            return Response({'saved': True, 'message': 'Job saved successfully!'})

class CandidateSavedJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        saved = SavedJob.objects.filter(candidate=request.user).select_related('job')
        jobs = [s.job for s in saved if s.job.status == 'Published']
        return Response(JobSerializer(jobs, many=True, context={'request': request}).data)

class RecruiterJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'recruiter' and request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        jobs = Job.objects.filter(recruiter=request.user).order_by('-created_at')
        return Response(JobSerializer(jobs, many=True, context={'request': request}).data)

class PublicCategoriesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all().order_by('order')
        return Response(CategorySerializer(categories, many=True).data)

class PublicFeaturedJobsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        jobs = Job.objects.filter(status='Published', featured=True).order_by('-created_at')[:8]
        if not jobs.exists():
            jobs = Job.objects.filter(status='Published').order_by('-created_at')[:8]
        return Response(JobSerializer(jobs, many=True, context={'request': request}).data)
