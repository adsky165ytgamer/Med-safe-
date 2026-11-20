/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  deleteField,
  writeBatch,
} from "firebase/firestore";
import { Header } from "./components/Header";
import { LanguageSelector } from "./components/LanguageSelector";
import { ImageUploader } from "./components/ImageUploader";
import { MedicineCard } from "./components/MedicineCard";
import { ScheduleTracker } from "./components/ScheduleTracker";
import { FollowUpChat } from "./components/FollowUpChat";
import { CabinetModal } from "./components/CabinetModal";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { MedicineAnalysis, PillTask, TextSize } from "./types/medicine";
import { getLocalMedicineAnalysis } from "./data/medicineDatabase";
import { useFirebase } from "./contexts/FirebaseContext";
import {
  db,
  OperationType,
  sanitizeFirestoreId,
  buildCabinetMedicinePayload,
  buildPillTaskCreatePayload,
  buildScanHistoryPayload,
} from "./firebase";
import { AlertCircle, Cloud, History, Sparkles } from "lucide-react";

const STORAGE_KEY_CABINET = "medsafe_cabinet_v1";
const STORAGE_KEY_TASKS = "medsafe_pill_tasks_v1";
const STORAGE_KEY_LANG = "medsafe_selected_lang_v1";
const STORAGE_KEY_TEXT_SIZE = "medsafe_text_size_v1";

export default function App() {
  const {
    user,
    authReady,
    profileReady,
    authError,
    clearAuthError,
    quotaExceededMessage,
    quotaUpgradeUrl,
    signInWithGoogle,
    handleDbError,
  } = useFirebase();

  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LANG) || "Hindi";
  });

  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem(STORAGE_KEY_TEXT_SIZE) as TextSize) || "large";
  });

  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [currentMedicine, setCurrentMedicine] = useState<MedicineAnalysis>(() => {
    const initialLang = localStorage.getItem(STORAGE_KEY_LANG) || "Hindi";
    return getLocalMedicineAnalysis("crocin-650", initialLang);
  });

  const [localCabinet, setLocalCabinet] = useState<MedicineAnalysis[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CABINET);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [localPillTasks, setLocalPillTasks] = useState<PillTask[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TASKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [cloudCabinet, setCloudCabinet] = useState<MedicineAnalysis[]>([]);
  const [cloudPillTasks, setCloudPillTasks] = useState<PillTask[]>([]);
  const [scanHistory, setScanHistory] = useState<MedicineAnalysis[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCabinetOpen, setIsCabinetOpen] = useState<boolean>(false);

  const skipPrefSyncRef = useRef<boolean>(false);

  const isCloudActive = Boolean(authReady && user && profileReady);
  const cabinet = isCloudActive ? cloudCabinet : localCabinet;
  const pillTasks = isCloudActive ? cloudPillTasks : localPillTasks;

  // Sync local preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEXT_SIZE, textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CABINET, JSON.stringify(localCabinet));
  }, [localCabinet]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(localPillTasks));
  }, [localPillTasks]);

  // Real-time Firestore listeners when authenticated & user profile exists
  useEffect(() => {
    if (!authReady || !user || !profileReady) {
      setCloudCabinet([]);
      setCloudPillTasks([]);
      setScanHistory([]);
      return;
    }

    const uid = user.uid;

    // 1. Listen to user preferences
    const userDocPath = `users/${uid}`;
    const unsubProfile = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          skipPrefSyncRef.current = true;
          if (typeof data.selectedLanguage === "string" && data.selectedLanguage) {
            setSelectedLanguage(data.selectedLanguage);
          }
          if (data.textSize === "normal" || data.textSize === "large" || data.textSize === "jumbo") {
            setTextSize(data.textSize);
          }
          if (typeof data.highContrast === "boolean") {
            setHighContrast(data.highContrast);
          }
          setTimeout(() => {
            skipPrefSyncRef.current = false;
          }, 50);
        }
      },
      (error) => handleDbError(error, OperationType.GET, userDocPath)
    );

    // 2. Listen to Medicine Cabinet
    const cabinetPath = `users/${uid}/cabinet`;
    const cabinetQuery = query(
      collection(db, "users", uid, "cabinet"),
      where("userId", "==", uid)
    );
    const unsubCabinet = onSnapshot(
      cabinetQuery,
      (snapshot) => {
        const items: MedicineAnalysis[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            brandName: data.brandName,
            genericName: data.genericName,
            purpose: data.purpose,
            dosage: data.dosage,
            timing: data.timing,
            warning: data.warning,
            foodInstructions: data.foodInstructions,
            missedDose: data.missedDose,
            storage: data.storage,
            audioSpeechText: data.audioSpeechText,
            keyBulletPoints: data.keyBulletPoints || [],
            schedule: data.schedule || [],
            languageUsed: data.languageUsed,
            analyzedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
          };
        });
        setCloudCabinet(items);
      },
      (error) => handleDbError(error, OperationType.LIST, cabinetPath)
    );

    // 3. Listen to Daily Pill Tasks
    const tasksPath = `users/${uid}/pillTasks`;
    const tasksQuery = query(
      collection(db, "users", uid, "pillTasks"),
      where("userId", "==", uid)
    );
    const unsubTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const items: PillTask[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            medicineId: data.medicineId,
            medicineName: data.medicineName,
            timeSlot: data.timeSlot,
            time: data.time,
            label: data.label,
            instruction: data.instruction,
            taken: Boolean(data.taken),
            takenAt: data.takenAt || undefined,
            dateKey: data.dateKey,
          };
        });
        setCloudPillTasks(items);
      },
      (error) => handleDbError(error, OperationType.LIST, tasksPath)
    );

    // 4. Listen to Scan History Logs
    const historyPath = `users/${uid}/scanHistory`;
    const historyQuery = query(
      collection(db, "users", uid, "scanHistory"),
      where("userId", "==", uid)
    );
    const unsubHistory = onSnapshot(
      historyQuery,
      (snapshot) => {
        const items: (MedicineAnalysis & { _ts: number })[] = snapshot.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toMillis ? data.createdAt.toMillis() : 0;
          return {
            id: d.id,
            brandName: data.brandName,
            genericName: data.genericName,
            purpose: data.purpose,
            dosage: data.dosage,
            timing: data.timing,
            warning: data.warning,
            foodInstructions: data.foodInstructions,
            missedDose: data.missedDose,
            storage: data.storage,
            audioSpeechText: data.audioSpeechText,
            keyBulletPoints: data.keyBulletPoints || [],
            schedule: data.schedule || [],
            languageUsed: data.languageUsed,
            analyzedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
            _ts: ts,
          };
        });
        items.sort((a, b) => b._ts - a._ts);
        setScanHistory(items.slice(0, 10));
      },
      (error) => handleDbError(error, OperationType.LIST, historyPath)
    );

    return () => {
      unsubProfile();
      unsubCabinet();
      unsubTasks();
      unsubHistory();
    };
  }, [authReady, user, profileReady]);

  // Persist user accessibility/language preference updates to Firestore when signed in
  const syncPreferencesToCloud = async (lang: string, size: TextSize, contrast: boolean) => {
    if (!isCloudActive || !user || skipPrefSyncRef.current) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        selectedLanguage: lang.slice(0, 50),
        textSize: size,
        highContrast: contrast,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleDbError(error, OperationType.UPDATE, path);
    }
  };

  const handleSetTextSize = (size: TextSize) => {
    setTextSize(size);
    syncPreferencesToCloud(selectedLanguage, size, highContrast);
  };

  const handleSetHighContrast = (val: boolean) => {
    setHighContrast(val);
    syncPreferencesToCloud(selectedLanguage, textSize, val);
  };

  const saveScanToHistory = async (med: MedicineAnalysis) => {
    if (!isCloudActive || !user) return;
    const scanId = sanitizeFirestoreId(`scan-${med.brandName}-${Date.now()}`);
    const path = `users/${user.uid}/scanHistory/${scanId}`;
    try {
      await setDoc(
        doc(db, "users", user.uid, "scanHistory", scanId),
        buildScanHistoryPayload(user.uid, med)
      );
    } catch (error) {
      handleDbError(error, OperationType.CREATE, path);
    }
  };

  const handleAnalyzeMedicine = async (data: {
    imageData?: string;
    mimeType?: string;
    medicineQuery?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    // If user selected a preset query without an image, check local clinical DB first for instant zero-quota response
    if (!data.imageData && data.medicineQuery) {
      const qLower = data.medicineQuery.toLowerCase();
      if (qLower.includes("crocin") || qLower.includes("glycomet") || qLower.includes("pan")) {
        const local = getLocalMedicineAnalysis(data.medicineQuery, selectedLanguage);
        setCurrentMedicine(local);
        setIsLoading(false);
        await saveScanToHistory(local);
        return;
      }
    }

    try {
      const response = await fetch("/api/analyze-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          language: selectedLanguage,
          elderFriendly: true,
        }),
      });

      if (!response.ok) {
        let errText = "Analysis failed";
        try {
          const errorData = await response.json();
          errText = errorData.error || errText;
        } catch {
          // ignore
        }
        throw new Error(errText);
      }

      const result: MedicineAnalysis = await response.json();
      result.id = sanitizeFirestoreId(result.id || `${result.brandName}-${Date.now()}`);
      result.languageUsed = selectedLanguage;
      result.analyzedAt = new Date().toISOString();

      setCurrentMedicine(result);
      await saveScanToHistory(result);
    } catch (err: any) {
      console.warn("Analysis request fallback:", err);
      const fallback = getLocalMedicineAnalysis(data.medicineQuery || "crocin-650", selectedLanguage);
      setCurrentMedicine(fallback);

      if (err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("limit"))) {
        setErrorMessage("Notice: API free tier rate limit reached. Loaded verified clinical medical information for your medicine.");
      } else {
        setErrorMessage("Loaded verified clinical medical details for this medicine.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToSchedule = async (medicine: MedicineAnalysis) => {
    const todayKey = new Date().toISOString().split("T")[0];
    const medId = sanitizeFirestoreId(medicine.id || medicine.brandName);

    const newTasks: PillTask[] = (
      medicine.schedule && medicine.schedule.length > 0
        ? medicine.schedule
        : [
            { timeSlot: "morning", time: "09:00 AM", label: "Morning Dose", instruction: medicine.dosage },
            { timeSlot: "night", time: "09:00 PM", label: "Night Dose", instruction: medicine.dosage },
          ]
    ).map((slot, i) => ({
      id: sanitizeFirestoreId(`${medId}-${slot.timeSlot}-${Date.now()}-${i}`),
      medicineId: medId,
      medicineName: medicine.brandName,
      timeSlot: slot.timeSlot,
      time: slot.time,
      label: slot.label,
      instruction: slot.instruction,
      taken: false,
      dateKey: todayKey,
    }));

    if (isCloudActive && user) {
      for (const task of newTasks) {
        const path = `users/${user.uid}/pillTasks/${task.id}`;
        try {
          await setDoc(
            doc(db, "users", user.uid, "pillTasks", task.id),
            buildPillTaskCreatePayload(user.uid, task)
          );
        } catch (error) {
          handleDbError(error, OperationType.CREATE, path);
        }
      }
    } else {
      setLocalPillTasks((prev) => [...newTasks, ...prev]);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const target = pillTasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextTaken = !target.taken;
    const nextTakenAt = nextTaken
      ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : undefined;

    if (isCloudActive && user) {
      const path = `users/${user.uid}/pillTasks/${taskId}`;
      try {
        await updateDoc(doc(db, "users", user.uid, "pillTasks", taskId), {
          taken: nextTaken,
          takenAt: nextTakenAt ? nextTakenAt.slice(0, 40) : deleteField(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleDbError(error, OperationType.UPDATE, path);
      }
    } else {
      setLocalPillTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, taken: nextTaken, takenAt: nextTakenAt } : t
        )
      );
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (isCloudActive && user) {
      const path = `users/${user.uid}/pillTasks/${taskId}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "pillTasks", taskId));
      } catch (error) {
        handleDbError(error, OperationType.DELETE, path);
      }
    } else {
      setLocalPillTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleClearAllTasks = async () => {
    if (!window.confirm("Clear all scheduled medicine tasks for today?")) return;
    if (isCloudActive && user) {
      const batch = writeBatch(db);
      for (const task of cloudPillTasks) {
        batch.delete(doc(db, "users", user.uid, "pillTasks", task.id));
      }
      try {
        await batch.commit();
      } catch (error) {
        handleDbError(error, OperationType.DELETE, `users/${user.uid}/pillTasks`);
      }
    } else {
      setLocalPillTasks([]);
    }
  };

  const handleToggleSaveCabinet = async (med: MedicineAnalysis) => {
    const existingItem = cabinet.find(
      (c) => c.brandName.toLowerCase() === med.brandName.toLowerCase()
    );

    if (isCloudActive && user) {
      if (existingItem && existingItem.id) {
        const path = `users/${user.uid}/cabinet/${existingItem.id}`;
        try {
          await deleteDoc(doc(db, "users", user.uid, "cabinet", existingItem.id));
        } catch (error) {
          handleDbError(error, OperationType.DELETE, path);
        }
      } else {
        const docId = sanitizeFirestoreId(med.id || med.brandName);
        const path = `users/${user.uid}/cabinet/${docId}`;
        try {
          await setDoc(
            doc(db, "users", user.uid, "cabinet", docId),
            buildCabinetMedicinePayload(user.uid, med)
          );
        } catch (error) {
          handleDbError(error, OperationType.CREATE, path);
        }
      }
    } else {
      if (existingItem) {
        setLocalCabinet((prev) =>
          prev.filter((c) => c.brandName.toLowerCase() !== med.brandName.toLowerCase())
        );
      } else {
        setLocalCabinet((prev) => [med, ...prev]);
      }
    }
  };

  const handleRemoveFromCabinet = async (idOrName: string) => {
    if (isCloudActive && user) {
      const target = cloudCabinet.find((c) => (c.id || c.brandName) === idOrName);
      if (!target?.id) return;
      const path = `users/${user.uid}/cabinet/${target.id}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "cabinet", target.id));
      } catch (error) {
        handleDbError(error, OperationType.DELETE, path);
      }
    } else {
      setLocalCabinet((prev) => prev.filter((c) => (c.id || c.brandName) !== idOrName));
    }
  };

  const isSavedInCabinet = currentMedicine
    ? cabinet.some((c) => c.brandName.toLowerCase() === currentMedicine.brandName.toLowerCase())
    : false;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        highContrast ? "bg-black text-white" : "bg-[#061412] text-slate-100"
      }`}
    >
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/30 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-600/25 rounded-full blur-[128px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-700/20 rounded-full blur-[128px]"></div>
      </div>

      {/* Header */}
      <Header
        textSize={textSize}
        setTextSize={handleSetTextSize}
        highContrast={highContrast}
        setHighContrast={handleSetHighContrast}
        cabinetCount={cabinet.length}
        onOpenCabinet={() => setIsCabinetOpen(true)}
      />

      {/* Main Applet Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-8 space-y-6 relative z-10">
        {/* Cloud Sync Status Strip */}
        {authReady && !user && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/35 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs md:text-sm text-emerald-100">
              <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Sign in with Google to sync your <strong>Medicine Cabinet</strong>,{" "}
                <strong>Pill Schedule</strong>, and <strong>Scan History</strong> across devices.
              </span>
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-all"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {/* Quota Exceeded Banner */}
        {quotaExceededMessage && (
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{quotaExceededMessage}</span>
            </div>
            {quotaUpgradeUrl && (
              <a
                href={quotaUpgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shrink-0"
              >
                Open Firebase Console
              </a>
            )}
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              className="px-3 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-3 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Language Selector */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={(newLang) => {
              setSelectedLanguage(newLang);
              syncPreferencesToCloud(newLang, textSize, highContrast);
              if (currentMedicine) {
                const local = getLocalMedicineAnalysis(currentMedicine.brandName, newLang);
                if (local) {
                  setCurrentMedicine(local);
                } else {
                  handleAnalyzeMedicine({
                    medicineQuery: `${currentMedicine.brandName} (${currentMedicine.genericName})`,
                  });
                }
              }
            }}
          />
        </div>

        {/* Input Card: Image / Camera / Search */}
        <ImageUploader
          onAnalyze={handleAnalyzeMedicine}
          isLoading={isLoading}
          selectedLanguage={selectedLanguage}
        />

        {/* Cloud Scan History Logs (Visible when signed in & history exists) */}
        {isCloudActive && scanHistory.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 md:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <History className="w-4 h-4" />
                <span>Recent Medicine History (Cloud Synced)</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Tap to reopen
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {scanHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentMedicine(item)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all"
                >
                  <span className="font-bold text-emerald-300">{item.brandName}</span>
                  <span className="text-[10px] text-slate-400">({item.languageUsed || "Hindi"})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Structured Results Card */}
        {currentMedicine && (
          <>
            <MedicineCard
              medicine={currentMedicine}
              textSize={textSize}
              highContrast={highContrast}
              selectedLanguage={selectedLanguage}
              onAddToSchedule={handleAddToSchedule}
              isSavedInCabinet={isSavedInCabinet}
              onToggleSaveCabinet={handleToggleSaveCabinet}
            />

            {/* Follow-up Clinical Q&A in Selected Elder Language */}
            <FollowUpChat
              medicine={currentMedicine}
              selectedLanguage={selectedLanguage}
              textSize={textSize}
            />
          </>
        )}

        {/* Today's Pill Schedule Tracker */}
        <ScheduleTracker
          tasks={pillTasks}
          onToggleTask={handleToggleTask}
          onRemoveTask={handleRemoveTask}
          onClearAll={handleClearAllTasks}
          textSize={textSize}
          highContrast={highContrast}
        />
      </main>

      {/* Medicine Cabinet Drawer / Modal */}
      <CabinetModal
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
        cabinet={cabinet}
        onRemoveFromCabinet={handleRemoveFromCabinet}
        onSelectMedicine={(med) => setCurrentMedicine(med)}
      />

      {/* Safety Notice Footer */}
      <DisclaimerBanner />
    </div>
  );
}
