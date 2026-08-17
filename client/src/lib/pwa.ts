/**
 * PWA install support for ADRAR.
 *
 * - Registers a minimal service worker so the site meets the installability
 *   criteria on Chrome/Android (requires HTTPS; skipped on http / dev).
 * - Captures the native `beforeinstallprompt` event so the app can surface an
 *   explicit "Install ADRAR" banner/button on mobile browsers that support it.
 */

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let swRegistered = false;

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    // Prevent Chrome 67+ default mini-infobar and stash the event
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent("adrar:pwa-ready"));
  });
}

export async function registerServiceWorker(): Promise<void> {
  if (swRegistered) return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  // Service workers require a secure context
  if (window.location.protocol !== "https:") return;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    swRegistered = true;
  } catch {
    // SW registration failure must never break the app
    swRegistered = false;
  }
}

/** Ask the browser to show its install dialog. No-op if not available. */
export async function installApp(): Promise<boolean> {
  if (!deferredPrompt) return false;
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === "accepted";
  } catch {
    return false;
  }
}
