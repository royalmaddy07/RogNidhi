import os
import django
import sys
from pathlib import Path

# Add project roots and set up DJANGO
sys.path.append(os.getcwd())
sys.path.append(str(Path(os.getcwd()).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import PatientProfile, Document
from ai.ai import chat_with_rognidhi

def simulate_chat(user_id, question):
    patient = PatientProfile.objects.filter(user_id=user_id).first()
    if not patient:
        print(f"No patient found with user_id {user_id}")
        return
    
    # ── Simulate the context building that happens in views.py ────────────────
    medical_data = []
    docs = Document.objects.filter(patient=patient).select_related('medical_record')
    for doc in docs:
        record_ctx = {
            "title": doc.title,
            "type": doc.document_type,
            "date": str(doc.document_date) if doc.document_date else "Unknown Date",
        }
        if hasattr(doc, 'medical_record'):
            record_ctx["ai_analysis"] = doc.medical_record.ai_summary
            if doc.medical_record.extracted_data:
                record_ctx["structured_tests"] = doc.medical_record.extracted_data
        medical_data.append(record_ctx)
    
    print(f"Patient: {patient.user.email}")
    print(f"Data count: {len(medical_data)}")
    print(f"Question: {question}")
    print("\n--- Running chat_with_rognidhi ---")
    
    # Simulate chat history
    chat_history = []
    
    # CALL THE ACTUAL RAG
    # This will trigger Lazy Indexing (rebuild) on first run
    response = chat_with_rognidhi(
        medical_data,
        chat_history,
        question,
        patient_id=user_id
    )
    
    print("\nRogNidhi Output:")
    print(response)

if __name__ == "__main__":
    print("=== TEST 1: MEDICAL QUERY ===")
    simulate_chat(2, "What do my eye test records show?")
    
    print("\n\n=== TEST 2: GREETING ===")
    simulate_chat(2, "Hello RogNidhi, how are you?")
    
    print("\n\n=== TEST 3: CAPABILITIES ===")
    simulate_chat(2, "what data you have access to?")
