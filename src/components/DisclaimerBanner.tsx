import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-slate-800 text-slate-500 text-xs">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="flex-1">
          <strong className="text-slate-400">Medical Safety Notice:</strong> MedSafe AI provides automated translation and packaging explanations to improve elder clarity and health literacy. Never modify, start, or stop prescription dosages without consulting your registered medical practitioner or licensed pharmacist. In emergencies, call your local ambulance or poison helpline immediately.
        </p>
      </div>
    </footer>
  );
};
