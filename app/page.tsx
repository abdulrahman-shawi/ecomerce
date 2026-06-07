export const dynamic = "force-dynamic";

import TopBanner from "@/component/sections/TopBanner";
import Header from "@/component/sections/Header";
import HeroSlider from "@/component/sections/HeroSlider";
import Features from "@/component/sections/Features";
import Categories from "@/component/sections/Categories";
import FeaturedProducts from "@/component/sections/FeaturedProducts";
import DualOffers from "@/component/sections/DualOffers";
import BestSellers from "@/component/sections/BestSellers";
import LimitedOffer from "@/component/sections/LimitedOffer";
import Testimonials from "@/component/sections/Testimonials";
import Newsletter from "@/component/sections/Newsletter";
import Footer from "@/component/sections/Footer";
import CartDrawer from "@/component/CartDrawer";
import { getHomePageData } from "@/server/home";

export default async function Home() {
  const { featuredProducts, bestSellers, categories } = await getHomePageData();

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-white">
      <TopBanner />
      <Header />
      <main>
        <HeroSlider />
        <Features />
        <Categories categories={categories} />
        <FeaturedProducts products={featuredProducts} />
        <DualOffers />
        <BestSellers products={bestSellers} />
        <LimitedOffer />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
