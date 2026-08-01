import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7yff-HxP2EI-tuiTshizJC3Af3L5Ikdo",
  authDomain: "ai-resume-builder-ae4fa.firebaseapp.com",
  projectId: "ai-resume-builder-ae4fa",
  storageBucket: "ai-resume-builder-ae4fa.firebasestorage.app",
  messagingSenderId: "740810352488",
  appId: "1:740810352488:web:0e21dbcef7db97d56498dd",
  measurementId: "G-RV0D970FHF",
};

console.log("Firebase Project:", firebaseConfig.projectId);
console.log("Firebase Auth Domain:", firebaseConfig.authDomain);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported
let analytics = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  analytics,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
};