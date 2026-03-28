import datetime
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, PatientProfile, DoctorProfile, Document, MedicalRecord, Notification, AuditLog, Role, DocumentType
from rest_framework import exceptions
from django.core.exceptions import ValidationError

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
    

# --------------------------------------------------------------------------------
# UPLOAD DOCUMENT SERVICE 
# --------------------------------------------------------------------------------
import os
import sys
import hashlib
from pathlib import Path

# Add project root to sys.path so we can import ai
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from ai.ai import run_ai_pipeline, update_patient_rag_index, rebuild_patient_rag_index

from django.conf import settings


def _get_record_context(doc):
    """Constructs the context dict used for RAG chunking."""
    record_ctx = {
        "title": doc.title,
        "type": doc.document_type,
        "date": str(doc.document_date) if doc.document_date else "Unknown Date",
    }
    if hasattr(doc, 'medical_record'):
        record_ctx["ai_analysis"] = doc.medical_record.ai_summary
        if doc.medical_record.extracted_data:
            # ── FIX: Extract the 'tests' list instead of the whole dict ──
            raw_data = doc.medical_record.extracted_data
            if isinstance(raw_data, dict):
                record_ctx["structured_tests"] = raw_data.get("tests", [])
            else:
                record_ctx["structured_tests"] = raw_data
    return record_ctx


def _add_document_to_rag(patient_profile, doc):
    """Incrementally add a single document to the patient's FAISS index."""
    try:
        record_ctx = _get_record_context(doc)
        update_patient_rag_index(patient_profile.user.id, record_ctx)
    except Exception as e:
        import logging as _log
        _log.getLogger(__name__).error(f"_add_document_to_rag failed for patient {patient_profile.user.id}: {e}")


def _rebuild_rag_for_patient(patient_profile):
    """Wipe and rebuild the patient's FAISS index from all remaining docs."""
    try:
        docs = Document.objects.filter(patient=patient_profile).select_related('medical_record')
        records = [_get_record_context(doc) for doc in docs]
        rebuild_patient_rag_index(patient_profile.user.id, records)
    except Exception as e:
        import logging as _log
        _log.getLogger(__name__).error(f"_rebuild_rag_for_patient failed for patient {patient_profile.user.id}: {e}")


class DocumentService:
    @staticmethod
    @transaction.atomic
    def save_document(patient_profile, validated_data):
        uploaded_file = validated_data.pop('file')

        # 1. Calculate file hash for aggressive caching
        sha256_hash = hashlib.sha256()
        for chunk in uploaded_file.chunks():
            sha256_hash.update(chunk)
        file_hash = sha256_hash.hexdigest()

        # REWIND THE POINTER BEFORE DOING ANYTHING ELSE
        uploaded_file.seek(0) 

        # 2. Check if THIS PATIENT already has this exact file
        if Document.objects.filter(patient=patient_profile, file_hash=file_hash).exists():
            raise ValidationError("This document is already present in your records.")

        # 3. Check if this file has been processed anywhere in the system before
        # We join with MedicalRecord to ensure we reuse a SUCCESSFUL previous run
        existing_record = MedicalRecord.objects.filter(
            document__file_hash=file_hash
        ).select_related('document').first()

        # 3. Create the Document record
        # Django's FileField automatically handles saving to MEDIA_ROOT
        doc = Document.objects.create(
            patient=patient_profile,
            uploaded_by=patient_profile.user,
            title=validated_data['title'],
            document_type=validated_data['document_type'],
            document_date=validated_data.get('document_date'),
            file_url=uploaded_file,
            file_hash=file_hash
        )

        if existing_record:
            # AGGRESSIVE CACHE HIT: Reuse existing processing results
            doc.title = existing_record.document.title
            doc.document_type = existing_record.document.document_type
            doc.document_date = existing_record.document.document_date
            doc.save()

            MedicalRecord.objects.create(
                document=doc,
                patient=patient_profile,
                extracted_data=existing_record.extracted_data,
                ai_summary=existing_record.ai_summary,
                timeline_date=existing_record.timeline_date
            )

            # Incrementally update FAISS index with newly reused record
            doc.refresh_from_db()
            _add_document_to_rag(patient_profile, doc)

            return doc

        # CACHE MISS: Run new AI pipeline
        file_path_on_disk = doc.file_url.path
        ai_result = run_ai_pipeline(file_path_on_disk, uploaded_file.name)
                
        if not ai_result.get("success"):
            # Expose the AI error to the frontend so it doesn't fail silently
            raise ValidationError(f"AI Processing failed: {ai_result.get('error')}")

        # Safe Date Parsing: Ensure Django doesn't crash if AI gives a bad date
        valid_date = None
        timeline_str = ai_result.get("timeline_date")
        if timeline_str:
            try:
                # Ensure it's valid YYYY-MM-DD
                datetime.date.fromisoformat(timeline_str)
                valid_date = timeline_str
            except ValueError:
                valid_date = None

        # Update doc metadata
        if ai_result.get("document_type") and getattr(DocumentType, ai_result["document_type"].upper(), None):
            doc.document_type = ai_result["document_type"].lower()
        if ai_result.get("title"):
            doc.title = ai_result["title"]
        if valid_date:
            doc.document_date = valid_date
        doc.save()

        # Create the medical record
        MedicalRecord.objects.create(
            document=doc,
            patient=patient_profile,
            extracted_data=ai_result.get("extracted_data", []),
            ai_summary=ai_result.get("ai_summary", ""),
            timeline_date=valid_date
        )

        # Incrementally update FAISS index with the new record
        doc.refresh_from_db()
        _add_document_to_rag(patient_profile, doc)

        return doc
    
    @staticmethod
    def delete_document(document):
        """
        Deletes the document record and the physical file from storage.
        """
        if document.file_url:
            if os.path.isfile(document.file_url.path):
                os.remove(document.file_url.path)
        
        patient_profile = document.patient
        document.delete()

        # Rebuild the FAISS index so the deleted document is removed
        _rebuild_rag_for_patient(patient_profile)