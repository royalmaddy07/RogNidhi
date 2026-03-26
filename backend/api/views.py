from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .serializers import PatientRegisterSerializer, DoctorRegisterSerializer
from .services import register_patient, register_doctor

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