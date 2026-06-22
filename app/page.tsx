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
import { getDualOffers, getHomePageData, getLimitedOffer } from "@/server/home";
import { getHeroSlides } from "@/server/hero-slides";
import { getRecentReviews } from "@/server/reviews";
import { getServerCountry } from "@/lib/region";

export default async function Home() {
  const country = getServerCountry();
  const [{ featuredProducts, bestSellers, categories }, testimonials, heroSlides, dualOffers, limitedOffer] = await Promise.all([
    getHomePageData(country),
    getRecentReviews(5),
    getHeroSlides(),
    getDualOffers(),
    getLimitedOffer(),
  ]);

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-white">
      <TopBanner />
      <Header />
      <main>
        <HeroSlider slides={heroSlides} />
        <Categories categories={categories} />
        <FeaturedProducts products={featuredProducts} />
        <DualOffers offers={dualOffers} />
        <BestSellers products={bestSellers} />
        <LimitedOffer offer={limitedOffer} />
        <Testimonials testimonials={testimonials} />
        <Features />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
