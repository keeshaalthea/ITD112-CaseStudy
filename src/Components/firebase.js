import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsDz2T_fE8owOin2s3OLh7Lsq4vbOM7ok",
  authDomain: "ratillacs-483eb.firebaseapp.com",
  projectId: "ratillacs-483eb",
  storageBucket: "ratillacs-483eb.firebasestorage.app",
  messagingSenderId: "712545093563",
  appId: "1:712545093563:web:bdc68eb33d0f43860ee69e",
  measurementId: "G-FYEJ7NEF52"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };