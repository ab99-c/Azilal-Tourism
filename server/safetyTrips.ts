import type { Request, Response } from "express";
import { findSafetyTripsForEscalation, markSafetyTripOverdue } from "./db";
import { sdk } from "./_core/sdk";
import { notifyOwner } from "./_core/notification";

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function isSafetyTripOverdue(lastActivity: Date, now: Date): boolean {
  return now.getTime() - lastActivity.getTime() >= TWENTY_FOUR_HOURS_MS;
}

/**
 * Heartbeat callback. It never contacts police automatically. It marks a trip
 * overdue once, then alerts the platform owner so a human can follow the
 * approved emergency process.
 */
export async function escalateInactiveSafetyTrips(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const now = new Date();
    const candidates = await findSafetyTripsForEscalation();
    let escalated = 0;

    for (const trip of candidates) {
      const lastActivity = trip.lastCheckInAt ?? trip.departureAt;
      if (!isSafetyTripOverdue(new Date(lastActivity), now)) continue;

      await markSafetyTripOverdue(trip.publicToken, now);
      escalated += 1;
      const location = trip.lastLocationLat && trip.lastLocationLng
        ? `آخر موقع شاركو الزائر بموافقته: ${trip.lastLocationLat}, ${trip.lastLocationLng}.`
        : "الزائر ما شارك حتى موقع محفوظ.";
      await notifyOwner({
        title: "تنبيه سلامة: رحلة بلا تأكيد لمدة 24 ساعة",
        content: `الاسم: ${trip.travelerName}\nالإيميل: ${trip.travelerEmail}\nالمسار: ${trip.route}\nوقت الوصول المتوقع: ${new Date(trip.expectedArrivalAt).toLocaleString("ar-MA")}\n${location}\nخاص شخص مسؤول يتواصل مع جهة اتصال الطوارئ أو خدمات الطوارئ المحلية حسب الحالة. المنصة ما كتبلغش الشرطة أوتوماتيكياً.`,
      });
    }

    return res.json({ ok: true, escalated });
  } catch (error) {
    console.error("[SafetyTrips] escalation failed", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
