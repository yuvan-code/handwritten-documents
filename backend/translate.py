import requests
import os

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "Bearer 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")

def translate_tamil_to_english(tamil_text: str) -> str:
    if not tamil_text.strip():
        return ""
        
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": NVIDIA_API_KEY if NVIDIA_API_KEY.startswith("Bearer") else f"Bearer {NVIDIA_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    prompt = f"Translate the following Tamil text clearly and accurately into English. Provide only the translation, no other text:\n{tamil_text}"
    
    payload = {
        "model": "meta/llama-3.1-70b-instruct",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Translation API error: {e}")
        return ""

def smart_format_tamil(tamil_text: str) -> str:
    # Use LLM to fix readability and spacing issues
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": NVIDIA_API_KEY if NVIDIA_API_KEY.startswith("Bearer") else f"Bearer {NVIDIA_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    prompt = f"Fix spacing errors, typos, and improve the readability of the following handwritten Tamil OCR text. Keep the same meaning and line structures. Output only the formatted Tamil text:\n{tamil_text}"
    
    payload = {
        "model": "meta/llama-3.1-70b-instruct",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Smart Format API error: {e}")
        return tamil_text
