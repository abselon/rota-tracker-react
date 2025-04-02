import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvEGsZOKi5vMQWBM-x3yc7Tua2O-vcut4",
  authDomain: "rota-tracker.firebaseapp.com",
  projectId: "rota-tracker",
  storageBucket: "rota-tracker.firebasestorage.app",
  messagingSenderId: "783519398646",
  appId: "1:783519398646:web:7727fc277db25c322f0ad7",
  measurementId: "G-QC9HTNR454"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics }; 