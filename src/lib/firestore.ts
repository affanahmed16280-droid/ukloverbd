import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CartItem } from "@/store/cartStore";

export interface OrderPayload {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
}

export async function submitOrder(payload: OrderPayload): Promise<string> {
  const orderData = {
    ...payload,
    items: payload.items.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    createdAt: serverTimestamp(),
    status: "pending",
  };

  const docRef = await addDoc(collection(db, "orders"), orderData);
  return docRef.id;
}
