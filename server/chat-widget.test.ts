import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("chat widget interaction contract", () => {
  it("keeps the launcher above page layers and exposes its open state", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ChatWidget.tsx"),
      "utf8",
    );

    expect(source).toContain('type="button"');
    expect(source).toContain("z-[100]");
    expect(source).toContain('aria-expanded={open}');
    expect(source).toContain('aria-controls="adrar-chat-panel"');
    expect(source).toContain("setOpen((current) => !current)");
  });
});

