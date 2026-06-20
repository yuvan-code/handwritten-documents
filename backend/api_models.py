from pydantic import BaseModel
from typing import Optional, List

class RequestMetadata(BaseModel):
    filename: Optional[str] = None
    timestamp: Optional[str] = None

class OcrRequest(BaseModel):
    image: str # Base64 encoded string
    mode: str  # strict | smart | translate
    metadata: Optional[RequestMetadata] = None

class OcrResponse(BaseModel):
    status: str
    mode: str
    text: Optional[str] = None
    translated_text: Optional[str] = None
    confidence: Optional[str] = None # high | medium | low
    uncertain_segments: Optional[List[str]] = None
    line_count: Optional[int] = None
    word_count: Optional[int] = None
    processing_time_ms: Optional[int] = None
    message: Optional[str] = None
    code: Optional[str] = None
