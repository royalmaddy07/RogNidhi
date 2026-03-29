import datetime
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, PatientProfile, DoctorProfile, Document, MedicalRecord, Notification, AuditLog, Role, DocumentType
from rest_framework import exceptions
from django.core.exceptions import ValidationError

from django.utils import timezone
from .models import AccessPermission, AccessStatus

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


import threading

def _update_rag_index_for_doc_async(patient_user_id, record_context):
    try:
        update_patient_rag_index(patient_user_id, record_context)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"RAG index update failed for patient {patient_user_id}: {e}")


def _update_rag_index_for_doc(patient_user_id, doc, medical_record):
    """
    Helper: converts a saved Document + MedicalRecord into the record_context dict,
    and spins up a background thread to update the FAISS index ONLY after the DB commits.
    """
    record_context = {
        "title": doc.title,
        "type": doc.document_type,
        "date": str(doc.document_date) if doc.document_date else "Unknown Date",
        "ai_analysis": medical_record.ai_summary or "",
        "structured_tests": medical_record.extracted_data or [],
    }
    
    transaction.on_commit(lambda: threading.Thread(
        target=_update_rag_index_for_doc_async,
        args=(patient_user_id, record_context)
    ).start())



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

            medical_record = MedicalRecord.objects.create(
                document=doc,
                patient=patient_profile,
                extracted_data=existing_record.extracted_data,
                ai_summary=existing_record.ai_summary,
                timeline_date=existing_record.timeline_date
            )
            # ── Update RAG index (cache-hit path) ──────────────────────
            _update_rag_index_for_doc(patient_profile.user.id, doc, medical_record)
            
            # ── Notify doctors ──
            active_doctors = AccessPermission.objects.filter(
                patient=patient_profile.user,
                status=AccessStatus.ACTIVE
            ).select_related('doctor')
            for permission in active_doctors:
                Notification.objects.create(
                    user=permission.doctor,
                    title="New Medical Record",
                    message=f"{patient_profile.user.get_full_name()} has uploaded a new document: '{doc.title}'."
                )

            return doc

        # CACHE MISS: Run new AI pipeline (with patient_id for RAG-augmented structuring)
        file_path_on_disk = doc.file_url.path
        ai_result = run_ai_pipeline(
            file_obj=file_path_on_disk, 
            filename=uploaded_file.name, 
            patient_id=patient_profile.user.id,
            uploaded_date=str(doc.document_date) if doc.document_date else None
        )
                
        if not ai_result.get("success"):
            # Clean up the file from disk since the transaction will roll back
            if doc.file_url:
                try:
                    doc.file_url.delete(save=False)
                except Exception:
                    pass
            # Expose the AI error to the frontend using ValueError to differentiate from 409 Conflict duplicates
            raise ValueError(f"AI Processing failed: {ai_result.get('error')}")

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
        medical_record = MedicalRecord.objects.create(
            document=doc,
            patient=patient_profile,
            extracted_data=ai_result.get("extracted_data", []),
            ai_summary=ai_result.get("ai_summary", ""),
            timeline_date=valid_date
        )
        # ── Update RAG index (fresh upload path) ──────────────────────
        _update_rag_index_for_doc(patient_profile.user.id, doc, medical_record)
        
        # ── Notify doctors ──
        active_doctors = AccessPermission.objects.filter(
            patient=patient_profile.user,
            status=AccessStatus.ACTIVE
        ).select_related('doctor')
        for permission in active_doctors:
            Notification.objects.create(
                user=permission.doctor,
                title="New Medical Record",
                message=f"{patient_profile.user.get_full_name()} has uploaded a new document: '{doc.title}'."
            )

        return doc
    
    @staticmethod
    def delete_document(document):
        """
        Deletes the document record and the physical file from storage.
        After deletion, rebuilds the patient's FAISS index from remaining records.
        """
        patient_user_id = document.patient.user.id
        patient_profile  = document.patient

        if document.file_url:
            try:
                document.file_url.delete(save=False)
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Failed to delete file from storage: {e}")
        
        document.delete()

        # ── Rebuild RAG index with remaining docs ──────────────────────
        try:
            remaining_docs = (
                Document.objects
                .filter(patient=patient_profile)
                .select_related('medical_record')
            )
            all_records = []
            for doc in remaining_docs:
                rec = {
                    "title": doc.title,
                    "type": doc.document_type,
                    "date": str(doc.document_date) if doc.document_date else "Unknown Date",
                    "ai_analysis": getattr(doc, 'medical_record', None) and doc.medical_record.ai_summary or "",
                    "structured_tests": getattr(doc, 'medical_record', None) and doc.medical_record.extracted_data or [],
                }
                all_records.append(rec)
            rebuild_patient_rag_index(patient_user_id, all_records)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"RAG rebuild after delete failed: {e}")

# ──────────────────────────────────────────────────────────────
# ACCESS CONTROL SERVICES ->
# REQUEST ACCESS
# Called by: Doctor
# Endpoint:  POST /api/access/request/
#
# Creates or re-activates an AccessPermission row with
# status='pending'. Sends a notification to the patient.
#
# If a revoked row already exists between this doctor and
# patient, we reuse it (reset to pending) instead of creating
# a duplicate — enforced by unique_together('patient','doctor').
# ──────────────────────────────────────────────────────────────

def request_access(doctor: User, patient_email: str) -> AccessPermission:
    patient = User.objects.get(email__iexact=patient_email)

    # ── Reuse revoked row or create new ──
    permission, created = AccessPermission.objects.get_or_create(
        patient=patient,
        doctor=doctor,
        defaults={
            'status':    AccessStatus.PENDING,
            'is_active': False,
        }
    )

    if not created:
        # Row existed (was previously revoked) — reset it to pending
        permission.status      = AccessStatus.PENDING
        permission.is_active   = False
        permission.approved_at = None
        permission.save(update_fields=['status', 'is_active', 'approved_at'])

    # ── Fetch doctor details ──
    doctor_detail = ""
    if hasattr(doctor, 'doctor_profile'):
        dp = doctor.doctor_profile
        spec = dp.specialization or "Doctor"
        hosp = dp.hospital or ""
        doctor_detail = f" ({spec}" + (f" at {hosp})" if hosp else ")")

    # ── Notify the patient ──
    Notification.objects.create(
        user    = patient,
        title   = "New Access Request",
        message = (
            f"Dr. {doctor.get_full_name()}{doctor_detail} has requested access to your "
            f"medical records. Please review and approve."
        ),
    )

    return permission


# ──────────────────────────────────────────────────────────────
# APPROVE ACCESS
# Called by: Patient
# Endpoint:  POST /api/access/approve/:id/
#
# Sets status='active' and is_active=True.
# Sends a notification to the doctor.
# Raises ValueError if:
#   - Permission doesn't belong to this patient
#   - Permission is not in 'pending' state
# ──────────────────────────────────────────────────────────────

def approve_access(patient: User, permission_id: int) -> AccessPermission:

    # ── Fetch + ownership check ──
    try:
        permission = AccessPermission.objects.get(
            id=permission_id,
            patient=patient,
        )
    except AccessPermission.DoesNotExist:
        raise ValueError("Access request not found.")

    # ── State check ──
    if permission.status != AccessStatus.PENDING:
        if permission.status == AccessStatus.ACTIVE:
            raise ValueError("This request has already been approved.")
        if permission.status == AccessStatus.REVOKED:
            raise ValueError("This permission was revoked. The doctor must send a new request.")

    # ── Approve ──
    permission.status      = AccessStatus.ACTIVE
    permission.is_active   = True
    permission.approved_at = timezone.now()
    permission.save(update_fields=['status', 'is_active', 'approved_at'])

    # ── Fetch patient details ──
    patient_detail = ""
    if hasattr(patient, 'patient_profile'):
        pp = patient.patient_profile
        bg = pp.blood_group or "Unknown Blood Group"
        age_str = ""
        if pp.dob:
            age = (datetime.date.today() - pp.dob).days // 365
            age_str = f", Age: {age}"
        patient_detail = f" [{bg}{age_str}]"

    # ── Notify the doctor ──
    Notification.objects.create(
        user    = permission.doctor,
        title   = "Access Approved",
        message = (
            f"{patient.get_full_name()}{patient_detail} has approved your request to access "
            f"their medical records. You can now view their health timeline."
        ),
    )

    return permission


# ──────────────────────────────────────────────────────────────
# REVOKE ACCESS
# Called by: Patient
# Endpoint:  POST /api/access/revoke/:id/
#
# Sets status='revoked' and is_active=False.
# Sends a notification to the doctor.
# Raises ValueError if:
#   - Permission doesn't belong to this patient
#   - Permission is already revoked or still pending
# ──────────────────────────────────────────────────────────────

def revoke_access(patient: User, permission_id: int) -> AccessPermission:

    # ── Fetch + ownership check ──
    try:
        permission = AccessPermission.objects.get(
            id=permission_id,
            patient=patient,
        )
    except AccessPermission.DoesNotExist:
        raise ValueError("Access permission not found.")

    # ── State check ──
    if permission.status == AccessStatus.REVOKED:
        raise ValueError("This permission is already revoked.")
    if permission.status == AccessStatus.PENDING:
        raise ValueError(
            "This request is still pending. "
            "You can simply ignore it instead of revoking."
        )

    # ── Revoke ──
    permission.status    = AccessStatus.REVOKED
    permission.is_active = False
    permission.save(update_fields=['status', 'is_active'])

    # ── Notify the doctor ──
    Notification.objects.create(
        user    = permission.doctor,
        title   = "Access Revoked",
        message = (
            f"Action: {patient.get_full_name()} has revoked your access to their "
            f"medical records."
        ),
    )

    return permission


# ──────────────────────────────────────────────────────────────
# GET PENDING REQUESTS
# Called by: Patient
# Endpoint:  GET /api/access/pending/
#
# Returns all AccessPermission rows where:
#   patient = request.user AND status = 'pending'
# ──────────────────────────────────────────────────────────────

def get_pending_requests(patient: User):
    return (
        AccessPermission.objects
        .filter(patient=patient, status=AccessStatus.PENDING)
        .select_related('doctor', 'doctor__doctor_profile')
        .order_by('-granted_at')
    )


# ──────────────────────────────────────────────────────────────
# GET MY DOCTORS (patient side)
# Called by: Patient
# Endpoint:  GET /api/access/my-doctors/
#
# Returns all active permissions for this patient —
# i.e. doctors currently able to view their records.
# ──────────────────────────────────────────────────────────────

def get_my_doctors(patient: User):
    return (
        AccessPermission.objects
        .filter(patient=patient, status=AccessStatus.ACTIVE)
        .select_related('doctor', 'doctor__doctor_profile')
        .order_by('-approved_at')
    )


# ──────────────────────────────────────────────────────────────
# GET MY PATIENTS (doctor side)
# Called by: Doctor
# Endpoint:  GET /api/access/my-patients/
#
# Returns all active permissions where doctor = request.user —
# i.e. patients whose records the doctor can currently view.
# Supports optional search by patient name or email.
# ──────────────────────────────────────────────────────────────

def get_my_patients(doctor: User, search: str = ""):
    qs = (
        AccessPermission.objects
        .filter(doctor=doctor, status=AccessStatus.ACTIVE)
        .select_related('patient', 'patient__patient_profile')
        .order_by('-approved_at')
    )

    if search:
        qs = qs.filter(
            patient__first_name__icontains=search
        ) | qs.filter(
            patient__last_name__icontains=search
        ) | qs.filter(
            patient__email__icontains=search
        )

    return qs

# ──────────────────────────────────────────────────────────────
# SCRAPE SCHEMES
# Called by: Patient
# Endpoint:  GET /api/schemes/scrape/
# ──────────────────────────────────────────────────────────────
def scrape_insurance_schemes():
    import requests
    from bs4 import BeautifulSoup
    
    # We will use Wikipedia's 'Healthcare in India' page as a reliable scrape source
    # alongside some curated standard schemas as fallback to ensure the UI showcase always works.
    
    scraped_data = []
    
    try:
        url = "https://en.wikipedia.org/wiki/List_of_government_schemes_in_India"
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        tables = soup.find_all('table', class_='wikitable')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:
                cols = row.find_all('td')
                if len(cols) >= 3:
                    name_th = row.find('th') or cols[0]
                    name = name_th.text.strip()
                    desc = cols[-1].text.strip()
                    
                    if "health" in desc.lower() or "health" in name.lower() or "bima" in name.lower() or "ayushman" in name.lower():
                        # Extract first official link if available
                        link = ""
                        for a in row.find_all('a', href=True):
                            href = a['href']
                            if "gov.in" in href or "nic.in" in href:
                                link = href
                                break
                        
                        # Default to india.gov.in search if no official link directly in wikipedia
                        if not link:
                            link = f"https://www.india.gov.in/search/site/{name.replace(' ', '%20')}"
                            
                        scraped_data.append({
                            "title": name,
                            "description": desc,
                            "category": "Government Scraped",
                            "features": ["Verified Live Source", "Government Backed"],
                            "url": link
                        })
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Scheme scraping failed: {e}")
        
    return scraped_data