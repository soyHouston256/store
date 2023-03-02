import { OrderType } from "@/types/OrderType";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseSetup";

export const createOrder = async (order: OrderType) => {
    console.log(order)
    await setDoc(doc(db, "orders", order.id!), order);
    return order
}