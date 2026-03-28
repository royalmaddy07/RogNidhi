from django.urls import path
from .views import (
    PatientRegisterView, DoctorRegisterView, LoginView, DocumentUploadView, 
    PatientTimelineView, DocumentDeleteView
)
from .views import (
    RequestAccessView,
    PendingRequestsView,
    ApproveAccessView,
    RevokeAccessView,
    MyDoctorsView,
    MyPatientsView,
)


urlpatterns = [
    path('auth/register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('auth/register/doctor/',  DoctorRegisterView.as_view(), name='doctor-register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('records/timeline/', PatientTimelineView.as_view(), name='patient-timeline'),
    path('documents/delete/<int:pk>/', DocumentDeleteView.as_view(), name='document-delete'),

    # ── Access Control ────────────────────────────────────────
    path('access/request/', RequestAccessView.as_view(), name='access-request'),
    path('access/pending/', PendingRequestsView.as_view(), name='access-pending'),
    path('access/approve/<int:permission_id>/', ApproveAccessView.as_view(), name='access-approve'),
    path('access/revoke/<int:permission_id>/', RevokeAccessView.as_view(), name='access-revoke'),
    path('access/my-doctors/', MyDoctorsView.as_view(), name='my-doctors'),
    path('access/my-patients/', MyPatientsView.as_view(), name='my-patients'),
]