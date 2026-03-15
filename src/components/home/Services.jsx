import React from "react";
import { Button } from "@/components/ui/button";
import MeshGradient from "@/components/ui/MeshGradient";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/ui/SectionHeading";

// Image URLs
const securityImageUrl = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2F7ba2dcca109e4fd8910770ed996c1ed4?format=webp&width=800&height=1200";
const softwareImageUrl = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2Fd8bfbd7d247345a7800e9bfaa5e4f512?format=webp&width=800&height=1200";
const desktopImageUrl = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2F7b2d48541a1e4db6a279641f241b67a5?format=webp&width=800&height=1200";
// Website & Application Services image
const webImageUrl = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2F6a64e8f773f14252acf370d1b9907bdd?format=webp&width=800&height=1200";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      category: t("services.security.category"),
      title: t("services.security.title"),
      description: t("services.security.description"),
      image: securityImageUrl,
      isSlideshow: false,
      link: "/contact"
    },
    {
      category: t("services.software.category"),
      title: t("services.software.title"),
      description: t("services.software.description"),
      image: softwareImageUrl,
      isSlideshow: false,
      link: "/contact"
    },
    {
      category: t("services.web.category"),
      title: t("services.web.title"),
      description: t("services.web.description"),
      image: webImageUrl,
      isSlideshow: false,
      link: "/contact"
    },
    {
      category: t("services.desktop.category"),
      title: t("services.desktop.title"),
      description: t("services.desktop.description"),
      image: desktopImageUrl,
      isSlideshow: false,
      link: "/contact"
    }
  ];

  return (
    <MeshGradient variant="purple" className="py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("services.title")}
          highlight={t("services.titleHighlight")}
          subtitle={t("services.subtitle")}
          className="mb-20"
        />

        <div className="space-y-16 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-6 lg:gap-12 items-center`}>
              <div className="flex-1 space-y-5">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">{service.category}</span>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{service.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{service.description}</p>
                <div className="pt-4">
                  <Button asChild className="group rounded-full px-8">
                    <Link to={service.link}>
                      {t("services.learnMore")}
                      <ArrowRight className="ms-2 h-4 w-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </div>
              <motion.div className="flex-1 w-full" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_40px_-8px_rgba(96,165,250,0.2)]">
                  <img
                    src={service.image}
                    alt={service.title}
                    className={`w-full ${index === 1 || index === 2 ? "h-auto object-contain" : "h-64 lg:h-80 object-cover"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center mt-24" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
          <p className="text-lg text-muted-foreground mb-6">{t("services.readyToTransform")}</p>
          <Button asChild size="lg" className="px-10 rounded-full">
            <Link to="/contact">
              {t("services.startToday")}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </MeshGradient>
  );
};

export default Services;
