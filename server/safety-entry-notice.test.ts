import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("safety entry notice", () => {
  const source = fs.readFileSync("client/src/components/SafetyTripSection.tsx", "utf8");

  it("opens automatically as a standalone modal", () => {
    expect(source).toContain("const [showEntryNotice, setShowEntryNotice] = useState(true)");
    expect(source).toContain('role="dialog" aria-modal="true"');
    expect(source).toContain("fixed inset-0 z-[100]");
  });

  it("provides localized title and continue copy", () => {
    expect(source).toContain("noticeTitle: 'قبل ما تدخل للمسارات الجبلية'");
    expect(source).toContain("noticeTitle: 'Before entering mountain routes'");
    expect(source).toContain("noticeTitle: 'Avant d’entrer sur les routes de montagne'");
    expect(source).toContain("noticeTitle: 'ⵣⵔⵉ ⵙ ⵓⵎⵏⵣⵓ ⵏ ⵉⵙⵏⵉⵔⴰⵏ'");
    expect(source).toContain("onClick={() => setShowEntryNotice(false)}");
  });

  it("keeps the safety-trip form below the notice", () => {
    expect(source).toContain('<section id="safety-trip"');
    expect(source).toContain("{!trip ? <form");
  });
});
