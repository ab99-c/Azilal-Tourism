import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Message {
  id: number;
  text: string;
  from: "user" | "bot";
}

export default function ChatWidget() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: t("chat.welcome"), from: "bot" },
  ]);
  const [input, setInput] = useState("");

  const sendContactMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: t("chat.received"), from: "bot" },
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: t("chat.error"), from: "bot" },
      ]);
    },
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendContactMutation.isPending) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), text, from: "user" },
    ]);
    setInput("");
    sendContactMutation.mutate({ message: text });
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1b5e3f] text-white shadow-2xl shadow-[#1b5e3f]/30 flex items-center justify-center hover:bg-[#0f3d28] transition-all hover:scale-110"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        aria-label={t("chat.title")}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden"
            dir="rtl"
          >
            <div className="bg-gradient-to-r from-[#0f3d28] to-[#1b5e3f] px-5 py-4">
              <h3 className="text-white font-bold text-lg">{t("chat.title")}</h3>
              <p className="text-white/70 text-sm mt-1">{t("chat.subtitle")}</p>
            </div>

            <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-gray-50" aria-live="polite">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-[#1b5e3f] text-white rounded-br-sm"
                        : "bg-white text-gray-700 shadow-sm rounded-bl-sm border border-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {sendContactMutation.isPending && (
                <div className="flex justify-end" aria-live="polite">
                  <div className="bg-white text-gray-500 shadow-sm rounded-2xl rounded-bl-sm border border-gray-100 px-4 py-2.5 text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    {t("chat.sending")}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#1b5e3f] focus:ring-1 focus:ring-[#1b5e3f]/20"
                  dir="rtl"
                  maxLength={5000}
                  disabled={sendContactMutation.isPending}
                  aria-label={t("chat.placeholder")}
                />
                <button
                  onClick={handleSend}
                  disabled={sendContactMutation.isPending || !input.trim()}
                  aria-busy={sendContactMutation.isPending}
                  aria-label={t("chat.send")}
                  className="w-10 h-10 rounded-xl bg-[#1b5e3f] text-white flex items-center justify-center hover:bg-[#0f3d28] transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendContactMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="text-center mt-2 text-[11px] text-gray-500">{t("chat.whatsappUnavailable")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
