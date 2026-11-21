from rest_framework import serializers
from .models import FAQ, AuditLog
from accounts.models import User

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'actor_email', 'action', 'target_model', 'target_id', 'details', 'ip_address', 'timestamp']
