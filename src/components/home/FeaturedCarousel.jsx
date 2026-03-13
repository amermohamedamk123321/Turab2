import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MeshGradient from "@/components/ui/MeshGradient";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/ui/SectionHeading";
import { projectsApi } from "@/services/api";

const FeaturedCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    projectsApi.list().then(data => {
      const featured = data.filter(p => p.featured);
      setFeaturedProjects(featured.length > 0 ? featured : data.slice(0, 3));
    });
  }, []);

  useEffect(() => {
    if (featuredProjects.length === 0) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion && isAutoPlaying) {
      const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % featuredProjects.length); }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, featuredProjects.length]);

  if (featuredProjects.length === 0) return null;

  const nextSlide = () => { setCurrentSlide((prev) => (prev + 1) % featuredProjects.length); setIsAutoPlaying(false); };
  const prevSlide = () => { setCurrentSlide((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length); setIsAutoPlaying(false); };
  const goToSlide = (index) => { setCurrentSlide(index); setIsAutoPlaying(false); };

  const current = featuredProjects[currentSlide];
  const hasVideo = !!current?.videoUrl;
  const hasWebsite = current?.isWebsite !== false && !!current?.url;

  return (
    <MeshGradient variant="blue" className="py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("featured.title")}
          highlight={t("featured.titleHighlight")}
          subtitle={t("featured.subtitle")}
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={currentSlide} initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                <GlassCard className="p-0 overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-[420px] overflow-hidden">
                      {hasVideo ? (
                        current.videoUrl.includes('youtube.com') || current.videoUrl.includes('youtu.be') ? (
                          <iframe src={current.videoUrl.replace('watch?v=', 'embed/')} title={`${current.title} video`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        ) : (
                          <video className="w-full h-full object-cover" poster={current.thumbnail} muted autoPlay loop>
                            <source src={current.videoUrl} type="video/mp4" />
                          </video>
                        )
                      ) : (
                        <>
                          <img src={current.thumbnail || "/placeholder.svg"} alt={current.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                        </>
                      )}
                    </div>
                    <div className="p-8 md:p-14 flex flex-col justify-center">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">{current.title}</h3>
                        <p className="text-muted-foreground mb-6 leading-relaxed">{current.description || current.shortDescription}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {(current.techTags || []).map((tech) => (
                            <span key={tech} className="px-4 py-1.5 text-sm bg-primary/10 text-primary rounded-full font-medium">{tech}</span>
                          ))}
                        </div>
                        {current.metric && <div className="text-lg font-bold text-primary mb-6">{current.metric}</div>}
                        <Button className="group rounded-full px-8" asChild>
                          <Link to="/projects">
                            {t("featured.viewDetails")}
                            <ArrowRight className="ms-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>

          <Button variant="outline" size="sm" onClick={prevSlide} className="absolute start-4 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 p-0 bg-background/80 backdrop-blur-sm border-none shadow-lg shadow-ring/10 hover:shadow-ring/20" aria-label="Previous project">
            <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextSlide} className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 p-0 bg-background/80 backdrop-blur-sm border-none shadow-lg shadow-ring/10 hover:shadow-ring/20" aria-label="Next project">
            <ChevronRight className="h-6 w-6 rtl:rotate-180" />
          </Button>

          <div className="flex justify-center gap-3 mt-8">
            {featuredProjects.map((_, index) => (
              <button key={index} onClick={() => goToSlide(index)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-primary w-8" : "bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40"}`} aria-label={`Go to slide ${index + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </MeshGradient>
  );
};

export default FeaturedCarousel;