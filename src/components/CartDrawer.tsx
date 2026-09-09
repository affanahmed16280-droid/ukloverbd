"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { cloudinaryUrl } from "@/lib/products";
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
          style={{ backgroundColor: "rgba(28,20,32,0.5)" }}
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 shadow-2xl flex flex-col cart-drawer ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "var(--cream)" }}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--cream-darker)" }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag
              size={20}
              strokeWidth={2}
              style={{ color: "var(--plum)" }}
            />
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--plum)", fontFamily: "var(--font-serif)" }}
            >
              Your Cart
              {items.length > 0 && (
                <span
                  className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "var(--plum)", color: "white" }}
                >
                  {items.length}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-medium underline-offset-2 transition-opacity hover:opacity-70 cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-secondary cursor-pointer"
              style={{ color: "var(--plum)" }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--cream-dark)" }}
              >
                <ShoppingBag
                  size={36}
                  strokeWidth={1.5}
                  style={{ color: "var(--plum)" }}
                />
              </div>
              <div>
                <p
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--plum)", fontFamily: "var(--font-serif)" }}
                >
                  Your cart is empty
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Add some products and they will show up here.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="text-sm font-semibold px-6 py-2.5 rounded-full border transition-colors hover:bg-secondary cursor-pointer"
                style={{
                  borderColor: "var(--cream-darker)",
                  color: "var(--plum)",
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
                  className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: "var(--cream-dark)" }}
                >
                  <Image
                    src={cloudinaryUrl(item.image, 200, 200)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.brand}
                  </p>
                  <p
                    className="text-[15px] font-semibold leading-tight truncate mb-1"
                    style={{ color: "var(--plum)" }}
                  >
                    {item.name}
                  </p>
                  {item.variant && (
                    <p
                      className="text-xs mb-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.variant}
                    </p>
                  )}
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--plum)" }}
                  >
                    {(item.price * item.quantity).toLocaleString()}
                    {item.quantity > 1 && (
                      <span
                        className="ml-1.5 text-[11px] font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        ({item.price.toLocaleString()} × {item.quantity})
                      </span>
                    )}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end justify-between gap-3">
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="transition-colors hover:text-destructive cursor-pointer"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                  <div
                    className="flex items-center rounded-full overflow-hidden border"
                    style={{ borderColor: "var(--cream-darker)" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-secondary cursor-pointer"
                      style={{ color: "var(--plum)" }}
                    >
                      <Minus size={13} strokeWidth={2} />
                    </button>
                    <span
                      className="w-6 text-sm font-bold text-center"
                      style={{ color: "var(--plum)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-secondary cursor-pointer"
                      style={{ color: "var(--plum)" }}
                    >
                      <Plus size={13} strokeWidth={2} />
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
            className="border-t px-6 py-5 space-y-4"
            style={{ borderColor: "var(--cream-darker)" }}
          >
            {total < 5000 && (
              <p
                className="text-xs font-medium text-center rounded-xl px-3 py-2.5"
                style={{
                  color: "var(--plum-deep)",
                  backgroundColor: "rgba(125,94,154,0.09)",
                }}
              >
                Add {(5000 - total).toLocaleString()} more to unlock free Dhaka delivery 🎁
              </p>
            )}
            <div className="flex justify-between items-baseline">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Subtotal
              </span>
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-serif)", color: "var(--plum)" }}
              >
                {total.toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-bold text-sm uppercase tracking-[0.06em] transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--plum)",
                color: "white",
              }}
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>
            <p
              className="text-center text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              No payment is taken online — we confirm via WhatsApp.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
