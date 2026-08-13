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
    const rect = el.getBoundingClientRect();
    const y = window.scrollY + rect.top - NAVBAR_HEIGHT_PX;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  } else {
    // Fallback: native hash navigation (browser handles it)
    window.location.hash = targetId;
  }
}
