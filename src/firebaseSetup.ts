import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAZpufa9fi9yDj6w2YvRL4ZsbmbJtUY13M",
    authDomain: "devstore-c8adb.firebaseapp.com",
    projectId: "devstore-c8adb",
    storageBucket: "devstore-c8adb.appspot.com",
    messagingSenderId: "245550783453",
    appId: "1:245550783453:web:bbfc05a15ebfefbe59f434"
}; //this is where your firebase app values you copied will go

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)