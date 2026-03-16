import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, MessageCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

const ProjectModal = ({ project, open, onOpenChange, onContactClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const { t } = useTranslation();

  useEffect(() => { if (open) { setCurrentImageIndex(0); setShowLightbox(false); } }, [open]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;
      switch (event.key) {
        case "Escape": showLightbox ? setShowLightbox(false) : onOpenChange(false); break;
        case "ArrowLeft": if (project?.images?.length > 1) setCurrentImageIndex(prev => prev === 0 ? project.images.length - 1 : prev - 1); break;
        case "ArrowRight": if (project?.images?.length > 1) setCurrentImageIndex(prev => prev === project.images.length - 1 ? 0 : prev + 1); break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, showLightbox, project, onOpenChange]);

  if (!project) return null;

  const hasVideo = !!project.videoUrl;
  const hasImages = project.images && project.images.length > 0;
  const hasWebsite = project.isWebsite !== false && !!project.url;

  const nextImage = () => setCurrentImageIndex(prev => prev === project.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex(prev => prev === 0 ? project.images.length - 1 : prev - 1);
  const handleContactClick = () => { onContactClick(project.title); onOpenChange(false); };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-full max-h-[80vh] p-0 bg-transparent border-0">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>{project.title}</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="h-full">
            <GlassCard variant="modal" className="h-full overflow-y-auto relative p-6">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="absolute top-4 end-4 z-10 w-10 h-10 rounded-full glass-hover" aria-label="Close modal">
                <X className="h-6 w-6" />
              </Button>

              <div className="space-y-6">
                {/* Media */}
                {hasVideo && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {project.videoUrl.includes('youtube.com') || project.videoUrl.includes('youtu.be') ? (
                      <iframe src={project.videoUrl.replace('watch?v=', 'embed/')} title={`${project.title} video`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : (
                      <video controls className="w-full h-full object-cover" poster={project.thumbnail}><source src={project.videoUrl} type="video/mp4" /></video>
                    )}
                  </div>
                )}

                {hasImages && !hasVideo && (
                  <div className="space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden cursor-pointer group relative" onClick={() => setShowLightbox(true)}>
                      <img src={project.images[currentImageIndex]} alt={`${project.title} - Image ${currentImageIndex + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    {project.images.length > 1 && (
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={prevImage}><ChevronLeft className="h-4 w-4 me-1 rtl:rotate-180" />{t("projects.previous")}</Button>
                        <span className="text-xs text-muted-foreground">{currentImageIndex + 1} / {project.images.length}</span>
                        <Button variant="outline" size="sm" onClick={nextImage}>{t("projects.next")}<ChevronRight className="h-4 w-4 ms-1 rtl:rotate-180" /></Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Title & Description */}
                <div>
                  <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">{project.shortDescription || project.description}</p>
                </div>

                {hasWebsite && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                    <ExternalLink className="h-4 w-4" />
                    {t("projects.visitWebsite") || "Visit Website"}
                  </a>
                )}

                {(project.techTags || []).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t("projects.technologiesUsed")}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(project.challenge || project.solution || project.result) && (
                  <div className="space-y-4 text-sm">
                    {project.challenge && <div><h4 className="font-semibold mb-1 text-orange-500">{t("projects.challenge")}</h4><p className="text-muted-foreground">{project.challenge}</p></div>}
                    {project.solution && <div><h4 className="font-semibold mb-1 text-blue-500">{t("projects.solution")}</h4><p className="text-muted-foreground">{project.solution}</p></div>}
                    {project.result && <div><h4 className="font-semibold mb-1 text-green-500">{t("projects.result")}</h4><p className="text-muted-foreground">{project.result}</p></div>}
                  </div>
                )}

                <div className="pt-4 border-t border-border/50">
                  <Button onClick={handleContactClick} className="w-full group" size="default"><MessageCircle className="me-2 h-4 w-4" />{t("projects.talkToUs")}</Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showLightbox && hasImages && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLightbox(false)}>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} src={project.images[currentImageIndex]} alt={`${project.title} - Full size`} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
            <Button variant="ghost" size="sm" onClick={() => setShowLightbox(false)} className="absolute top-4 end-4 text-white hover:bg-white/20"><X className="h-6 w-6" /></Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectModal;
