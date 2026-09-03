import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface Message { id: number; text: string; from: "user" | "bot"; }

export default function ChatWidget() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: t("chat.welcome"), from: "bot" }]);
  const [input, setInput] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.email && !email) setEmail(user.email);
  }, [user?.name, user?.email, name, email]);

  const sendContactMutation = trpc.contact.send.useMutation({
    onSuccess: () => setMessages((prev) => [...prev, { id: Date.now() + 1, text: t("chat.received"), from: "bot" }]),
    onError: () => setMessages((prev) => [...prev, { id: Date.now() + 1, text: t("chat.error"), from: "bot" }]),
  });

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const handleSend = () => {
    const text = input.trim();
    if (!text || !emailIsValid || sendContactMutation.isPending) return;
    setMessages((prev) => [...prev, { id: Date.now(), text, from: "user" }]);
    setInput("");
    sendContactMutation.mutate({ name: name.trim() || undefined, email: email.trim(), message: text });
  };

  return <>
    <motion.button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1b5e3f] text-white shadow-2xl shadow-[#1b5e3f]/30 transition-all hover:scale-110 hover:bg-[#0f3d28]" whileTap={{ scale: 0.95 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2 }} aria-label={t("chat.title")}>{open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}</motion.button>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl bg-white shadow-2xl" dir="rtl">
      <div className="bg-gradient-to-r from-[#0f3d28] to-[#1b5e3f] px-5 py-4"><h3 className="text-lg font-bold text-white">{t("chat.title")}</h3><p className="mt-1 text-sm text-white/70">{t("chat.subtitle")}</p></div>
      <div className="h-[300px] space-y-3 overflow-y-auto bg-gray-50 p-4" aria-live="polite">{messages.map((msg) => <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.from === "user" ? "justify-start" : "justify-end"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.from === "user" ? "rounded-br-sm bg-[#1b5e3f] text-white" : "rounded-bl-sm border border-gray-100 bg-white text-gray-700 shadow-sm"}`}>{msg.text}</div></motion.div>)}{sendContactMutation.isPending && <div className="flex justify-end"><div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-2.5 text-xs text-gray-500 shadow-sm"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />{t("chat.sending")}</div></div>}</div>
      <div className="border-t border-gray-100 bg-white p-3"><div className="mb-2 grid grid-cols-2 gap-2"><input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("chat.name")} maxLength={120} disabled={sendContactMutation.isPending} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-[#1b5e3f] focus:outline-none" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("chat.email")} maxLength={320} required disabled={sendContactMutation.isPending} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-[#1b5e3f] focus:outline-none" aria-invalid={Boolean(email) && !emailIsValid} /></div>{Boolean(email) && !emailIsValid && <p className="mb-2 text-center text-[11px] text-red-600">{t("chat.emailRequired")}</p>}<div className="flex gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }} placeholder={t("chat.placeholder")} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#1b5e3f] focus:outline-none focus:ring-1 focus:ring-[#1b5e3f]/20" dir="rtl" maxLength={5000} disabled={sendContactMutation.isPending} aria-label={t("chat.placeholder")} /><button onClick={handleSend} disabled={sendContactMutation.isPending || !input.trim() || !emailIsValid} aria-busy={sendContactMutation.isPending} aria-label={t("chat.send")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b5e3f] text-white transition-colors hover:bg-[#0f3d28] disabled:cursor-not-allowed disabled:opacity-50">{sendContactMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}</button></div><p className="mt-2 text-center text-[11px] text-gray-500">{t("chat.whatsappUnavailable")}</p></div>
    </motion.div>}</AnimatePresence>
  </>;
}
