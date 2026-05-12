import { useEffect } from "react";
import { trackWebVitals, sendToGA4 } from "@/utils/performance";

/**
 * Hook to track Web Vitals and send to Google Analytics
 * Add this to your main App component
 * @param {string} gaId - Google Analytics Measurement ID (optional)
 */
export function usePerformanceTracking(gaId = null) {
  useEffect(() => {
    // Track Web Vitals
    trackWebVitals((metric) => {
      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`${metric.metric}: ${Math.round(metric.value)}ms (${metric.rating})`);
      }

      // Send to Google Analytics if ID is provided
      if (gaId) {
        sendToGA4(gaId, metric);
      }

      // Send to analytics service endpoint if needed
      // await fetch('/api/analytics/vitals', { method: 'POST', body: JSON.stringify(metric) })
    });
  }, [gaId]);
}

export default usePerformanceTracking;
