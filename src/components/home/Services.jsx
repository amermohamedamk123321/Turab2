import { Button } from "@/components/ui/button";
import MeshGradient from "@/components/ui/MeshGradient";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/ui/SectionHeading";
import ImageSlideshow from "@/components/ui/ImageSlideshow";
import securityImage from "@/assets/service-security.jpg";
import softwareImage from "@/assets/service-software.jpg";

// Image URLs - can be replaced with local assets when images are added to src/assets/
const desktopImageUrl = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2F48c0bc2265ba46e4b574642b9c0b630b?format=webp&width=800&height=1200";
const webImage1Url = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2Fa54ff4944dd94143a1dbfb42166ad737?format=webp&width=800&height=1200";
const webImage2Url = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2F7fcd25ae96714dbca345fdfd59eb9997?format=webp&width=800&height=1200";
const webImage3Url = "https://cdn.builder.io/api/v1/image/assets%2F7469f803d36a4105ba11ae5a139f172c%2Fc138be7ed5744a44a1a304ba188e3a1d?format=webp&width=800&height=1200";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      category: t("services.security.category"),
      title: t("services.security.title"),
      description: t("services.security.description"),
      image: securityImage,
      isSlideshow: false,
      link: "/contact"
    },
    {
      category: t("services.software.category"),
      title: t("services.software.title"),
      description: t("services.software.description"),
      image: softwareImage,
      isSlideshow: false,
      link: "/contact"
    },
    {
      category: t("services.web.category"),
      title: t("services.web.title"),
      description: t("services.web.description"),
      images: [webImage1Url, webImage2Url, webImage3Url],
      isSlideshow: true,
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

        <div className="space-y-24 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 items-center`}>
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
                {service.isSlideshow ? (
                  <ImageSlideshow images={service.images} alt={service.title} />
                ) : (
                  <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_40px_-8px_rgba(96,165,250,0.2)]">
                    <img src={service.image} alt={service.title} className="w-full h-64 lg:h-80 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                  </div>
                )}
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
