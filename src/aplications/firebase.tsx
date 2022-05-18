import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

console.log('esta esta la api key', import.meta.env.VITE_REACT_APP_API_KEY);

const firebaseConfig = {
    apiKey: import.meta.env.VITE_REACT_APP_API_KEY,
    authDomain: import.meta.env.VITE_REACT_APP_PROJECT_ID + '.firebaseapp.com',
    projectId: import.meta.env.VITE_REACT_APP_PROJECT_ID,
    storageBucket: import.meta.env.VITE_REACT_APP_PROJECT_ID + ".appspot.com",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export default app;