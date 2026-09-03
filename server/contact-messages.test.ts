import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const read = (relativePath: string) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("real contact message flow contract", () => {
  it("persists messages through the contact tRPC procedure", () => {
    const router = read("server/routers.ts");
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");

    expect(schema).toContain('mysqlTable("contact_messages"');
    expect(router).toContain("contact: router({");
    expect(router).toContain("send: publicProcedure");
    expect(router).toContain("createContactMessage");
    expect(db).toContain("db.insert(contactMessages).values(input)");
  });

  it("does not use the old fake reply or placeholder WhatsApp number", () => {
    const widget = read("client/src/components/ChatWidget.tsx");

    expect(widget).toContain("trpc.contact.send.useMutation");
    expect(widget).toContain("chat.received");
    expect(widget).toContain("chat.sending");
    expect(widget).not.toContain("setTimeout");
    expect(widget).not.toContain("212600000000");
  });

  it("exposes admin-only list, status, and reply procedures", () => {
    const router = read("server/routers.ts");
    const dashboard = read("client/src/components/CarOwnerDashboard.tsx");
    const adminPage = read("client/src/pages/AdminPage.tsx");

    expect(router).toContain("list: adminProcedure");
    expect(router).toContain("adminList: adminProcedure");
    expect(router).toContain("updateStatus: adminProcedure");
    expect(router).toContain("reply: adminProcedure");
    expect(router).toContain("replyContactMessage");
    expect(dashboard).toContain("trpc.contact.adminList.useQuery");
    expect(adminPage).toContain("trpc.contact.adminList.useQuery");
    expect(adminPage).toContain("trpc.contact.reply.useMutation");
    expect(dashboard).toContain("ContactMessagesPanel");
  });

  it("collects a replyable visitor email and sends it with the message", () => {
    const widget = read("client/src/components/ChatWidget.tsx");

    expect(widget).toContain('type="email"');
    expect(widget).toContain("required");
    expect(widget).toContain("email: email.trim()");
    expect(widget).toContain("name: name.trim() || undefined");
  });
});
