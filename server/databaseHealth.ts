import type { Request, Response } from "express";
import { checkDatabaseHealth } from "./db";
import { sdk } from "./_core/sdk";
import { notifyOwner } from "./_core/notification";

/** Heartbeat callback: checks DB connectivity and alerts the owner on failure. */
export async function databaseHealthHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const health = await checkDatabaseHealth();
    if (!health.ok) {
      await notifyOwner({
        title: "تنبيه: قاعدة بيانات ADRAR غير متاحة",
        content: `فشل فحص الاتصال بقاعدة البيانات. السبب: ${health.reason}. المدة: ${health.latencyMs}ms. لم يتم تضمين أي أسرار أو بيانات اتصال.`,
      });
      return res.status(503).json({ ok: false, alerted: true, latencyMs: health.latencyMs });
    }

    return res.json({ ok: true, latencyMs: health.latencyMs });
  } catch (error) {
    console.error("[DatabaseHealth] check failed", error);
    return res.status(500).json({ ok: false, error: "health_check_failed", timestamp: new Date().toISOString() });
  }
}

export async function databaseHealthStatus() {
  return checkDatabaseHealth();
}
