"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2, ShoppingBag } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { submitOrder } from "@/lib/firestore";

interface FormData {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();

  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!form.address.trim() || form.address.trim().length < 10) {
      newErrors.address = "Please enter your full delivery address (min. 10 chars)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const id = await submitOrder({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        items,
        total,
      });
      setOrderId(id);
      clearCart();
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (orderId) {
    return (
      <>
        <TopBar />
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Order Placed! 🎉
            </h1>
            <p className="text-gray-500 mb-2">
              Your order has been received. We&apos;ll confirm it via WhatsApp shortly.
            </p>
            <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 rounded px-3 py-2">
              Order ID: {orderId}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/8801959524393"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
              >
                Confirm on WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold text-sm hover:border-gray-900 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <CartDrawer />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Form */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Complete Your Order
                </h1>
                <p className="text-gray-400 text-sm mb-8">
                  No account needed. Just fill in your delivery details.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Fatima Rahman"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all ${
                        errors.name ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 01711-123456"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all ${
                        errors.phone ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Shipping Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House/Flat no., Road, Area, District, Bangladesh"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none ${
                        errors.address ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Order Notes{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Any special instructions?"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full bg-gray-900 text-white py-4 rounded-full font-bold text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order · ৳{total.toLocaleString()}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    By placing an order, we&apos;ll contact you on WhatsApp to confirm.
                    No payment is taken online.
                  </p>
                </form>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 sticky top-24">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <ShoppingBag size={16} />
                  Order Summary
                </h2>

                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-4">
                      Your cart is empty.
                    </p>
                    <Link
                      href="/"
                      className="text-sm font-semibold text-gray-700 border border-gray-200 px-5 py-2 rounded-full hover:border-gray-900 transition-colors"
                    >
                      Go Shop
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">{item.brand}</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>৳{total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Delivery</span>
                        <span className={total >= 5000 ? "text-green-600 font-medium" : ""}>
                          {total >= 5000 ? "FREE (Dhaka)" : "Calculated after order"}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>৳{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <CartDrawer />
    </>
  );
}
