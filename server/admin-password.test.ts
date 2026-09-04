import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("admin local password setup contract", () => {
  it("protects password setup with adminProcedure and hashes the password", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("setLocalPassword: adminProcedure");
    expect(router).toContain("hashPassword(input.password)");
    expect(router).toContain("await setLocalPassword(user.id");
  });

  it("shows a confirmation-based password setup form inside the admin panel", () => {
    const page = read("client/src/pages/AdminPage.tsx");
    const component = read("client/src/components/AdminPasswordSetup.tsx");
    expect(page).toContain("AdminPasswordSetup");
    expect(page).toContain("openLocalAuth(\"activate\")");
    expect(page).toContain("تفعيل الإدارة في Vercel");
    expect(page).toContain("الدخول بالبريد");
    expect(component).toContain("trpc.auth.setLocalPassword.useMutation");
    expect(component).toContain("كلمة مرور جديدة");
    expect(component).toContain("تأكيد كلمة المرور");
    expect(component).toContain("password !== confirm");
  });
});
