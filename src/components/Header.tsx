import React, { useState } from "react";
import { Pill, PhoneCall, Sun, Moon, FolderHeart, Cloud, LogIn, LogOut, Loader2 } from "lucide-react";
import { TextSize } from "../types/medicine";
import { useFirebase } from "../contexts/FirebaseContext";

interface HeaderProps {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  cabinetCount: number;
  onOpenCabinet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  textSize,
  setTextSize,
  highContrast,
  setHighContrast,
  cabinetCount,
  onOpenCabinet,
}) => {
  const [showEmergency, setShowEmergency] = useState(false);
  const { user, authReady, isSigningIn, signInWithGoogle, signOutUser } = useFirebase();

  return (
    <>
      <header className="w-full pt-4 pb-6 border-b border-emerald-900/30">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center text-slate-950 font-black">
              <Pill className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  MedSafe AI
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Elder Care
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                Multi-Language Medicine Explainer, Voice Reader & Pill Tracker
              </p>
            </div>
          </div>

          {/* Accessibility & Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            
            {/* Text Size Control for Elders */}
            <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-xl p-1 shadow-inner" title="Elder Text Size">
              <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
                Text:
              </span>
              <button
                type="button"
                onClick={() => setTextSize("normal")}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  textSize === "normal"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                title="Normal Text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setTextSize("large")}
                className={`px-2 py-1 rounded-lg text-sm font-bold transition-all ${
                  textSize === "large"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                title="Large Text for Seniors"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setTextSize("jumbo")}
                className={`px-2.5 py-1 rounded-lg text-base font-extrabold transition-all ${
                  textSize === "jumbo"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                title="Jumbo Text for Low Vision"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                highContrast
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/50"
                  : "bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-800"
              }`}
              title="Toggle High Contrast for clearer reading"
            >
              {highContrast ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">Contrast</span>
            </button>

            {/* My Cabinet Button */}
            <button
              type="button"
              onClick={onOpenCabinet}
              className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all relative"
            >
              <FolderHeart className="w-4 h-4 text-emerald-400" />
              <span>Cabinet</span>
              {cabinetCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                  {cabinetCount}
                </span>
              )}
            </button>

            {/* Emergency Hotline Button */}
            <button
              type="button"
              onClick={() => setShowEmergency(true)}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>SOS / Help</span>
            </button>

            {/* Cloud Sync / Google Auth Button */}
            {authReady && (
              user ? (
                <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-6 h-6 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Cloud className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-xs font-semibold text-emerald-200 max-w-[90px] truncate hidden sm:inline">
                    {user.displayName?.split(" ")[0] || "Synced"}
                  </span>
                  <button
                    type="button"
                    onClick={signOutUser}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={isSigningIn}
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Sign in with Google to save your medicine cabinet & schedule in the cloud"
                >
                  {isSigningIn ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5" />
                  )}
                  <span>{isSigningIn ? "Signing in..." : "Sync Account"}</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Medical Assistance</h3>
                <p className="text-xs text-red-300">If you suspect an overdose or severe reaction</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">Emergency Medical Services</div>
                  <div className="text-xs text-slate-400">National Ambulance</div>
                </div>
                <a
                  href="tel:108"
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Call 108 / 911 / 112
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">Poison Information Center</div>
                  <div className="text-xs text-slate-400">24x7 Medicine & Poison Helpline</div>
                </div>
                <a
                  href="tel:1800116117"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Call Helpline
                </a>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                ⚠️ <strong>Caregiver Notice:</strong> If the patient experiences difficulty breathing, facial swelling, chest pain, or sudden loss of consciousness, seek immediate hospital emergency care immediately.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEmergency(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
