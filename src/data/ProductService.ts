import { db } from "@/firebaseSetup";
import { collection, getDocs, getDoc, doc, setDoc, updateDoc } from "firebase/firestore";

export const getProducts = async () => {
    const docSnap = await getDocs(collection(db, "products"));
    const products: Array<any> =[];
        docSnap.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
                likes: doc.data().likes || 0
            })
        });
    return products
}

export const getProduct = async (id: string) => {
    const docSnap = await getDoc(doc(db, "products", id));
    return { id: docSnap.id, ...docSnap.data(), likes: docSnap.data()?.likes || 0 }
}

export const editProduct = async (id: string, { likes }: { likes: number}) => {
    await updateDoc(doc(db, "products", id), { likes });
    return { id }
}