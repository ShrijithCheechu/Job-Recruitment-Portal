from rest_framework import serializers
from .models import Interview

class InterviewSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company_name_override', read_only=True)
    candidate_name = serializers.SerializerMethodField()
    recruiter_name = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'job', 'job_title', 'company_name',
            'scheduled_at', 'duration_minutes', 'mode', 'meeting_link',
            'notes', 'status', 'reschedule_reason', 'created_at',
            'candidate_name', 'recruiter_name'
        ]

    def get_candidate_name(self, obj):
        cp = getattr(obj.candidate, 'candidate_profile', None)
        return cp.full_name if (cp and cp.full_name) else obj.candidate.email

    def get_recruiter_name(self, obj):
        rp = getattr(obj.recruiter, 'recruiter_profile', None)
        return rp.company_name if (rp and rp.company_name) else obj.recruiter.email
