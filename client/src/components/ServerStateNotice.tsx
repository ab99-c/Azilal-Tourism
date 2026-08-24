import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lang = "ar" | "en" | "fr" | "ber";

const copy = {
  ar: { loading: "كنحمّلو المعطيات...", slow: "الخادم كيتأخر شوية، حاول من جديد.", error: "وقع مشكل مؤقت فالاتصال بالخادم.", retry: "عاود المحاولة" },
  en: { loading: "Loading data...", slow: "The server is taking longer than usual.", error: "A temporary server connection problem occurred.", retry: "Try again" },
  fr: { loading: "Chargement des données…", slow: "Le serveur met plus de temps que d’habitude.", error: "Un problème temporaire de connexion au serveur est survenu.", retry: "Réessayer" },
  ber: { loading: "ⵉⵜⵜⵔⵣⵣⵉ ⵓⵙⵏⵓⴱⴳ...", slow: "ⵉⵙⵙⵉⵡⵍ ⵓⵙⵔⵙ ⵙ ⵓⵙⵙⴰⵏ.", error: "ⵜⵍⵍⴰ ⵜⵙⵏⴰ ⵏ ⵓⵙⵔⵙ.", retry: "ⴰⵍⵙ ⵜⵔⵉⵔⵉ" },
} as const;

export function ServerLoading({ lang }: { lang: Lang }) {
  return <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-6 text-[#1b5e3f] text-sm font-semibold"><Loader2 className="h-4 w-4 animate-spin" />{copy[lang].loading}</div>;
}

export function ServerError({ lang, onRetry }: { lang: Lang; onRetry: () => void }) {
  const text = copy[lang];
  return <div role="alert" className="mx-auto my-5 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-amber-950"><AlertCircle className="mx-auto mb-2 h-5 w-5 text-amber-700" /><p className="font-semibold">{text.error}</p><p className="mt-1 text-sm text-amber-800">{text.slow}</p><Button type="button" onClick={onRetry} className="mt-4 gap-2 bg-[#1b5e3f] text-white hover:bg-[#154a32]"><RefreshCw className="h-4 w-4" />{text.retry}</Button></div>;
}
