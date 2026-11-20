import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { MedicineAnalysis, PillTask, TextSize } from "./types/medicine";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Startup connection validation
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Defensive Payload Sanitization & Blueprint Alignment ---

export function sanitizeFirestoreId(raw: string): string {
  const cleaned = (raw || "item")
    .replace(/[^a-zA-Z0-9_\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (cleaned || `id-${Date.now()}`).slice(0, 128);
}

function clampString(val: unknown, fallback: string, maxLen: number): string {
  const str = typeof val === "string" && val.trim().length > 0 ? val.trim() : fallback;
  return str.slice(0, maxLen);
}

export function buildUserProfileCreatePayload(
  userId: string,
  selectedLanguage: string,
  textSize: TextSize,
  highContrast: boolean
) {
  return {
    userId: sanitizeFirestoreId(userId),
    selectedLanguage: clampString(selectedLanguage, "Hindi", 50),
    textSize: (["normal", "large", "jumbo"].includes(textSize) ? textSize : "large") as TextSize,
    highContrast: Boolean(highContrast),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildUserProfileUpdatePayload(
  userId: string,
  selectedLanguage: string,
  textSize: TextSize,
  highContrast: boolean,
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>
) {
  return {
    userId: sanitizeFirestoreId(userId),
    selectedLanguage: clampString(selectedLanguage, "Hindi", 50),
    textSize: (["normal", "large", "jumbo"].includes(textSize) ? textSize : "large") as TextSize,
    highContrast: Boolean(highContrast),
    createdAt,
    updatedAt: serverTimestamp(),
  };
}

function sanitizeMedicineCore(userId: string, med: MedicineAnalysis) {
  const bullets = Array.isArray(med.keyBulletPoints)
    ? med.keyBulletPoints
        .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
        .slice(0, 10)
        .map((b) => b.slice(0, 300))
    : [];

  const schedule = Array.isArray(med.schedule)
    ? med.schedule.slice(0, 10).map((s) => ({
        timeSlot: clampString(s?.timeSlot, "morning", 40),
        time: clampString(s?.time, "09:00 AM", 40),
        label: clampString(s?.label, "Dose", 100),
        instruction: clampString(s?.instruction, "Take as directed", 500),
      }))
    : [];

  return {
    userId: sanitizeFirestoreId(userId),
    brandName: clampString(med.brandName, "Medicine", 200),
    genericName: clampString(med.genericName, "Unknown Generic", 200),
    purpose: clampString(med.purpose, "Consult doctor for purpose.", 1000),
    dosage: clampString(med.dosage, "As prescribed", 500),
    timing: clampString(med.timing, "After meals", 500),
    warning: clampString(med.warning, "Consult your physician before changing dosage.", 1500),
    foodInstructions: clampString(med.foodInstructions, "Take with plain water.", 1000),
    missedDose: clampString(med.missedDose, "Take when remembered unless close to next dose.", 1000),
    storage: clampString(med.storage, "Store in a cool, dry place.", 500),
    audioSpeechText: clampString(med.audioSpeechText, med.purpose || med.brandName, 1500),
    keyBulletPoints: bullets,
    schedule,
    languageUsed: clampString(med.languageUsed, "Hindi", 50),
  };
}

export function buildCabinetMedicinePayload(userId: string, med: MedicineAnalysis) {
  return {
    ...sanitizeMedicineCore(userId, med),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildScanHistoryPayload(userId: string, med: MedicineAnalysis) {
  return {
    ...sanitizeMedicineCore(userId, med),
    createdAt: serverTimestamp(),
  };
}

export function buildPillTaskCreatePayload(userId: string, task: PillTask) {
  const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  const validDateKey = dateRegex.test(task.dateKey)
    ? task.dateKey
    : new Date().toISOString().split("T")[0];

  const payload: Record<string, unknown> = {
    userId: sanitizeFirestoreId(userId),
    medicineId: sanitizeFirestoreId(task.medicineId || task.medicineName),
    medicineName: clampString(task.medicineName, "Medicine", 200),
    timeSlot: clampString(task.timeSlot, "morning", 40),
    time: clampString(task.time, "09:00 AM", 40),
    label: clampString(task.label, "Daily Dose", 100),
    instruction: clampString(task.instruction, "1 Tablet", 500),
    taken: Boolean(task.taken),
    dateKey: validDateKey.slice(0, 20),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (task.takenAt) {
    payload.takenAt = clampString(task.takenAt, "", 40);
  }

  return payload;
}

export const FIREBASE_CONSOLE_QUOTA_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;
