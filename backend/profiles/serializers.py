from rest_framework import serializers
from .models import CandidateProfile, RecruiterProfile, Experience, Education, PortfolioItem, Resume

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ['candidate']

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ['candidate']

class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = '__all__'
        read_only_fields = ['candidate']

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'title', 'file', 'skills', 'is_default', 'uploaded_at', 'extracted_text']
        read_only_fields = ['id', 'uploaded_at']

class CandidateProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    portfolio_items = PortfolioItemSerializer(many=True, read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'email', 'full_name', 'headline', 'bio', 'location',
            'phone', 'website', 'github', 'linkedin', 'avatar',
            'is_discoverable', 'skills', 'experiences', 'educations',
            'portfolio_items', 'resumes', 'created_at', 'updated_at'
        ]

class RecruiterProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'email', 'company_name', 'logo', 'logo_url', 'website',
            'description', 'location', 'is_approved', 'created_at'
        ]
