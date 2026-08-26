import { describe, expect, it } from "vitest";
import fs from "node:fs";

const source = fs.readFileSync("client/src/components/ConnectionStatusIndicator.tsx", "utf8");
const app = fs.readFileSync("client/src/App.tsx", "utf8");

describe("connection status indicator", () => {
  it("supports online, weak, and offline states in all supported languages", () => {
    expect(source).toContain('type ConnectionState = "online" | "weak" | "offline"');
    expect(source).toContain('ar: { label: "الاتصال جيد"');
    expect(source).toContain('en: { label: "Good connection"');
    expect(source).toContain('fr: { label: "Bonne connexion"');
    expect(source).toContain('ber: { label: "ⵜⵉⵏⵎⵍ ⵏ ⵡⴰⵔⴰⵎ"');
    expect(source).toContain("navigator.onLine");
    expect(source).toContain("effectiveType");
    expect(source).toContain('window.addEventListener("offline"');
    expect(source).toContain('window.addEventListener("online"');
  });

  it("is accessible, responsive, and mounted only in the mountain Safety Trip flow", () => {
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("max-w-[calc(100vw-1.5rem)]");
    expect(source).toContain("motion-reduce:animate-none");
    expect(source).toContain("hideWhenOnline = false");
    expect(source).toContain('if (hideWhenOnline && state === "online") return null;');
    expect(app).toContain("{isSafetyTripPage && <ConnectionStatusIndicator hideWhenOnline />}");
    expect(app).not.toContain("<ConnectionStatusIndicator />");
  });
});
