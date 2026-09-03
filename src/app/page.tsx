"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, ShoppingBag, UserRound, Heart, Moon, Sun,
  ArrowRight, Minus, Plus, X, Package,
  Truck, PackageCheck, Phone, Sparkles, Menu, Check, Printer,
} from "lucide-react";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import { InvoiceModal } from "@/components/InvoiceModal";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
export type Product = {
  id: string;
  title: string;
  brand?: string;
  size?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category: string;
  inStock: boolean;
  tag?: string; // e.g. "Bestseller", "Trending", "Save 16%"
};

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All Products", "Offers", "Sunscreen", "Facewash",
  "Face Serum", "Cream", "Shampoo", "Jewelry", "Baby Care",
];

const DEMO_PRODUCTS: Product[] = [
  {
    id: "d1", brand: "The Body Shop", title: "Shea Body Butter",
    size: "200ml", category: "Cream", price: 1650, originalPrice: 1900,
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop",
    inStock: true, tag: "Bestseller",
  },
  {
    id: "d2", brand: "Boots Soltan", title: "Protect & Moisturise SPF 50+",
    size: "200ml", category: "Sunscreen", price: 1850, originalPrice: 2200,
    imageUrl: "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=500&h=500&fit=crop",
    inStock: true, tag: "Save 16%",
  },
  {
    id: "d3", brand: "CeraVe", title: "Hydrating Cleanser",
    size: "236ml", category: "Facewash", price: 2150, originalPrice: 2400,
    imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop",
    inStock: true, tag: "UK Import",
  },
  {
    id: "d4", brand: "The Ordinary", title: "Niacinamide 10% + Zinc 1%",
    size: "30ml", category: "Face Serum", price: 1750, originalPrice: 1990,
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&h=500&fit=crop",
    inStock: true, tag: "Trending",
  },
  {
    id: "d5", brand: "Aveeno", title: "Daily Moisturising Lotion",
    size: "300ml", category: "Cream", price: 1950, originalPrice: 2250,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
    inStock: true, tag: "UK Import",
  },
  {
    id: "d6", brand: "Johnson's", title: "Baby Bedtime Wash",
    size: "500ml", category: "Baby Care", price: 1250, originalPrice: 1450,
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop",
    inStock: true, tag: "Gentle care",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function categoryToVisual(cat: string): string {
  const map: Record<string, string> = {
    "Sunscreen":   "visual-sun",
    "Cream":       "visual-body",
    "Body Lotion": "visual-lotion",
    "Facewash":    "visual-cleanse",
    "Face Serum":  "visual-serum",
    "Baby Care":   "visual-baby",
    "Shampoo":     "visual-shampoo",
    "Conditioner": "visual-shampoo",
    "Jewelry":     "visual-jewelry",
  };
  return map[cat] ?? "visual-sun";
}

function savePct(price: number, orig: number): number {
  if (!orig || orig <= price) return 0;
  return Math.round(((orig - price) / orig) * 100);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<"BDT" | "GBP">("BDT");
  const collectionRef = useRef<HTMLElement>(null);
  const isDark = resolvedTheme === "dark";

  // Mount guard for theme
  useEffect(() => { setMounted(true); }, []);

  // Firebase realtime listener
  useEffect(() => {
    if (!db) { setProducts(DEMO_PRODUCTS); return; }
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const prods: Product[] = [];
        snap.forEach((doc) => prods.push({ id: doc.id, ...doc.data() } as Product));
        setProducts(prods.length > 0 ? prods : DEMO_PRODUCTS);
      },
      () => setProducts(DEMO_PRODUCTS)
    );
    return () => unsub();
  }, []);

  // Cart helpers
  const addToCart = (p: Product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return prev.map((i) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart((p) => p.filter((i) => i.id !== id));
  const updateQty = (id: string, delta: number) =>
    setCart((p) => p.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const cartTotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const shipping = cartTotal >= 5000 ? 0 : 100;

  const gbpRate = 0.0072; // approx BDT→GBP
  const fmt = (bdt: number) =>
    currency === "GBP" ? `£${(bdt * gbpRate).toFixed(2)}` : `৳${bdt.toLocaleString()}`;

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All Products" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const whatsappMsg = encodeURIComponent(
    `Hi! I'd like to order:\n${cart.map((i) => `• ${i.title} x${i.quantity} = ৳${i.price * i.quantity}`).join("\n")}\n\nTotal: ৳${cartTotal + shipping}`
  );

  const featuredProduct = products[0] ?? DEMO_PRODUCTS[0];

  return (
    <div className="storefront">

      {/* ── UTILITY BAR ─────────────────────────────────── */}
      <div className="utility">
        <span>01959-524393 <i>|</i> Order via Call or WhatsApp</span>
        <span className="ticker">Free delivery in Dhaka on orders over ৳5,000</span>
        <span className="utility-actions">
          <button
            className={currency === "BDT" ? "active" : ""}
            onClick={() => setCurrency("BDT")}
          >BDT ৳</button>
          <button
            className={currency === "GBP" ? "active" : ""}
            onClick={() => setCurrency("GBP")}
          >GBP £</button>
          {mounted && (
            <button aria-label="Toggle theme" onClick={() => setTheme(isDark ? "light" : "dark")}>
              {isDark
                ? <Sun width={15} height={15} aria-hidden />
                : <Moon width={15} height={15} aria-hidden />}
            </button>
          )}
        </span>
      </div>

      {/* ── HEADER ──────────────────────────────────────── */}
      <header>
        <div className="main-header">
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu width={21} height={21} aria-hidden />
          </button>

          <div className="wordmark">
            <h1>UK Brand Lover</h1>
            <span>London to Dhaka</span>
          </div>

          <div className="search">
            <Search width={17} height={17} aria-hidden />
            <input
              placeholder="Search Boots, Cetaphil, CeraVe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <nav className="header-actions">
            <button aria-label="Account"><UserRound width={19} height={19} aria-hidden /></button>
            <button aria-label="Wishlist"><Heart width={19} height={19} aria-hidden /></button>
            <button className="cart" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag width={19} height={19} aria-hidden />
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
            <button className="invoice-button" onClick={() => setIsInvoiceOpen(true)}>
              Invoice Generator <ArrowRight width={15} height={15} aria-hidden />
            </button>
          </nav>
        </div>

        {/* Category pills */}
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "selected" : ""}
              onClick={() => setActiveCategory(cat)}
            >{cat}</button>
          ))}
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero">
        {/* Left: copy */}
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="eyebrow">Genuinely sourced <i>•</i> London to Dhaka</span>

          <h2>
            British shelf staples,<br />
            <em>flown in</em> — not knocked off.
          </h2>

          <p>
            Authentic beauty and personal care, picked from trusted stores like{" "}
            <strong>Boots</strong> and <strong>Superdrug</strong>, then air-freighted to your door in Dhaka.
          </p>

          <div className="hero-buttons">
            <button
              className="button button-dark"
              onClick={() => collectionRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              Shop collection <ArrowRight width={16} height={16} aria-hidden />
            </button>
            <a
              className="button button-outline"
              href="https://facebook.com/tuhinatopa"
              target="_blank"
              rel="noreferrer"
            >Visit Facebook page</a>
          </div>

          <div className="hero-signature">
            <span>UK</span>
            <p><strong>Personal imports,</strong><br />properly verified.</p>
          </div>
        </motion.div>

        {/* Right: featured product visual */}
        <motion.div
          className="hero-product"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          <div className="verification">
            <Check width={14} height={14} aria-hidden /> Batch verified<br />
            <strong>Authentic UK import</strong>
          </div>

          <div className={`product-visual ${categoryToVisual(featuredProduct.category)}`} aria-hidden="true">
            {featuredProduct.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredProduct.imageUrl}
                alt={featuredProduct.title}
                style={{ width: "62%", objectFit: "contain", filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.18))" }}
              />
            ) : (
              <>
                <div className="bottle-cap" />
                <div className="bottle"><span>UK<br /><b>BRAND</b></span></div>
                <div className="leaf leaf-one" />
                <div className="leaf leaf-two" />
              </>
            )}
          </div>

          <div className="hero-product-caption">
            <span>Featured edit</span>
            <strong>{featuredProduct.brand ? `${featuredProduct.brand} — ` : ""}{featuredProduct.title}</strong>
            <small>{fmt(featuredProduct.price)}</small>
          </div>
        </motion.div>
      </section>

      {/* ── TRUST ROW ───────────────────────────────────── */}
      <div className="trust-row">
        <div>
          <Truck width={21} height={21} aria-hidden />
          <span><strong>Free Dhaka delivery</strong>Over ৳5,000</span>
        </div>
        <div>
          <PackageCheck width={21} height={21} aria-hidden />
          <span><strong>100% verified imports</strong>Every item batch-checked</span>
        </div>
        <div>
          <Phone width={21} height={21} aria-hidden />
          <span><strong>Order via WhatsApp / call</strong>01959-524393</span>
        </div>
        <div>
          <Sparkles width={21} height={21} aria-hidden />
          <span><strong>2,000+ verified reviews</strong>On Facebook</span>
        </div>
      </div>

      {/* ── OFFERS BANNER ───────────────────────────────── */}
      <div className="offers-wrapper">
        <div className="offers">
          <div>
            <span className="eyebrow">The good stuff, together</span>
            <h2>Current offers <em>&amp; bundles</em></h2>
            <p>Thoughtfully paired British favourites, priced to make your routine feel a little more considered.</p>
          </div>
          <button
            className="button button-light"
            onClick={() => { setActiveCategory("Offers"); collectionRef.current?.scrollIntoView({ behavior: "smooth" }); }}
          >
            Explore offers <ArrowRight width={16} height={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* ── COLLECTION ──────────────────────────────────── */}
      <main ref={collectionRef} id="collection" className="collection">
        <div className="section-heading">
          <div>
            <span className="eyebrow">The current edit</span>
            <h2>Made for your <em>shelf.</em></h2>
          </div>
          <span className="result-count">{filteredProducts.length} products</span>
        </div>

        <div className="product-grid">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, i) => {
              const orig = product.originalPrice ?? Math.round(product.price * 1.25);
              const pct = savePct(product.price, orig);
              const tagLabel = product.tag ?? (pct > 0 ? `Save ${pct}%` : "UK Import");
              const visual = categoryToVisual(product.category);

              return (
                <motion.article
                  key={product.id}
                  className="product-card"
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.32) }}
                >
                  <div className="product-image-wrap">
                    <span className="import-tag">UK Import</span>
                    <span className="save-tag">{tagLabel}</span>

                    <button
                      className={`heart-button ${wishlist.has(product.id) ? "wishlisted" : ""}`}
                      aria-label="Add to wishlist"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart width={17} height={17} aria-hidden />
                    </button>

                    {/* Product image or CSS bottle art */}
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} />
                    ) : (
                      <div className={`product-visual ${visual}`} aria-hidden="true">
                        <div className="bottle-cap" />
                        <div className="bottle"><span>UK<br /><b>BRAND</b></span></div>
                        <div className="leaf leaf-one" />
                        <div className="leaf leaf-two" />
                      </div>
                    )}

                    {!product.inStock && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>Out of Stock</span>
                      </div>
                    )}

                    <div className="quick-actions">
                      <button onClick={() => addToCart(product)}>Quick add to cart</button>
                      <button onClick={() => { addToCart(product); setIsInvoiceOpen(true); }}>View invoice preview</button>
                    </div>
                  </div>

                  <div className="product-info">
                    <span>{product.brand ?? product.category}</span>
                    <h3>{product.title}</h3>
                    <small>
                      {product.size ? `${product.size}` : ""}{product.size && product.category ? " · " : ""}{product.category}
                    </small>
                    <div>
                      <div>
                        <strong>{fmt(product.price)}</strong>
                        {orig > product.price && <del>{fmt(orig)}</del>}
                      </div>
                      <button
                        className="add-btn"
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        title="Add to cart"
                      >
                        <Plus width={14} height={14} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <Package width={48} height={48} style={{ opacity: 0.15, margin: "0 auto 1rem" }} />
            <h3>No products found</h3>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
              Try a different search or browse all categories
            </p>
          </div>
        )}
      </main>

      {/* ── STORY GRID ──────────────────────────────────── */}
      <div className="story-grid">
        <div className="story-card">
          <span className="eyebrow">Our little beginning</span>
          <h2>Started on Facebook.<br /><em>Still run that way.</em></h2>
          <p>
            What began as personal suitcase imports for friends became a trusted Dhaka destination
            for the British beauty staples we kept reaching for ourselves.
          </p>
          <a href="https://facebook.com/tuhinatopa" target="_blank" rel="noreferrer">
            Read our story <ArrowRight width={16} height={16} aria-hidden />
          </a>
        </div>

        <div className="social-card">
          <Sparkles width={20} height={20} aria-hidden />
          <span className="eyebrow">Follow the real-time edit</span>
          <h3>@ukbrandlover</h3>
          <p>New arrivals, suitcase reveals, and honest reviews from our community in Bangladesh.</p>
          <strong>2,000+ <small>Followers on Facebook</small></strong>
          <a
            href="https://facebook.com/tuhinatopa"
            target="_blank"
            rel="noreferrer"
            className="button button-outline"
            style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
          >Visit Facebook page</a>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer>
        <div className="wordmark">
          <h1>UK Brand Lover</h1>
          <span>London to Dhaka</span>
        </div>
        <p>Authentic British beauty, closer to home.</p>
        <span>© {new Date().getFullYear()} UK Brand Lover · Dhaka, Bangladesh</span>
        <Link href="/admin/upload" style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "0.5rem", textDecoration: "none" }}>
          Admin →
        </Link>
      </footer>

      {/* ── MOBILE DRAWER ───────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              className="mobile-drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="wordmark">
                <h1>UK Brand Lover</h1>
                <span>London to Dhaka</span>
              </div>
              <nav>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={activeCategory === cat ? "selected" : ""}
                    onClick={() => { setActiveCategory(cat); setIsMobileMenuOpen(false); collectionRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                  >{cat}</button>
                ))}
              </nav>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <a href="https://www.facebook.com/share/g/1AzmaHVMGt/" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#1877F2", fontWeight: 600, textDecoration: "none" }}>
                  <FaFacebook /> Facebook Page
                </a>
                <a href="https://wa.me/01959524393" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#25D366", fontWeight: 600, textDecoration: "none" }}>
                  <FaWhatsapp /> WhatsApp Order
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CART SIDEBAR ────────────────────────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              className="cart-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              className="cart-sidebar"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="cart-sidebar-header">
                <h2>Cart ({cartCount})</h2>
                <button onClick={() => setIsCartOpen(false)}><X width={20} height={20} /></button>
              </div>

              {cart.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag width={48} height={48} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.title} />
                        ) : (
                          <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "0.5rem", background: "var(--product-image-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Package width={20} height={20} style={{ opacity: 0.3 }} />
                          </div>
                        )}
                        <div className="item-info">
                          <p>{item.title}</p>
                          <p>{fmt(item.price)}</p>
                        </div>
                        <div className="cart-item-controls">
                          <button onClick={() => removeFromCart(item.id)}><X width={14} height={14} /></button>
                          <div className="qty-controls">
                            <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus width={10} height={10} /></button>
                            <span>{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus width={10} height={10} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-footer">
                    <div className="cart-row">
                      <span>Subtotal</span><span>{fmt(cartTotal)}</span>
                    </div>
                    <div className="cart-row">
                      <span>Delivery</span>
                      <span style={cartTotal >= 5000 ? { color: "#16a34a", fontWeight: 600 } : undefined}>
                        {cartTotal >= 5000 ? "FREE" : fmt(100)}
                      </span>
                    </div>
                    <div className="cart-total">
                      <span>Total</span><span>{fmt(cartTotal + shipping)}</span>
                    </div>
                    <div className="cart-actions">
                      <button onClick={() => { setIsCartOpen(false); setIsInvoiceOpen(true); }}>
                        <Printer width={16} height={16} /> Generate Invoice
                      </button>
                      <a
                        href={`https://wa.me/01959524393?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaWhatsapp size={16} /> Order via WhatsApp
                      </a>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── INVOICE MODAL ───────────────────────────────── */}
      <InvoiceModal open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen} cart={cart} total={cartTotal} />
    </div>
  );
}
