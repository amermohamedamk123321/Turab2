import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectModal from "@/components/projects/ProjectModal";
import ProjectRequestForm from "@/components/contact/ProjectRequestForm";
import { GlassCard } from "@/components/ui/glass-card";
import Aurora from "@/components/ui/Aurora";
import { projectsApi } from "@/services/api";
import { Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const Projects = () => {
  useSEO({
    title: "Our Portfolio – Websites, Apps & Software Projects",
    description: "Explore Turab Root's portfolio of websites, web apps, mobile applications, desktop software, and cybersecurity projects delivered to clients worldwide.",
    canonical: "https://turabroot.com/projects",
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const { t } = useTranslation();

  useEffect(() => {
    projectsApi.list()
      .then(data => {
        // Map admin data to the format ProjectCard/ProjectModal expect
        const mapped = data.map(p => ({
          ...p,
          shortDescription: p.description || "",
          thumbnail: p.thumbnail || "/placeholder.svg",
          images: p.images || [],
          techTags: Array.isArray(p.techTags) ? p.techTags : [],
          videoUrl: p.videoUrl || "",
        }));
        setProjects(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load projects:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProjects = filter === "all" ? projects : projects.filter(p => p.featured);

  const handleProjectClick = (project) => { setSelectedProject(project); setModalOpen(true); };
  const handleContactClick = (projectTitle) => { console.log(`Contact about: ${projectTitle}`); };

  return (
    <main className="pb-12 sm:pb-16 md:pb-20">
      <section className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0">
          <Aurora colorStops={["#fcfdfc", "#B19EEF", "#ff2929"]} blend={0.5} amplitude={1.0} speed={1} />
        </div>
        <motion.div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 md:mb-6">
            {t("projects.title")} <span className="hero-gradient">{t("projects.titleHighlight")}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">{t("projects.subtitle")}</p>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 md:mt-16">
        <motion.div className="flex justify-center mb-8 sm:mb-10 md:mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <GlassCard variant="nav" className="inline-flex flex-col sm:flex-row w-full sm:w-auto">
            <button onClick={() => setFilter("all")} className={`px-4 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t("projects.allProjects")} ({projects.length})
            </button>
            <button onClick={() => setFilter("featured")} className={`px-4 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base ${filter === "featured" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t("projects.featured")} ({projects.filter(p => p.featured).length})
            </button>
          </GlassCard>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12 sm:py-16 md:py-20"><Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <GlassCard className="p-8 text-center">
            <p className="text-destructive mb-2">Error: {error}</p>
            <p className="text-muted-foreground text-sm">
              {error.includes('backend') ?
                'The backend server may not be running. Please ensure the backend is started.' :
                'Failed to load projects. Please refresh the page.'}
            </p>
          </GlassCard>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            {filteredProjects.map((project, index) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <ProjectCard project={project} onClick={() => handleProjectClick(project)} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <motion.div className="text-center py-12 sm:py-16 md:py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t("projects.noProjects")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground">{t("projects.adjustFilter")}</p>
          </motion.div>
        )}
      </div>

      <ProjectModal project={selectedProject} open={modalOpen} onOpenChange={setModalOpen} onContactClick={handleContactClick} />

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20">
        <ProjectRequestForm />
      </section>
    </main>
  );
};

export default Projects;
