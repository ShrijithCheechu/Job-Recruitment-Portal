from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import FAQ, AuditLog
from .serializers import FAQSerializer, AuditLogSerializer
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview

User = get_user_model()

class PublicFAQListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        faqs = FAQ.objects.filter(is_active=True).order_by('order')
        return Response(FAQSerializer(faqs, many=True).data)

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        total_users = User.objects.count()
        candidates_count = User.objects.filter(role='candidate').count()
        recruiters_count = User.objects.filter(role='recruiter').count()
        jobs_count = Job.objects.count()
        active_jobs = Job.objects.filter(status='Published').count()
        applications_count = Application.objects.count()
        interviews_count = Interview.objects.count()

        return Response({
            'total_users': total_users,
            'candidates_count': candidates_count,
            'recruiters_count': recruiters_count,
            'jobs_count': jobs_count,
            'active_jobs': active_jobs,
            'applications_count': applications_count,
            'interviews_count': interviews_count
        })

class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all().order_by('-date_joined')
        data = [{
            'id': u.id,
            'email': u.email,
            'role': u.role,
            'is_active': u.is_active,
            'is_verified': u.is_verified,
            'date_joined': u.date_joined
        } for u in users]
        return Response(data)

    def post(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            target_user = User.objects.get(pk=pk)
            target_user.is_active = not target_user.is_active
            target_user.save()
            return Response({'is_active': target_user.is_active, 'message': f"User status updated to {'active' if target_user.is_active else 'suspended'}."})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

class AdminAuditLogsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        logs = AuditLog.objects.all().order_by('-timestamp')[:100]
        return Response(AuditLogSerializer(logs, many=True).data)
