"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPrice,
    clearCart,
  } = useCartStore();

  const total = totalPrice();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(28,20,32,0.4)" }}
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 shadow-2xl flex flex-col cart-drawer ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "var(--cream)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--cream-darker)" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag
              size={16}
              strokeWidth={1.5}
              style={{ color: "var(--plum)" }}
            />
            <h2
              className="text-sm font-semibold"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--plum)",
                fontWeight: 600,
              }}
            >
              Your Cart
              {items.length > 0 && (
                <span
                  className="ml-1.5 text-xs font-normal"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                >
                  ({items.length} item{items.length > 1 ? "s" : ""})
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] transition-opacity hover:opacity-60 cursor-pointer"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              className="p-1 cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: "var(--plum)" }}
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag
                size={40}
                strokeWidth={1}
                style={{ color: "var(--cream-darker)" }}
              />
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--plum)", fontFamily: "var(--font-serif)" }}
                >
                  Your cart is empty
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                >
                  Add some items to get started
                </p>
              </div>
              <button
                onClick={closeCart}
                className="text-xs font-medium px-5 py-2 rounded-full border transition-all hover:opacity-70 cursor-pointer"
                style={{
                  borderColor: "var(--cream-darker)",
                  color: "var(--plum)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 py-4 border-b"
                style={{ borderColor: "var(--cream-darker)" }}
              >
                {/* Image */}
                <div
                  className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: "var(--cream-dark)" }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] mb-0.5"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                  >
                    {item.brand}
                  </p>
                  <p
                    className="text-sm font-semibold leading-tight truncate mb-1"
                    style={{ fontFamily: "var(--font-serif)", color: "var(--plum)" }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--gold)", fontFamily: "var(--font-sans)" }}
                  >
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="transition-opacity hover:opacity-60 cursor-pointer"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                  <div
                    className="flex items-center rounded-full overflow-hidden border"
                    style={{ borderColor: "var(--cream-darker)" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 transition-colors cursor-pointer hover:bg-opacity-50"
                      style={{ color: "var(--plum)" }}
                    >
                      <Minus size={11} strokeWidth={1.5} />
                    </button>
                    <span
                      className="px-2 text-xs font-semibold min-w-[18px] text-center"
                      style={{ color: "var(--plum)", fontFamily: "var(--font-sans)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 transition-colors cursor-pointer"
                      style={{ color: "var(--plum)" }}
                    >
                      <Plus size={11} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="border-t px-6 py-6 space-y-4"
            style={{ borderColor: "var(--cream-darker)" }}
          >
            {total < 5000 && (
              <p
                className="text-[11px] text-center"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
              >
                Add ৳{(5000 - total).toLocaleString()} more for free Dhaka delivery
              </p>
            )}
            <div className="flex justify-between items-center">
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
              >
                Subtotal
              </span>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-serif)", color: "var(--plum)" }}
              >
                ৳{total.toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-xs transition-all hover:opacity-80"
              style={{
                backgroundColor: "var(--plum)",
                color: "white",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.08em",
              }}
            >
              PROCEED TO CHECKOUT
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
