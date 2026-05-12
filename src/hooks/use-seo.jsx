import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const BASE_TITLE = "Turab Root";

/**
 * Enhanced SEO hook with multilingual support
 * @param {Object} options - SEO configuration
 * @param {Object|string} options.title - Title (string for simple use, object for {en, fa} localized)
 * @param {Object|string} options.description - Description (string for simple use, object for {en, fa} localized)
 * @param {Object|string} options.canonical - Canonical URL (string for simple use, object for {en, fa} localized)
 * @param {string} options.keywords - Keywords for the page (optional)
 * @param {string} options.robots - Robots meta value (optional, defaults to "index, follow")
 * @param {string} options.image - OG image URL (optional)
 */
export function useSEO({
  title,
  description,
  canonical,
  keywords,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  image = "https://turabroot.com/og-image.jpg"
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRTL = currentLang === "fa";

  useEffect(() => {
    // Get localized content (support both string and object formats)
    const getLocalized = (content) => {
      if (!content) return null;
      if (typeof content === "string") return content;
      if (typeof content === "object") return content[currentLang] || content.en || null;
      return null;
    };

    const localizedTitle = getLocalized(title);
    const localizedDesc = getLocalized(description);
    const localizedCanonical = getLocalized(canonical);

    // Title
    document.title = localizedTitle
      ? `${localizedTitle} | ${BASE_TITLE}`
      : `${BASE_TITLE} | ${currentLang === "fa"
          ? "شرکت نرم‌افزاری در افغانستان – توسعه وب، اپلیکیشن موبایل و خدمات امنیتی"
          : "Software Company in Afghanistan – Web, Mobile App & Security Services"}`;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && localizedDesc) {
      metaDesc.setAttribute("content", localizedDesc);
    }

    // Meta keywords
    if (keywords) {
      let keywordMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordMeta) {
        keywordMeta = document.createElement("meta");
        keywordMeta.setAttribute("name", "keywords");
        document.head.appendChild(keywordMeta);
      }
      keywordMeta.setAttribute("content", keywords);
    }

    // Meta robots
    if (robots) {
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", robots);
    }

    // Canonical
    const link = document.querySelector('link[rel="canonical"]');
    if (link && localizedCanonical) {
      link.setAttribute("href", localizedCanonical);
    }

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && localizedTitle) {
      ogTitle.setAttribute("content", `${localizedTitle} | ${BASE_TITLE}`);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && localizedDesc) {
      ogDesc.setAttribute("content", localizedDesc);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && localizedCanonical) {
      ogUrl.setAttribute("content", localizedCanonical);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && image) {
      ogImage.setAttribute("content", image);
    }

    // Update document language and direction
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";

  }, [title, description, canonical, keywords, robots, image, currentLang, isRTL]);
}
