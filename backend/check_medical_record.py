import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import MedicalRecord, PatientProfile

def check_patient_mr(user_id):
    patient = PatientProfile.objects.filter(user_id=user_id).first()
    if not patient:
        print(f"No patient found with user_id {user_id}")
        return
    
    mr = MedicalRecord.objects.filter(patient=patient).first()
    if not mr:
        print(f"No medical record found for patient {patient.user.email}")
        return
    
    print(f"Patient: {patient.user.email}")
    print(f"Summary: {mr.ai_summary}")
    print(f"Tests: {mr.extracted_data}")

if __name__ == "__main__":
    check_patient_mr(2)
