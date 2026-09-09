import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Keep these as direct `process.env.NEXT_PUBLIC_*` references. Next.js replaces
// direct public-variable references in browser bundles at build time, but does
// not inline dynamic lookups such as `process.env[variableName]`.
const firebaseEnvironmentVariables = [
  ["NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
  ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN],
  ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
  ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET],
  ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID],
  ["NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID],
] as const;

const missingFirebaseVariables = firebaseEnvironmentVariables
  .filter(([, value]) => !value)
  .map(([name]) => name);

const isProduction = process.env.NODE_ENV === "production";

export function assertFirebaseConfigured() {
  if (missingFirebaseVariables.length > 0) {
    const hint = isProduction
      ? "Add these variables in your hosting provider's environment settings (Vercel: Project → Settings → Environment Variables), then deploy a new build. The build must be created after the variables are added because they are embedded at build time."
      : "Fill them in the .env.local file in the project root, then fully stop the dev server (Ctrl+C) and run npm run dev again. Restarting is required because environment variables are read when the server starts.";
    throw new Error(
      `Firebase is not configured. Missing: ${missingFirebaseVariables.join(", ")}. ${hint}`
    );
  }
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, db, storage };
