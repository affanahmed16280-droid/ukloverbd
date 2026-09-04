"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { Product, cloudinaryUrl } from "@/lib/products";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
}

// Bottle colors matching the reference site aesthetic
const bottleGradients: Record<number, string> = {
  0: "linear-gradient(160deg, #C9A96A 0%, #E8C98A 50%, #BF8E5A 100%)",
  1: "linear-gradient(160deg, #D4AA70 0%, #EDD090 50%, #C8965A 100%)",
  2: "linear-gradient(160deg, #D6DDD8 0%, #E8EDE9 50%, #C2CCC4 100%)",
  3: "linear-gradient(160deg, #E2D5BE 0%, #F0E8D4 50%, #D4C4A8 100%)",
  4: "linear-gradient(160deg, #C4B090 0%, #DDD0B2 50%, #B8A07A 100%)",
  5: "linear-gradient(160deg, #D8CEB8 0%, #EEE7D2 50%, #C8BBA0 100%)",
  6: "linear-gradient(160deg, #DCDEE0 0%, #ECEEF0 50%, #CACDD0 100%)",
  7: "linear-gradient(160deg, #C8A878 0%, #E4C898 50%, #B89460 100%)",
};

function BottleVisual({ index }: { index: number }) {
  const gradient = bottleGradients[index % 8];
  return (
    <div className="relative w-28 h-40 mx-auto">
      {/* Main bottle body */}
      <div
        className="absolute inset-x-3 bottom-0 top-5 rounded-2xl shadow-md"
        style={{ background: gradient }}
      />
      {/* Cap */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-7 rounded-md shadow-sm"
        style={{ backgroundColor: "var(--plum)" }}
      />
      {/* Label area */}
      <div
        className="absolute inset-x-6 top-[45%] -translate-y-1/2 text-center"
      >
        <p className="text-[6px] font-bold tracking-widest" style={{ color: "rgba(28,20,32,0.4)" }}>UK</p>
        <p className="text-[6px] font-bold tracking-widest" style={{ color: "rgba(28,20,32,0.4)" }}>BRAND</p>
      </div>
      {/* Leaf decorations */}
      <div
        className="absolute -right-1 bottom-8 w-8 h-12 rounded-full opacity-35"
        style={{ backgroundColor: "#7A8F7E", transform: "rotate(25deg)" }}
      />
      <div
        className="absolute -left-1 bottom-14 w-6 h-10 rounded-full opacity-25"
        style={{ backgroundColor: "#7A8F7E", transform: "rotate(-20deg)" }}
      />
    </div>
  );
}

export default function ProductCard({ product, index = 0 }: ProductCardProps & { index?: number }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      id: product.id,
      brand: product.brand,
      name: product.name,
      variant: product.variant,
      price: product.price,
      image: cloudinaryUrl(product.image, 200, 200),
    });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div
      className="group flex flex-col cursor-pointer"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Image area */}
      <div
        className="relative rounded-2xl overflow-hidden mb-3"
        style={{ backgroundColor: "var(--cream-dark)", aspectRatio: "3/4" }}
      >
        {/* Badges top-left */}
        {(product.badge || true) && (
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider"
              style={{
                backgroundColor: "var(--plum)",
                color: "white",
                fontFamily: "var(--font-sans)",
              }}
            >
              UK IMPORT
            </span>
            {product.badge && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider"
                style={{
                  backgroundColor: discount ? "#E07A5A" : "var(--sage)",
                  color: "white",
                }}
              >
                {product.badge === "Sale" ? "SALE" :
                 product.badge === "New Arrival" ? "NEW" :
                 product.badge === "Best Seller" ? "BEST" :
                 product.badge.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Wishlist button */}
        <button
          className="absolute bottom-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          style={{ backgroundColor: "white", color: "var(--text-muted)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Heart size={13} strokeWidth={1.5} />
        </button>

        {/* Product visual */}
        {product.image.startsWith("samples/") ? (
          <div className="flex items-center justify-center h-full pt-4">
            <BottleVisual index={index} />
          </div>
        ) : (
          <Image
            src={cloudinaryUrl(product.image, 400, 500)}
            alt={`${product.brand} ${product.name}`}
            fill
            className="object-cover group-hover:scale-103 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
      </div>

      {/* Product info */}
      <div className="px-1">
        {/* Brand */}
        <p
          className="text-[10px] mb-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {product.brand}
        </p>

        {/* Product name — serif */}
        <h3
          className="text-sm font-bold leading-tight mb-1 line-clamp-2"
          style={{ fontFamily: "var(--font-serif)", color: "var(--plum)", fontWeight: 600 }}
          onClick={handleAdd}
        >
          {product.name}
        </h3>

        {/* Variant */}
        <p
          className="text-[10px] mb-2"
          style={{ color: "var(--gold)" }}
        >
          {product.variant}
        </p>

        {/* Price row */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold"
            style={{ color: "var(--plum)", fontFamily: "var(--font-sans)" }}
          >
            ৳{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span
              className="text-xs line-through"
              style={{ color: "var(--text-muted)" }}
            >
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
