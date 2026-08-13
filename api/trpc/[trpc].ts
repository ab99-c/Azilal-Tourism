import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../../server/_core/oauth";
import { registerStorageProxy } from "../../server/_core/storageProxy";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Register all API routes
registerStorageProxy(app);
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Catch-all: any unmatched route under /api goes to tRPC
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default (req: VercelRequest, res: VercelResponse) => {
  // Override URL parsing for Express in serverless context
  const expressReq = req as any;
  const expressRes = res as any;
  
  // Set originalUrl if not set
  if (!expressReq.originalUrl) {
    expressReq.originalUrl = expressReq.url;
  }

  app(expressReq, expressRes);
};
