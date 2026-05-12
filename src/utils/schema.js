/**
 * Schema.org structured data utilities for SEO
 * Generates JSON-LD markup for various schema types
 */

/**
 * Generate breadcrumb schema for a page
 * @param {Array} breadcrumbs - Array of breadcrumb items: [{name, url}]
 * @returns {Object} JSON-LD schema object
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  const itemListElement = breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement,
  };
}

/**
 * Generate service schema
 * @param {Object} service - Service data: {name, description, url, price, priceRange}
 * @returns {Object} JSON-LD schema object
 */
export function generateServiceSchema(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description || "",
    "url": service.url || "https://turabroot.com",
    "serviceType": service.serviceType || service.name,
    ...(service.provider && { "provider": service.provider }),
    ...(service.price && { "price": service.price }),
    ...(service.priceRange && { "priceRange": service.priceRange }),
    ...(service.areaServed && { "areaServed": service.areaServed }),
  };
}

/**
 * Generate aggregate rating / review schema
 * @param {Object} rating - Rating data: {ratingValue, bestRating, ratingCount, reviewCount}
 * @returns {Object} JSON-LD schema object
 */
export function generateAggregateRatingSchema(rating) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": rating.ratingValue || 4.8,
    "bestRating": rating.bestRating || 5,
    "worstRating": rating.worstRating || 1,
    "ratingCount": rating.ratingCount || 100,
    "reviewCount": rating.reviewCount || 25,
  };
}

/**
 * Generate FAQPage schema for FAQ content
 * @param {Array} faqs - Array of FAQ items: [{question, answer}]
 * @returns {Object} JSON-LD schema object
 */
export function generateFAQSchema(faqs) {
  const mainEntity = faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity,
  };
}

/**
 * Generate organization schema
 * @param {Object} org - Organization data
 * @returns {Object} JSON-LD schema object
 */
export function generateOrganizationSchema(org) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": org.name || "Turab Root",
    "alternateName": org.alternateName || "Turab Root ICT",
    "url": org.url || "https://turabroot.com",
    "logo": org.logo || "https://turabroot.com/turab-root-logo.png",
    "description": org.description || "Leading software company in Afghanistan offering website development, web apps, mobile apps, desktop applications, and cybersecurity services.",
    "foundingDate": org.foundingDate || "2022",
    "areaServed": org.areaServed || "Worldwide",
    "address": org.address || {
      "@type": "PostalAddress",
      "addressCountry": "AF",
      "addressRegion": "Afghanistan",
    },
    "contactPoint": org.contactPoint || {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Farsi", "Pashto"],
    },
    ...(org.sameAs && { "sameAs": org.sameAs }),
  };
}

/**
 * Generate local business schema
 * @param {Object} business - Business data
 * @returns {Object} JSON-LD schema object
 */
export function generateLocalBusinessSchema(business) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name || "Turab Root",
    "image": business.image || "https://turabroot.com/og-image.jpg",
    "url": business.url || "https://turabroot.com",
    "description": business.description || "Professional software development and consulting services",
    "address": business.address || {
      "@type": "PostalAddress",
      "addressCountry": "AF",
      "addressRegion": "Afghanistan",
    },
    "telephone": business.telephone || "",
    "email": business.email || "",
    "contactPoint": business.contactPoint || {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Farsi", "Pashto"],
    },
    ...(business.geo && { "geo": business.geo }),
    ...(business.areaServed && { "areaServed": business.areaServed }),
    ...(business.sameAs && { "sameAs": business.sameAs }),
  };
}

/**
 * Generate creative work / article schema
 * @param {Object} article - Article data: {headline, description, datePublished, author, image}
 * @returns {Object} JSON-LD schema object
 */
export function generateArticleSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline || "",
    "description": article.description || "",
    "datePublished": article.datePublished || new Date().toISOString(),
    "dateModified": article.dateModified || new Date().toISOString(),
    ...(article.author && { "author": article.author }),
    ...(article.image && { "image": article.image }),
    ...(article.url && { "url": article.url }),
  };
}

/**
 * Inject JSON-LD schema into the page
 * @param {Object} schema - The schema object to inject
 * @param {string} id - Unique ID for the script tag (optional)
 */
export function injectSchema(schema, id = `schema-${Date.now()}`) {
  // Check if script with this ID already exists
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Remove schema by ID
 * @param {string} id - The ID of the schema script tag
 */
export function removeSchema(id) {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
}

/**
 * Clear all dynamic schemas (those with IDs)
 */
export function clearDynamicSchemas() {
  document.querySelectorAll('script[id^="schema-"]').forEach(script => {
    script.remove();
  });
}

export default {
  generateBreadcrumbSchema,
  generateServiceSchema,
  generateAggregateRatingSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateArticleSchema,
  injectSchema,
  removeSchema,
  clearDynamicSchemas,
};
