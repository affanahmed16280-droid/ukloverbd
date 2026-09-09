import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "qvkox4mr";

export function cloudinaryUrl(
  publicId: string,
  width = 400,
  height = 400
): string {
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  variant: string;
  price: number;
  originalPrice?: number;
  image: string; // Cloudinary public_id
  category: string;
  badge?: string;
  createdAt?: number;
}

export interface FirestoreProduct {
  title?: unknown;
  name?: unknown;
  brand?: unknown;
  variant?: unknown;
  price?: unknown;
  originalPrice?: unknown;
  imageUrl?: unknown;
  image_url?: unknown;
  image?: unknown;
  category?: unknown;
  categoryName?: unknown;
  category_name?: unknown;
  categoryId?: unknown;
  category_id?: unknown;
  badge?: unknown;
  sku?: unknown;
  createdAt?: unknown;
}

function firstString(...values: unknown[]): string | undefined {
  return values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  )?.trim();
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toTimestamp(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === "object" && "toMillis" in value) {
    const toMillis = (value as { toMillis?: unknown }).toMillis;
    if (typeof toMillis === "function") {
      const result = toMillis.call(value);
      return typeof result === "number" && Number.isFinite(result) ? result : undefined;
    }
  }
  if (value && typeof value === "object" && "seconds" in value) {
    const seconds = (value as { seconds?: unknown }).seconds;
    return typeof seconds === "number" && Number.isFinite(seconds)
      ? seconds * 1000
      : undefined;
  }
  return undefined;
}

export function productFromFirestore(
  id: string,
  data: FirestoreProduct
): Product | null {
  const image = firstString(data.image_url, data.imageUrl, data.image) ?? "";
  const name = firstString(data.title, data.name) ?? "";

  if (!image || !name) {
    return null;
  }

  return {
    id,
    brand: firstString(data.brand) ?? "UK Brand Lover",
    name,
    variant: firstString(data.variant) ?? "",
    price: toNumber(data.price) ?? 0,
    originalPrice: toNumber(data.originalPrice),
    image,
    category: firstString(
      data.category,
      data.category_name,
      data.categoryName,
      data.category_id,
      data.categoryId,
    ) ?? "Beauty & Care",
    badge: firstString(data.badge),
    createdAt: toTimestamp(data.createdAt),
  };
}

export async function getStoreProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs
    .map((document) => productFromFirestore(document.id, document.data()))
    .filter((product): product is Product => product !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const products: Product[] = [
  {
    id: "1",
    brand: "CeraVe",
    name: "Hydrating Facial Cleanser",
    variant: "236ml · Gel Cleanser",
    price: 1850,
    originalPrice: 2200,
    image: "samples/ecommerce/leather-bag-gray",
    category: "Skincare",
    badge: "Best Seller",
  },
  {
    id: "2",
    brand: "The Ordinary",
    name: "Niacinamide 10% + Zinc 1%",
    variant: "30ml · Serum",
    price: 1200,
    originalPrice: 1500,
    image: "samples/ecommerce/accessories-bag",
    category: "Skincare",
  },
  {
    id: "3",
    brand: "The Body Shop",
    name: "Vitamin E Moisture Cream",
    variant: "50ml · Moisturiser",
    price: 2100,
    originalPrice: 2600,
    image: "samples/food/spices",
    category: "Skincare",
    badge: "New Arrival",
  },
  {
    id: "4",
    brand: "Simple",
    name: "Kind to Skin Moisturising Cream",
    variant: "125ml · Cream",
    price: 1450,
    image: "samples/landscapes/nature-italy",
    category: "Skincare",
  },
  {
    id: "5",
    brand: "Dove",
    name: "Deep Moisture Body Wash",
    variant: "500ml · Body Wash",
    price: 980,
    originalPrice: 1200,
    image: "samples/ecommerce/shoes",
    category: "Body Care",
  },
  {
    id: "6",
    brand: "Nivea",
    name: "Q10 Anti-Wrinkle Day Cream",
    variant: "50ml · SPF 15",
    price: 1650,
    originalPrice: 2000,
    image: "samples/bike",
    category: "Skincare",
    badge: "Sale",
  },
  {
    id: "7",
    brand: "Garnier",
    name: "Micellar Cleansing Water",
    variant: "400ml · All Skin Types",
    price: 1100,
    image: "samples/animals/reindeer",
    category: "Skincare",
  },
  {
    id: "8",
    brand: "L'Oréal Paris",
    name: "Revitalift Anti-Wrinkle Serum",
    variant: "30ml · With Vitamin C",
    price: 2400,
    originalPrice: 3000,
    image: "samples/people/smiling-man",
    category: "Skincare",
    badge: "Popular",
  },
];
