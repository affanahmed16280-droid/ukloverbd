"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { productFromFirestore, products, type Product } from "@/lib/products";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const [storeProducts, setStoreProducts] = useState<Product[]>(products);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const firestoreProducts = snapshot.docs
          .map((document) => productFromFirestore(document.id, document.data()))
          .filter((product): product is Product => product !== null);

        if (active && firestoreProducts.length > 0) {
          setStoreProducts(firestoreProducts);
        }
      } catch (error) {
        console.error("Unable to load products from Firestore", error);
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      id="products"
      className="py-16"
      style={{ backgroundColor: "var(--cream)" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="mb-12 border-b pb-6" style={{ borderColor: "var(--cream-darker)" }}>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tighter"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--plum)",
            }}
          >
            Made for your shelf.
          </h2>
          <p
            className="mt-3 text-base font-medium"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
          >
            Every product here is real, authentic, and hand-picked from UK stores.
          </p>
        </div>

        {/* Grid — matches reference 4-col layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {storeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
