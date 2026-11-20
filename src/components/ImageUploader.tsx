import React, { useState, useRef } from "react";
import { Camera, Upload, Search, X, Sparkles, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { SAMPLE_MEDICINES, SampleMedicinePreset } from "../data/sampleMedicines";

interface ImageUploaderProps {
  onAnalyze: (data: { imageData?: string; mimeType?: string; medicineQuery?: string }) => void;
  isLoading: boolean;
  selectedLanguage: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onAnalyze,
  isLoading,
  selectedLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<"photo" | "name">("photo");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [fileName, setFileName] = useState<string>("");
  const [medicineQuery, setMedicineQuery] = useState<string>("");
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPEG, PNG, WEBP).");
      return;
    }
    setMimeType(file.type);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      const base64 = result.split(",")[1];
      setBase64Data(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setBase64Data(null);
    setFileName("");
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Camera handling for mobile & desktop webcam
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Could not access live camera stream:", err);
      // Fallback: trigger file input with capture="environment"
      setCameraActive(false);
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setImagePreview(dataUrl);
      setBase64Data(dataUrl.split(",")[1]);
      setMimeType("image/jpeg");
      setFileName("Camera-Capture.jpg");
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "photo") {
      if (!base64Data) {
        alert("Please select or capture a medicine image first.");
        return;
      }
      onAnalyze({ imageData: base64Data, mimeType });
    } else {
      if (!medicineQuery.trim()) {
        alert("Please enter a medicine or prescription name.");
        return;
      }
      onAnalyze({ medicineQuery: medicineQuery.trim() });
    }
  };

  const handleSelectPreset = (preset: SampleMedicinePreset) => {
    setActiveTab("name");
    setMedicineQuery(`${preset.name} - ${preset.generic}`);
    onAnalyze({ medicineQuery: `${preset.name} (${preset.generic})` });
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5">
      {/* Tab Switcher: Snap Photo vs Type Medicine */}
      <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => {
            setActiveTab("photo");
            stopCamera();
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "photo"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Snap / Upload Medicine</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("name");
            stopCamera();
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "name"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Search by Name</span>
        </button>
      </div>

      {/* Tab 1: Photo Upload & Camera */}
      {activeTab === "photo" && (
        <div className="space-y-4">
          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video max-h-72 flex flex-col items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950/80 p-3 flex flex-col items-center">
              <div className="relative max-h-64 w-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Medicine to analyze"
                  className="max-h-60 max-w-full object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/80 hover:bg-red-600 text-slate-200 hover:text-white transition-all shadow-md"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-300 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{fileName || "Medicine photo loaded"}</span>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all cursor-pointer relative overflow-hidden ${
                dragOver
                  ? "border-emerald-400 bg-emerald-950/30 scale-[1.01]"
                  : "border-slate-700/80 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-950/60"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-all">
                <Camera className="w-8 h-8 stroke-[1.8]" />
              </div>

              <div className="text-base md:text-lg font-bold text-white">
                Tap to Take a Photo or Upload Label
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Snap the front of your medicine strip, syrup bottle, blister pack, or doctor's prescription
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-300">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" /> Choose File
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> Open Camera Live
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manual Search / Prescription Name */}
      {activeTab === "name" && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Enter Medicine Brand or Chemical Name:
          </label>
          <div className="relative">
            <input
              type="text"
              value={medicineQuery}
              onChange={(e) => setMedicineQuery(e.target.value)}
              placeholder="e.g. Crocin 650, Metformin 500mg, Amoxicillin, Pantoprazole..."
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm md:text-base font-medium shadow-inner"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            {medicineQuery && (
              <button
                type="button"
                onClick={() => setMedicineQuery("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Test Samples Bar */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Test Presets (1-Click Sample Medicines):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_MEDICINES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-200 border border-slate-800 hover:border-emerald-600/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title={`${preset.generic} - ${preset.indication}`}
            >
              <span>{preset.icon}</span>
              <span>{preset.name.split(" ")[0]}</span>
              <span className="text-[10px] text-slate-400">({preset.category})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Big Action Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || (activeTab === "photo" && !base64Data) || (activeTab === "name" && !medicineQuery.trim())}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-base md:text-lg shadow-xl shadow-emerald-900/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>MedSafe AI is Translating in {selectedLanguage}...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>Analyze & Explain in {selectedLanguage}</span>
          </>
        )}
      </button>
    </div>
  );
};
