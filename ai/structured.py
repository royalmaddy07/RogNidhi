import os
import json
import logging
from google import genai
from groq import Groq

logger = logging.getLogger(__name__)

gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_prompt(text: str) -> str:
    return f"""
Act as an expert Medical Data Specialist. 
Analyze the provided OCR text and extract the document metadata and all laboratory test results into a structured JSON object.

RULES:
1. Normalization: Standardize test names (e.g., 'Hb' -> 'Haemoglobin', 'WBC' -> 'Total White Blood Cell Count').
2. Context: Ensure the 'date' is extracted for every row. If not found, use the report generation date.
3. Data Integrity: Keep 'value' as a string (don't remove commas here, let the logic handle it). Ensure 'reference_range' includes the full string.
4. Tables: If the OCR has merged columns, logically separate the Test Name from the Finding.

SCHEMA:
{{
  "document_title": "The name of the report (e.g., Complete Blood Count, Lipid Panel, Prescription)",
  "document_type": "LAB_REPORT or PRESCRIPTION or DOCTOR_NOTE or OTHER",
  "tests": [
    {{
      "test_name": "Full clinical name",
      "value": "Numeric or text value",
      "unit": "Standard unit (e.g., mg/dL, %)",
      "reference_range": "The exact range provided",
      "date": "DD.MM.YYYY"
    }}
  ]
}}

TEXT TO PROCESS:
{text}
"""

def extract_with_gemini(text: str, model_name: str):
    prompt = build_prompt(text)
    try:
        response = gemini_client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={"temperature": 0.1, "response_mime_type": "application/json"}
        )
        output = response.text.strip()
        
        if "```json" in output:
            output = output.split("```json")[1].split("```")[0].strip()
            
        return json.loads(output) if output else None

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            logger.warning(f"{model_name} quota exhausted.")
        else:
            logger.error(f"{model_name} failed with error: {error_msg[:100]}...")
        return None

def extract_with_groq(text: str):
    logger.info("Fallback to Groq...")
    prompt = build_prompt(text)
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a medical data extractor. Output ONLY valid JSON matching the exact schema."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        output = response.choices[0].message.content
        return json.loads(output)

    except Exception as e:
        logger.error(f"Groq Fallback Error: {e}")
        return {"document_title": "Unknown Document", "document_type": "OTHER", "tests": []}

def extract_structured(text: str):
    logger.info("Gemini 2.5 Flash...")
    data = extract_with_gemini(text, "gemini-2.5-flash")
    if data: return data

    logger.info("Gemini 3 Flash (Preview)...")
    data = extract_with_gemini(text, "gemini-3-flash-preview")
    if data: return data

    return extract_with_groq(text)

def extract_limited(text: str):
    try:
        return extract_structured(text)
    except Exception:
        return extract_structured(text[:5000])