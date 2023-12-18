import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBRWCxx3Voly9UFyDoqGry-HRbMiqggiQk',
  authDomain: 'voice-summarizer.firebaseapp.com',
  projectId: 'voice-summarizer',
  storageBucket: 'voice-summarizer.appspot.com',
  messagingSenderId: '947731590796',
  appId: '1:947731590796:web:cd232c2bb57ef8579855a9',
  measurementId: 'G-Q7J9V35E20',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
