from rest_framework import serializers
from .models import Application, ApplicationStatusHistory, IdentityRevealLog
from matching.matcher import redact_text_for_blind_hiring

class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationStatusHistory
        fields = ['id', 'old_status', 'new_status', 'comment', 'created_at', 'changed_by_name']

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            if obj.changed_by.role == 'recruiter':
                return "Hiring Team"
            return obj.changed_by.email
        return "System"

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    candidate_phone = serializers.SerializerMethodField()
    candidate_avatar = serializers.SerializerMethodField()
    candidate_headline = serializers.SerializerMethodField()
    candidate_skills = serializers.SerializerMethodField()
    resume_text = serializers.SerializerMethodField()
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_title', 'company_name', 'status', 'match_score',
            'matching_skills', 'missing_skills', 'anonymous_code',
            'identity_revealed', 'revealed_at', 'recruiter_notes',
            'recruiter_rating', 'applied_at', 'updated_at',
            'candidate_name', 'candidate_email', 'candidate_phone',
            'candidate_avatar', 'candidate_headline', 'candidate_skills',
            'resume_text', 'cover_letter', 'status_history'
        ]

    def get_company_name(self, obj):
        return obj.job.company_name_override or (obj.job.company.company_name if obj.job.company else "Company")

    def is_blind_mode(self, obj):
        request = self.context.get('request')
        # If candidate is viewing their own application, no blind masking
        if request and request.user == obj.candidate:
            return False
        # If identity is already revealed or status is Shortlisted/Offered/Hired, no masking
        if obj.identity_revealed or obj.status in ['Shortlisted', 'Interview Scheduled', 'Offered', 'Hired']:
            return False
        # If job has blind hiring enabled
        return obj.job.is_blind

    def get_candidate_name(self, obj):
        if self.is_blind_mode(obj):
            return obj.anonymous_code or f"Candidate #{obj.id}"
        cp = getattr(obj.candidate, 'candidate_profile', None)
        return cp.full_name if (cp and cp.full_name) else obj.candidate.email

    def get_candidate_email(self, obj):
        if self.is_blind_mode(obj):
            return "Confidential (Revealed on Shortlist)"
        return obj.candidate.email

    def get_candidate_phone(self, obj):
        if self.is_blind_mode(obj):
            return "Confidential"
        cp = getattr(obj.candidate, 'candidate_profile', None)
        return cp.phone if cp else ""

    def get_candidate_avatar(self, obj):
        if self.is_blind_mode(obj):
            return None
        cp = getattr(obj.candidate, 'candidate_profile', None)
        return cp.avatar.url if (cp and cp.avatar) else None

    def get_candidate_headline(self, obj):
        cp = getattr(obj.candidate, 'candidate_profile', None)
        return cp.headline if cp else "Professional Candidate"

    def get_candidate_skills(self, obj):
        cp = getattr(obj.candidate, 'candidate_profile', None)
        return cp.skills if cp else []

    def get_resume_text(self, obj):
        if not obj.resume:
            return ""
        text = obj.resume.extracted_text or ""
        if self.is_blind_mode(obj):
            cp = getattr(obj.candidate, 'candidate_profile', None)
            c_name = cp.full_name if cp else None
            return redact_text_for_blind_hiring(text, candidate_name=c_name, email=obj.candidate.email)
        return text
