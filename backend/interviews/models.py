from django.db import models
from django.conf import settings
from applications.models import Application
from jobs.models import Job

class Interview(models.Model):
    MODE_CHOICES = (
        ('Video', 'Video Call'),
        ('Phone', 'Phone Call'),
        ('In-person', 'In-person'),
    )
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('Confirmed', 'Confirmed'),
        ('Rescheduled', 'Rescheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='interviews')
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recruiter_interviews')
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidate_interviews')
    
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=45)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='Video')
    meeting_link = models.CharField(max_length=500, default='https://meet.google.com/xyz-rec-demo')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    reschedule_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Interview for {self.candidate.email} on {self.scheduled_at}"
