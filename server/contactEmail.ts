import { ENV } from "./_core/env";

export type ContactEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendContactEmail(input: ContactEmailInput): Promise<boolean> {
  if (!ENV.resendApiKey || !ENV.contactFromEmail || !input.to) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.contactFromEmail,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[ContactEmail] Resend rejected email (${response.status})${detail ? `: ${detail}` : ""}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[ContactEmail] Resend request failed", error);
    return false;
  }
}

export async function notifyContactAdmin(input: {
  senderName?: string | null;
  senderEmail?: string | null;
  message: string;
}): Promise<boolean> {
  if (!ENV.contactAdminEmail) return false;
  return sendContactEmail({
    to: ENV.contactAdminEmail,
    subject: `رسالة تواصل جديدة من ${input.senderName || "زائر"}`,
    text: [
      "وصلت رسالة جديدة من موقع ADRAR.",
      `الاسم: ${input.senderName || "غير متوفر"}`,
      `البريد: ${input.senderEmail || "غير متوفر"}`,
      "",
      input.message,
    ].join("\n"),
  });
}

export async function sendContactReply(input: {
  to: string;
  senderName?: string | null;
  reply: string;
}): Promise<boolean> {
  return sendContactEmail({
    to: input.to,
    subject: "رد من فريق ADRAR على رسالتك",
    text: [
      `مرحباً ${input.senderName || ""}`.trim(),
      "",
      "هذا رد فريق ADRAR على رسالتك:",
      input.reply,
      "",
      "شكراً لتواصلك معنا.",
    ].join("\n"),
  });
}
