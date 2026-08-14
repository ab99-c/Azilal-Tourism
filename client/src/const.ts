import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
//
// It has SIDE EFFECTS — it mints a one-time nonce, writes the __Host- state
// cookie, and navigates immediately — so the cookie nonce always matches the
// `state` it sends. Do NOT call it during render (no `href={startLogin()}` /
// `loginUrl={...}`): each call overwrites the cookie, so a stray render-phase
// call would desync it from an in-flight login and the callback would reject it
// with "invalid oauth state". It returns void by design, so there is no URL to
// stash across renders.
// The Manus OAuth portal base URL. It is injected at build time on the Manus
// platform (VITE_OAUTH_PORTAL_URL); on external hosts (e.g. Vercel static
// builds) the env is empty, so fall back to the canonical production portal.
const OAUTH_PORTAL_FALLBACK = "https://manus.im";
// The Manus OAuth app id. On the Manus platform VITE_APP_ID is injected at
// build time; on external hosts (Vercel) it is empty. The project id doubles
// as the OAuth client id, so hardcode it as the canonical fallback.
const OAUTH_APP_ID_FALLBACK = "J2SX2a5nNx9zeqeJ7oPCCo";
export const startLogin = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || OAUTH_PORTAL_FALLBACK;
  const appId = import.meta.env.VITE_APP_ID || OAUTH_APP_ID_FALLBACK;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  let url: URL;
  try {
    url = new URL(`${oauthPortalUrl}/app-auth`);
  } catch {
    // Env misconfigured (no appId/portal) — navigate to the portal homepage
    // instead of silently throwing and breaking the page.
    window.location.href = OAUTH_PORTAL_FALLBACK;
    return;
  }
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.href = url.toString();
};
