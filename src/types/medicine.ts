export interface MedicineScheduleItem {
  timeSlot: "morning" | "afternoon" | "evening" | "night" | string;
  time: string;
  label: string;
  instruction: string;
}

export interface MedicineAnalysis {
  id?: string;
  brandName: string;
  genericName: string;
  purpose: string;
  dosage: string;
  timing: string;
  warning: string;
  foodInstructions: string;
  missedDose: string;
  storage: string;
  audioSpeechText: string;
  keyBulletPoints: string[];
  schedule: MedicineScheduleItem[];
  imageUrl?: string;
  analyzedAt?: string;
  languageUsed?: string;
}

export interface PillTask {
  id: string;
  medicineId: string;
  medicineName: string;
  timeSlot: string;
  time: string;
  label: string;
  instruction: string;
  taken: boolean;
  takenAt?: string;
  dateKey: string; // YYYY-MM-DD
}

export interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  speechCode: string; // e.g. hi-IN, te-IN
  flag: string;
}

export type TextSize = "normal" | "large" | "jumbo";
