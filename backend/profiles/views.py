from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CandidateProfile, RecruiterProfile, Resume, Experience, Education, PortfolioItem
from .serializers import (
    CandidateProfileSerializer, RecruiterProfileSerializer,
    ResumeSerializer, ExperienceSerializer, EducationSerializer, PortfolioItemSerializer
)
from matching.matcher import extract_text_from_pdf, extract_skills_from_text, redact_text_for_blind_hiring

class CandidateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'candidate':
            return Response({'error': 'Candidate profile not found.'}, status=status.HTTP_403_FORBIDDEN)
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        return Response(CandidateProfileSerializer(profile).data)

    def put(self, request):
        if request.user.role != 'candidate':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'candidate':
            return Response({'error': 'Only candidates can upload resumes.'}, status=status.HTTP_403_FORBIDDEN)

        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        file = request.FILES.get('file')
        title = request.data.get('title', 'My Resume.pdf')
        raw_text = request.data.get('raw_text', '')

        extracted_text = ""
        if file:
            extracted_text = extract_text_from_pdf(file)
        elif raw_text:
            extracted_text = raw_text

        # Detect skills from extracted text
        extracted_skills = extract_skills_from_text(extracted_text)

        # Merge new skills with candidate profile
        current_skills = set(profile.skills or [])
        current_skills.update(extracted_skills)
        profile.skills = sorted(list(current_skills))
        profile.save()

        # Set others to not default if this is marked or first
        is_default = request.data.get('is_default', 'true') == 'true'
        if is_default:
            Resume.objects.filter(candidate=profile).update(is_default=False)

        resume = Resume.objects.create(
            candidate=profile,
            title=title,
            file=file if file else None,
            extracted_text=extracted_text,
            skills=extracted_skills,
            is_default=is_default
        )

        return Response({
            'message': f'Resume uploaded and parsed successfully! Identified {len(extracted_skills)} skills.',
            'resume': ResumeSerializer(resume).data,
            'extracted_skills': extracted_skills,
            'profile_skills': profile.skills
        }, status=status.HTTP_201_CREATED)

class CandidateResumesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'candidate':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        resumes = Resume.objects.filter(candidate=profile).order_by('-uploaded_at')
        return Response(ResumeSerializer(resumes, many=True).data)

class RecruiterProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'recruiter':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        profile, _ = RecruiterProfile.objects.get_or_create(
            user=request.user,
            defaults={'company_name': f"{request.user.email.split('@')[0]} Company"}
        )
        return Response(RecruiterProfileSerializer(profile).data)

    def put(self, request):
        if request.user.role != 'recruiter':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TalentDiscoveryView(APIView):
    """Candidate discovery for recruiters with blind-mode anonymization."""
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.GET.get('q', '').lower().strip()
        skill_filter = request.GET.get('skill', '').lower().strip()
        category = request.GET.get('category', '').lower().strip()

        candidates = CandidateProfile.objects.filter(is_discoverable=True)

        talent_list = []
        is_recruiter = request.user.is_authenticated and request.user.role == 'recruiter'

        for c in candidates:
            c_skills = c.skills or []
            if query:
                match_query = (
                    query in (c.headline or '').lower() or
                    query in (c.bio or '').lower() or
                    any(query in s.lower() for s in c_skills)
                )
                if not match_query:
                    continue

            if skill_filter and not any(skill_filter in s.lower() for s in c_skills):
                continue

            # Anonymized or public representation
            hex_id = hex(hash(c.id) & 0xFFFF)[2:].upper()
            talent_list.append({
                'id': c.id,
                'anonymous_name': f"Candidate #{hex_id}",
                'full_name': c.full_name if is_recruiter else f"Professional #{hex_id}",
                'headline': c.headline or 'Experienced Professional',
                'bio': c.bio or 'Specialized in building modern, scalable software solutions.',
                'location': c.location or 'Remote',
                'skills': c_skills,
                'avatar': c.avatar.url if (c.avatar and is_recruiter) else None,
                'experiences_count': c.experiences.count(),
                'portfolio_count': c.portfolio_items.count()
            })

        return Response(talent_list)
