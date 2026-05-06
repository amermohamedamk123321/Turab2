import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Timeline from "@/components/about/Timeline";
import Values from "@/components/about/Values";
import Partners from "@/components/about/Partners";
import { GlassCard } from "@/components/ui/glass-card";
import Orb from "@/components/ui/Orb";
import { useSEO } from "@/hooks/use-seo";
import { useHreflang } from "@/hooks/use-hreflang";
import { useBreadcrumbSchema } from "@/hooks/use-breadcrumb-schema";
import { combineKeywords, combinePersianKeywords, getCanonicalUrl } from "@/utils/seo";

const About = () => {
  const { t } = useTranslation();
  useHreflang();
  useBreadcrumbSchema([
    { name: "Home", url: "https://turabroot.com/" },
    { name: "About", url: "https://turabroot.com/about" }
  ]);

  const seoConfig = {
    title: {
      en: "About Us – Afghanistan's Leading Software Company",
      fa: "درباره ما | شرکت نرم‌افزاری پیشرو افغانستان"
    },
    description: {
      en: "Learn about Turab Root, a passionate software company in Afghanistan building websites, mobile apps, desktop applications & cybersecurity solutions for global clients.",
      fa: "درباره تراب روت بیاموزید، یک شرکت نرم‌افزاری با انگیزه در افغانستان که وب‌سایت‌ها، اپلیکیشن‌های موبایل، برنامه‌های کمپیوتری و راه‌حل‌های امنیت سایبری برای مشتریان جهانی می‌سازد."
    },
    canonical: {
      en: getCanonicalUrl("/about", "en"),
      fa: getCanonicalUrl("/about", "fa")
    },
    keywords: {
      en: combineKeywords(
        ["about software company", "company history", "our team", "company mission",
         "software development company", "Afghanistan tech company", "company values",
         "professional services", "experienced developers"]
      ),
      fa: combinePersianKeywords(
        ["درباره شرکت", "تیم ما", "مأموریت", "تاریخچه", "تجربه", "متخصص",
         "نرم‌افزار", "توسعه"]
      )
    }
  };

  useSEO({
    title: seoConfig.title,
    description: seoConfig.description,
    canonical: seoConfig.canonical,
    keywords: seoConfig.keywords.en,
  });

  return (
    <main className="pb-12 sm:pb-16 md:pb-20">
      {/* Orb Hero Section */}
      <section className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] min-h-[550px] sm:min-h-[600px] flex flex-col items-center justify-end pb-16 sm:pb-20 md:pb-24 lg:pb-28 overflow-hidden bg-background">
        <div className="absolute inset-0 top-[20%]">
          <Orb
            hoverIntensity={0.68}
            rotateOnHover
            hue={257}
            forceHoverState={false}
            backgroundColor="#0B0B0D"
          />
        </div>
        <motion.div
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 flex flex-col items-center max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-7 md:mb-8">
            {t("about.title")} <span className="hero-gradient">{t("about.titleHighlight")}</span>
          </h1>
          <div className="bg-white/[0.06] backdrop-blur-[12px] rounded-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 shadow-[0_4px_24px_rgba(96,165,250,0.18)] w-full sm:w-auto">
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto leading-relaxed">{t("about.subtitle")}</p>
          </div>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 md:mt-16">
        <motion.div className="mb-12 sm:mb-16 md:mb-20" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <GlassCard className="text-center relative overflow-hidden p-6 sm:p-8 md:p-10">
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full translate-x-20 -translate-y-20" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-ring rounded-full -translate-x-28 translate-y-28" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 md:mb-6">
                {t("about.mission.title")} <span className="hero-gradient">{t("about.mission.titleHighlight")}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-7 md:mb-8">{t("about.mission.description")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8">
                <div><div className="text-2xl sm:text-3xl font-bold hero-gradient mb-2">9+</div><div className="text-sm sm:text-base text-muted-foreground">{t("about.mission.projectsDelivered")}</div></div>
                <div><div className="text-2xl sm:text-3xl font-bold hero-gradient mb-2">98%</div><div className="text-sm sm:text-base text-muted-foreground">{t("about.mission.clientSatisfaction")}</div></div>
                <div><div className="text-2xl sm:text-3xl font-bold hero-gradient mb-2">24/7</div><div className="text-sm sm:text-base text-muted-foreground">{t("about.mission.supportAvailable")}</div></div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <Timeline />
      <Partners />
      <Values />

      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <GlassCard className="max-w-2xl mx-auto p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 md:mb-6">
                {t("about.workWithUs.title")} <span className="hero-gradient">{t("about.workWithUs.titleHighlight")}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5 sm:mb-6">{t("about.workWithUs.description")}</p>
              <div className="flex justify-center items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-xs sm:text-sm text-muted-foreground mx-auto">
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default About;
