import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "[GCP_API_KEY]",
  authDomain: "salah-pro-tracker.firebaseapp.com",
  projectId: "salah-pro-tracker",
  storageBucket: "salah-pro-tracker.firebasestorage.app",
  messagingSenderId: "555420890201",
  appId: "1:555420890201:web:b0f4b7fb4c2334a138ed48",
  measurementId: "G-568947878"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();