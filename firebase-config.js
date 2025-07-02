// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCLEw8oxzH2qpeJXuigyMJT2cL4W5QjUY",
  authDomain: "gason-9af35.firebaseapp.com",
  projectId: "gason-9af35",
  storageBucket: "gason-9af35.firebasestorage.app",
  messagingSenderId: "5093811758",
  appId: "1:5093811758:web:2faa458d4029de9bed21bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
