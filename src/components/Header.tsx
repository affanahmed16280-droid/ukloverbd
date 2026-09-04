"use client";

import Link from "next/link";
import { Search, User, Heart, ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const categories = [
  "All Products",
  "Offers",
  "Sunscreen",
  "Facewash",
  "Face Serum",
  "Cream",
  "Shampoo",
  "Jewelry",
  "Baby Care",
];

export default function Header() {
  const { toggleCart, totalItems } = useCartStore();
  const count = totalItems();

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--cream)",
        borderColor: "var(--cream-darker)",
      }}
    >
      {/* Main header row */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Brand */}
          <Link href="/" className="flex-shrink-0">
            <div
              className="text-2xl font-black leading-none tracking-tighter"
              style={{ fontFamily: "var(--font-sans)", color: "var(--plum)" }}
            >
              UK Brand Lover
            </div>
            <div
              className="text-[9px] font-bold tracking-[0.3em] uppercase mt-1"
              style={{ color: "var(--gold)", fontFamily: "var(--font-sans)" }}
            >
              London to Dhaka
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block mx-8">
            <div
              className="flex items-center gap-3 rounded-full px-5 py-2.5 w-full"
              style={{
                backgroundColor: "var(--cream-dark)",
                color: "var(--text-muted)",
              }}
            >
              <Search size={16} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search Boots, Cetaphil, CeraVe..."
                className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder-gray-400"
                style={{ fontFamily: "var(--font-sans)", color: "var(--plum)" }}
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* User */}
            <button
              className="p-1 transition-opacity hover:opacity-60"
              style={{ color: "var(--plum)" }}
            >
              <User size={20} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <button
              className="p-1 transition-opacity hover:opacity-60"
              style={{ color: "var(--plum)" }}
            >
              <Heart size={20} strokeWidth={1.5} />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-1 transition-opacity hover:opacity-60 cursor-pointer"
              style={{ color: "var(--plum)" }}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center"
                  style={{ backgroundColor: "var(--plum)", color: "white" }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Invoice Generator CTA */}
            <button
              className="hidden lg:flex items-center gap-2 text-[11px] font-bold px-5 py-2.5 rounded-full border border-gray-300 transition-all hover:bg-gray-50"
              style={{
                borderColor: "var(--plum)",
                color: "var(--plum)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.08em",
              }}
            >
              INVOICE GENERATOR
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Category pills row */}
      <div
        className="border-t"
        style={{ borderColor: "var(--cream-darker)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className="flex-shrink-0 text-xs font-semibold px-5 py-2 rounded-full transition-all cursor-pointer"
                style={
                  i === 0
                    ? {
                        backgroundColor: "var(--plum)",
                        color: "white",
                        fontFamily: "var(--font-sans)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "var(--text-body)",
                        border: "1px solid var(--cream-darker)",
                        fontFamily: "var(--font-sans)",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
