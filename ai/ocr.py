import requests
import os
import base64
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
            logger.info("Converting PDF page to image format...")
            if isinstance(file_obj, str):
                doc = fitz.open(file_obj)
            else:
                file_bytes = file_obj.read() if hasattr(file_obj, 'read') else file_obj
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                
            page = doc.load_page(0)
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        else:
            logger.info("Processing standard image format...")
            img = Image.open(file_obj)
            if img.mode != 'RGB': img = img.convert('RGB')

        img.thumbnail((1600, 1600))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return base64.b64encode(buf.getvalue()).decode('utf-8')
        
    except Exception as e:
        logger.error(f"File Processing Error: {e}")
        return None