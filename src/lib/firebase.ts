import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDL23dqKxfGBkLcxjGqKfnwInzIpgO235g",
  authDomain: "ukloverbangla.firebaseapp.com",
  projectId: "ukloverbangla",
  storageBucket: "ukloverbangla.firebasestorage.app",
  messagingSenderId: "64007694018",
  appId: "1:64007694018:web:728f3e9969cf670a193d5b"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
