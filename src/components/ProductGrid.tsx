import { products } from "@/lib/products";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  return (
    <section
      id="products"
      className="py-16"
      style={{ backgroundColor: "var(--cream)" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="mb-12 border-b pb-6" style={{ borderColor: "var(--cream-darker)" }}>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tighter"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--plum)",
            }}
          >
            Made for your shelf.
          </h2>
          <p
            className="mt-3 text-base font-medium"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
          >
            Every product here is real, authentic, and hand-picked from UK stores.
          </p>
        </div>

        {/* Grid — matches reference 4-col layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
