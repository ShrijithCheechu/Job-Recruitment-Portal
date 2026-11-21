from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .auth import create_jwt_token
from adminpanel.models import AuditLog

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = create_jwt_token(user)
            AuditLog.objects.create(
                actor=user,
                action="User registered",
                target_model="User",
                target_id=str(user.id),
                details={"email": user.email, "role": user.role}
            )
            return Response({
                'token': token,
                'user': UserSerializer(user).data,
                'message': 'Account created successfully!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Please provide email and password.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user_obj.check_password(password):
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user_obj.is_active:
            return Response({'error': 'Account is suspended or deactivated.'}, status=status.HTTP_403_FORBIDDEN)

        token = create_jwt_token(user_obj)
        AuditLog.objects.create(
            actor=user_obj,
            action="User logged in",
            target_model="User",
            target_id=str(user_obj.id)
        )
        return Response({
            'token': token,
            'user': UserSerializer(user_obj).data,
            'message': 'Logged in successfully!'
        })

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
