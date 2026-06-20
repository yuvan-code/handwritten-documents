from fastapi import FastAPI, HTTPException, File, UploadFile, Form
import time
import base64
import re
import os
import hashlib
import logging
from contextlib import asynccontextmanager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(" तमिलनाडु_OCR_Pipeline ")

from dotenv import load_dotenv
load_dotenv()

from api_models import OcrRequest, OcrResponse
from preprocess import preprocess_image, image_to_base64
from ocr_engine import process_image_pipeline
from translate import translate_tamil_to_english, smart_format_tamil

# MongoDB setup (optional)
MONGO_URI = os.getenv("MONGO_URI", "")
db_collection = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_collection
    if MONGO_URI:
        from pymongo import MongoClient
        import certifi
        client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
        db = client.tamil_ocr_db
        db_collection = db.ocr_requests
        print("Connected to MongoDB Atlas")
    yield

app = FastAPI(title="Tamil OCR API", lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr", response_model=OcrResponse)
def process_ocr(file: UploadFile = File(...), mode: str = Form("strict")):
    start_time = time.time()
    
    # Validation
    if not file:
        return OcrResponse(status="error", mode="strict", message="Image data is required", code="INVALID_FILE")
        
    mode = mode if mode in ["strict", "smart", "translate"] else "strict"
    
    try:
        # Check if MIME type is valid
        mime = file.content_type
        if mime and mime.lower() not in ["image/jpeg", "image/jpg", "image/png"]:
            return OcrResponse(status="error", mode=mode, message="Only JPG, PNG, JPEG allowed", code="INVALID_FILE")
            
        image_bytes = file.file.read()
            
        if len(image_bytes) > 10 * 1024 * 1024:
            return OcrResponse(status="error", mode=mode, message="File size exceeds 10MB limit", code="INVALID_FILE")
            
        # 0. Check Cache (Task 5)
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        logger.info(f"Request received. Image Hash: {image_hash}. Mode: {mode}")
        
        if db_collection is not None:
            cached_doc = db_collection.find_one({"image_hash": image_hash, "mode": mode})
            if cached_doc:
                logger.info(f"Cache hit! Skipping OCR API calls for {image_hash}.")
                processing_time_ms = int((time.time() - start_time) * 1000)
                return OcrResponse(
                    status="success",
                    mode=cached_doc["mode"],
                    text=cached_doc["text"],
                    translated_text=cached_doc.get("translated_text"),
                    confidence=cached_doc["confidence"],
                    uncertain_segments=cached_doc.get("uncertain_segments", []),
                    line_count=cached_doc.get("line_count"),
                    word_count=cached_doc.get("word_count"),
                    processing_time_ms=processing_time_ms
                )
            
        # 1. Preprocess
        logger.info("Cache miss. Starting image preprocessing...")
        thresh, deskewed = preprocess_image(image_bytes)
        
        # 2. Convert preprocessed image to base64 to send to Nemotron
        processed_b64 = image_to_base64(deskewed)
        
        # 3. Run OCR Pipeline (Nemotron + fallback)
        logger.info("Executing Primary OCR Engine Request (Nemotron)")
        result = process_image_pipeline(processed_b64, deskewed)
        text = result["text"]
        confidence = result["confidence"]
        logger.info(f"OCR Engine Completed. Confidence output: {confidence}")
        
        # Check for OCR failure
        if not text:
            return OcrResponse(
                status="error",
                mode=mode,
                message="OCR_FAILED: Could not extract text from image",
                code="OCR_FAILED"
            )
            
        # 4. Mode Handling
        translated_text = None
        if mode == "smart":
            text = smart_format_tamil(text)
        elif mode == "translate":
            translated_text = translate_tamil_to_english(text)
            
        # 5. Extract metrics
        uncertain_segments = re.findall(r'\[uncertain[^\]]*\]', text)
        lines = [line for line in text.split('\n') if line.strip()]
        line_count = len(lines)
        word_count = sum(len(line.split()) for line in lines)
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        response = OcrResponse(
            status="success",
            mode=mode,
            text=text,
            translated_text=translated_text,
            confidence=confidence,
            uncertain_segments=uncertain_segments,
            line_count=line_count,
            word_count=word_count,
            processing_time_ms=processing_time_ms
        )
        
        # 6. Optional Storage & Cache save
        if db_collection is not None:
            doc = {
                "image_hash": image_hash,
                "text": text,
                "translated_text": translated_text,
                "confidence": confidence,
                "mode": mode,
                "line_count": line_count,
                "word_count": word_count,
                "processing_time_ms": processing_time_ms,
                "timestamp": None,
                "filename": file.filename
            }
            # Fire and forget insertion
            import threading
            threading.Thread(target=db_collection.insert_one, args=(doc,)).start()
            
        return response
        
    except ValueError as ve:
        return OcrResponse(status="error", mode=mode, message=f"{ve}", code="INVALID_FILE")
    except Exception as e:
        logger.error(f"Unplanned error occurred during OCR sequence: {str(e)}")
        import traceback
        traceback.print_exc()
        # Do not expose internal errors
        return OcrResponse(
            status="error",
            mode=mode,
            message="An unexpected error occurred during processing",
            code="API_TIMEOUT" if "timeout" in str(e).lower() else "INTERNAL_ERROR"
        )
