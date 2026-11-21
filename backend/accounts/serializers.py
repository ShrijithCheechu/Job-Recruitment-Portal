from rest_framework import serializers
from django.contrib.auth import get_user_model
from profiles.models import CandidateProfile, RecruiterProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    candidate_profile = serializers.SerializerMethodField()
    recruiter_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'is_verified', 'created_at', 'candidate_profile', 'recruiter_profile']
        read_only_fields = ['id', 'created_at']

    def get_candidate_profile(self, obj):
        if obj.role == 'candidate' and hasattr(obj, 'candidate_profile'):
            cp = obj.candidate_profile
            return {
                'id': cp.id,
                'full_name': cp.full_name,
                'headline': cp.headline,
                'bio': cp.bio,
                'location': cp.location,
                'skills': cp.skills,
                'is_discoverable': cp.is_discoverable,
                'avatar': cp.avatar.url if cp.avatar else None,
            }
        return None

    def get_recruiter_profile(self, obj):
        if obj.role == 'recruiter' and hasattr(obj, 'recruiter_profile'):
            rp = obj.recruiter_profile
            return {
                'id': rp.id,
                'company_name': rp.company_name,
                'logo_url': rp.logo_url or (rp.logo.url if rp.logo else None),
                'website': rp.website,
                'description': rp.description,
                'location': rp.location,
                'is_approved': rp.is_approved
            }
        return None

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['candidate', 'recruiter'])
    name = serializers.CharField(max_length=150)
    company_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        role = validated_data['role']
        name = validated_data['name']
        company_name = validated_data.get('company_name', '')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            role=role,
            is_verified=True
        )

        if role == 'candidate':
            CandidateProfile.objects.create(
                user=user,
                full_name=name,
                headline="Software Engineer",
                location="Lalitpur, Nepal",
                skills=["React", "JavaScript", "Python"]
            )
        elif role == 'recruiter':
            RecruiterProfile.objects.create(
                user=user,
                company_name=company_name or f"{name}'s Team",
                location="Remote / Lalitpur, Nepal",
                description="Hiring top-tier engineering and creative talent globally."
            )

        return user
