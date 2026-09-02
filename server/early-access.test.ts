import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(
  fileURLToPath(new URL("../client/src/App.tsx", import.meta.url)),
  "utf8"
);
const sectionSource = readFileSync(
  fileURLToPath(
    new URL("../client/src/components/EarlyAccessSection.tsx", import.meta.url)
  ),
  "utf8"
);
const authSource = readFileSync(
  fileURLToPath(
    new URL("../client/src/components/LocalAuthDialog.tsx", import.meta.url)
  ),
  "utf8"
);

describe("early access conversion path", () => {
  it("shows a dedicated early-access section before unified discovery", () => {
    expect(appSource.indexOf("<EarlyAccessSection />")).toBeLessThan(
      appSource.indexOf("<UnifiedDiscoverySearch />")
    );
    expect(sectionSource).toContain('id="early-access"');
  });

  it("offers distinct visitor and owner paths with lightweight intent tracking", () => {
    expect(sectionSource).toContain("trackEarlyAccess('visitor-search')");
    expect(sectionSource).toContain("trackEarlyAccess('owner-onboarding')");
    expect(sectionSource).toContain(
      "window.sessionStorage.setItem('adrar:early-access-intent', intent)"
    );
    expect(sectionSource).toContain(
      'data-umami-event="early-access-visitor-cta"'
    );
    expect(sectionSource).toContain(
      'data-umami-event="early-access-owner-cta"'
    );
  });

  it("opens registration when a local owner arrives through the early-access CTA", () => {
    expect(sectionSource).toContain(
      "/?auth=register&utm_source=early-access&utm_medium=owner-cta"
    );
    expect(authSource).toContain('params.get("auth") === "register"');
    expect(authSource).toContain('? "register"');
  });
});
