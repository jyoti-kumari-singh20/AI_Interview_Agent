import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "ai-interview-9164c.firebaseapp.com",
  projectId: "ai-interview-9164c",
  storageBucket: "ai-interview-9164c.firebasestorage.app",
  messagingSenderId: "506033386600",
  appId: "1:506033386600:web:4539817cc3e4b5859637dd"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth , provider};