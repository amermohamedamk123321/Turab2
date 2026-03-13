import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const revealVariants = {
  hidden: {
    clipPath: "inset(0 0 100% 0)",
    opacity: 0,
  },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const subtitleVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const SectionHeading = ({
  title,
  highlight,
  subtitle,
  className,
  showLine = true,
  align = "center",
}) => {
  return (
    <motion.div
      className={cn(
        "mb-16",
        align === "center" && "text-center",
        align === "left" && "text-start",
        className
      )}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {/* Decorative line */}
      {showLine && align === "center" && (
        <motion.div
          variants={lineVariants}
          className="w-12 h-1 bg-primary rounded-full mx-auto mb-6 origin-left"
        />
      )}
      {showLine && align === "left" && (
        <motion.div
          variants={lineVariants}
          className="w-12 h-1 bg-primary rounded-full mb-6 origin-left"
        />
      )}

      {/* Title with clip-path reveal */}
      <div className="overflow-hidden">
        <motion.h2
          variants={revealVariants}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          {title}{" "}
          {highlight && (
            <span className="hero-gradient">{highlight}</span>
          )}
        </motion.h2>
      </div>

      {/* Subtitle with blur-in */}
      {subtitle && (
        <motion.p
          variants={subtitleVariants}
          className={cn(
            "text-xl text-muted-foreground leading-relaxed",
            align === "center" && "max-w-2xl mx-auto"
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
