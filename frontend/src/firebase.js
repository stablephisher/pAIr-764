// pAIr v3 — Firebase Configuration
// Google-only authentication for MSME business owners
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA0OKSXa6_Ou4ZA5XK6ANN-NfjTmR9BXEo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "codeunnati-im-proj.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "codeunnati-im-proj",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "codeunnati-im-proj.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "909462033616",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:909462033616:web:52dd1ec22299e08012fad5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EM3797X3KC",
};

let app = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase init failed (demo mode):", e.message);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not configured");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logOut = async () => {
  if (auth) await signOut(auth);
};

export { auth };
export default app;
