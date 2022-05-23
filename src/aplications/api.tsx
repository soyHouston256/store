import firebase, { db } from './firebase';
import { collection, getDocs, query, doc, getDoc, addDoc, deleteDoc, updateDoc, setDoc, where } from "firebase/firestore";
import ProductResponse from '@/models/ProductResponse';
import Product from '@/models/product';


const collectionName = 'products';
const itemsCollection = collection(db, collectionName);

export const getItems= async ():Promise<Product[]>  => {
    const {docs} = await getDocs(query(itemsCollection));
    return docs.map(doc => doc.data().products)[0];
}