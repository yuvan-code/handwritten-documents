import cv2
import numpy as np
from typing import Tuple, Dict

def preprocess_image(image_bytes: bytes) -> Tuple[np.ndarray, np.ndarray]:
    # Decode image from bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Invalid image file")

    # 0. Resize to max dimension 1024px to prevent timeout over API inferences
    h, w = image.shape[:2]
    scale = 1024.0 / max(h, w)
    if scale < 1.0:
        new_w = int(w * scale)
        new_h = int(h * scale)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Simply return the high-quality resized image natively without corrupting the RGB space
    # Multimodal LLMs perform vastly worse on artificially deskewed binary/grey thresholds than raw photos.
    return image, image

def image_to_base64(image_numpy: np.ndarray) -> str:
    import base64
    # Compress JPEG to 75% quality to save API bandwith and response speeds
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 75]
    _, buffer = cv2.imencode('.jpg', image_numpy, encode_param)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"
