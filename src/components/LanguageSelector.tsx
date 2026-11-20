import React from "react";
import { Languages, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../data/languages";
import { LanguageOption } from "../types/medicine";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-emerald-400" />
          <span>Elder's Language / बुजुर्ग की भाषा / భాష / மொழி:</span>
        </label>
        <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
          Native Script & Voice
        </span>
      </div>

      {/* Quick horizontal badges for fast elder selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage.toLowerCase() === lang.name.toLowerCase();
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => onSelectLanguage(lang.name)}
              className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 group ${
                isSelected
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-900/40 font-semibold"
                  : "bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 border-slate-700/50 hover:border-slate-600"
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm md:text-base font-bold truncate leading-tight">
                  {lang.nativeName}
                </div>
                <div className={`text-[10px] truncate ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                  {lang.name}
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 shrink-0 text-white stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
