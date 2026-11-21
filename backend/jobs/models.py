from django.db import models
from django.conf import settings
from profiles.models import RecruiterProfile

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='Briefcase')
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    synonyms = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name

class Job(models.Model):
    WORK_MODE_CHOICES = (
        ('Remote', 'Remote'),
        ('Hybrid', 'Hybrid'),
        ('On-site', 'On-site'),
    )
    JOB_TYPE_CHOICES = (
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Internship', 'Internship'),
    )
    EXP_LEVEL_CHOICES = (
        ('Entry Level', 'Entry Level'),
        ('Mid Level', 'Mid Level'),
        ('Senior Level', 'Senior Level'),
        ('Lead / Principal', 'Lead / Principal'),
    )
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Closed', 'Closed'),
    )

    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')
    company = models.ForeignKey(RecruiterProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    company_name_override = models.CharField(max_length=150, blank=True)
    company_logo_override = models.CharField(max_length=500, blank=True)
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    category_name = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, default='Remote')
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='Full-time')
    experience_level = models.CharField(max_length=50, choices=EXP_LEVEL_CHOICES, default='Mid Level')
    location = models.CharField(max_length=150, default='Lalitpur, Nepal')
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Published')
    is_blind = models.BooleanField(default=True)
    deadline = models.DateField(null=True, blank=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} at {self.company.company_name if self.company else self.company_name_override}"

class JobSkill(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_skills')
    name = models.CharField(max_length=100)
    is_required = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({'Required' if self.is_required else 'Preferred'}) for {self.job.title}"

class SavedJob(models.Model):
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'job')
