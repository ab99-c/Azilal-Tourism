import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("safety activities flow", () => {
  const safetySource = fs.readFileSync("client/src/components/SafetyTripSection.tsx", "utf8");
  const categoriesSource = fs.readFileSync("client/src/components/CategoriesSection.tsx", "utf8");
  const appSource = fs.readFileSync("client/src/App.tsx", "utf8");
  const pageSource = fs.readFileSync("client/src/pages/SafetyTripPage.tsx", "utf8");

  it("navigates to a dedicated Safety Trip page from the three relevant activities", () => {
    expect(categoriesSource).toContain('id="activities"');
    expect(categoriesSource).toContain("onClick={() => openActivity(cat)}");
    expect(categoriesSource).toContain("window.location.assign(`/safety-trip?activity=");
    expect(categoriesSource).toContain("title: 'cat.nature'");
    expect(categoriesSource).toContain("title: 'cat.adventure'");
    expect(categoriesSource).toContain("title: 'cat.culture'");
    expect(categoriesSource).toContain("title: 'cat.sports'");
    expect(categoriesSource).toContain("safety: false");
    expect(categoriesSource.match(/safety: true/g)?.length).toBe(3);
    expect(appSource).toContain("const isSafetyTripPage = currentPath === '/safety-trip'");
    expect(appSource).toContain("<SafetyTripPage />");
    expect(appSource).not.toContain("<SafetyTripSection />");
  });

  it("provides a home link and keeps the Safety Trip form on the dedicated page", () => {
    expect(pageSource).toContain("import SafetyTripSection from '@/components/SafetyTripSection'");
    expect(pageSource).toContain('href="/"');
    expect(pageSource).toContain("<SafetyTripSection />");
    expect(pageSource).toContain("new URLSearchParams(window.location.search)");
  });

  it("keeps the safety card inline with one acknowledgement button", () => {
    expect(safetySource).toContain("const [showTripForm, setShowTripForm] = useState(Boolean(initialEmergency))");
    expect(safetySource).toContain("onClick={() => setShowTripForm(true)}");
    expect(safetySource).toContain("noticeContinue: 'فهمت، نكمل التسجيل'");
    expect(safetySource).not.toContain('role="dialog" aria-modal="true"');
    expect(safetySource).not.toContain("fixed inset-0 z-[100]");
  });

  it("requires an emergency phone and explains consent-based monitoring", () => {
    expect(safetySource).toContain("emergencyPhone: 'رقم شخص للطوارئ'");
    expect(safetySource).toContain("!form.emergencyPhone");
    expect(safetySource).toContain("tracking: 'إلى سجلتي الرحلة ووافقتي");
    expect(safetySource).toContain("emergencyPhone: form.emergencyPhone");
  });

  it("does not render the removed Vercel warning box", () => {
    expect(safetySource).not.toContain("isStaticHost");
    expect(safetySource).not.toContain("نسخة Vercel مربوطة");
    expect(safetySource).not.toContain("Vercel version is connected");
    expect(safetySource).not.toContain("La version Vercel est connectée");
  });
});
