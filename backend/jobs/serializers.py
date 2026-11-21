from rest_framework import serializers
from .models import Job, Category, Skill, JobSkill, SavedJob
from matching.matcher import calculate_compatibility_score

class CategorySerializer(serializers.ModelSerializer):
    jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'order', 'jobs_count']

    def get_jobs_count(self, obj):
        return obj.jobs.filter(status='Published').count()

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'synonyms']

class JobSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSkill
        fields = ['id', 'name', 'is_required']

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    job_skills = JobSkillSerializer(many=True, read_only=True)
    match_score = serializers.SerializerMethodField()
    matching_skills = serializers.SerializerMethodField()
    missing_skills = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company_name', 'company_logo', 'category', 'category_name',
            'description', 'requirements', 'benefits', 'work_mode', 'job_type',
            'experience_level', 'location', 'salary_min', 'salary_max', 'currency',
            'status', 'is_blind', 'deadline', 'featured', 'created_at', 'updated_at',
            'job_skills', 'match_score', 'matching_skills', 'missing_skills', 'is_saved',
            'applications_count'
        ]

    def get_company_name(self, obj):
        if obj.company_name_override:
            return obj.company_name_override
        if obj.company and obj.company.company_name:
            return obj.company.company_name
        return "Innovative Tech Global"

    def get_company_logo(self, obj):
        if obj.company_logo_override:
            return obj.company_logo_override
        if obj.company and obj.company.logo_url:
            return obj.company.logo_url
        if obj.company and obj.company.logo:
            return obj.company.logo.url
        return None

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return obj.category_name or "General"

    def get_match_score(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'candidate':
            if hasattr(request.user, 'candidate_profile'):
                c_skills = request.user.candidate_profile.skills or []
                score, _, _ = calculate_compatibility_score(c_skills, obj.job_skills.all())
                return score
        return None

    def get_matching_skills(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'candidate':
            if hasattr(request.user, 'candidate_profile'):
                c_skills = request.user.candidate_profile.skills or []
                _, match, _ = calculate_compatibility_score(c_skills, obj.job_skills.all())
                return match
        return []

    def get_missing_skills(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'candidate':
            if hasattr(request.user, 'candidate_profile'):
                c_skills = request.user.candidate_profile.skills or []
                _, _, missing = calculate_compatibility_score(c_skills, obj.job_skills.all())
                return missing
        return []

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(candidate=request.user, job=obj).exists()
        return False

    def get_applications_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and (request.user == obj.recruiter or request.user.role == 'admin'):
            return obj.applications.count()
        return None
