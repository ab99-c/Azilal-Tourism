import { CalendarDays, MapPinned, MessageCircleMore } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const content = {
  eyebrow: { ar: 'خطّط قبل السفر', en: 'Plan before you go', fr: 'Préparez votre visite', ber: 'ⵙⵎⵓⵜⵜⵉ ⵣⵣⴰⵜ ⴰⴷ ⵜⵔⵔⵓⴷ' },
  title: { ar: 'رحلة واضحة من البحث حتى التواصل', en: 'A clear path from search to contact', fr: 'Un parcours clair, de la recherche au contact', ber: 'ⴰⴱⵔⵉⴷ ⵉⴼⵔⴷⵉⵏ ⵙⴳ ⵓⵏⴰⴷⵉ ⴰⵔ ⵓⵎⵙⴰⵡⴰⴹ' },
  description: { ar: 'استخدم ADRAR لمقارنة الخيارات وتحديد التواريخ والتنسيق مباشرةً مع المالك قبل إكمال رحلتك.', en: 'Use ADRAR to compare options, choose dates and coordinate directly with an owner before your trip.', fr: 'Utilisez ADRAR pour comparer les options, choisir les dates et coordonner directement avec un propriétaire avant le départ.', ber: 'ⵙⵙⵎⵔⵙ ADRAR ⴰⴼⴰⴷ ⴰⴷ ⵜⵙⵎⵍⴰⵍⴷ ⵜⵉⴼⵔⴰⵜⵉⵏ, ⵜⴼⵔⵏⴷ ⵜⵉⵣⵡⵉⵔⵉⵏ ⴷ ⵜⵎⵙⴰⵡⴰⴹⴷ ⴷ ⵓⵎⴰⵙⵙ ⵣⵣⴰⵜ ⴰⴷ ⵜⵔⵔⵓⴷ.' },
  step1Title: { ar: 'ابحث وقارن', en: 'Search and compare', fr: 'Cherchez et comparez', ber: 'ⵔⵣⵓ ⴷ ⵙⵎⵍⴰⵍ' },
  step1Text: { ar: 'صفِّ الفنادق والسيارات والمطاعم والمقاهي وفقاً لاحتياجاتك.', en: 'Filter hotels, cars, restaurants and cafés around your needs.', fr: 'Filtrez hôtels, voitures, restaurants et cafés selon vos besoins.', ber: 'ⵙⵉⴼⴹ ⵉⵙⵏⴷⵇⵏ, ⵜⵙⵍⵍⴰⵙⵉⵏ, ⵉⵎⵙⵙⴽⵜⵏ ⴷ ⵉⵇⵀⵡⴰⵢⵏ ⵙ ⵍⵇⴰⵏ ⵏⵏⴽ.' },
  step2Title: { ar: 'أكّد التواريخ', en: 'Confirm your dates', fr: 'Confirmez vos dates', ber: 'ⵙⵙⵎⵔⵙ ⵜⵉⵣⵡⵉⵔⵉⵏ' },
  step2Text: { ar: 'اختر التواريخ وتحقّق من التوفر قبل إرسال طلب الحجز.', en: 'Choose dates and check availability before sending a booking request.', fr: 'Choisissez vos dates et vérifiez la disponibilité avant d’envoyer une demande.', ber: 'ⴼⵔⵏ ⵜⵉⵣⵡⵉⵔⵉⵏ ⴷ ⵙⵙⵉⵇⵙⵉ ⵜⴰⴼⵔⴰ ⵣⵣⴰⵜ ⵓⵙⴰⵣⵏ ⵏ ⵓⵙⵓⵜⵔ.' },
  step3Title: { ar: 'نسّق مع المالك', en: 'Coordinate with the owner', fr: 'Coordonnez avec le propriétaire', ber: 'ⵎⵙⴰⵡⴰⴹ ⴷ ⵓⵎⴰⵙⵙ' },
  step3Text: { ar: 'استخدم واتساب المتاح في الإعلان لتوضيح التفاصيل قبل الوصول.', en: 'Use the listing’s available WhatsApp contact to clarify details before arrival.', fr: 'Utilisez le contact WhatsApp affiché pour clarifier les détails avant l’arrivée.', ber: 'ⵙⵙⵎⵔⵙ ⵡⴰⵜⵙⴰⴱ ⵉⵍⵍⴰⵏ ⴳ ⵜⵉⵔⵔⴰ ⴰⴼⴰⴷ ⴰⴷ ⵜⵙⵙⵉⵡⵍⴷ ⵅⴼ ⵜⵉⴼⵔⴰⵜⵉⵏ ⵣⵣⴰⵜ ⵓⵡⵡⴰⴹ.' },
};

export default function VisitorPlanningSection() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof content) => content[key][lang] || content[key].en;
  const steps = [
    { icon: MapPinned, title: 'step1Title' as const, text: 'step1Text' as const },
    { icon: CalendarDays, title: 'step2Title' as const, text: 'step2Text' as const },
    { icon: MessageCircleMore, title: 'step3Title' as const, text: 'step3Text' as const },
  ];
  return <section className="bg-white py-14 sm:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}><div className="container"><div className="mx-auto max-w-3xl text-center"><span className="rounded-full bg-[#c8a951]/20 px-3 py-1.5 text-xs font-extrabold text-[#725b1d]">{t('eyebrow')}</span><h2 className="mt-4 text-3xl font-extrabold text-[#163b2a] sm:text-4xl">{t('title')}</h2><p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">{t('description')}</p></div><div className="mt-9 grid gap-4 md:grid-cols-3">{steps.map((step, index) => <article key={step.title} className="rounded-2xl border border-[#1b5e3f]/10 bg-[#f5f5f0] p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b5e3f] text-white"><step.icon className="h-5 w-5" /></span><span className="text-xs font-extrabold text-[#c8a951]">0{index + 1}</span></div><h3 className="mt-5 font-extrabold text-[#163b2a]">{t(step.title)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t(step.text)}</p></article>)}</div></div></section>;
}
