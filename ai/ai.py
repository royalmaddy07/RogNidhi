import logging
from .ocr import extract_text
from .structured import extract_limited
from .chat import detect_abnormal, generate_doctor_summary, generate_patient_summary, ask_rognidhi

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
        enriched_data = detect_abnormal(test_data)
        summary = generate_patient_summary(enriched_data)

        timeline_date = None
        for test in enriched_data:
            if test.get("date"):
                timeline_date = test["date"]
                break

        return {
            "success": True,
            "title": doc_title,                 
            "document_type": doc_type,         
            "extracted_data": enriched_data,   
            "ai_summary": summary,             
            "timeline_date": timeline_date     
        }
        
    except Exception as e:
        logger.error(f"AI Pipeline crashed: {str(e)}")
        return {"success": False, "error": "An internal error occurred while processing the document."}


def chat_with_rognidhi(medical_data: list, chat_history: list, new_question: str) -> str:
    if not medical_data or not new_question:
        return "I don't have enough information to answer that."
        
    try:
        logger.info("Returning RogNidhi response...")
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