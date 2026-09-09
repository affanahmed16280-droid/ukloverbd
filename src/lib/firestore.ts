import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { CartItem } from "@/store/cartStore";

export interface OrderPayload {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
}

function normalizeOrderItem(item: CartItem) {
  if (
    !item.id ||
    !item.name.trim() ||
    !Number.isFinite(item.price) ||
    item.price < 0 ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1
  ) {
    throw new Error("Your cart contains an invalid product. Please update your cart and try again.");
  }

  return {
    id: item.id,
    name: item.name.trim(),
    brand: item.brand.trim(),
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  };
}

export async function submitOrder(payload: OrderPayload): Promise<string> {
  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const address = payload.address.trim();

  if (!name || !phone || !address) {
    throw new Error("Name, phone number, and shipping address are required.");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const items = payload.items.map(normalizeOrderItem);
  const calculatedTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!Number.isFinite(payload.total) || payload.total <= 0 || calculatedTotal !== payload.total) {
    throw new Error("Your order total could not be verified. Please refresh your cart and try again.");
  }

  const orderData = {
    name,
    phone,
    address,
    notes: payload.notes?.trim() ?? "",
    items,
    total: calculatedTotal,
    createdAt: serverTimestamp(),
    status: "pending",
  };

  const docRef = await addDoc(collection(db, "orders"), orderData);
  return docRef.id;
}
