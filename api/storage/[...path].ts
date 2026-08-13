import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { registerStorageProxy } from "../../server/_core/storageProxy";

const app = express();
registerStorageProxy(app);

export default (req: VercelRequest, res: VercelResponse) => {
  const expressReq = req as any;
  const expressRes = res as any;
  
  if (!expressReq.originalUrl) {
    expressReq.originalUrl = expressReq.url;
  }

  app(expressReq, expressRes);
};
