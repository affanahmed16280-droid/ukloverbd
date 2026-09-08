"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Settings } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

const categories = [
  "All Products",
  "Offers",
  ...PRODUCT_CATEGORIES,
];

export default function Header() {
  const { toggleCart, totalItems } = useCartStore();
  const count = totalItems();
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    // Dispatch event for page to handle
    window.dispatchEvent(new CustomEvent('categoryChange', { detail: category }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    window.dispatchEvent(new CustomEvent("searchChange", { detail: value }));
  };

  return (
    <header
      className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl"
      style={{
        backgroundColor: "var(--cream)",
        borderColor: "var(--cream-darker)",
      }}
    >
      {/* Main header row */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex h-[76px] items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="flex-shrink-0">
            <div
              className="text-[1.45rem] font-black leading-none tracking-[-0.06em]"
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
              className="flex w-full items-center gap-3 rounded-full border border-transparent px-5 py-3 transition-colors focus-within:border-primary/30 focus-within:bg-card"
              style={{
                backgroundColor: "var(--cream-dark)",
                color: "var(--text-muted)",
              }}
            >
              <Search size={16} strokeWidth={1.5} />
              <input
                type="search"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search Boots, Cetaphil, CeraVe..."
                className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder-gray-400"
                style={{ fontFamily: "var(--font-sans)", color: "var(--plum)" }}
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Admin */}
            <Link href="/admin" className="p-1 transition-opacity hover:opacity-60" style={{ color: "var(--plum)" }}>
              <Settings size={20} strokeWidth={1.5} />
            </Link>

            {/* User */}
            <button
              type="button"
              title="Account"
              aria-label="Account"
              className="hidden p-2 transition-all hover:-translate-y-0.5 hover:text-accent sm:block"
              style={{ color: "var(--plum)" }}
            >
              <User size={20} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              title="Wishlist"
              aria-label="Wishlist"
              className="hidden p-2 transition-all hover:-translate-y-0.5 hover:text-accent sm:block"
              style={{ color: "var(--plum)" }}
            >
              <Heart size={20} strokeWidth={1.5} />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative rounded-full p-2 transition-all hover:-translate-y-0.5 hover:bg-secondary cursor-pointer"
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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                type="button"
                aria-pressed={selectedCategory === cat}
                className="flex-shrink-0 text-xs font-semibold px-5 py-2 rounded-full transition-all cursor-pointer hover:-translate-y-0.5"
                style={
                  selectedCategory === cat
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
