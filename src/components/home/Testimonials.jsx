import { GlassCard } from "@/components/ui/glass-card";
import MeshGradient from "@/components/ui/MeshGradient";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/ui/SectionHeading";

const testimonials = [
  { name: "Sarah Johnson", role: "CEO, TechFlow Solutions", content: "Turab Root transformed our digital presence completely. Their attention to detail and innovative approach exceeded all our expectations. The results speak for themselves.", rating: 5, company: "TechFlow Solutions" },
  { name: "Michael Chen", role: "Product Manager, InnovateCorp", content: "Working with Turab Root was a game-changer for our product launch. They delivered a stunning platform that our users absolutely love. Highly recommended!", rating: 5, company: "InnovateCorp" },
  { name: "Emily Rodriguez", role: "Marketing Director, GrowthLab", content: "The team's expertise in both design and development is remarkable. They created something that not only looks amazing but performs flawlessly across all devices.", rating: 5, company: "GrowthLab" }
];

const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <MeshGradient variant="subtle" className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("testimonials.title")}
          highlight={t("testimonials.titleHighlight")}
          subtitle={t("testimonials.subtitle")}
        />

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.2 }} viewport={{ once: true }} whileHover={{ y: -5 }}>
              <GlassCard hover className="h-full relative">
                <div className="absolute -top-4 start-6">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <Quote className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star key={starIndex} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</blockquote>
                  <div className="pt-6">
                    <div className="font-bold text-foreground mb-1">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary font-semibold">{testimonial.company}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
          <GlassCard className="text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "98%", label: t("testimonials.clientSatisfaction") },
                { number: "20+", label: t("testimonials.projectsCompleted") },
                { number: "24/7", label: t("testimonials.supportAvailable") },
                { number: "4.5", label: t("testimonials.averageRating") }
              ].map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }} viewport={{ once: true }}>
                  <div className="text-3xl md:text-4xl font-bold hero-gradient mb-2">{stat.number}</div>
                  <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MeshGradient>
  );
};

export default Testimonials;
