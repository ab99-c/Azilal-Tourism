import { useState } from "react";
import { Loader2, Mail, Check, MessageCircle, Send, ChevronDown } from "lucide-react";

type Lang = "ar" | "en" | "fr" | "ber";
type ContactStatus = "new" | "replied";

type ContactMessage = {
  id: number;
  userId: number | null;
  senderName: string | null;
  senderEmail: string | null;
  message: string;
  status: ContactStatus;
  reply: string | null;
  repliedAt: Date | string | null;
  createdAt: Date | string;
};

interface ContactMessagesPanelProps {
  messages: ContactMessage[];
  isLoading: boolean;
  isUpdating: boolean;
  lang: Lang;
  onStatusChange: (id: number, status: ContactStatus) => Promise<void>;
  onReply: (id: number, reply: string) => Promise<void>;
}

const copy = {
  ar: { title: "رسائل التواصل الواردة", empty: "لا توجد رسائل واردة بعد.", loading: "جارٍ تحميل الرسائل...", anonymous: "زائر بدون اسم", noEmail: "لا يوجد بريد إلكتروني", new: "جديدة", replied: "تم الرد", reply: "الرد على الرسالة", placeholder: "اكتب الرد هنا...", send: "حفظ الرد", noReply: "لا يمكن إرسال رد: لا يوجد بريد إلكتروني.", saved: "تم حفظ الرد في النظام." },
  en: { title: "Incoming contact messages", empty: "No contact messages yet.", loading: "Loading messages...", anonymous: "Anonymous visitor", noEmail: "No email provided", new: "New", replied: "Replied", reply: "Reply to this message", placeholder: "Write your reply...", send: "Save reply", noReply: "Cannot send a reply: no email provided.", saved: "Reply saved in the system." },
  fr: { title: "Messages de contact reçus", empty: "Aucun message pour le moment.", loading: "Chargement des messages...", anonymous: "Visiteur anonyme", noEmail: "Aucun e-mail fourni", new: "Nouveau", replied: "Répondu", reply: "Répondre à ce message", placeholder: "Écrivez votre réponse...", send: "Enregistrer la réponse", noReply: "Réponse impossible : aucun e-mail fourni.", saved: "Réponse enregistrée dans le système." },
  ber: { title: "ⵜⵉⵏⴰⵡⵉⵏ ⵏ ⵓⵎⵢⴰⵡⴰⴹ", empty: "ⵓⵍⴰ ⵢⴰⵜ ⵜⴰⵏⴰⵡⵜ.", loading: "ⴰⵔ ⵜⵜⵡⴰⵙⵙⵏ...", anonymous: "ⴰⵎⵙⵙⴰⵡⴰⴹ ⵓⵔ ⵉⵙⵎ", noEmail: "ⵓⵔ ⵉⵍⵍⵉ ⵉⵎⴰⵢⵍ", new: "ⵜⴰⵎⵣⵡⴰⵔⵓⵜ", replied: "ⵜⵜⵡⴰⵔⴰⵔ", reply: "ⵔⴰⵔ ⵉ ⵜⵏⴰⵡⵜ", placeholder: "ⴰⵔⵓ ⵜⴰⵔⴰⵔⴰ...", send: "ⵃⴱⵙ ⵜⴰⵔⴰⵔⴰ", noReply: "ⵓⵔ ⵜⵣⵎⵔⴷ ⴰⴷ ⵜⵣⵏⴷ ⵜⴰⵔⴰⵔⴰ: ⵓⵔ ⵉⵍⵍⵉ ⵉⵎⴰⵢⵍ.", saved: "ⵜⵜⵡⴰⵃⴱⵙ ⵜⴰⵔⴰⵔⴰ." },
} as const;

export default function ContactMessagesPanel({ messages, isLoading, isUpdating, lang, onStatusChange, onReply }: ContactMessagesPanelProps) {
  const labels = copy[lang];
  const [openId, setOpenId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const dir = lang === "ar" ? "rtl" : "ltr";

  async function submitReply(message: ContactMessage) {
    const reply = drafts[message.id]?.trim() || "";
    if (!reply || !message.senderEmail) return;
    await onReply(message.id, reply);
    setDrafts((current) => ({ ...current, [message.id]: "" }));
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/10 p-5 text-white shadow-xl" dir={dir}>
      <div className="mb-5 flex items-center gap-3"><MessageCircle className="h-5 w-5 text-[#c8a951]" /><h2 className="text-xl font-bold">{labels.title}</h2></div>
      {isLoading ? <div className="flex items-center justify-center gap-2 py-12 text-white/70"><Loader2 className="h-5 w-5 animate-spin" />{labels.loading}</div> : messages.length === 0 ? <p className="py-12 text-center text-white/60">{labels.empty}</p> : (
        <div className="space-y-3">
          {messages.map((message) => {
            const date = new Date(message.createdAt);
            const isOpen = openId === message.id;
            const canReply = Boolean(message.senderEmail);
            return (
              <article key={message.id} className={`rounded-xl border p-4 ${message.status === "new" ? "border-[#c8a951]/70 bg-[#0f3d28]" : "border-white/10 bg-[#0f3d28]/70"}`}>
                <button type="button" className="w-full text-start" onClick={() => setOpenId(isOpen ? null : message.id)} aria-expanded={isOpen}>
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{message.senderName || labels.anonymous}</p><p className="flex items-center gap-1 text-xs text-white/60"><Mail className="h-3 w-3" />{message.senderEmail || labels.noEmail}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-[#c8a951]/20 px-2.5 py-1 text-xs text-[#f0d77c]">{message.status === "new" ? labels.new : labels.replied}<ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} /></span></div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/90">{message.message}</p>
                </button>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3"><time className="text-xs text-white/50" dateTime={date.toISOString()}>{date.toLocaleString()}</time>{message.status === "new" && <button type="button" disabled={isUpdating} onClick={() => void onStatusChange(message.id, "replied")} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20 disabled:opacity-50"><Check className="me-1 inline h-3 w-3" />{labels.replied}</button>}</div>
                {isOpen && <div className="mt-4 border-t border-white/10 pt-4"><h3 className="mb-2 text-sm font-semibold">{labels.reply}</h3>{!canReply && <p className="mb-2 text-xs text-amber-200">{labels.noReply}</p>}{message.reply && <p className="mb-3 rounded-lg bg-white/10 p-3 text-sm text-white/80">{message.reply}</p>}<textarea value={drafts[message.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [message.id]: event.target.value }))} disabled={!canReply || isUpdating} placeholder={labels.placeholder} rows={3} className="w-full rounded-lg border border-white/15 bg-black/20 p-3 text-sm text-white placeholder:text-white/40 focus:border-[#c8a951] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" /><button type="button" disabled={!canReply || !drafts[message.id]?.trim() || isUpdating} onClick={() => void submitReply(message)} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#c8a951] px-4 py-2 text-sm font-bold text-[#1b5e3f] disabled:cursor-not-allowed disabled:opacity-50">{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{labels.send}</button></div>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
