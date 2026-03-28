import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import PatientProfile, Document

def identify_test_patient():
    # Find patients with documents
    patients_with_docs = PatientProfile.objects.filter(documents__isnull=False).distinct()
    
    if not patients_with_docs.exists():
        print("No patients with documents found in the database.")
        return None
    
    patient = patients_with_docs.first()
    print(f"Testing with Patient: {patient.user.email} (ID: {patient.user.id})")
    print(f"Document count: {patient.documents.count()}")
    return patient

if __name__ == "__main__":
    identify_test_patient()
