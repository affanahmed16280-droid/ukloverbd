import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import FeaturesStrip from "@/components/FeaturesStrip";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopBar from "@/components/TopBar";

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
    </>
  );
}