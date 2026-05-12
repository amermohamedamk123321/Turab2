/**
 * Performance and Core Web Vitals monitoring utilities
 * Measures LCP, FID/INP, and CLS for SEO optimization
 */

/**
 * Track Web Vitals metrics
 * @param {Function} callback - Callback function to report metrics
 */
export function trackWebVitals(callback) {
  // Measure Largest Contentful Paint (LCP)
  const observerLCP = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    callback({
      metric: "LCP",
      value: lastEntry.renderTime || lastEntry.loadTime,
      rating: getLCPRating(lastEntry.renderTime || lastEntry.loadTime),
    });
  });

  try {
    observerLCP.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (e) {
    console.warn("LCP observer not supported", e);
  }

  // Measure First Input Delay (FID) or Interaction to Next Paint (INP)
  const observerFID = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      callback({
        metric: "FID",
        value: entry.processingDuration,
        rating: getFIDRating(entry.processingDuration),
      });
    });
  });

  try {
    observerFID.observe({ entryTypes: ["first-input"] });
  } catch (e) {
    console.warn("FID observer not supported", e);
  }

  // Measure Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const observerCLS = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        callback({
          metric: "CLS",
          value: clsValue,
          rating: getCLSRating(clsValue),
        });
      }
    });
  });

  try {
    observerCLS.observe({ entryTypes: ["layout-shift"] });
  } catch (e) {
    console.warn("CLS observer not supported", e);
  }

  // Measure First Contentful Paint (FCP)
  const observerFCP = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      callback({
        metric: "FCP",
        value: entry.startTime,
        rating: getFCPRating(entry.startTime),
      });
    });
  });

  try {
    observerFCP.observe({ entryTypes: ["paint"] });
  } catch (e) {
    console.warn("FCP observer not supported", e);
  }
}

/**
 * Get LCP rating (Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s)
 * @param {number} value - LCP value in milliseconds
 * @returns {string} Rating: "good", "needsImprovement", or "poor"
 */
export function getLCPRating(value) {
  if (value < 2500) return "good";
  if (value < 4000) return "needsImprovement";
  return "poor";
}

/**
 * Get FID rating (Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms)
 * @param {number} value - FID value in milliseconds
 * @returns {string} Rating: "good", "needsImprovement", or "poor"
 */
export function getFIDRating(value) {
  if (value < 100) return "good";
  if (value < 300) return "needsImprovement";
  return "poor";
}

/**
 * Get CLS rating (Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25)
 * @param {number} value - CLS value (unitless)
 * @returns {string} Rating: "good", "needsImprovement", or "poor"
 */
export function getCLSRating(value) {
  if (value < 0.1) return "good";
  if (value < 0.25) return "needsImprovement";
  return "poor";
}

/**
 * Get FCP rating (Good: < 1.8s, Needs Improvement: 1.8-3s, Poor: > 3s)
 * @param {number} value - FCP value in milliseconds
 * @returns {string} Rating: "good", "needsImprovement", or "poor"
 */
export function getFCPRating(value) {
  if (value < 1800) return "good";
  if (value < 3000) return "needsImprovement";
  return "poor";
}

/**
 * Send metrics to Google Analytics 4
 * @param {string} measurementId - GA4 Measurement ID (e.g., G-XXXXXXXXXX)
 * @param {Object} metric - Metric object {metric, value, rating}
 */
export function sendToGA4(measurementId, metric) {
  if (!measurementId) return;

  try {
    // Send to Google Analytics using gtag
    if (typeof gtag !== "undefined") {
      gtag("event", `web_vital_${metric.metric.toLowerCase()}`, {
        value: Math.round(metric.value),
        event_category: "web_vitals",
        event_label: metric.metric,
        non_interaction: true,
        metric_rating: metric.rating,
      });
    }
  } catch (e) {
    console.warn("Failed to send metric to GA4", e);
  }
}

/**
 * Get performance timing summary
 * @returns {Object} Performance metrics summary
 */
export function getPerformanceSummary() {
  const navigation = performance.getEntriesByType("navigation")[0] || {};
  const paint = performance.getEntriesByType("paint");

  return {
    timeToFirstByte: navigation.responseStart - navigation.fetchStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: paint.find(p => p.name === "first-paint")?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === "first-contentful-paint")?.startTime || 0,
  };
}

/**
 * Check if performance is acceptable for SEO (Core Web Vitals must be "good")
 * @returns {Object} SEO performance check result
 */
export function checkSEOPerformance() {
  const vitals = {
    lcp: { current: null, target: 2500 },
    fid: { current: null, target: 100 },
    cls: { current: null, target: 0.1 },
  };

  trackWebVitals((metric) => {
    if (metric.metric === "LCP") vitals.lcp.current = metric.value;
    if (metric.metric === "FID") vitals.fid.current = metric.value;
    if (metric.metric === "CLS") vitals.cls.current = metric.value;
  });

  return {
    isGood: vitals.lcp.current < vitals.lcp.target &&
            vitals.fid.current < vitals.fid.target &&
            vitals.cls.current < vitals.cls.target,
    vitals,
  };
}

/**
 * Optimize image loading with lazy loading attribute
 * @param {string} selector - CSS selector for images to optimize
 */
export function optimizeImageLoading(selector = "img") {
  document.querySelectorAll(selector).forEach((img) => {
    if (!img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }
  });
}

/**
 * Preload critical resources for faster page load
 * @param {Array} resources - Array of resource URLs to preload
 */
export function preloadResources(resources) {
  resources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = resource.url;
    link.as = resource.as || "script";
    if (resource.type) link.type = resource.type;
    document.head.appendChild(link);
  });
}

/**
 * Defer non-critical scripts
 * @param {Array} scripts - Array of script URLs to defer
 */
export function deferScripts(scripts) {
  scripts.forEach((scriptUrl) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.defer = true;
    document.body.appendChild(script);
  });
}

export default {
  trackWebVitals,
  getLCPRating,
  getFIDRating,
  getCLSRating,
  getFCPRating,
  sendToGA4,
  getPerformanceSummary,
  checkSEOPerformance,
  optimizeImageLoading,
  preloadResources,
  deferScripts,
};
