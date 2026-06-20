import base64
import requests
import json
import pytesseract
import cv2
import numpy as np
import re
import time
import os
import logging

logger = logging.getLogger(" तमिलनाडु_OCR_Engine ")

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "Bearer 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")

def run_nemotron_ocr(base64_image: str) -> dict:
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": NVIDIA_API_KEY if NVIDIA_API_KEY.startswith("Bearer") else f"Bearer {NVIDIA_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    prompt = """Extract handwritten Tamil text from this image.
- Preserve exact wording
- Maintain original line structure
- Do NOT translate
- Do NOT summarize
- Mark unclear words as [uncertain]
- Output only Tamil Unicode text"""

    # If the base64 string doesn't have the data URI prefix, add it.
    # We assume base64_image is properly prefixed or raw base64.
    if not base64_image.startswith("data:image"):
        base64_image = f"data:image/jpeg;base64,{base64_image}"

    payload = {
        "model": "meta/llama-3.2-11b-vision-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": base64_image
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        logger.info("Nemotron Success Response received")
        content = data["choices"][0]["message"]["content"]
        # Fake a confidence score based on the content (if it's good length)
        # Nemotron doesn't give confidence directly
        uncertain_count = content.count("[uncertain]")
        if uncertain_count == 0:
            confidence = "high"
        elif uncertain_count < 3:
            confidence = "medium"
        else:
            confidence = "low"
            
        return {
            "text": content.strip(),
            "confidence": confidence,
            "error": None
        }
    except Exception as e:
        logger.error(f"Nemotron API error: {e}")
        return {
            "text": "",
            "confidence": "low",
            "error": str(e)
        }

def run_tesseract_fallback(image_numpy: np.ndarray) -> str:
    # Use PyTesseract for Tamil text extraction
    logger.info("Running Tesseract Fallback")
    custom_config = r'--oem 3 --psm 6 -l tam'
    try:
        text = pytesseract.image_to_string(image_numpy, config=custom_config)
        return text.strip()
    except Exception as e:
        logger.error(f"Tesseract Error: {e}")
        return ""

def clean_ocr_text(text: str) -> str:
    # Remove markdown blocks if hallucinated by LLM
    text = re.sub(r'```[a-zA-Z]*', '', text).replace('```', '')
    
    # Basic cleanup: remove extra consecutive spaces and empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    cleaned_lines = []
    
    # Tamil Unicode range parsing can be complex, but for now we just remove stray symbols
    for line in lines:
        # keep standard tamil characters (\u0B80-\u0BFF), ascii numbers/punctuation for context
        line = re.sub(r'[^\u0B80-\u0BFFa-zA-Z0-9\s.,?!\[\]():-]', '', line)
        line = re.sub(r'  +', ' ', line)
        if len(line.strip()) > 0:
            cleaned_lines.append(line.strip())
        
    return '\n'.join(cleaned_lines)

def process_image_pipeline(b64_image_input: str, original_image_np: np.ndarray) -> dict:
    
    # Run Nemotron OCR
    nemotron_result = run_nemotron_ocr(b64_image_input)
    text = nemotron_result["text"]
    confidence = nemotron_result["confidence"]
    
    if not text or confidence == "low" or len(text.strip()) < 2:
        # Fallback to Tesseract
        tesseract_text = run_tesseract_fallback(original_image_np)
        if tesseract_text:
            text = f"{text}\n{tesseract_text}".strip()
            confidence = "medium" if confidence == "low" else "high"
            
    # Post-processing
    cleaned_text = clean_ocr_text(text)
    
    # Recalculate confidence post-processing (Task 3)
    uncertain_count = cleaned_text.count("[uncertain]")
    if not cleaned_text.strip():
        confidence = "low"
    elif uncertain_count == 0:
        confidence = "high"
    elif uncertain_count < 3:
        confidence = "medium"
    else:
        confidence = "low"
    
    return {
        "text": cleaned_text,
        "confidence": confidence
    }
