import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAp7DalG3oELJ7RBT_JYYSCqKq7CNX89_g",
  authDomain: "movies-33f4c.firebaseapp.com",
  databaseURL: "https://movies-33f4c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "movies-33f4c",
  storageBucket: "movies-33f4c.firebasestorage.app",
  messagingSenderId: "431494140222",
  appId: "1:431494140222:web:898452916bd76623a69c6f",
  measurementId: "G-R5S1YTTG5H"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);