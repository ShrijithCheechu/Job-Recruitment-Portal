from django.db import models
from django.conf import settings
from jobs.models import Job
from profiles.models import Resume

class Application(models.Model):
    STATUS_CHOICES = (
        ('Applied', 'Applied'),
        ('Under Review', 'Under Review'),
        ('Shortlisted', 'Shortlisted'),
        ('Interview Scheduled', 'Interview Scheduled'),
        ('Offered', 'Offered'),
        ('Hired', 'Hired'),
        ('Rejected', 'Rejected'),
        ('Withdrawn', 'Withdrawn'),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True)
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Applied')
    match_score = models.FloatField(default=0.0)
    matching_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    
    # Blind hiring
    anonymous_code = models.CharField(max_length=20, blank=True)
    identity_revealed = models.BooleanField(default=False)
    revealed_at = models.DateTimeField(null=True, blank=True)
    revealed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='revealed_applications'
    )
    
    # Recruiter notes & evaluation
    recruiter_notes = models.TextField(blank=True)
    recruiter_rating = models.IntegerField(null=True, blank=True)
    
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'candidate')

    def save(self, *args, **kwargs):
        if not self.anonymous_code:
            import random
            hex_part = hex(random.randint(4096, 65535))[2:].upper()
            self.anonymous_code = f"Candidate #{hex_part}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.candidate.email} -> {self.job.title} ({self.status})"

class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=30)
    new_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class IdentityRevealLog(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='reveal_logs')
    revealed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    revealed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
