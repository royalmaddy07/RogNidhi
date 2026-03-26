from django.urls import path
from .views import PatientRegisterView, DoctorRegisterView

urlpatterns = [
    path('auth/register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('auth/register/doctor/',  DoctorRegisterView.as_view(), name='doctor-register'),
]