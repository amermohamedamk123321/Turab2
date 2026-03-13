import { GlassCard } from "@/components/ui/glass-card";
import { Lightbulb, Users, HeadsetIcon } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { useTranslation } from "react-i18next";

const Values = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Lightbulb, title: t("about.values.innovation"), description: t("about.values.innovationDesc"), color: "text-yellow-500" },
    { icon: Users, title: t("about.values.collaboration"), description: t("about.values.collaborationDesc"), color: "text-blue-500" },
    { icon: HeadsetIcon, title: t("about.values.qualitySupport"), description: t("about.values.qualitySupportDesc"), color: "text-green-500" }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("about.values.title")}
          highlight={t("about.values.titleHighlight")}
          subtitle={t("about.values.subtitle")}
        />

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {values.map((value, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.2 }} viewport={{ once: true }} whileHover={{ y: -5 }}>
              <GlassCard className="text-center h-full">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 ${value.color}`}><value.icon className="h-8 w-8" /></div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
