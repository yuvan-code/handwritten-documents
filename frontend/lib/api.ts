export const API_URL = "http://127.0.0.1:8000/ocr";

export interface OcrResponse {
  status: string;
  mode?: string;
  text?: string;
  translated_text?: string;
  confidence?: "high" | "medium" | "low";
  uncertain_segments?: string[];
  line_count?: number;
  word_count?: number;
  processing_time_ms?: number;
  message?: string;
  code?: string;
}

export async function processOcr(file: File, mode: string = "strict"): Promise<OcrResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
         status: "error",
         message: data.message || `Server error: ${response.status}`,
         code: data.code || "SERVER_ERROR",
      };
    }

    return data as OcrResponse;
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Network error. Please verify the backend is running on 127.0.0.1:8000.",
      code: "NETWORK_ERROR",
    };
  }
}
