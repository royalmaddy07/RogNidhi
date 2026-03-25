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
You are a helpful, empathetic clinical assistant talking directly to a patient.
Use very simple, easy-to-understand everyday language. Do not use complex medical jargon.
Be reassuring and ready for follow-up questions.

Analyze the following lab report data:
{abnormal if abnormal else data}

Instructions:
- Gently list any parameters that are out of the normal range.
- Explain what these results generally mean in simple terms.
- Remind them that this is just a summary and they should consult their doctor for a real diagnosis.
- Keep it concise and structured.
- Don't use " ** " for bold text in your answer.

Output format:
- ...
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
You are an advanced clinical AI assistant generating a quick brief for an attending physician.
Use precise medical terminology and maintain a highly professional, clinical tone.

Analyze the following lab report data:
{abnormal if abnormal else data}

Instructions:
- Immediately highlight the abnormal parameters (HIGH/LOW) with their exact values and variances.
- State potential clinical significance or common differentials based purely on the data.
- Be extremely concise; doctors have limited time. Bullet points are preferred.
- Do not provide patient-facing reassurance.
- Handle properly if no structured data is available.
- Don't use " ** " for bold text in your answer.

Output format:
- ...
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Groq Chat Error (Doctor Summary): {e}")
        return "I'm having trouble connecting to my summarization engine. Please try again."


def ask_question(data: list, question: str, chat_history: list = None):
    prompt = f"""
You are a clinical assistant.
Talk like a doctor, human, not an AI. Use simple language but be precise.
Be ready for follow-up questions.

Here is the patient's structured lab report data:
{data}

Instructions: 
- Answer the user's question clearly and concisely.
- Don't repeat "Based on the data, ..." in every answer, just answer directly.
- Don't use markdown bolding (**) in your answer.
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