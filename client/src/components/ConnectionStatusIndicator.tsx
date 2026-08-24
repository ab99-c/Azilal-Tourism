import { useEffect, useState } from "react";
import { CheckCircle2, CloudOff, Gauge, Wifi, WifiOff } from "lucide-react";
import { useLanguage, type Lang } from "@/contexts/LanguageContext";

 type ConnectionState = "online" | "weak" | "offline";

type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

const copy: Record<ConnectionState, Record<Lang, { label: string; detail: string }>> = {
  online: {
    ar: { label: "الاتصال مزيان", detail: "الإنترنت خدام بشكل عادي" },
    en: { label: "Good connection", detail: "Your internet connection is working normally" },
    fr: { label: "Bonne connexion", detail: "Votre connexion internet fonctionne normalement" },
    ber: { label: "ⵜⵉⵏⵎⵍ ⵏ ⵡⴰⵔⴰⵎ", detail: "ⵉⵏⵜⵉⵔⵏⵜ ⵜⵅⴷⵎ ⵙ ⵎⵏⵉⵔ" },
  },
  weak: {
    ar: { label: "الاتصال ضعيف", detail: "التحميل قد يتأخر، حاول تبقى قريب من شبكة قوية" },
    en: { label: "Weak connection", detail: "Loading may take longer; try a stronger network" },
    fr: { label: "Connexion faible", detail: "Le chargement peut prendre plus de temps" },
    ber: { label: "ⵜⵉⵏⵎⵍ ⵏ ⵡⴰⵔⴰⵎ ⵜⵣⵔⵉ", detail: "ⴰⵙⵙⵉⵔⵉ ⵉⵣⵎⵔ ⴰⴷ ⵉⵣⵔⵉ" },
  },
  offline: {
    ar: { label: "ما كاينش اتصال", detail: "تحقق من Wi‑Fi أو بيانات الهاتف ثم عاود المحاولة" },
    en: { label: "You are offline", detail: "Check Wi‑Fi or mobile data, then try again" },
    fr: { label: "Vous êtes hors ligne", detail: "Vérifiez le Wi‑Fi ou les données mobiles" },
    ber: { label: "ⵓⵔ ⵜⵍⵍⵉ ⵜⵉⵏⵎⵍ", detail: "ⵙⵙⵏ ⵡⵉ-ⴼⵉ ⵏⵖ ⵉⵙⴼⴽⴰ ⵏ ⵓⵎⵣⵔⵓⵢ" },
  },
};

function getNetworkState(): ConnectionState {
  if (typeof navigator === "undefined" || !navigator.onLine) return "offline";
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  const slowType = connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
  const slowMetrics = (connection?.downlink !== undefined && connection.downlink < 1.5)
    || (connection?.rtt !== undefined && connection.rtt > 600);
  return slowType || slowMetrics ? "weak" : "online";
}

export default function ConnectionStatusIndicator() {
  const { lang, isRTL } = useLanguage();
  const [state, setState] = useState<ConnectionState>(() => getNetworkState());

  useEffect(() => {
    const update = () => setState(getNetworkState());
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    connection?.addEventListener?.("change", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  const Icon = state === "online" ? CheckCircle2 : state === "weak" ? Gauge : WifiOff;
  const palette = state === "online"
    ? "border-[#1b5e3f]/20 bg-[#f0f8f2] text-[#1b5e3f]"
    : state === "weak"
      ? "border-[#c8a951]/40 bg-[#fff8df] text-[#856b18]"
      : "border-[#b84b45]/30 bg-[#fff1ef] text-[#9b302b]";

  return (
    <div
      role="status"
      aria-live="polite"
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed left-3 top-[4.75rem] z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border px-3 py-2 shadow-sm backdrop-blur-sm transition-colors duration-200 sm:left-auto sm:right-4 sm:top-20 ${palette}`}
    >
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70">
        {state === "offline" ? <CloudOff className="h-4 w-4" aria-hidden="true" /> : state === "weak" ? <Wifi className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
        {state !== "offline" && <span className="absolute inset-0 rounded-full motion-safe:animate-ping motion-reduce:animate-none opacity-25" />}
      </span>
      <span className="min-w-0 pr-1">
        <span className="block truncate text-xs font-bold">{copy[state][lang].label}</span>
        <span className="hidden max-w-[15rem] truncate text-[10px] opacity-80 sm:block">{copy[state][lang].detail}</span>
      </span>
    </div>
  );
}
