import Hero from "@/components/home/Hero";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import CTAStrip from "@/components/home/CTAStrip";
import { useSEO } from "@/hooks/use-seo";
import { useHreflang } from "@/hooks/use-hreflang";
import { useBreadcrumbSchema } from "@/hooks/use-breadcrumb-schema";
import { combineKeywords, combinePersianKeywords, getCanonicalUrl } from "@/utils/seo";

const Home = () => {
  useHreflang();
  useBreadcrumbSchema([
    { name: "Home", url: "https://turabroot.com/" }
  ]);

  // Localized SEO content with Persian keyword optimization
  const seoConfig = {
    title: {
      en: "Software Company in Afghanistan – Web, Mobile App & Security Services",
      fa: "شرکت نرم‌افزاری افغانستان | توسعه وب، اپلیکیشن موبایل و خدمات امنیتی"
    },
    description: {
      en: "Turab Root is a leading software company in Afghanistan. We develop websites, web apps, mobile apps, Windows desktop software & provide cybersecurity services to clients worldwide.",
      fa: "تراب روت یک شرکت نرم‌افزاری پیشرو در افغانستان است. ما ویب‌سایت، اپلیکیشن‌های وب، اپلیکیشن‌های موبایل، نرم‌افزارهای Windows و خدمات امنیت سایبری را برای مشتریان جهانی فراهم می‌کنیم."
    },
    canonical: {
      en: getCanonicalUrl("/", "en"),
      fa: getCanonicalUrl("/", "fa")
    },
    keywords: {
      en: combineKeywords(
        ["software company Afghanistan", "web development Afghanistan", "mobile app development",
         "desktop application development", "cybersecurity services", "web app development",
         "website design Afghanistan", "IT services Afghanistan", "software development Kabul",
         "custom software solutions", "AI solutions", "database development"]
      ),
      fa: combinePersianKeywords(
        ["شرکت نرم‌افزاری افغانستان", "توسعه وب کابل", "اپلیکیشن موبایل",
         "نرم‌افزار ویندوز", "خدمات امنیت سایبری", "توسعه داشبورد",
         "سیستم‌های مدیریتی", "راه‌حل‌های نرم‌افزاری", "AI و یادگیری ماشین"]
      )
    }
  };

  useSEO({
    title: seoConfig.title,
    description: seoConfig.description,
    canonical: seoConfig.canonical,
    keywords: seoConfig.keywords.en, // Will be updated by useSEO based on language
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
