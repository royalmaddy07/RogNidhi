import logging
from .base.ocr import extract_text
from .base.structured import extract_limited
from .base.chat import detect_abnormal, generate_doctor_summary, generate_patient_summary
from .rag.crag import corrective_rag
from .rag.index_store import update_patient_index
from .rag.chunker import chunk_medical_records

logger = logging.getLogger(__name__)

def run_ai_pipeline(file_obj, filename: str) -> dict:
    try:
        logger.info(f"Starting AI pipeline for: {filename}")

        text = extract_text(file_obj, filename)
        if not text:
            return {"success": False, "error": "Could not extract text from the document. Please ensure the file is clear."}

        logger.info("Structuring data..")
        structured_output = extract_limited(text)
        
        doc_title = structured_output.get("document_title", "Medical Document")
        doc_type = structured_output.get("document_type", "OTHER")
        test_data = structured_output.get("tests", [])

        logger.info("Detecting abnormalities & generating summary...")
        enriched_tests = detect_abnormal(test_data)
        structured_output["tests"] = enriched_tests
        summary = generate_patient_summary(enriched_tests)

        timeline_date = structured_output.get("report_date")
        if not timeline_date:
            for test in enriched_tests:
                if test.get("date"):
                    timeline_date = test["date"]
                    break

        return {
            "success": True,
            "title": doc_title,                 
            "document_type": doc_type,         
            "extracted_data": structured_output, 
            "ai_summary": summary,             
            "timeline_date": timeline_date     
        }
        
    except Exception as e:
        logger.error(f"AI Pipeline crashed: {str(e)}")
        return {"success": False, "error": "An internal error occurred while processing the document."}


def chat_with_rognidhi(
    medical_data: list,
    chat_history: list,
    new_question: str,
    patient_id: str | int | None = None,
) -> str:
    """
    Main chat entry point.

    If patient_id is provided, uses Corrective RAG (FAISS retrieval + LLM grading).
    Falls back to direct LLM if patient_id is missing (graceful degradation).
    """
    if not new_question:
        return "Please ask a question."

    try:
        if patient_id is not None:
            logger.info(f"Using Corrective RAG for patient {patient_id}.")
            recent_history = chat_history[-6:] if chat_history else []
            return corrective_rag(
                patient_id=patient_id,
                question=new_question,
                chat_history=recent_history,
            )
        else:
            # Fallback: no index available yet — use legacy direct LLM path
            logger.info("No patient_id provided — using legacy ask_rognidhi path.")
            from .base.chat import ask_rognidhi
            recent_history = chat_history[-6:] if chat_history else []
            return ask_rognidhi(medical_data, new_question, recent_history)

    except Exception as e:
        logger.error(f"Chat Error: {e}")
        return "I'm having trouble analyzing your report right now. Please try again."
    

def get_doctor_brief(medical_data: list) -> str:
    if not medical_data:
        return "No structured data available for this report."

    try:
        logger.info("Generating Doctor Summary...")
        return generate_doctor_summary(medical_data)
    except Exception as e:
        logger.error(f"Doctor Summary Error: {e}")
        return "I'm having trouble generating clinical brief report right now. Please try again."


def update_patient_rag_index(patient_id: str | int, medical_records: list[dict]):
    """
    Build / incrementally update the patient's FAISS index from their medical records.

    Call this after every successful document upload.

    Args:
        patient_id:      Patient DB primary key.
        medical_records: List of record context dicts (same format used in views.py chat endpoint).
    """
    try:
        chunks, metas = chunk_medical_records(medical_records)
        if chunks:
            update_patient_index(patient_id, chunks, metas)
            logger.info(f"RAG index updated for patient {patient_id}: +{len(chunks)} chunks.")
        else:
            logger.info(f"No chunks generated for patient {patient_id} — skipping index update.")
    except Exception as e:
        # Non-fatal: log and continue. Chat will degrade gracefully.
        logger.error(f"Failed to update RAG index for patient {patient_id}: {e}")