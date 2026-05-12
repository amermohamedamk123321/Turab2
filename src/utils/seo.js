/**
 * SEO utilities for handling multilingual URLs, hreflang tags, and canonical URLs
 */

const BASE_URL = "https://turabroot.com";
const SUPPORTED_LANGUAGES = ["en", "fa"];

/**
 * Get the canonical URL for a page
 * @param {string} path - The page path (e.g., "/", "/about", "/services/web-development")
 * @param {string} language - The language (en or fa)
 * @returns {string} The full canonical URL
 */
export function getCanonicalUrl(path = "/", language = "en") {
  // Current implementation uses query parameter for language
  // Alternative: Could use path-based routing like /en/ and /fa/
  const baseUrl = `${BASE_URL}${path}`;
  
  if (language === "fa") {
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}lang=fa`;
  }
  return baseUrl;
}

/**
 * Get all hreflang URLs for a page (returns both language versions)
 * @param {string} path - The page path
 * @returns {Object} Object with en and fa hreflang URLs
 */
export function getHreflangs(path = "/") {
  return {
    en: getCanonicalUrl(path, "en"),
    fa: getCanonicalUrl(path, "fa"),
    "x-default": getCanonicalUrl(path, "en"), // English is default
  };
}

/**
 * Generate hreflang meta tags for a page
 * Call this within a useEffect hook to inject hreflang tags
 * @param {string} path - The page path
 */
export function setHreflangs(path = "/") {
  const hreflangs = getHreflangs(path);

  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"]').forEach(tag => {
    tag.remove();
  });

  // Add new hreflang tags
  Object.entries(hreflangs).forEach(([lang, url]) => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hrefLang = lang;
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Build localized SEO config for pages
 * @param {Object} config - Configuration object
 * @returns {Object} Localized SEO configuration
 */
export function buildLocalizedSEO(config) {
  return {
    title: config.title, // Can be string or {en, fa}
    description: config.description, // Can be string or {en, fa}
    canonical: config.canonical || getCanonicalUrl(config.path, "en"), // Will be handled by useSEO
    keywords: config.keywords,
    robots: config.robots,
    image: config.image,
    path: config.path,
  };
}

/**
 * Format keyword for SEO (lowercase, trim, etc.)
 * @param {string} keyword - The keyword to format
 * @returns {string} Formatted keyword
 */
export function formatKeyword(keyword) {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Generate keywords from multiple keyword groups
 * @param {...string[]} keywordGroups - Arrays of keywords
 * @returns {string} Comma-separated keywords
 */
export function combineKeywords(...keywordGroups) {
  return keywordGroups
    .flat()
    .map(formatKeyword)
    .filter(k => k.length > 0)
    .join(", ");
}

/**
 * Generate Persian keywords from Persian terms
 * @param {...string[]} persianKeywordGroups - Arrays of Persian keywords
 * @returns {string} Comma-separated Persian keywords
 */
export function combinePersianKeywords(...persianKeywordGroups) {
  return persianKeywordGroups
    .flat()
    .map(k => k.trim())
    .filter(k => k.length > 0)
    .join("، ");
}

/**
 * Build meta description with proper length (50-160 chars recommended)
 * @param {string} description - The description text
 * @param {number} maxLength - Maximum length (default: 160)
 * @returns {string} Optimized description
 */
export function optimizeDescription(description, maxLength = 160) {
  if (!description) return "";
  if (description.length <= maxLength) return description;
  
  // Try to cut at a word boundary
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}

export default {
  getCanonicalUrl,
  getHreflangs,
  setHreflangs,
  buildLocalizedSEO,
  formatKeyword,
  combineKeywords,
  combinePersianKeywords,
  optimizeDescription,
};
