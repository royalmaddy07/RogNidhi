import os
import re
from groq import Groq
import logging

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
logger = logging.getLogger(__name__)

def clean_number(val_str: str):
    cleaned = str(val_str).replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_range(r: str):
    r_str = str(r).replace(",", "").strip()
    
    if "<" in r_str or "less" in r_str.lower():
        nums = re.findall(r"\d+\.?\d*", r_str)
        if nums:
            return 0.0, float(nums[0])
            
    if ">" in r_str or "greater" in r_str.lower():
        nums = re.findall(r"\d+\.?\d*", r_str)
        if nums:
            return float(nums[0]), float('inf')

    nums = re.findall(r"\d+\.?\d*", r_str)
    if len(nums) >= 2:
        return float(nums[0]), float(nums[1])
        
    return None, None


def detect_abnormal(data: list):
    for item in data:
        val_str = item.get("value", "")
        range_str = item.get("reference_range", "")
        val = clean_number(val_str)

        if val is None:
            if val_str and not range_str:
                item["status"] = "INFO"
            else:
                item["status"] = "UNKNOWN"
            continue

        low, high = parse_range(range_str)

        if low is None or high is None:
            item["status"] = "UNKNOWN"
        elif val < low:
            item["status"] = "LOW"
        elif val > high:
            item["status"] = "HIGH"
        else:
            item["status"] = "NORMAL"

    return data


def generate_patient_summary(data: list):
    abnormal = [d for d in data if d.get("status") in ["HIGH", "LOW"]]
    prompt = f"""
You are RogNidhi, a friendly and supportive health assistant.
Tone: Warm, empathetic, and very easy to understand.

Input Data:
{abnormal if abnormal else data}

Instructions:
1.  Overview: Start with a brief, reassuring sentence about the report.
2.  Key Findings: If there are HIGH/LOW values, explain what they are using everyday words (e.g., use 'Iron' instead of 'Serum Ferritin').
3.  Actionable Advice: Suggest simple lifestyle steps (e.g., 'drink more water' or 'get more rest') if applicable.
4.  The 'Doctor' Rule: Always end by saying this is not a diagnosis and they must talk to their doctor.
5.  Constraints: No complex medical terms. No markdown bolding (**).

Output format:
- HELLO: [Brief greeting]
- WHAT WE FOUND: [Simple explanation of results]
- NEXT STEPS: [Simple lifestyle suggestion]
- NOTE: [Disclaimer about seeing a doctor]
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Groq Chat Error (Patient Summary): {e}")
        return "I'm having trouble connecting to my summarization engine. Please try again."
    
    
def generate_doctor_summary(data: list):
    abnormal = [d for d in data if d.get("status") in ["HIGH", "LOW"]]
    prompt = f"""
You are a Senior Clinical AI Assistant. Generate a concise Clinical Brief for an attending physician.
Tone: Highly professional, objective, and analytical. Use standard medical terminology.

Input Data:
{abnormal if abnormal else data}

Instructions:
1.  Summary of Findings: Immediately list all out-of-range parameters with values and reference deltas.
2.  Clinical Correlation: Suggest 2-3 common differential considerations based ONLY on the abnormal values.
3.  Critical Flags: Highlight any values that are severely outside normal limits (Panic Values).
4.  Format: Use a structured, bulleted list. 
5.  Constraints: No conversational filler. No "I hope this helps." No markdown bolding (**).

Output format:
- FINDINGS: [Test Name] ([Value] [Unit]) - [HIGH/LOW]
- DIFFERENTIALS: [Potential clinical considerations]
- RECOMMENDATION: [Next steps like 'Correlate clinically' or 'Follow-up tests']
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1 
        )
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Groq Chat Error (Doctor Summary): {e}")
        return "I'm having trouble connecting to my summarization engine. Please try again."


def ask_rognidhi(data: list, question: str, chat_history: list = None):
    prompt = f"""
You are RogNidhi, a helpful clinical assistant. You are talking to a patient about their lab results.
Tone: Concise, human, and direct. Avoid sounding like a robot.

Patient's Data:
{data}

Instructions: 
1.  Directness: Answer the question immediately. Do not start with "Based on your data..." or "Looking at your report...".
2.  Simplicity: Use simple language. Like if they ask "What is RBC?", explain it as "Red blood cells that carry oxygen."
3.  Safety: If they ask for a diagnosis or "Do I have cancer?", explain that you are an AI and only their doctor can confirm a diagnosis.
4.  Empathetic: Be supportive and understanding, especially if the question is about abnormal results.
5.  Contextual: Use the patient's data to inform your answer, but do not repeat the entire data back to them. Focus on what's relevant to the question.
6.  No Bolding: Do not use markdown bolding (**) in your response.
"""
    messages = [{"role": "system", "content": prompt}]
    
    if chat_history: messages.extend(chat_history)

    messages.append({"role": "user", "content": question})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Groq Chat Error: {e}")
        return "I'm having trouble connecting to my knowledge base. Please try again."