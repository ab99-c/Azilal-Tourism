import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import "./index.css";
// PWA install support: service worker + native install prompt
import { registerServiceWorker } from "./lib/pwa";
registerServiceWorker();

// SEO — inject rich structured data (JSON-LD) for crawlers.
// Static meta tags live in index.html; these blocks are added at runtime so
// they always reflect the current dataset, and each render dedupes by id.
import {
  SEO_ENTITIES,
  buildBreadcrumbJsonLd,
  buildLocalBusinessesJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "./lib/seoSchema";

const injectJsonLd = (id: string, payload: object) => {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
};

injectJsonLd("adrar-jsonld-website", buildWebSiteJsonLd());
injectJsonLd("adrar-jsonld-organization", buildOrganizationJsonLd());
injectJsonLd("adrar-jsonld-breadcrumb", buildBreadcrumbJsonLd());
injectJsonLd(
  "adrar-jsonld-businesses",
  buildLocalBusinessesJsonLd(SEO_ENTITIES)
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // On static hosts (Vercel) the backend is absent; never refetch a wall of
      // errors that could abort rendering — surface empty results instead.
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
// The API endpoint may be absent on static external hosts (e.g. Vercel builds
// without the Manus backend). In that case an "unauthorized" error is actually
// just a missing endpoint (404) — never auto-redirect to login there.
const apiAvailable = () =>
  typeof document !== "undefined" && import.meta.env.VITE_APP_ID !== "";

// Throttle guard: on Manus hosts, UNAUTHORIZED API errors used to trigger
// startLogin() on every failing query. If the OAuth session cookie did not
// stick (e.g. the callback lost its state cookie), that produced an infinite
// login-redirect loop that killed the page (blank/black screen after login).
// Now the redirect fires at most once per page load.
let loginRedirectFired = false;
const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (!apiAvailable()) return;
  if (loginRedirectFired) return;
  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;
  loginRedirectFired = true;
  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
