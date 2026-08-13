/**
 * Robust smooth-scroll utility for one-page navigation.
 * Native anchor scrolling can fail in some environments (iframed previews,
 * browsers without CSS scroll-behavior support, or when the page is embedded),
 * so we scroll programmatically with JS and compensate for the fixed navbar.
 */

const NAVBAR_HEIGHT_PX = 76;

/**
 * Smoothly scroll to the element with the given id (the "#" is optional).
 * Falls back to a plain hash navigation if no element is found.
 */
export function scrollToSection(id: string): void {
  const targetId = id.startsWith('#') ? id.slice(1) : id;
  const el = document.getElementById(targetId);

  if (el) {
    // In some environments (iframed previews, certain mobile browsers, or
    // embedded pages) window.scrollTo() does not scroll the page. Detect
    // that and fall back to scrollIntoView, which the browser always routes
    // to the correct scrollable ancestor.
    const before = window.scrollY;
    const y = before + el.getBoundingClientRect().top - NAVBAR_HEIGHT_PX;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    // Smooth scrolling is async: check after the browser has had a frame to
    // move. Only fall back if the page genuinely did not move (e.g. the
    // document is not the scrollable container, or scrollTo is blocked).
    requestAnimationFrame(() => {
      if (window.scrollY === before && document.documentElement.scrollHeight > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  } else {
    // Fallback: native hash navigation (browser handles it)
    window.location.hash = targetId;
  }
}
