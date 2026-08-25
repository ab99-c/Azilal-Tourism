import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./_core/storageProxy";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";
import { escalateInactiveSafetyTrips } from "./safetyTrips";
import { databaseHealthHandler } from "./databaseHealth";

const allowedOrigins = new Set([
  "https://azilal-tourism.vercel.app",
  "https://azilaltour-j2sx2a5n.manus.space",
]);

function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.headers.origin;
  const corsOrigin = origin && allowedOrigins.has(origin)
    ? origin
    : "https://azilal-tourism.vercel.app";

  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Vary", "Origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}

const app = express();
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
app.post("/api/scheduled/escalateSafetyTrips", escalateInactiveSafetyTrips);
app.post("/api/scheduled/db-health", databaseHealthHandler);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export default app;
