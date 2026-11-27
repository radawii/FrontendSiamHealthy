// Shared GA4 helper for the Ascender Ingredient Knowledge Base pages.
// Reuses the gtag.js snippet already loaded sitewide (measurement ID G-0MNXV0DG3R).
function trackKbEvent(eventName, params) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  } catch (e) {
    // GA4 is best-effort only; never let analytics break the page.
  }
}
