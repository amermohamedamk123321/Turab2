import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { useHreflang } from "@/hooks/use-hreflang";
import { useBreadcrumbSchema } from "@/hooks/use-breadcrumb-schema";
import { generateServiceSchema, injectSchema, removeSchema } from "@/utils/schema";
import { getServiceBySlug, getServiceNavigationList } from "@/data/services";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Aurora from "@/components/ui/Aurora";

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const service = getServiceBySlug(slug);

  // Redirect to home if service not found
  if (!service) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
          <Button onClick={() => navigate("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Hooks for SEO
  useHreflang();
  useBreadcrumbSchema([
    { name: "Home", url: "https://turabroot.com/" },
    { name: "Services", url: "https://turabroot.com/services" },
    { name: service.name[currentLang], url: `https://turabroot.com/services/${slug}` }
  ]);

  // Set up SEO
  useSEO({
    title: service.seoTitle[currentLang],
    description: service.seoDescription[currentLang],
    canonical: {
      en: `https://turabroot.com/services/${slug}`,
      fa: `https://turabroot.com/services/${slug}?lang=fa`
    },
    keywords: service.keywords[currentLang],
  });

  // Inject service schema
  useEffect(() => {
    const serviceSchema = generateServiceSchema({
      name: service.name[currentLang],
      description: service.description[currentLang],
      url: `https://turabroot.com/services/${slug}`,
      areaServed: "Worldwide",
    });
    injectSchema(serviceSchema, "service-schema");

    return () => removeSchema("service-schema");
  }, [currentLang, slug, service]);

  const otherServices = getServiceNavigationList()
    .filter(s => s.slug !== slug)
    .slice(0, 3);

  return (
    <main className="pb-12 sm:pb-16 md:pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] min-h-[450px] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0">
          <Aurora colorStops={["#fcfdfc", "#B19EEF", "#ff2929"]} blend={0.5} amplitude={1.0} speed={1} />
        </div>
        <motion.div
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">{service.serviceIcon}</div>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 md:mb-6">
            {service.name[currentLang]}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {service.description[currentLang]}
          </p>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20">
        {/* Features Section */}
        <motion.section
          className="mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 md:mb-12">
            {currentLang === "fa" ? "ویژگی‌های خدمات" : "Service Features"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {service.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 sm:p-8 flex gap-4">
                  <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2">
                      {feature[currentLang]}
                    </h3>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GlassCard className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              {currentLang === "fa" ? "آماده شروع می‌کنید؟" : "Ready to Get Started?"}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              {currentLang === "fa"
                ? "بیایید با تیم ما صحبت کنید تا ببینیم چطور می‌توانیم به کسب‌وکار شما کمک کنیم."
                : "Let's talk with our team to see how we can help your business."}
            </p>
            <Button size="lg" className="gap-2" onClick={() => navigate("/contact")}>
              {currentLang === "fa" ? "درخواست رایگان" : "Request Free Consultation"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </GlassCard>
        </motion.section>

        {/* Other Services */}
        {otherServices.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 md:mb-12">
              {currentLang === "fa" ? "خدمات دیگری که ارائه می‌دهیم" : "Our Other Services"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {otherServices.map((otherService, index) => (
                <motion.div
                  key={otherService.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard
                    className="p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-shadow h-full"
                    onClick={() => navigate(`/services/${otherService.slug}`)}
                  >
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                      {currentLang === "fa" ? otherService.nameFa : otherService.nameEn}
                    </h3>
                    <Button variant="ghost" size="sm" className="gap-2">
                      {currentLang === "fa" ? "بیشتر بدانید" : "Learn More"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
};

export default ServiceDetail;
