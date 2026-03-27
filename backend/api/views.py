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
            doc = DocumentService.save_document(patient_profile, serializer.validated_data)
            
            return Response({
                "message": "Document uploaded successfully",
                "document_id": doc.id,
                "file_path": request.build_absolute_uri(doc.file_url.url)
            }, status=status.HTTP_201_CREATED)
            
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