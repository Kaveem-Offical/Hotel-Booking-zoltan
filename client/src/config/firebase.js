import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCwy9ymE-tOhcG-jjSxOpOBEicp1NI1HTs",
    authDomain: "zoltan-51993.firebaseapp.com",
    projectId: "zoltan-51993",
    storageBucket: "zoltan-51993.firebasestorage.app",
    messagingSenderId: "120266758296",
    appId: "1:120266758296:web:e581d1f9c3e07843a818ed",
    measurementId: "G-K5B8H2TJC6",
    databaseURL: "https://zoltan-51993-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { app, analytics, auth, database, googleProvider };
