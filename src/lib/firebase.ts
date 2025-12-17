import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBgrUj4FZLG0D0Lgn2kyQbssHE6Kro_ekw",
  authDomain: "for-my-juniors.firebaseapp.com",
  projectId: "for-my-juniors",
  storageBucket: "for-my-juniors.firebasestorage.app",
  messagingSenderId: "239106147784",
  appId: "1:239106147784:web:ae8449231baa689d222cfd",
  measurementId: "G-SXSN21H7F4"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Analytics (only in browser)
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;

