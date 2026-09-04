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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-16">
          {/* Brand */}
          <Link href="/" className="flex-shrink-0">
            <div
              className="text-xl font-bold leading-none tracking-tight"
              style={{ fontFamily: "var(--font-serif)", color: "var(--plum)" }}
            >
              UK Brand Lover
            </div>
            <div
              className="text-[9px] font-semibold tracking-[0.25em] uppercase mt-0.5"
              style={{ color: "var(--gold)", fontFamily: "var(--font-sans)" }}
            >
              London to Dhaka
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
              style={{
                backgroundColor: "var(--cream-dark)",
                color: "var(--text-muted)",
              }}
            >
              <Search size={14} strokeWidth={1.5} />
              <span className="text-xs" style={{ fontFamily: "var(--font-sans)" }}>
                Search Boots, Cetaphil, CeraVe...
              </span>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4 ml-auto">
            {/* User */}
            <button
              className="p-1 transition-opacity hover:opacity-60"
              style={{ color: "var(--plum)" }}
            >
              <User size={18} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <button
              className="p-1 transition-opacity hover:opacity-60"
              style={{ color: "var(--plum)" }}
            >
              <Heart size={18} strokeWidth={1.5} />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-1 transition-opacity hover:opacity-60 cursor-pointer"
              style={{ color: "var(--plum)" }}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ backgroundColor: "var(--gold)", color: "white" }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Invoice Generator CTA */}
            <button
              className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:opacity-80"
              style={{
                borderColor: "var(--plum)",
                color: "var(--plum)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.05em",
              }}
            >
              INVOICE GENERATOR
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Category pills row */}
      <div
        className="border-t"
        style={{ borderColor: "var(--cream-darker)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className="flex-shrink-0 text-xs font-medium px-4 py-1.5 rounded-full transition-all cursor-pointer"
                style={
                  i === 0
                    ? {
                        backgroundColor: "var(--plum)",
                        color: "white",
                        fontFamily: "var(--font-sans)",
                        letterSpacing: "0.02em",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "var(--text-body)",
                        border: "1px solid var(--cream-darker)",
                        fontFamily: "var(--font-sans)",
                        letterSpacing: "0.02em",
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
