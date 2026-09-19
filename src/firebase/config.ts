import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project credentials
// Go to https://console.firebase.google.com → Create Project → Web App → Copy config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAt8iKzgWF9xNWHs5glrYDIzTjZ8_UW5ws',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'journal-clock.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'journal-clock',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'journal-clock.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '553151449502',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:553151449502:web:19b26dd932e557eb202e8f',
};

const isFirebaseConfigured = true;

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn('Firebase initialization failed:', e);
  }
}

export { app, auth, db, isFirebaseConfigured };
