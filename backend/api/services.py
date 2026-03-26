from django.contrib.auth.models import User
from django.db import transaction
from .models import UserProfile, PatientProfile, DoctorProfile, Role

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