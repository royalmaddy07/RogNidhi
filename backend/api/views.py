from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
 
from .models import Document
from .serializers import PatientRegisterSerializer, DoctorRegisterSerializer, LoginRequestSerializer
from .services import register_patient, register_doctor
from rest_framework import status, permissions
from .services import AuthService
from .serializers import DocumentUploadSerializer
from .services import DocumentService

# ──────────────────────────────────────────────────────────────
# PATIENT REGISTER VIEW
# POST /api/auth/register/patient/
#
# Flow:
#   1. Deserialize + validate incoming JSON via serializer
#   2. Call service layer to create User + profiles atomically
#   3. Return success message
#
# permission_classes = [AllowAny] because this is a public
# endpoint — no token needed to register.
# ──────────────────────────────────────────────────────────────

class PatientRegisterView(APIView):
    permission_classes = [AllowAny]

    """
    POST /api/auth/register/patient/

    Request body:
    {
        "first_name": "Ramesh",
        "last_name": "Kumar",
        "email": "ramesh@gmail.com",
        "password": "secure123",
        "phone": "9876543210",         ← optional
        "dob": "1985-04-12",           ← optional
        "blood_group": "O+",           ← optional
        "allergies": "Penicillin",     ← optional
        "emergency_contact": "9000000" ← optional
    }
    """

    def post(self, request):
        serializer = PatientRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            # Returns all validation errors at once
            # e.g. {"email": ["already exists"], "password": ["too common"]}
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            register_patient(serializer.validated_data)
        except Exception as e:
            return Response(
                {"error": "Registration failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"message": "User created successfully"},
            status=status.HTTP_201_CREATED
        )


# ──────────────────────────────────────────────────────────────
# DOCTOR REGISTER VIEW
# POST /api/auth/register/doctor/
#
# Same flow as patient but uses DoctorRegisterSerializer
# and register_doctor service.
# ──────────────────────────────────────────────────────────────

class DoctorRegisterView(APIView):
    """
    POST /api/auth/register/doctor/

    Request body:
    {
        "first_name": "Anjali",
        "last_name": "Mehta",
        "email": "anjali@hospital.com",
        "password": "secure123",
        "phone": "9876543210",         ← optional
        "specialization": "Cardiology",← optional
        "license_number": "MH-12345",  ← required
        "hospital": "Apollo Delhi"     ← optional
    }
    """


    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DoctorRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            register_doctor(serializer.validated_data)
        except Exception as e:
            return Response(
                {"error": "Registration failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"message": "User created successfully"},
            status=status.HTTP_201_CREATED
        )
    
# --------------------------------------------------------------------------------
# LOGIN VIEW 
# --------------------------------------------------------------------------------
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import LoginRequestSerializer
from .services import AuthService

class LoginView(APIView):
    # This endpoint must be public
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Business Logic via Service
            user = AuthService.authenticate_user(email, password)
            tokens = AuthService.get_tokens_for_user(user)
            user_data = AuthService.get_user_payload(user)
            
            return Response({
                **tokens,
                "user": user_data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# --------------------------------------------------------------------------------
# DOCUMENT VIEWS
# --------------------------------------------------------------------------------

class DocumentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DocumentUploadSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get the patient profile of the logged-in user
            patient_profile = request.user.patient_profile
            
            # Save the document
            try:
                doc = DocumentService.save_document(patient_profile, serializer.validated_data)
                return Response({
                    "message": "Document uploaded successfully",
                    "document_id": doc.id,
                    "file_path": request.build_absolute_uri(doc.file_url.url)
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                # If it's a validation error (duplicate check), return 409
                from django.core.exceptions import ValidationError
                if isinstance(e, ValidationError):
                    return Response({"detail": str(e.message)}, status=status.HTTP_409_CONFLICT)
                raise e
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            # We filter by both ID and patient to ensure ownership
            document = Document.objects.get(pk=pk, patient=request.user.patient_profile)
            
            DocumentService.delete_document(document)
            
            return Response({
                "message": "Document and clinical records deleted successfully."
            }, status=status.HTTP_204_NO_CONTENT)
            
        except Document.DoesNotExist:
            return Response({
                "error": "Document not found or you don't have permission to delete it."
            }, status=status.HTTP_404_NOT_FOUND)

# --------------------------------------------------------------------------------
# PATIENT DOCUMENT UPLOAD TIMELINE VIEW 
# --------------------------------------------------------------------------------
class PatientTimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch documents for the logged-in patient
        documents = Document.objects.filter(patient=request.user.patient_profile)
        
        # Serialize the data
        data = []
        for doc in documents:
            data.append({
                "id": doc.id,
                "title": doc.title,
                "type": doc.document_type.replace('_', ' ').title(),
                "date": doc.document_date.strftime("%d %b") if doc.document_date else "Recent",
                "year": doc.document_date.year if doc.document_date else "2026",
                "file_url": request.build_absolute_uri(doc.file_url.url)
            })
        
        return Response(data)

# --------------------------------------------------------------------------------
# CHAT VIEWS 
# --------------------------------------------------------------------------------
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from ai.ai import chat_with_rognidhi

class ChatSessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(patient=request.user.patient_profile)
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get('title', 'New Chat')
        session = ChatSession.objects.create(patient=request.user.patient_profile, title=title)
        ChatMessage.objects.create(
            session=session,
            sender='ai',
            text="Hello! I'm RogNidhi. Ask me anything about your health records."
        )

        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        ChatSession.objects.filter(patient=request.user.patient_profile).delete()
        return Response({"message": "All chat sessions deleted."}, status=status.HTTP_204_NO_CONTENT)

class ChatSessionMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            session = ChatSession.objects.get(pk=pk, patient=request.user.patient_profile)
            return Response(ChatSessionSerializer(session).data)
        except ChatSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, pk):
        try:
            session = ChatSession.objects.get(pk=pk, patient=request.user.patient_profile)
        except ChatSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
            
        question = request.data.get('question')
        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)

        ChatMessage.objects.create(session=session, sender='user', text=question)

        medical_data = []
        patient_documents = Document.objects.filter(patient=request.user.patient_profile).select_related('medical_record')
        for doc in patient_documents:
            # Build a more complete context block for each record
            record_context = {
                "title": doc.title,
                "type": doc.document_type,
                "date": str(doc.document_date) if doc.document_date else "Unknown Date",
            }
            if hasattr(doc, 'medical_record'):
                # Include the AI's summary of what it saw in the image/PDF
                record_context["ai_analysis"] = doc.medical_record.ai_summary
                # Include extracted raw data if available
                if doc.medical_record.extracted_data:
                    # ── FIX: Extract 'tests' list instead of entire dictionary ──
                    raw_data = doc.medical_record.extracted_data
                    if isinstance(raw_data, dict):
                        record_context["structured_tests"] = raw_data.get("tests", [])
                    else:
                        record_context["structured_tests"] = raw_data
            
            medical_data.append(record_context)
        
        history_msgs = ChatMessage.objects.filter(session=session).order_by('created_at')
        chat_history = []
        for msg in history_msgs:
            role = "user" if msg.sender == "user" else "assistant"
            chat_history.append({"role": role, "content": msg.text})

        if chat_history and chat_history[-1]['role'] == 'user' and chat_history[-1]['content'] == question:
            chat_history.pop()
            
        try:
            ans = chat_with_rognidhi(
                medical_data,
                chat_history,
                question,
                patient_id=request.user.id,
            )
        except Exception as e:
            ans = "I'm having trouble analyzing your request right now. Please try again."

        ChatMessage.objects.create(session=session, sender='ai', text=ans)

        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, pk):
        try:
            session = ChatSession.objects.get(pk=pk, patient=request.user.patient_profile)
        except ChatSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
            
        title = request.data.get('title')
        if title:
            session.title = title
            session.save()
            return Response(ChatSessionSerializer(session).data, status=status.HTTP_200_OK)
        return Response({"error": "No title provided"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            session = ChatSession.objects.get(pk=pk, patient=request.user.patient_profile)
            session.delete()
            return Response({"message": "Chat session deleted."}, status=status.HTTP_204_NO_CONTENT)
        except ChatSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)