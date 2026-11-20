import React, { useState } from "react";
import {
  FolderHeart,
  X,
  Share2,
  Copy,
  Printer,
  Trash2,
  ExternalLink,
  Check,
  Pill,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { MedicineAnalysis } from "../types/medicine";

interface CabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabinet: MedicineAnalysis[];
  onRemoveFromCabinet: (idOrName: string) => void;
  onSelectMedicine: (medicine: MedicineAnalysis) => void;
}

export const CabinetModal: React.FC<CabinetModalProps> = ({
  isOpen,
  onClose,
  cabinet,
  onRemoveFromCabinet,
  onSelectMedicine,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateCaregiverSummaryText = () => {
    let text = `📋 MedSafe AI - Caregiver Medicine Summary Sheet\nDate: ${new Date().toLocaleDateString()}\nTotal Medicines: ${cabinet.length}\n\n`;

    cabinet.forEach((med, idx) => {
      text += `[${idx + 1}] ${med.brandName} (${med.genericName})\n`;
      text += `• Purpose: ${med.purpose}\n`;
      text += `• Dose: ${med.dosage}\n`;
      text += `• Timing: ${med.timing}\n`;
      text += `• Warning: ${med.warning}\n\n`;
    });

    text += `*Generated for safe elder care. Always consult attending physician.*`;
    return text;
  };

  const handleCopySummary = () => {
    const text = generateCaregiverSummaryText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateCaregiverSummaryText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white">
                Elder's Medicine Cabinet ({cabinet.length})
              </h3>
              <p className="text-xs text-slate-400">
                Persistent list of all daily prescriptions for family & doctor reference
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
          {cabinet.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div className="text-base font-bold text-slate-300">Your Cabinet is Currently Empty</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                After scanning or viewing any medicine, click <strong>"Save to Cabinet"</strong> to keep it here permanently.
              </p>
            </div>
          ) : (
            cabinet.map((med, idx) => (
              <div
                key={med.id || idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-white truncate">
                      {med.brandName}
                    </h4>
                  </div>
                  <div className="text-xs text-emerald-400 font-medium ml-8">
                    {med.genericName}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 ml-8 line-clamp-1">
                    {med.purpose}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2 ml-8">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-emerald-400" /> {med.dosage}
                    </span>
                    <span>•</span>
                    <span>{med.timing}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMedicine(med);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromCabinet(med.id || med.brandName)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-700 transition-all"
                    title="Remove from cabinet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions: Share & Print */}
        {cabinet.length > 0 && (
          <div className="p-4 md:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Caregiver & Emergency Tools:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied Summary!" : "Copy Summary"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Print Medication Sheet"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
