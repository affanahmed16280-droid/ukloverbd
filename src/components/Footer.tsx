import Link from "next/link";
import { MessageCircle, Phone, ArrowRight } from "lucide-react";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{
        backgroundColor: "var(--cream)",
        borderColor: "var(--cream-darker)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <h3
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "var(--font-serif)", color: "var(--plum)" }}
            >
              UK Brand Lover
            </h3>
            <p
              className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-6"
              style={{ color: "var(--gold)" }}
            >
              London to Dhaka
            </p>
            <p
              className="text-sm max-w-sm leading-relaxed mb-6"
              style={{ color: "var(--text-body)" }}
            >
              Authentic British beauty and personal care, picked from Boots and
              Superdrug, air-freighted to your door in Dhaka.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/8801959524393"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:opacity-70"
                style={{
                  borderColor: "var(--cream-darker)",
                  color: "var(--plum)",
                }}
              >
                <MessageCircle size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com/ukloverbangla"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:opacity-70"
                style={{
                  borderColor: "var(--cream-darker)",
                  color: "var(--plum)",
                }}
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href="tel:+8801959524393"
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:opacity-70"
                style={{
                  borderColor: "var(--cream-darker)",
                  color: "var(--plum)",
                }}
              >
                <Phone size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-xs font-semibold mb-6 tracking-widest uppercase"
              style={{ color: "var(--plum)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#products"
                  className="text-sm transition-opacity hover:opacity-60 flex items-center gap-2"
                  style={{ color: "var(--text-body)" }}
                >
                  <ArrowRight size={12} style={{ color: "var(--gold)" }} />
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-sm transition-opacity hover:opacity-60 flex items-center gap-2"
                  style={{ color: "var(--text-body)" }}
                >
                  <ArrowRight size={12} style={{ color: "var(--gold)" }} />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-sm transition-opacity hover:opacity-60 flex items-center gap-2"
                  style={{ color: "var(--text-body)" }}
                >
                  <ArrowRight size={12} style={{ color: "var(--gold)" }} />
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs font-semibold mb-6 tracking-widest uppercase"
              style={{ color: "var(--plum)" }}
            >
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li className="text-sm" style={{ color: "var(--text-body)" }}>
                <strong style={{ color: "var(--plum)", fontWeight: 600 }}>Phone:</strong>{" "}
                01959-524393
              </li>
              <li className="text-sm" style={{ color: "var(--text-body)" }}>
                <strong style={{ color: "var(--plum)", fontWeight: 600 }}>WhatsApp:</strong>{" "}
                01959-524393
              </li>
              <li className="text-sm" style={{ color: "var(--text-body)" }}>
                <strong style={{ color: "var(--plum)", fontWeight: 600 }}>Social:</strong>{" "}
                @ukloverbangla
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]"
          style={{ borderColor: "var(--cream-darker)", color: "var(--text-muted)" }}
        >
          <p>© {currentYear} UK Brand Lover. All rights reserved.</p>
          <p>Authentic imports. Delivered to Dhaka.</p>
        </div>
      </div>
    </footer>
  );
}
