// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
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

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
