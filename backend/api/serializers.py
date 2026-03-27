from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DoctorProfile, Document

# ──────────────────────────────────────────────────────────────
# PATIENT REGISTER SERIALIZER
# Validates all fields required to create a patient account.
# Patient-specific fields: dob, blood_group, allergies,
#                          emergency_contact
# ──────────────────────────────────────────────────────────────

class PatientRegisterSerializer(serializers.Serializer):

    # ── Core user fields ──
    first_name = serializers.CharField(max_length=100)
    last_name  = serializers.CharField(max_length=100)
    email      = serializers.EmailField()
    password   = serializers.CharField(min_length=8, write_only=True)
    phone      = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )

    # ── Patient-specific fields ──
    dob = serializers.DateField(
        required=False,
        allow_null=True
    )
    blood_group = serializers.ChoiceField(
        choices=['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required=False,
        allow_null=True
    )
    allergies = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )
    emergency_contact = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )

    def validate_email(self, value):
        """
        Reject if email is already registered.
        Stored lowercase — 'User@Gmail.com' == 'user@gmail.com'
        """
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()

    def validate_password(self, value):
        if value.isdigit():
            raise serializers.ValidationError(
                "Password cannot be entirely numeric."
            )
        if value.lower() in ['password', 'password123', '12345678']:
            raise serializers.ValidationError(
                "This password is too common."
            )
        return value


# ──────────────────────────────────────────────────────────────
# DOCTOR REGISTER SERIALIZER
# Validates all fields required to create a doctor account.
# Doctor-specific fields: specialization, license_number,
#                         hospital
# license_number is required and must be unique globally.
# ──────────────────────────────────────────────────────────────

class DoctorRegisterSerializer(serializers.Serializer):

    # ── Core user fields ──
    first_name = serializers.CharField(max_length=100)
    last_name  = serializers.CharField(max_length=100)
    email      = serializers.EmailField()
    password   = serializers.CharField(min_length=8, write_only=True)
    phone      = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )

    # ── Doctor-specific fields ──
    specialization = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )
    license_number = serializers.CharField(max_length=100)
    hospital       = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()

    def validate_password(self, value):
        if value.isdigit():
            raise serializers.ValidationError(
                "Password cannot be entirely numeric."
            )
        if value.lower() in ['password', 'password123', '12345678']:
            raise serializers.ValidationError(
                "This password is too common."
            )
        return value

    def validate_license_number(self, value):
        """
        One license number = one doctor account.
        Prevents duplicate doctor registrations.
        """
        if DoctorProfile.objects.filter(license_number=value).exists():
            raise serializers.ValidationError(
                "A doctor with this license number is already registered."
            )
        return value
    
# ----------------------------------------------------------------------------
# LOGIN SERIALIZERS
# ----------------------------------------------------------------------------

class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class UserResponseSerializer(serializers.Serializer):
    """
    Used only for documentation or structured output if needed.
    """
    id = serializers.IntegerField()
    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    details = serializers.DictField(required=False)

# ----------------------------------------------------------------------------
# Document upload serializer
# ----------------------------------------------------------------------------
import os
from rest_framework import serializers
from django.core.exceptions import ValidationError

class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Document
        fields = ['title', 'document_type', 'document_date', 'file']

    def validate_file(self, value):
        # 1. Extract the file extension
        ext = os.path.splitext(value.name)[1].lower()
        
        # 2. Define supported extensions
        valid_extensions = ['.pdf', '.png', '.jpg', '.jpeg']
        
        # 3. Check extension
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"Unsupported file extension '{ext}'. Supported types are: {', '.join(valid_extensions)}"
            )
            
        # 4. Optional: Check file size (e.g., limit to 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size too large. Maximum limit is 5MB.")
            
        return value

# ----------------------------------------------------------------------------
# CHAT SERIALIZERS
# ----------------------------------------------------------------------------
from .models import ChatSession, ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'text', 'created_at']

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'patient', 'title', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['patient']