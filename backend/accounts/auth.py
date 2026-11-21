import base64
import hashlib
import hmac
import json
import time
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def create_jwt_token(user, expires_in=86400 * 7):
    """Generate a signed HS256 JWT token valid for 7 days."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "iat": now,
        "exp": now + expires_in
    }
    
    encoded_header = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    encoded_payload = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signature_base = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
    encoded_signature = base64url_encode(signature)
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def verify_jwt_token(token_str):
    """Verify signature and expiration of JWT token."""
    parts = token_str.split('.')
    if len(parts) != 3:
        raise AuthenticationFailed('Invalid token format.')
        
    encoded_header, encoded_payload, encoded_signature = parts
    signature_base = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    expected_sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
    
    if not hmac.compare_digest(base64url_encode(expected_sig), encoded_signature):
        raise AuthenticationFailed('Token signature invalid.')
        
    try:
        payload_bytes = base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))
    except Exception:
        raise AuthenticationFailed('Could not parse token payload.')
        
    now = int(time.time())
    if payload.get('exp') and now > payload['exp']:
        raise AuthenticationFailed('Token has expired. Please log in again.')
        
    return payload

class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = get_authorization_header(request).split()
        if not auth_header:
            return None
            
        if len(auth_header) == 1:
            token = auth_header[0].decode('utf-8')
        elif len(auth_header) == 2:
            prefix = auth_header[0].decode('utf-8').lower()
            if prefix not in ('bearer', 'token'):
                return None
            token = auth_header[1].decode('utf-8')
        else:
            raise AuthenticationFailed('Invalid authorization header format.')
            
        payload = verify_jwt_token(token)
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Invalid payload.')
            
        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found or inactive.')
            
        return (user, token)
