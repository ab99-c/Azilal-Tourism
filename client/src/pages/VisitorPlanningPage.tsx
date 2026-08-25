import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useLanguage, type Lang } from '@/contexts/LanguageContext';
import VisitorPlanningSection from '@/components/VisitorPlanningSection';
import FooterSection from '@/components/FooterSection';

const pageCopy = {
  ar: { back: 'العودة إلى الصفحة الرئيسية', title: 'خطّط لزيارتك إلى أزيلال بهدوء', intro: 'جمعنا لك الخطوات الأساسية لمقارنة الخيارات وتأكيد التواريخ والتواصل مع المالك قبل السفر.' },
  en: { back: 'Back to home', title: 'Plan your Azilal visit with confidence', intro: 'Use these simple steps to compare options, confirm dates, and contact an owner before you travel.' },
  fr: { back: "Retour à l'accueil", title: 'Préparez votre visite à Azilal', intro: 'Suivez ces étapes simples pour comparer, confirmer vos dates et contacter un propriétaire avant votre départ.' },
  ber: { back: 'ⵔⵔ ⵖⵔ ⵓⵙⵏⵓⴱⴳ', title: 'ⵙⵎⵓⵜⵜⵉ ⵉ ⵓⵔⴰⵔ ⵏⵏⴽ ⴳ ⵣⵉⵍⴰⵍ', intro: 'ⵙⵙⵎⵔⵙ ⵜⵉⵎⵙⵉⵔⵉⵏ ⴰⴷ ⵜⵙⵎⵍⴰⵍⴷ ⵜⵉⴼⵔⴰⵜⵉⵏ, ⵜⵙⵙⵎⵔⵙⴷ ⵜⵉⵣⵡⵉⵔⵉⵏ ⴷ ⵜⵎⵙⴰⵡⴰⴹⴷ ⴷ ⵓⵎⴰⵙⵙ.' },
} as const;

const logoUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663817279330/xbbDARckWbPXkreO.png';

export default function VisitorPlanningPage() {
  const { lang, setLang } = useLanguage();
  const copy = pageCopy[lang];
  const isRtl = lang === 'ar' || lang === 'ber';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const languageNames: Record<Lang, string> = { ar: 'العربية', en: 'English', fr: 'Français', ber: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#163b2a]" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="border-b border-[#1b5e3f]/10 bg-white/95 shadow-sm">
        <div className="container flex min-h-20 items-center justify-between gap-3 py-3">
          <a href="/" className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 font-extrabold text-[#1b5e3f] transition hover:bg-[#1b5e3f]/5" aria-label={copy.back}>
            <BackIcon className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">{copy.back}</span>
            <Home className="h-4 w-4 sm:hidden" />
          </a>
          <a href="/" className="flex items-center gap-2" aria-label="ADRAR">
            <img src={logoUrl} alt="ADRAR" className="h-10 w-10 object-contain" />
            <span className="text-lg font-black text-[#1b5e3f]">{lang === 'ber' ? 'ⴰⴷⵔⴰⵔ' : lang === 'ar' ? 'ادرار' : 'ADRAR'}</span>
          </a>
          <div className="flex items-center gap-1 rounded-full bg-[#f5f5f0] p-1" aria-label="Language selector">
            {(Object.keys(languageNames) as Lang[]).map((key) => (
              <button key={key} type="button" onClick={() => setLang(key)} className={`rounded-full px-2 py-1 text-[11px] font-bold transition sm:px-3 ${lang === key ? 'bg-[#1b5e3f] text-white' : 'text-slate-600 hover:bg-white'}`}>
                {languageNames[key]}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main>
        <section className="bg-[#1b5e3f] px-4 py-14 text-center text-white sm:py-20">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex rounded-full bg-[#c8a951]/20 px-3 py-1.5 text-xs font-extrabold text-[#f9e7a8]">{copy.back}</span>
            <h1 className="mt-4 text-3xl font-black sm:text-5xl">{copy.title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{copy.intro}</p>
          </div>
        </section>
        <VisitorPlanningSection />
      </main>
      <FooterSection />
    </div>
  );
}
