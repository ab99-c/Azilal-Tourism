import { ArrowLeft, ArrowRight, Globe, Home, ShieldCheck } from 'lucide-react';
import SafetyTripSection from '@/components/SafetyTripSection';
import MountainActivitiesOfflineCard from '@/components/MountainActivitiesOfflineCard';
import { useLanguage, type Lang } from '@/contexts/LanguageContext';

const languageNames: Record<Lang, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
  ber: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
};

const pageCopy = {
  ar: { back: 'رجوع للصفحة الرئيسية', heading: 'سلامتك فالمسارات الجبلية', selected: 'النشاط المختار' },
  en: { back: 'Back to homepage', heading: 'Your safety on mountain routes', selected: 'Selected activity' },
  fr: { back: 'Retour à la page d’accueil', heading: 'Votre sécurité sur les routes de montagne', selected: 'Activité choisie' },
  ber: { back: 'ⵓⵔⴰⵔ ⵙ ⵜⵏⴰⵙⵜ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ', heading: 'ⵜⴰⵏⴼⵍⵜ ⵏⵏⴽ ⴳ ⵉⵙⵏⵉⵔⴰⵏ', selected: 'ⴰⵙⵏⵙⵓ ⵉⵜⵜⵓⵙⵜⵉ' },
} as const;

const activityNames = {
  ar: { nature: 'السياحة الطبيعية', adventure: 'المغامرات', sports: 'الرياضات الجبلية' },
  en: { nature: 'Nature tourism', adventure: 'Adventure', sports: 'Mountain sports' },
  fr: { nature: 'Tourisme nature', adventure: 'Aventure', sports: 'Sports de montagne' },
  ber: { nature: 'ⵜⵓⵔⵉⵙⵎ ⵏ ⵜⵎⴰⵜⴰⵔⵜ', adventure: 'ⵜⵉⵎⵙⵙⵉⵔⵉⵏ', sports: 'ⵉⵎⵙⵙⵓⵜⵉⵏ ⵏ ⵉⵙⵏⵉⵔⴰⵏ' },
} as const;

export default function SafetyTripPage() {
  const { lang, setLang } = useLanguage();
  const c = pageCopy[lang];
  const direction = lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr';
  const activityKey = new URLSearchParams(window.location.search).get('activity') as keyof typeof activityNames.ar | null;
  const activityName = activityKey && activityNames[lang][activityKey];
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#f5f5f0]" dir={direction}>
      <header className="border-b border-[#dce8dd] bg-white/95 shadow-sm">
        <div className="container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <a href="/" className="inline-flex items-center gap-3 font-extrabold text-[#1b5e3f]">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663817279330/xbbDARckWbPXkreO.png" alt="ADRAR" className="h-10 w-10 object-contain" />
            <span className="text-xl">{lang === 'ber' ? 'ⴰⴷⵔⴰⵔ' : lang === 'ar' ? 'ادرار' : 'ADRAR'}</span>
          </a>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#1b5e3f]" />
            <div className="flex flex-wrap gap-1 rounded-full bg-[#eef5ef] p-1">
              {(Object.keys(languageNames) as Lang[]).map((key) => (
                <button key={key} type="button" onClick={() => setLang(key)} className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors ${lang === key ? 'bg-[#1b5e3f] text-white' : 'text-[#315443] hover:bg-white'}`}>
                  {languageNames[key]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <a href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#176b4d] shadow-sm transition hover:bg-[#eaf4ec] focus:outline-none focus:ring-4 focus:ring-[#176b4d]/20">
          <BackIcon className="h-4 w-4" />
          <Home className="h-4 w-4" />
          {c.back}
        </a>
        <div className="mx-auto mt-8 max-w-5xl rounded-3xl border border-[#d6e4d8] bg-[#eaf4ec] p-5 text-center shadow-sm md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#176b4d]"><ShieldCheck className="h-5 w-5" /> ADRAR Safety</div>
          <h1 className="mt-4 text-2xl font-black text-[#164b38] md:text-4xl">{c.heading}</h1>
          {activityName && <p className="mt-3 text-sm font-bold text-[#5b6c63]">{c.selected}: {activityName}</p>}
        </div>
        <MountainActivitiesOfflineCard />
        <SafetyTripSection />
      </main>
    </div>
  );
}
