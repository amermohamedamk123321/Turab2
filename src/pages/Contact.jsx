import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import { GlassCard } from "@/components/ui/glass-card";
import { MessageCircle, Clock, Shield } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const Contact = () => {
  const { t } = useTranslation();

  useSEO({
    title: "Contact Us – Get a Free Consultation",
    description: "Contact Turab Root for website development, mobile apps, desktop software, or cybersecurity services. Free consultation, 24-hour response. Based in Afghanistan, serving worldwide.",
    canonical: "https://turabroot.com/contact",
  });

  return (
    <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 md:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12 sm:mb-16 md:mb-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-5 md:mb-6">
            {t("contact.title")} <span className="hero-gradient">{t("contact.titleHighlight")}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">{t("contact.subtitle")}</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {[
            { icon: MessageCircle, title: t("contact.freeConsultation"), description: t("contact.freeConsultationDesc") },
            { icon: Clock, title: t("contact.quickResponse"), description: t("contact.quickResponseDesc") },
            { icon: Shield, title: t("contact.confidential"), description: t("contact.confidentialDesc") }
          ].map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}>
              <GlassCard className="text-center h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full mb-3 sm:mb-4"><item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /></div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 max-w-6xl mx-auto">
          <ContactForm />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <ContactInfo />
          </motion.div>
        </div>

        <motion.div className="mt-12 sm:mt-16 md:mt-20 max-w-4xl mx-auto" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <GlassCard>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
              {t("contact.faq.title")} <span className="hero-gradient">{t("contact.faq.titleHighlight")}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-5 sm:space-y-6">
                <div><h3 className="font-semibold mb-2 text-sm sm:text-base">{t("contact.faq.q1")}</h3><p className="text-muted-foreground text-xs sm:text-sm">{t("contact.faq.a1")}</p></div>
                <div><h3 className="font-semibold mb-2 text-sm sm:text-base">{t("contact.faq.q2")}</h3><p className="text-muted-foreground text-xs sm:text-sm">{t("contact.faq.a2")}</p></div>
                <div><h3 className="font-semibold mb-2 text-sm sm:text-base">{t("contact.faq.q3")}</h3><p className="text-muted-foreground text-xs sm:text-sm">{t("contact.faq.a3")}</p></div>
              </div>
              <div className="space-y-5 sm:space-y-6">
                <div><h3 className="font-semibold mb-2 text-sm sm:text-base">{t("contact.faq.q4")}</h3><p className="text-muted-foreground text-xs sm:text-sm">{t("contact.faq.a4")}</p></div>
                <div><h3 className="font-semibold mb-2 text-sm sm:text-base">{t("contact.faq.q5")}</h3><p className="text-muted-foreground text-xs sm:text-sm">{t("contact.faq.a5")}</p></div>
                <div><h3 className="font-semibold mb-2 text-sm sm:text-base">{t("contact.faq.q6")}</h3><p className="text-muted-foreground text-xs sm:text-sm">{t("contact.faq.a6")}</p></div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </main>
  );
};

export default Contact;
