from django.urls import path
from .views import (
    PatientRegisterView, DoctorRegisterView, LoginView, DocumentUploadView, 
    PatientTimelineView, DocumentDeleteView, ChatSessionListView, ChatSessionMessageView
)


urlpatterns = [
    path('auth/register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('auth/register/doctor/',  DoctorRegisterView.as_view(), name='doctor-register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('records/timeline/', PatientTimelineView.as_view(), name='patient-timeline'),
    path('documents/delete/<int:pk>/', DocumentDeleteView.as_view(), name='document-delete'),
    path('chat/sessions/', ChatSessionListView.as_view(), name='chat-sessions'),
    path('chat/sessions/<int:pk>/', ChatSessionMessageView.as_view(), name='chat-session-messages'),
]