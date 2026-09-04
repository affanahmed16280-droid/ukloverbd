const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

export function cloudinaryUrl(
  publicId: string,
  width = 400,
  height = 400
): string {
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
