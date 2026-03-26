from django.contrib import admin
from .models import (
    UserProfile,
    PatientProfile, 
    DoctorProfile,
    LabProfile,
    Document,
    MedicalRecord,
    AccessPermission,
    Notification,
    AuditLog,
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'role', 'phone']
    list_filter   = ['role']
    search_fields = ['user__username', 'user__email']

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'blood_group', 'dob']
    search_fields = ['user__username', 'user__email']

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'specialization', 'hospital', 'license_number']
    search_fields = ['user__username', 'specialization']

@admin.register(LabProfile)
class LabProfileAdmin(admin.ModelAdmin):
    list_display  = ['lab_name', 'registration_number']
    search_fields = ['lab_name']

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ['title', 'patient', 'uploaded_by', 'document_type', 'document_date']
    list_filter   = ['document_type']
    search_fields = ['title', 'patient__username']

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display  = ['document', 'patient', 'timeline_date']
    search_fields = ['patient__username']

@admin.register(AccessPermission)
class AccessPermissionAdmin(admin.ModelAdmin):
    list_display  = ['patient', 'doctor', 'is_active', 'granted_at', 'expires_at']
    list_filter   = ['is_active']
    search_fields = ['patient__username', 'doctor__username']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ['user', 'title', 'is_read', 'created_at']
    list_filter   = ['is_read']
    search_fields = ['user__username', 'title']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ['user', 'action', 'target_table', 'target_id', 'performed_at']
    search_fields = ['user__username', 'action']
    readonly_fields = ['user', 'action', 'target_table', 'target_id', 'performed_at']