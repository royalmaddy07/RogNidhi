import requests
import base64
import os
import io
import logging
import fitz 
from PIL import Image
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("NVIDIA_API_KEY")
logger = logging.getLogger(__name__)

def standardize_to_jpg(file_obj, filename: str):
    try:
        if filename.lower().endswith('.pdf'):
            file_bytes = file_obj.read() if hasattr(file_obj, 'read') else file_obj
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page = doc.load_page(0)
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        else:
            img = Image.open(file_obj)
            if img.mode != 'RGB': img = img.convert('RGB')

        img.thumbnail((1600, 1600))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return base64.b64encode(buf.getvalue()).decode('utf-8')
        
    except Exception as e:
        logger.error(f"File Processing Error: {e}")
        return None

def extract_text(file_obj, filename="document.jpg"):
    img_b64 = standardize_to_jpg(file_obj, filename)
    if not img_b64: return None
    
    image_data_url = f"data:image/jpeg;base64,{img_b64}"
    url = "https://ai.api.nvidia.com/v1/cv/nvidia/nemoretriever-ocr"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    payload = {
        "input": [{"type": "image_url", "url": image_data_url}],
        "merge_levels": ["paragraph"] 
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            logger.error(f"NVIDIA API Error ({response.status_code}): {response.text}")
            return None

        result = response.json()
        lines = []
        for detection in result.get("data", []):
            for item in detection.get("text_detections", []):
                text = item.get("text_prediction", {}).get("text", "")
                if text.strip():
                    lines.append(text.strip())
        return "\n".join(lines)

    except Exception as e:
        logger.error(f"OCR Connection Error: {e}")
        return None