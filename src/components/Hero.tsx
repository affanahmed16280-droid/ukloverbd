"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section
      className="py-16 lg:py-24 relative"
      style={{ backgroundColor: "var(--cream)" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-16 lg:gap-24">

          {/* Left Content */}
          <div className="flex-1 max-w-3xl">
            {/* Eyebrow tag */}
            <div
              className="flex items-center gap-2 mb-6 text-[10px] font-bold tracking-[0.25em] uppercase"
              style={{ color: "var(--gold)", fontFamily: "var(--font-sans)" }}
            >
              GENUINELY SOURCED
              <span style={{ color: "var(--cream-darker)" }}>•</span>
              LONDON TO DHAKA
            </div>

            {/* Headline */}
            <h1
              className="text-6xl sm:text-7xl lg:text-[6.5rem] xl:text-[7.5rem] leading-[0.95] mb-8 font-black tracking-tighter"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--plum)",
              }}
            >
              <span className="block mb-2">British shelf</span>
              <span className="block mb-2">staples,</span>
              <span className="block mb-2">
                <em
                  className="inline-block font-normal pr-4"
                  style={{
                    color: "var(--gold)",
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    letterSpacing: "normal"
                  }}
                >
                  flown in
                </em>
                <span className="tracking-tighter">— not</span>
              </span>
              <span className="block">knocked off.</span>
            </h1>

            {/* Description */}
            <p
              className="text-base sm:text-lg leading-relaxed mb-10 max-w-md font-medium"
              style={{ color: "var(--text-body)", fontFamily: "var(--font-sans)" }}
            >
              Authentic beauty and personal care, picked from trusted stores like{" "}
              <span style={{ color: "var(--gold)" }}>Boots</span> and{" "}
              <span style={{ color: "var(--gold)" }}>Superdrug</span>, then
              air-freighted to your door in Dhaka.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                href="#products"
                className="inline-flex items-center gap-2 text-xs font-black px-8 py-3.5 rounded-full transition-all hover:opacity-80 uppercase tracking-widest"
                style={{
                  backgroundColor: "var(--plum)",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                }}
              >
                SHOP COLLECTION
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>

              <a
                href="https://facebook.com/ukloverbangla"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black px-8 py-3.5 rounded-full border transition-all hover:opacity-70 uppercase tracking-widest"
                style={{
                  borderColor: "var(--plum)",
                  color: "var(--plum)",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "transparent",
                }}
              >
                VISIT FACEBOOK PAGE
              </a>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-4 mt-6">
              <div
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0"
              >
                <span
                  className="text-xs font-black"
                  style={{ color: "var(--plum)", fontFamily: "var(--font-sans)" }}
                >
                  UK
                </span>
              </div>
              <div>
                <p
                  className="text-xs font-semibold leading-tight italic"
                  style={{ color: "var(--plum)", fontFamily: "var(--font-serif)" }}
                >
                  Personal imports,
                </p>
                <p
                  className="text-xs leading-tight italic"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif)" }}
                >
                  properly verified
                </p>
              </div>
            </div>
          </div>

          {/* Right: Featured Product Card */}
          <div className="hidden lg:block w-full max-w-[500px]">
            <div
              className="relative rounded-[2rem] p-10 overflow-hidden"
              style={{ backgroundColor: "var(--cream-dark)", aspectRatio: '4/4' }}
            >
              {/* Top-right badge */}
              <div className="absolute top-8 right-8 text-right z-10">
                <div
                  className="flex items-center gap-1.5 justify-end mb-1"
                  style={{ color: "var(--sage)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span
                    className="text-[10px] font-semibold tracking-wide"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    100% verified
                  </span>
                </div>
                <p
                  className="text-[10px] font-medium"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                >
                  Authentic UK Import
                </p>
              </div>

              {/* Product image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-48 h-72 rounded-3xl shadow-xl flex items-end justify-center pb-6 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #D4B47B 0%, #E8CD97 50%, #C4986B 100%)",
                  }}
                >
                  {/* Bottle cap */}
                  <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-8 rounded-lg"
                    style={{ backgroundColor: "var(--plum)" }}
                  />
                  {/* Brand text on bottle */}
                  <div className="text-center z-10">
                    <p
                      className="text-[9px] font-bold tracking-[0.3em] mb-0.5"
                      style={{ color: "rgba(28,20,32,0.5)" }}
                    >
                      UK
                    </p>
                    <p
                      className="text-[9px] font-bold tracking-[0.3em]"
                      style={{ color: "rgba(28,20,32,0.5)" }}
                    >
                      BRAND
                    </p>
                  </div>
                  {/* Leaf decoration */}
                  <div
                    className="absolute -right-4 bottom-12 w-16 h-24 rounded-full opacity-60"
                    style={{
                      backgroundColor: "var(--sage)",
                      transform: "rotate(30deg)",
                    }}
                  />
                  <div
                    className="absolute -left-4 bottom-16 w-12 h-20 rounded-full opacity-50"
                    style={{
                      backgroundColor: "var(--sage)",
                      transform: "rotate(-20deg)",
                    }}
                  />
                </div>
              </div>

              {/* Product info (bottom left) */}
              <div className="absolute bottom-8 left-8 z-10">
                <p
                  className="text-[11px] font-bold tracking-wide uppercase mb-1.5"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                >
                  Featured edit
                </p>
                <h3
                  className="text-2xl font-black leading-tight mb-2 tracking-tight"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--plum)" }}
                >
                  Boots Soltan
                  <br />
                  Protect &amp; Moisturise SPF 50+
                </h3>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-sans)" }}
                >
                  ৳860
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile social links */}
        <div className="flex items-center gap-4 mt-8 lg:hidden">
          <a
            href="https://wa.me/8801959524393"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full"
            style={{
              backgroundColor: "var(--cream-dark)",
              color: "var(--plum)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <WhatsAppIcon size={14} />
            WhatsApp
          </a>
          <a
            href="https://facebook.com/ukloverbangla"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full"
            style={{
              backgroundColor: "var(--cream-dark)",
              color: "var(--plum)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <FacebookIcon size={14} />
            Facebook
          </a>
          <a
            href="tel:+8801959524393"
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full"
            style={{
              backgroundColor: "var(--cream-dark)",
              color: "var(--plum)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <Phone size={14} />
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
}
