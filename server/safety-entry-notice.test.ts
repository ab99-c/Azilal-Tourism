import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("safety activities flow", () => {
  const safetySource = fs.readFileSync("client/src/components/SafetyTripSection.tsx", "utf8");
  const categoriesSource = fs.readFileSync("client/src/components/CategoriesSection.tsx", "utf8");
  const appSource = fs.readFileSync("client/src/App.tsx", "utf8");

  it("renders Safety Trip inside the activities section", () => {
    expect(categoriesSource).toContain('id="activities"');
    expect(categoriesSource).toContain("import SafetyTripSection from './SafetyTripSection'");
    expect(categoriesSource).toContain("<SafetyTripSection />");
    expect(appSource).not.toContain("<SafetyTripSection />");
  });

  it("keeps the safety card inline with one acknowledgement button", () => {
    expect(safetySource).toContain("const [showTripForm, setShowTripForm] = useState(false)");
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
});
