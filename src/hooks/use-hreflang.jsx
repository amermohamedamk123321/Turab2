import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setHreflangs } from "@/utils/seo";

/**
 * Hook to inject hreflang meta tags for multilingual SEO
 * Automatically detects the current path and sets hreflang tags for EN and FA versions
 */
export function useHreflang() {
  const location = useLocation();

  useEffect(() => {
    // Extract the path without language query parameter
    const path = location.pathname;
    
    // Set hreflang tags for all language versions
    setHreflangs(path);

    // Cleanup: remove hreflang tags when component unmounts
    return () => {
      document.querySelectorAll('link[rel="alternate"]').forEach(tag => {
        tag.remove();
      });
    };
  }, [location.pathname]);
}
