import { db } from "@/firebaseSetup";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

export const getProducts = async () => {
    const docSnap = await getDocs(collection(db, "products"));
    const products: Array<any> =[];
        docSnap.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            })
        });
    return products
}

export const getProduct = async (id: string) => {
    const docSnap = await getDoc(doc(db, "products", id));
    return {id: docSnap.id, ...docSnap.data()}
}