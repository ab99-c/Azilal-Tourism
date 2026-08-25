import { describe, expect, it } from "vitest";
import fs from "node:fs";

const safety = fs.readFileSync("client/src/components/SafetyTripSection.tsx", "utf8");
const serviceWorker = fs.readFileSync("client/public/sw.js", "utf8");

describe("Safety Trip offline emergency storage", () => {
  it("requires device consent before caching emergency data locally", () => {
    expect(safety).toContain("adrar-safety-emergency-data-v1");
    expect(safety).toContain("deviceConsent");
    expect(safety).toContain("if (!nextForm.deviceConsent) return");
    expect(safety).toContain("localStorage.setItem(LOCAL_EMERGENCY_KEY");
    expect(safety).toContain("localStorage.removeItem(LOCAL_EMERGENCY_KEY)");
    expect(safety).toContain("localConsentNeeded");
  });

  it("restores and exposes a local emergency record with a removal control", () => {
    expect(safety).toContain("function readLocalEmergency");
    expect(safety).toContain("localEmergency");
    expect(safety).toContain("localTitle");
    expect(safety).toContain("localDelete");
    expect(safety).toContain("offlineSaved");
  });

  it("minimizes the local record and discloses browser-storage risk", () => {
    expect(safety).toContain("type EmergencySnapshot = Pick<FormState, 'name' | 'route'");
    expect(safety).toContain("localPrivacyNotice");
    expect(safety).toContain("not encrypted");
  });

  it("caches the Safety Trip route and app assets for offline access", () => {
    expect(serviceWorker).toContain('"/safety-trip"');
    expect(serviceWorker).toContain("adrar-shell-v4");
    expect(serviceWorker).toContain('"script", "style", "font", "image"');
    expect(serviceWorker).toContain('caches.match("/safety-trip")');
  });
});
