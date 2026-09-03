import { Loader2, Mail, Check, MessageCircle } from "lucide-react";

type Lang = "ar" | "en" | "fr" | "ber";
type ContactStatus = "unread" | "read" | "replied";

type ContactMessage = {
  id: number;
  userId: number | null;
  senderName: string | null;
  senderEmail: string | null;
  message: string;
  status: ContactStatus;
  createdAt: Date | string;
};

interface ContactMessagesPanelProps {
  messages: ContactMessage[];
  isLoading: boolean;
  isUpdating: boolean;
  lang: Lang;
  onStatusChange: (id: number, status: ContactStatus) => Promise<void>;
}

const copy = {
  ar: {
    title: "رسائل التواصل الواردة",
    empty: "لا توجد رسائل واردة بعد.",
    loading: "جارٍ تحميل الرسائل...",
    anonymous: "زائر بدون اسم",
    noEmail: "لا يوجد بريد إلكتروني",
    unread: "غير مقروءة",
    read: "مقروءة",
    replied: "تمت المتابعة",
    markRead: "تعليم كمقروءة",
    markReplied: "تعليم تمت المتابعة",
  },
  en: {
    title: "Incoming contact messages",
    empty: "No contact messages yet.",
    loading: "Loading messages...",
    anonymous: "Anonymous visitor",
    noEmail: "No email provided",
    unread: "Unread",
    read: "Read",
    replied: "Followed up",
    markRead: "Mark as read",
    markReplied: "Mark as followed up",
  },
  fr: {
    title: "Messages de contact reçus",
    empty: "Aucun message pour le moment.",
    loading: "Chargement des messages...",
    anonymous: "Visiteur anonyme",
    noEmail: "Aucun e-mail fourni",
    unread: "Non lu",
    read: "Lu",
    replied: "Suivi effectué",
    markRead: "Marquer comme lu",
    markReplied: "Marquer comme suivi",
  },
  ber: {
    title: "ⵜⵉⵏⴰⵡⵉⵏ ⵏ ⵓⵎⵢⴰⵡⴰⴹ",
    empty: "ⵓⵍⴰ ⵢⴰⵜ ⵜⴰⵏⴰⵡⵜ ⵙ ⵙⵙⵉⵏⴰ.",
    loading: "ⴰⵔ ⵜⵜⵡⴰⵙⵙⵏ ⵜⵉⵏⴰⵡⵉⵏ...",
    anonymous: "ⴰⵎⵙⵙⴰⵡⴰⴹ ⵓⵔ ⵉⵙⵎ",
    noEmail: "ⵓⵔ ⵉⵍⵍⵉ ⵉⵎⴰⵢⵍ",
    unread: "ⵓⵔ ⵜⵜⵡⴰⵖⵔⴰ",
    read: "ⵜⵜⵡⴰⵖⵔⴰ",
    replied: "ⵜⵜⵡⴰⵙⵙⵏ",
    markRead: "ⵙⵙⵏ ⵜⵜⵡⴰⵖⵔⴰ",
    markReplied: "ⵙⵙⵏ ⵜⵜⵡⴰⵙⵙⵏ",
  },
} as const;

export default function ContactMessagesPanel({ messages, isLoading, isUpdating, lang, onStatusChange }: ContactMessagesPanelProps) {
  const labels = copy[lang];

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/10 p-5 text-white shadow-xl" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mb-5 flex items-center gap-3">
        <MessageCircle className="h-5 w-5 text-[#c8a951]" />
        <h2 className="text-xl font-bold">{labels.title}</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-white/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          {labels.loading}
        </div>
      ) : messages.length === 0 ? (
        <p className="py-12 text-center text-white/60">{labels.empty}</p>
      ) : (
        <div className="space-y-3">
          {messages.map(message => {
            const date = new Date(message.createdAt);
            const statusLabel = labels[message.status];
            return (
              <article key={message.id} className="rounded-xl border border-white/10 bg-[#0f3d28]/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{message.senderName || labels.anonymous}</p>
                    <p className="flex items-center gap-1 text-xs text-white/60">
                      <Mail className="h-3 w-3" />
                      {message.senderEmail || labels.noEmail}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#c8a951]/20 px-2.5 py-1 text-xs text-[#f0d77c]">{statusLabel}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/90">{message.message}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                  <time className="text-xs text-white/50" dateTime={date.toISOString()}>{date.toLocaleString()}</time>
                  <div className="flex gap-2">
                    {message.status === "unread" && (
                      <button type="button" disabled={isUpdating} onClick={() => void onStatusChange(message.id, "read")} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20 disabled:opacity-50">
                        <Check className="me-1 inline h-3 w-3" />{labels.markRead}
                      </button>
                    )}
                    {message.status !== "replied" && (
                      <button type="button" disabled={isUpdating} onClick={() => void onStatusChange(message.id, "replied")} className="rounded-lg bg-[#c8a951] px-3 py-1.5 text-xs font-bold text-[#1b5e3f] hover:bg-[#d4b75e] disabled:opacity-50">
                        {labels.markReplied}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
