# Tamil OCR Backend Ordinance

This backend orchestrator processes Tamil handwritten text from images. It uses a custom pipeline comprising OpenCV image processing, standard optical verification via NVIDIA Nemotron multimodal APIs, and fallback Tesseract detection. It provides "strict", "smart", and "translate" output modes.

## Requirements
- Python 3.9+
- Tesseract-OCR with Tamil Language Pack (`tesseract-ocr-tam`)
- Required python packages (see requirements.txt)

## Installation

1. Install Tesseract-OCR:
   - On Linux applications: `sudo apt-get install tesseract-ocr tesseract-ocr-tam`
   
2. Install Python dependencies:
   ```sh
   pip install -r requirements.txt
   ```

3. Setup environment variables (or rely on defaults fallback):
   - `NVIDIA_API_KEY`: The provided Bearer token for accessing Nemotron capabilities.
   - `MONGO_URI`: Optional MongoDB Atlas URI if you want to store OCR logs and metrics.

## Running the Application

Execute the FastAPI module using Uvicorn:

```sh
uvicorn main:app --host 0.0.0.0 --port 8000
```
This runs the orchestrator API. The frontend can submit POST requests to `http://localhost:8000/api/v1/ocr`.

## API Documentation
Once the server is running, you can access the interactive Swagger/OpenAPI documentation at `http://localhost:8000/docs`.
