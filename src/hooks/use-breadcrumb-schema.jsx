import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generateBreadcrumbSchema, injectSchema, removeSchema } from "@/utils/schema";

/**
 * Hook to inject breadcrumb schema for pages
 * @param {Array} breadcrumbs - Custom breadcrumb items: [{name, url}]
 *                              If not provided, generates breadcrumbs from current path
 */
export function useBreadcrumbSchema(customBreadcrumbs) {
  const location = useLocation();

  useEffect(() => {
    // Generate breadcrumbs from path if not provided
    const getBreadcrumbs = () => {
      if (customBreadcrumbs) {
        return customBreadcrumbs;
      }

      const breadcrumbs = [
        { name: "Home", url: "https://turabroot.com/" },
      ];

      const pathSegments = location.pathname
        .split("/")
        .filter(segment => segment.length > 0);

      pathSegments.forEach((segment, index) => {
        const path = "/" + pathSegments.slice(0, index + 1).join("/");
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        breadcrumbs.push({
          name,
          url: `https://turabroot.com${path}`,
        });
      });

      return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();
    const schema = generateBreadcrumbSchema(breadcrumbs);
    const schemaId = "breadcrumb-schema";

    injectSchema(schema, schemaId);

    return () => {
      removeSchema(schemaId);
    };
  }, [location.pathname, customBreadcrumbs]);
}
