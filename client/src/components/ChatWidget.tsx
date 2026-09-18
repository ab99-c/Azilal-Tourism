import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, X, Send, Loader2, Headphones } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type ChatRole = "user" | "assistant";
interface Message { id: number; text: string; role: ChatRole; }

export default function ChatWidget() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: t("chat.welcome"), role: "assistant" }]);
  const [input, setInput] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.email && !email) setEmail(user.email);
  }, [user?.name, user?.email, name, email]);

  const askMutation = trpc.contact.ask.useMutation({
    onSuccess: (result) => setMessages((prev) => [...prev, { id: Date.now() + 1, text: result.reply, role: "assistant" }]),
    onError: (error) => setMessages((prev) => [...prev, { id: Date.now() + 1, text: error.data?.code === "TOO_MANY_REQUESTS" ? t("chat.rateLimited") : t("chat.error"), role: "assistant" }]),
  });

  const history = messages.slice(-12).map((message) => ({ role: message.role, content: message.text }));
  const pending = askMutation.isPending;
  const handleAsk = (requestAdmin = false) => {
    const text = input.trim();
    if (!requestAdmin && !text) return;
    const adminText = t("chat.adminRequest");
    const messageText = requestAdmin ? adminText : text;
    setMessages((prev) => [...prev, { id: Date.now(), text: messageText, role: "user" }]);
    setInput("");
    askMutation.mutate({
      message: messageText,
      language: lang,
      history,
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      requestAdmin,
    });
  };

  return <>
    <motion.button type="button" onClick={() => setOpen((current) => !current)} className="pointer-events-auto fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#1b5e3f] text-white shadow-2xl shadow-[#1b5e3f]/30 transition-all hover:scale-110 hover:bg-[#0f3d28] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1b5e3f]" whileTap={{ scale: 0.95 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2 }} aria-expanded={open} aria-controls="adrar-chat-panel" aria-label={t("chat.title")}>{open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}</motion.button>
    <AnimatePresence>{open && <motion.div id="adrar-chat-panel" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="pointer-events-auto fixed bottom-24 right-6 z-[100] w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl bg-white shadow-2xl" dir="rtl">
      <div className="bg-gradient-to-r from-[#0f3d28] to-[#1b5e3f] px-5 py-4"><h3 className="text-lg font-bold text-white">{t("chat.title")}</h3><p className="mt-1 text-sm text-white/70">{t("chat.subtitle")}</p></div>
      <div className="h-[300px] space-y-3 overflow-y-auto bg-gray-50 p-4" aria-live="polite">
        {messages.map((msg) => <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}><div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "rounded-br-sm bg-[#1b5e3f] text-white" : "rounded-bl-sm border border-gray-100 bg-white text-gray-700 shadow-sm"}`}>{msg.text}</div></motion.div>)}
        {pending && <div className="flex justify-end"><div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-2.5 text-xs text-gray-500 shadow-sm"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />{t("chat.thinking")}</div></div>}
      </div>
      <div className="border-t border-gray-100 bg-white p-3">
        <div className="mb-2 grid grid-cols-2 gap-2"><input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("chat.name")} maxLength={120} disabled={pending} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-[#1b5e3f] focus:outline-none" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("chat.email")} maxLength={320} disabled={pending} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-[#1b5e3f] focus:outline-none" /></div>
        <div className="mb-2 flex gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }} placeholder={t("chat.placeholder")} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#1b5e3f] focus:outline-none focus:ring-1 focus:ring-[#1b5e3f]/20" dir="rtl" maxLength={5000} disabled={pending} aria-label={t("chat.placeholder")} /><button type="button" onClick={() => handleAsk()} disabled={pending || !input.trim()} aria-busy={pending} aria-label={t("chat.send")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b5e3f] text-white transition-colors hover:bg-[#0f3d28] disabled:cursor-not-allowed disabled:opacity-50">{pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}</button></div>
        <button type="button" onClick={() => handleAsk(true)} disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1b5e3f]/20 bg-[#1b5e3f]/5 px-3 py-2 text-xs font-bold text-[#1b5e3f] transition-colors hover:bg-[#1b5e3f]/10 disabled:opacity-50"><Headphones className="h-3.5 w-3.5" />{t("chat.contactAdmin")}</button>
        <p className="mt-2 text-center text-[11px] text-gray-500">{t("chat.aiNotice")}</p>
      </div>
    </motion.div>}</AnimatePresence>
  </>;
}
