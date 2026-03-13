import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const GlassCard = forwardRef(
  ({ className, hover = false, variant = "default", ...props }, ref) => {
    const variants = {
      default: "glass rounded-2xl p-6",
      nav: "glass rounded-full px-6 py-3",
      modal: "glass rounded-3xl p-8 max-w-4xl mx-auto",
      footer: "glass rounded-t-3xl p-6"
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          hover && "glass-hover cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
