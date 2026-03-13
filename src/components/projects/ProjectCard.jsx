import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ProjectCard = ({ project, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
    >
      <GlassCard 
        hover 
        className="group cursor-pointer overflow-hidden p-0 h-full"
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Hover Icon */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="w-10 h-10 bg-primary/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.shortDescription}
          </p>

          {/* Tech Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.techTags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-none"
              >
                {tag}
              </Badge>
            ))}
            {project.techTags.length > 3 && (
              <Badge variant="outline" className="text-xs border-none bg-muted/50">
                +{project.techTags.length - 3}
              </Badge>
            )}
          </div>

          {project.metric && (
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <TrendingUp className="h-4 w-4" />
              {project.metric}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ProjectCard;
