"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, Copy, Download, RefreshCw, Loader2, Image as ImageIcon } from "lucide-react";
import { processOcr, OcrResponse } from "@/lib/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("strict");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file (JPG, PNG)");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setResult(null);
      
      await handleUpload(selectedFile, mode);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.type.startsWith("image/")) {
        setError("Please select a valid image file (JPG, PNG)");
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError(null);
      setResult(null);
      await handleUpload(droppedFile, mode);
    }
  };

  const handleUpload = async (selectedFile: File, selectedMode: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await processOcr(selectedFile, selectedMode);
      if (data.status === "error") {
        setError(data.message || "Failed to process image");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError("An unexpected error occurred while uploading. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = async (newMode: string) => {
    setMode(newMode);
    if (file) {
      await handleUpload(file, newMode);
    }
  };

  const copyToClipboard = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
    }
  };

  const downloadText = () => {
    if (result?.text) {
      const element = document.createElement("a");
      const fileBlob = new Blob([result.text], {type: 'text/plain'});
      element.href = URL.createObjectURL(fileBlob);
      element.download = "extraction.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/(\[uncertain[^\]]*\])/gi);
      return (
        <div key={i} className="min-h-[1.5rem] leading-relaxed mb-2 font-medium text-slate-200">
          {parts.map((part, j) => {
            if (part.toLowerCase().startsWith('[uncertain')) {
              return (
                <span key={j} className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded px-1.5 py-0.5 mx-1 text-sm shadow-sm inline-flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 inline" />
                  {part}
                </span>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const getConfidenceBadge = (confidence: string) => {
    switch(confidence) {
      case "high":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> High Confidence</span>;
      case "medium":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"><AlertTriangle className="w-3 h-3 mr-1"/> Medium Confidence</span>;
      case "low":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3 mr-1"/> Low Confidence</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4 text-white font-bold text-xl shadow-lg shadow-blue-900/50">TS</div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">TamilScribe Deep OCR</h1>
              <p className="text-slate-400 text-sm">Upload handwritten documents and extract structural Tamil intelligently.</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex p-1 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
            {['strict', 'smart', 'translate'].map((m) => (
              <button
                key={m}
                onClick={() => handleModeToggle(m)}
                disabled={loading}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                  mode === m 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                } ${loading && 'opacity-50 cursor-not-allowed'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Upload Panel */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center text-slate-200">
              <ImageIcon className="w-5 h-5 mr-2 text-slate-500" />
              Source Image
            </h2>
            
            <div 
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors ${
                preview ? 'bg-slate-900 border-slate-800' : 'bg-[#0f1524] border-slate-800 hover:bg-slate-900 hover:border-blue-500/50'
              } h-[500px] overflow-hidden group`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/jpeg, image/png, image/jpg" 
                onChange={handleFileChange}
                disabled={loading}
              />
              
              {preview ? (
                <div className="absolute inset-0 p-4 flex items-center justify-center bg-slate-950/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Upload preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-md border border-slate-800" />
                  
                  {loading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10 transition-all border border-slate-800">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse"></div>
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4 relative z-10" />
                      </div>
                      <p className="text-lg font-medium text-slate-200 animate-pulse tracking-wide">Nemotron is analyzing...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center cursor-pointer">
                  <div className="bg-slate-800 p-4 rounded-full shadow-inner inline-block mb-4 group-hover:scale-105 transition-transform ring-1 ring-white/5">
                    <UploadCloud className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-300 font-medium text-lg">Click or drag image to upload</p>
                  <p className="text-slate-500 text-sm mt-2">Supports JPG, JPEG, PNG (Max 10MB)</p>
                </div>
              )}
            </div>

            {file && (
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-800">
                <div className="truncate pr-4 flex-1">
                  <p className="font-medium text-sm text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={resetAll}
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-neutral-800 rounded-md transition-colors"
                  title="Clear image"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Result Panel */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center text-slate-200">
                <FileText className="w-5 h-5 mr-2 text-slate-500" />
                Extracted Output
              </h2>
              {result?.confidence && getConfidenceBadge(result.confidence)}
            </div>

            <div className="flex-1 bg-[#0f1524] border border-slate-800 rounded-xl shadow-sm h-[500px] flex flex-col overflow-hidden relative">
              {error ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-200 mb-2">OCR Processing Failed</h3>
                  <p className="text-slate-400 max-w-sm text-sm">{error}</p>
                </div>
              ) : result ? (
                <>
                  <div className="p-8 flex-1 overflow-y-auto text-lg text-slate-200">
                    {renderFormattedText(result.text || "")}
                    
                    {result.translated_text && (
                      <div className="mt-8 pt-6 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-blue-500/70 uppercase tracking-wider mb-3">English Translation</h4>
                        <p className="text-slate-300 italic">{result.translated_text}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Bar Footer */}
                  <div className="bg-slate-900/60 border-t border-slate-800 p-4 flex items-center justify-between mt-auto">
                    <div className="flex space-x-4 text-xs font-medium text-slate-500">
                      <span>{result.word_count || 0} words</span>
                      <span>{result.processing_time_ms} ms span</span>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm text-slate-200"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </button>
                      <button 
                        onClick={downloadText}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download TXT
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-8">
                  <div className="bg-slate-900/50 p-4 rounded-full mb-6 border border-slate-800/50">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-300 font-medium mb-1">No text extracted yet</h3>
                  <p className="text-sm">Upload an image and wait for the structural recognition.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
