import { cn } from "@/lib/utils";

const MeshGradient = ({ variant = "blue", className, children }) => {
  const variants = {
    blue: "mesh-gradient-blue",
    purple: "mesh-gradient-purple",
    subtle: "mesh-gradient-subtle",
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className={cn("absolute inset-0 pointer-events-none", variants[variant])} />
      <div className="absolute inset-0 pointer-events-none noise-texture" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default MeshGradient;
