from django.urls import path
from .views import PatientRegisterView, DoctorRegisterView, LoginView

urlpatterns = [
    path('auth/register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('auth/register/doctor/',  DoctorRegisterView.as_view(), name='doctor-register'),
    path('auth/login/', LoginView.as_view(), name='login'),
]