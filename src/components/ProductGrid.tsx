import { products } from "@/lib/products";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  return (
    <section
      id="products"
      className="py-16"
      style={{ backgroundColor: "var(--cream)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10">
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--plum)",
              fontWeight: 700,
            }}
          >
            Made for your shelf.
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
          >
            Every product here is real, authentic, and hand-picked from UK stores.
          </p>
        </div>

        {/* Grid — matches reference 3-col layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
