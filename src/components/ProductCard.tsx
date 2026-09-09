"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { Product, cloudinaryUrl } from "@/lib/products";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    if (product.price <= 0) {
      const message = `Hi, please share the current price for ${product.name}.`;
      window.open(`https://wa.me/8801959524393?text=${encodeURIComponent(message)}`, "_blank");
      return;
    }

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
      onClick={handleAdd}
    >
      {/* Image area */}
      <div
        className="relative rounded-2xl overflow-hidden mb-5 transition-transform duration-300 group-hover:-translate-y-1"
        style={{ backgroundColor: "var(--cream-dark)", aspectRatio: "1/1.1" }}
      >
        {/* Badges top-left */}
        {(product.badge || true) && (
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded tracking-[0.1em]"
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
                className="text-[9px] font-bold px-2 py-0.5 rounded tracking-wide w-fit"
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
          className="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-sm"
          style={{ backgroundColor: "white", color: "var(--text-muted)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Heart size={14} strokeWidth={2} />
        </button>

        {/* Product image */}
        <Image
          src={cloudinaryUrl(product.image, 400, 500)}
          alt={`${product.brand} ${product.name}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* Product info */}
      <div className="px-1 flex flex-col h-full justify-between">
        <div>
          {/* Brand */}
          <p
            className="text-[11px] font-bold mb-1 tracking-wider uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {product.brand}
          </p>

          {/* Product name — sans-serif block */}
          <h3
            className="text-lg font-black leading-tight mb-1.5 line-clamp-2 tracking-tight"
            style={{ fontFamily: "var(--font-sans)", color: "var(--plum)" }}
          >
            {product.name}
          </h3>

          {/* Variant */}
          <p
            className="text-[11px] mb-3 font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            {product.variant}
          </p>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span
            className="text-base font-bold"
            style={{ color: "var(--plum)", fontFamily: "var(--font-sans)" }}
          >
            {product.price > 0 ? `${product.price.toLocaleString()}` : "Price on request"}
          </span>
          {product.originalPrice && (
            <span
              className="text-[13px] line-through decoration-[var(--cream-darker)]"
              style={{ color: "var(--text-muted)" }}
            >
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
