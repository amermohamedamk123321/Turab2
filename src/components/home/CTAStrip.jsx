import { Button } from "@/components/ui/button";
import MeshGradient from "@/components/ui/MeshGradient";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, MessageCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CTAStrip = () => {
  const { t } = useTranslation();

  return (
    <MeshGradient variant="purple" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute top-0 left-0 w-48 h-48 bg-primary rounded-full -translate-x-20 -translate-y-20" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-ring rounded-full translate-x-28 translate-y-28" />
            </div>

            <div className="relative z-10 text-center max-w-4xl mx-auto py-6">
              <motion.h2 className="text-4xl md:text-5xl font-bold mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
                {t("cta.title")}{" "}
                <span className="hero-gradient">{t("cta.titleHighlight")}</span>
              </motion.h2>

              <motion.p className="text-xl text-muted-foreground mb-10 leading-relaxed" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
                {t("cta.subtitle")}
              </motion.p>

              <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full group min-w-[200px]">
                  <Link to="/contact">
                    <MessageCircle className="me-2 h-5 w-5" />
                    {t("cta.startConsultation")}
                    <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg rounded-full group min-w-[200px]">
                  <Link to="/contact">
                    <Calendar className="me-2 h-5 w-5" />
                    {t("cta.scheduleCall")}
                  </Link>
                </Button>
              </motion.div>

              <motion.div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} viewport={{ once: true }}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {t("cta.freeConsultation")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  {t("cta.noObligations")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  {t("cta.quickResponse")}
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MeshGradient>
  );
};

export default CTAStrip;
