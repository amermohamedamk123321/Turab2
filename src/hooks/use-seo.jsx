import { useEffect } from "react";

const BASE_TITLE = "Turab Root";

export function useSEO({ title, description, canonical }) {
  useEffect(() => {
    // Title
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Software Company in Afghanistan – Web, Mobile & Security Services`;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute("content", description);
    }

    // Canonical
    const link = document.querySelector('link[rel="canonical"]');
    if (link && canonical) {
      link.setAttribute("href", canonical);
    }

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) ogTitle.setAttribute("content", `${title} | ${BASE_TITLE}`);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute("content", description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && canonical) ogUrl.setAttribute("content", canonical);
  }, [title, description, canonical]);
}
