import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  AlertTriangle,
  Clock,
  Utensils,
  PlusCircle,
  BookmarkCheck,
  Bookmark,
  CheckCircle2,
  Info,
  Calendar,
  Sparkles,
  ShieldAlert,
  Flame,
} from "lucide-react";
import { MedicineAnalysis, TextSize } from "../types/medicine";
import { speakText, stopSpeaking } from "../utils/audio";
import { SUPPORTED_LANGUAGES } from "../data/languages";

interface MedicineCardProps {
  medicine: MedicineAnalysis;
  textSize: TextSize;
  highContrast: boolean;
  selectedLanguage: string;
  onAddToSchedule: (medicine: MedicineAnalysis) => void;
  isSavedInCabinet: boolean;
  onToggleSaveCabinet: (medicine: MedicineAnalysis) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  textSize,
  highContrast,
  selectedLanguage,
  onAddToSchedule,
  isSavedInCabinet,
  onToggleSaveCabinet,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.85); // Elder slow speech default
  const [justAddedToSchedule, setJustAddedToSchedule] = useState<boolean>(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(
    (l) => l.name.toLowerCase() === selectedLanguage.toLowerCase()
  ) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    // Stop speaking if medicine changes or unmounts
    return () => {
      stopSpeaking();
    };
  }, [medicine]);

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const narrationText = medicine.audioSpeechText || `${medicine.brandName}. ${medicine.purpose}. ${medicine.dosage}. ${medicine.timing}. ${medicine.warning}`;

    setIsSpeaking(true);
    await speakText(
      narrationText,
      currentLangObj.speechCode,
      speechSpeed,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleScheduleClick = () => {
    onAddToSchedule(medicine);
    setJustAddedToSchedule(true);
    setTimeout(() => setJustAddedToSchedule(false), 2500);
  };

  // Dynamic typography scale based on elder setting
  const titleSizeClass =
    textSize === "jumbo" ? "text-3xl md:text-4xl" : textSize === "large" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl";
  const bodySizeClass =
    textSize === "jumbo" ? "text-lg md:text-xl leading-relaxed" : textSize === "large" ? "text-base md:text-lg leading-relaxed" : "text-sm md:text-base leading-normal";
  const subtextSizeClass =
    textSize === "jumbo" ? "text-base md:text-lg" : textSize === "large" ? "text-sm md:text-base" : "text-xs md:text-sm";

  return (
    <div
      className={`rounded-3xl border transition-all shadow-2xl overflow-hidden ${
        highContrast
          ? "bg-slate-950 border-emerald-400 text-white"
          : "bg-slate-900/80 backdrop-blur-xl border-emerald-900/40 text-slate-100"
      }`}
    >
      {/* Top Banner: Brand & Generic */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border-b border-emerald-900/40">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Medical Details
              </span>
              <span className="text-xs text-slate-400">
                Language: <strong className="text-white">{selectedLanguage}</strong>
              </span>
            </div>
            <h2 className={`${titleSizeClass} font-black text-white tracking-tight`}>
              {medicine.brandName}
            </h2>
            <div className={`${subtextSizeClass} font-semibold text-emerald-400 mt-1 flex items-center gap-1.5`}>
              <span>Active Chemical:</span>
              <span className="text-emerald-300 underline underline-offset-2">{medicine.genericName}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSaveCabinet(medicine)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSavedInCabinet
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              {isSavedInCabinet ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4 text-emerald-400" />}
              <span>{isSavedInCabinet ? "Saved in Cabinet" : "Save to Cabinet"}</span>
            </button>

            <button
              type="button"
              onClick={handleScheduleClick}
              disabled={justAddedToSchedule}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                justAddedToSchedule
                  ? "bg-teal-500 text-slate-950"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950"
              }`}
            >
              {justAddedToSchedule ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to Today's List!</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Add to Daily Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Big Audio Narration Strip for Elders */}
        <div className="mt-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSpeak}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                isSpeaking
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              }`}
              title={isSpeaking ? "Stop Speaking" : "Listen in Native Language"}
            >
              {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 stroke-[2.5]" />}
            </button>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{isSpeaking ? "Reading Out Loud..." : `Listen in ${selectedLanguage} (सुनें / వినండి)`}</span>
                {isSpeaking && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-emerald-400 animate-bounce"></span>
                    <span className="w-1 h-5 bg-emerald-300 animate-bounce delay-75"></span>
                    <span className="w-1 h-2 bg-emerald-400 animate-bounce delay-150"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Clear voice narration designed for elders with low vision or reading difficulty
              </p>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-center bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Speed:</span>
            <button
              type="button"
              onClick={() => {
                setSpeechSpeed(0.75);
                if (isSpeaking) handleSpeak();
              }}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                speechSpeed === 0.75 ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white"
              }`}
            >
              0.75x (Elder Slow)
            </button>
            <button
              type="button"
              onClick={() => {
                setSpeechSpeed(1.0);
                if (isSpeaking) handleSpeak();
              }}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                speechSpeed === 1.0 ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white"
              }`}
            >
              1.0x (Normal)
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Purpose / Why this medicine is taken */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Why is this Medicine Prescribed? / यह किस बीमारी के लिए है? / ఎందుకు వాడాలి:</span>
          </div>
          <p className={`${bodySizeClass} font-semibold text-white leading-relaxed`}>
            {medicine.purpose}
          </p>
        </div>

        {/* 2-Column Info Grid: Dosage & Food Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Dosage & Strength */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Recommended Dosage / खुराक / మోతాదు:</span>
            </div>
            <div className={`${bodySizeClass} font-bold text-emerald-300`}>
              {medicine.dosage}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Always follow the exact dosage prescribed on your personal doctor prescription.
            </p>
          </div>

          {/* Timing & Food Interactions */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-teal-400" />
              <span>Food & Timing / भोजन का समय / భోజనం సమయం:</span>
            </div>
            <div className={`${bodySizeClass} font-bold text-teal-300`}>
              {medicine.timing}
            </div>
            <p className={`${subtextSizeClass} text-slate-300 mt-2 font-medium`}>
              {medicine.foodInstructions}
            </p>
          </div>
        </div>

        {/* Critical Safety Alert Box */}
        <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-amber-950/40 border border-red-500/40 shadow-inner">
          <div className="flex items-center gap-2 mb-2 text-red-400 font-extrabold text-sm md:text-base tracking-wide">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            <span>CRITICAL SAFETY WARNING / महत्वपूर्ण चेतावनी / హెచ్చరిక:</span>
          </div>
          <p className={`${bodySizeClass} font-bold text-red-200 leading-relaxed`}>
            {medicine.warning}
          </p>
        </div>

        {/* Missed Dose & Storage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>What if a Dose is Missed? / खुराक छूट जाए तो:</span>
            </div>
            <p className={`${subtextSizeClass} text-slate-300 font-medium`}>
              {medicine.missedDose}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Storage Guidelines / दवा रखने का तरीका:</span>
            </div>
            <p className={`${subtextSizeClass} text-slate-300 font-medium`}>
              {medicine.storage}
            </p>
          </div>
        </div>

        {/* Quick Key Takeaways Bullets */}
        {medicine.keyBulletPoints && medicine.keyBulletPoints.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Key Takeaways for Caregiver & Patient:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {medicine.keyBulletPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2.5 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className={`${subtextSizeClass} font-semibold`}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
