from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, PatientProfile, DoctorProfile, Document, Notification, AuditLog, Role
from rest_framework import exceptions

def register_patient(validated_data: dict) -> User:
    """
    Creates a Patient user atomically.
    Rolls back everything if any step fails —
    no orphaned User rows without a profile.

    Steps:
        1. Create Django User (auth_user table)
        2. Create UserProfile with role='patient'
        3. Create PatientProfile with health details

    Args:
        validated_data: cleaned data from PatientRegisterSerializer

    Returns:
        The newly created User instance

    Raises:
        Exception: bubbles up to the view if anything fails,
                   transaction.atomic() rolls back all 3 steps
    """
    with transaction.atomic():

        # ── Step 1: Create the base Django User ──
        user = User.objects.create_user(
            # username = email (keeps it unique, no separate username needed)
            username   = validated_data['email'],
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = validated_data['first_name'],
            last_name  = validated_data['last_name'],
        )

        # ── Step 2: Create UserProfile (role + phone) ──
        UserProfile.objects.create(
            user  = user,
            role  = Role.PATIENT,
            phone = validated_data.get('phone', ''),
        )

        # ── Step 3: Create PatientProfile (health details) ──
        PatientProfile.objects.create(
            user              = user,
            dob               = validated_data.get('dob', None),
            blood_group       = validated_data.get('blood_group', None),
            allergies         = validated_data.get('allergies', None),
            emergency_contact = validated_data.get('emergency_contact', ''),
        )

    return user


def register_doctor(validated_data: dict) -> User:
    """
    Creates a Doctor user atomically.
    Rolls back everything if any step fails.

    Steps:
        1. Create Django User (auth_user table)
        2. Create UserProfile with role='doctor'
        3. Create DoctorProfile with professional details

    Args:
        validated_data: cleaned data from DoctorRegisterSerializer

    Returns:
        The newly created User instance
    """
    with transaction.atomic():

        # ── Step 1: Create the base Django User ──
        user = User.objects.create_user(
            username   = validated_data['email'],
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = validated_data['first_name'],
            last_name  = validated_data['last_name'],
        )

        # ── Step 2: Create UserProfile (role + phone) ──
        UserProfile.objects.create(
            user  = user,
            role  = Role.DOCTOR,
            phone = validated_data.get('phone', ''),
        )

        # ── Step 3: Create DoctorProfile (professional details) ──
        DoctorProfile.objects.create(
            user           = user,
            specialization = validated_data.get('specialization', ''),
            license_number = validated_data['license_number'],
            hospital       = validated_data.get('hospital', ''),
        )

    return user

# -------------------------------------------------------------------------------
# LOGIN SERVICE
# -------------------------------------------------------------------------------

class AuthService:
    @staticmethod
    def authenticate_user(email, password):
        """
        Verifies credentials and returns a user object with tokens.
        """
        user = authenticate(username=email, password=password)
        
        if not user:
            raise exceptions.AuthenticationFailed("Invalid email or password")
            
        if not user.is_active:
            raise exceptions.PermissionDenied("User account is disabled")
            
        return user

    @staticmethod
    def get_tokens_for_user(user):
        """
        Generates JWT Access and Refresh tokens.
        """
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @staticmethod
    def get_user_payload(user):
        """
        Constructs a comprehensive user payload including role and profile data.
        """
        profile = user.userprofile
        payload = {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "role": profile.role,
            "phone": profile.phone
        }

        # Dynamically add profile-specific details
        if profile.role == 'patient' and hasattr(user, 'patient_profile'):
            p = user.patient_profile
            payload["details"] = {
                "blood_group": p.blood_group,
                "dob": p.dob
            }
        elif profile.role == 'doctor' and hasattr(user, 'doctor_profile'):
            d = user.doctor_profile
            payload["details"] = {
                "specialization": d.specialization,
                "hospital": d.hospital
            }
            
        return payload