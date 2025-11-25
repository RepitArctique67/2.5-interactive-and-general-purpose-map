/**
 * Analytics Utility
 * Handles event tracking and user behavior monitoring.
 * Currently configured to log to console in development.
 * Can be extended to send data to Google Analytics, Mixpanel, or a custom backend.
 */

const isDev = import.meta.env.DEV;

/**
 * Track a specific event
 * @param {string} category - The category of the event (e.g., 'Layer', 'Timeline', 'Search')
 * @param {string} action - The action performed (e.g., 'Toggle', 'Slide', 'Submit')
 * @param {string} [label] - Optional label for additional context (e.g., 'Population Layer', '1950')
 * @param {number} [value] - Optional numeric value (e.g., duration, count)
 */
export const trackEvent = (category, action, label = null, value = null) => {
    if (isDev) {
        console.log(`[Analytics] Event: ${category} | ${action} | ${label} | ${value}`);
    }

    // TODO: Integrate with external analytics provider
    // window.gtag('event', action, {
    //   event_category: category,
    //   event_label: label,
    //   value: value
    // });
};

/**
 * Track a page view (or virtual page view in SPA)
 * @param {string} path - The path viewed
 */
export const trackPageView = (path) => {
    if (isDev) {
        console.log(`[Analytics] Page View: ${path}`);
    }

    // TODO: Integrate with external analytics provider
    // window.gtag('config', 'GA_MEASUREMENT_ID', {
    //   page_path: path
    // });
};

/**
 * Track an error
 * @param {string} description - Description of the error
 * @param {boolean} [fatal=false] - Whether the error was fatal
 */
export const trackError = (description, fatal = false) => {
    if (isDev) {
        console.error(`[Analytics] Error: ${description} (Fatal: ${fatal})`);
    }

    // TODO: Integrate with external analytics provider
    // window.gtag('event', 'exception', {
    //   description: description,
    //   fatal: fatal
    // });
};

export default {
    trackEvent,
    trackPageView,
    trackError
};
