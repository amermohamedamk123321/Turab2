import { GlassCard } from "@/components/ui/glass-card";
import MeshGradient from "@/components/ui/MeshGradient";
import { CheckCircle, Users, Award } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { useTranslation } from "react-i18next";

const Timeline = () => {
  const { t } = useTranslation();

  const milestones = [
    { year: "2022", title: t("about.timeline.founded"), description: t("about.timeline.foundedDesc"), icon: CheckCircle, color: "text-blue-500" },
    { year: "2025", title: t("about.timeline.projects"), description: t("about.timeline.projectsDesc"), icon: Users, color: "text-green-500" },
    { year: "2026", title: t("about.timeline.recognition"), description: t("about.timeline.recognitionDesc"), icon: Award, color: "text-yellow-500" }
  ];

  return (
    <MeshGradient variant="blue" className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("about.timeline.title")}
          highlight={t("about.timeline.titleHighlight")}
          subtitle={t("about.timeline.subtitle")}
        />

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary via-primary/50 to-transparent" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div key={index} className={`flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-col md:gap-12 gap-6`} initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: index * 0.2 }} viewport={{ once: true }}>
                  <div className="flex-1 w-full">
                    <GlassCard hover className="relative">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full bg-primary/10 ${milestone.color}`}><milestone.icon className="h-6 w-6" /></div>
                        <div>
                          <div className="text-sm font-semibold text-primary mb-1">{milestone.year}</div>
                          <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg relative z-10" />
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MeshGradient>
  );
};

export default Timeline;
