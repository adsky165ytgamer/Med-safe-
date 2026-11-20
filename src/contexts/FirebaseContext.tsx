import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  buildUserProfileCreatePayload,
  FIREBASE_CONSOLE_QUOTA_URL,
} from "../firebase";
import { TextSize } from "../types/medicine";

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  profileReady: boolean;
  profileCreatedAt: Timestamp | null;
  isSigningIn: boolean;
  authError: string | null;
  quotaExceededMessage: string | null;
  quotaUpgradeUrl: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
  handleDbError: (error: unknown, operation: OperationType, path: string | null) => void;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [profileReady, setProfileReady] = useState<boolean>(false);
  const [profileCreatedAt, setProfileCreatedAt] = useState<Timestamp | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [quotaExceededMessage, setQuotaExceededMessage] = useState<string | null>(null);
  const [quotaUpgradeUrl, setQuotaUpgradeUrl] = useState<string | null>(null);

  const checkQuotaError = (error: unknown): boolean => {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Quota exceeded")) {
      if (msg.includes("Free daily read units per project")) {
        setQuotaUpgradeUrl(FIREBASE_CONSOLE_QUOTA_URL);
      }
      setQuotaExceededMessage(
        "Firestore daily free-tier quota exceeded. Quota resets tomorrow, or check the Spark plan limits in Firebase Console."
      );
      return true;
    }
    return false;
  };

  const handleDbError = (error: unknown, operation: OperationType, path: string | null) => {
    if (checkQuotaError(error)) {
      return;
    }
    handleFirestoreError(error, operation, path);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setProfileReady(false);
      setProfileCreatedAt(null);

      if (firebaseUser) {
        const userDocPath = `users/${firebaseUser.uid}`;
        const userDocRef = doc(db, "users", firebaseUser.uid);

        try {
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            const savedLang = localStorage.getItem("medsafe_selected_lang_v1") || "Hindi";
            const savedSize = (localStorage.getItem("medsafe_text_size_v1") as TextSize) || "large";
            const payload = buildUserProfileCreatePayload(
              firebaseUser.uid,
              savedLang,
              savedSize,
              false
            );
            try {
              await setDoc(userDocRef, payload);
              const freshSnap = await getDoc(userDocRef);
              if (freshSnap.exists() && freshSnap.data()?.createdAt instanceof Timestamp) {
                setProfileCreatedAt(freshSnap.data().createdAt);
              }
            } catch (writeErr) {
              if (!checkQuotaError(writeErr)) {
                handleFirestoreError(writeErr, OperationType.CREATE, userDocPath);
              }
            }
          } else {
            const data = snap.data();
            if (data?.createdAt instanceof Timestamp) {
              setProfileCreatedAt(data.createdAt);
            }
          }
          setProfileReady(true);
        } catch (readErr) {
          if (!checkQuotaError(readErr)) {
            handleFirestoreError(readErr, OperationType.GET, userDocPath);
          }
        }
      }

      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in window was closed before completing.");
      } else if (err?.code === "auth/popup-blocked") {
        setAuthError("Pop-up was blocked by the browser. Please allow pop-ups and try again.");
      } else {
        setAuthError(err?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setProfileReady(false);
      setProfileCreatedAt(null);
    } catch (err: any) {
      console.error("Sign-out failed:", err);
      setAuthError(err?.message || "Failed to sign out.");
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        profileReady,
        profileCreatedAt,
        isSigningIn,
        authError,
        quotaExceededMessage,
        quotaUpgradeUrl,
        signInWithGoogle,
        signOutUser,
        clearAuthError: () => setAuthError(null),
        handleDbError,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return ctx;
}
