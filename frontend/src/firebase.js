// pAIr v3 — Firebase Configuration
// Google-only authentication for MSME business owners
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA0OKSXa6_Ou4ZA5XK6ANN-NfjTmR9BXEo",
  authDomain: "codeunnati-im-proj.firebaseapp.com",
  projectId: "codeunnati-im-proj",
  storageBucket: "codeunnati-im-proj.firebasestorage.app",
  messagingSenderId: "909462033616",
  appId: "1:909462033616:web:52dd1ec22299e08012fad5",
  measurementId: "G-EM3797X3KC",
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
