"use client";

import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturesStrip from "@/components/FeaturesStrip";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <FeaturesStrip />
        <ProductGrid />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
