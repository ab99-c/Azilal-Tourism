import { Coffee, Mountain } from "lucide-react";

type Lang = "ar" | "en" | "fr" | "ber";
type Kind = "cafes" | "hotels";

const labels = {
  cafes: {
    ar: "كنوجدو القهوة ليك...",
    en: "Preparing your coffee stop...",
    fr: "Préparation de votre pause café…",
    ber: "ⵏⵙⵙⴰⵡⴰⵍ ⵉ ⵇⴰⵀⵡⴰ ⵏⵏⴽ...",
  },
  hotels: {
    ar: "كنوجدو إقامتك فالأطلس...",
    en: "Preparing your Atlas stay...",
    fr: "Préparation de votre séjour dans l’Atlas…",
    ber: "ⵏⵙⵙⴰⵡⴰⵍ ⵉ ⵎⴰⵏⵣⴰ ⵏⵏⴽ ⴷ ⴰⵟⵍⴰⵙ...",
  },
} as const;

export default function TourismLoadingSkeleton({ kind, lang, count = 4 }: { kind: Kind; lang: Lang; count?: number }) {
  const Icon = kind === "cafes" ? Coffee : Mountain;
  return (
    <div role="status" aria-live="polite" aria-label={labels[kind][lang]} className="space-y-5">
      <div className="flex items-center justify-center gap-3 text-[#1b5e3f]">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#c8a951]/15">
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full border border-[#c8a951]/40 motion-safe:animate-ping motion-reduce:animate-none" />
        </span>
        <span className="text-sm font-bold">{labels[kind][lang]}</span>
      </div>
      <div className={`grid gap-6 ${kind === "cafes" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-4"}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-[#1b5e3f]/10 bg-white shadow-sm">
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#e7efe9] via-[#f4f0dc] to-[#d8e7df] motion-safe:animate-pulse motion-reduce:animate-none">
              <div className="absolute inset-x-8 top-8 h-16 rounded-full bg-white/45" />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1b5e3f]/10" />
            </div>
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 rounded-full bg-[#1b5e3f]/12 motion-safe:animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-1/2 rounded-full bg-[#c8a951]/20 motion-safe:animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-full rounded-full bg-slate-200 motion-safe:animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-5/6 rounded-full bg-slate-200 motion-safe:animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
