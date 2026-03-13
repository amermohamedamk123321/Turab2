import Hero from "@/components/home/Hero";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import CTAStrip from "@/components/home/CTAStrip";
import { useSEO } from "@/hooks/use-seo";

const Home = () => {
  useSEO({
    title: "Software Company in Afghanistan – Web, Mobile App & Security Services",
    description: "Turab Root is a leading software company in Afghanistan. We develop websites, web apps, mobile apps, Windows desktop software & provide cybersecurity services to clients worldwide.",
    canonical: "https://turabroot.com",
  });

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <FeaturedCarousel />
      <Services />
      <Testimonials />
      <CTAStrip />
    </main>
  );
};

export default Home;