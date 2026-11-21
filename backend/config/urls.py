from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from accounts.views import RegisterView, LoginView, CurrentUserView
from profiles.views import (
    CandidateProfileView, RecruiterProfileView, ResumeUploadView,
    CandidateResumesView, TalentDiscoveryView
)
from jobs.views import (
    JobListCreateView, JobDetailView, SaveJobToggleView,
    CandidateSavedJobsView, RecruiterJobsView,
    PublicCategoriesView, PublicFeaturedJobsView
)
from applications.views import (
    ApplyToJobView, CandidateApplicationsView, JobApplicationsPipelineView,
    UpdateApplicationStatusView, RevealCandidateIdentityView, WithdrawApplicationView
)
from interviews.views import (
    ScheduleInterviewView, InterviewListView, InterviewStatusView, InterviewIcsExportView
)
from notifications.views import (
    NotificationListView, MarkNotificationReadView, MarkAllNotificationsReadView
)
from adminpanel.views import (
    PublicFAQListView, AdminStatsView, AdminUsersView, AdminAuditLogsView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/v1/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/v1/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/v1/auth/me/', CurrentUserView.as_view(), name='auth-me'),

    # Public
    path('api/v1/public/categories/', PublicCategoriesView.as_view(), name='public-categories'),
    path('api/v1/public/featured-jobs/', PublicFeaturedJobsView.as_view(), name='public-featured-jobs'),
    path('api/v1/public/faqs/', PublicFAQListView.as_view(), name='public-faqs'),

    # Candidate
    path('api/v1/candidate/profile/', CandidateProfileView.as_view(), name='candidate-profile'),
    path('api/v1/candidate/resume/upload/', ResumeUploadView.as_view(), name='candidate-resume-upload'),
    path('api/v1/candidate/resumes/', CandidateResumesView.as_view(), name='candidate-resumes'),
    path('api/v1/candidate/applications/', CandidateApplicationsView.as_view(), name='candidate-applications'),
    path('api/v1/candidate/applications/<int:pk>/withdraw/', WithdrawApplicationView.as_view(), name='candidate-withdraw-app'),
    path('api/v1/candidate/saved-jobs/', CandidateSavedJobsView.as_view(), name='candidate-saved-jobs'),

    # Recruiter
    path('api/v1/recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('api/v1/recruiter/jobs/', RecruiterJobsView.as_view(), name='recruiter-jobs'),
    path('api/v1/recruiter/jobs/<int:job_id>/applications/', JobApplicationsPipelineView.as_view(), name='recruiter-job-apps'),
    path('api/v1/recruiter/applications/<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='recruiter-app-status'),
    path('api/v1/recruiter/applications/<int:pk>/reveal/', RevealCandidateIdentityView.as_view(), name='recruiter-reveal-identity'),
    path('api/v1/recruiter/applications/<int:app_id>/schedule-interview/', ScheduleInterviewView.as_view(), name='recruiter-schedule-interview'),
    path('api/v1/recruiter/talent/', TalentDiscoveryView.as_view(), name='recruiter-talent'),

    # Jobs
    path('api/v1/jobs/', JobListCreateView.as_view(), name='jobs-list-create'),
    path('api/v1/jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('api/v1/jobs/<int:job_id>/apply/', ApplyToJobView.as_view(), name='job-apply'),
    path('api/v1/jobs/<int:pk>/save/', SaveJobToggleView.as_view(), name='job-save-toggle'),

    # Interviews
    path('api/v1/interviews/', InterviewListView.as_view(), name='interviews-list'),
    path('api/v1/interviews/<int:pk>/status/', InterviewStatusView.as_view(), name='interview-status'),
    path('api/v1/interviews/<int:pk>/ics/', InterviewIcsExportView.as_view(), name='interview-ics'),

    # Notifications
    path('api/v1/notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('api/v1/notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
    path('api/v1/notifications/read-all/', MarkAllNotificationsReadView.as_view(), name='notifications-read-all'),

    # Admin
    path('api/v1/admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('api/v1/admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('api/v1/admin/users/<int:pk>/toggle-active/', AdminUsersView.as_view(), name='admin-user-toggle'),
    path('api/v1/admin/audit-logs/', AdminAuditLogsView.as_view(), name='admin-audit-logs'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
