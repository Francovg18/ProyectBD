import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC6sDPhC3rf-inEfeiQtwXXJvf2_0Fa8uo",
  authDomain: "sistema-de-elecciones-bd3.firebaseapp.com",
  projectId: "sistema-de-elecciones-bd3",
  storageBucket: "sistema-de-elecciones-bd3.firebasestorage.app",
  messagingSenderId: "10872179255",
  appId: "1:10872179255:web:f14d3c13de71f99db10db2",
  measurementId: "G-SX14V7SKLN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);