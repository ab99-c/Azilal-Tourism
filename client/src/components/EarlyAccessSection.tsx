import { ArrowUpLeft, BadgeCheck, CalendarCheck2, Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { scrollToSection } from '@/lib/scroll';

const copy = {
  ar: {
    eyebrow: 'نسخة تجريبية مفتوحة',
    title: 'خطط رحلتك إلى أزيلال، أو أضف خدمتك المحلية',
    description: 'نربط الزوار بالخدمات المحلية ونراجع كل طلب مع المالك قبل اعتباره حجزاً مؤكداً.',
    visitorTitle: 'أبحث عن إقامة أو خدمة',
    visitorBody: 'ابحث في الفنادق والسيارات والمطاعم والمقاهي، ثم أرسل طلبك مباشرة.',
    visitorAction: 'ابدأ البحث',
    ownerTitle: 'لدي فندق أو نشاط محلي',
    ownerBody: 'أنشئ حساباً وأضف بيانات خدمتك للانضمام إلى التجربة الأولى دون التزام بالدفع الآن.',
    ownerAction: 'أضف خدمتك',
    trustOne: 'معلومات محلية منظمة',
    trustTwo: 'التوفر يؤكده المالك',
    trustThree: 'الدفع عند الوصول للخدمات التي تدعمه',
  },
  en: {
    eyebrow: 'Open early access',
    title: 'Plan an Azilal trip, or add your local service',
    description: 'We connect visitors with local services and every request is reviewed by the owner before it becomes confirmed.',
    visitorTitle: 'I need a stay or service',
    visitorBody: 'Browse hotels, cars, restaurants and cafés, then send your request directly.',
    visitorAction: 'Start exploring',
    ownerTitle: 'I run a local service',
    ownerBody: 'Create an account and add your service to join the first trial with no payment commitment today.',
    ownerAction: 'Add your service',
    trustOne: 'Organised local details',
    trustTwo: 'Availability confirmed by owner',
    trustThree: 'Pay on arrival where supported',
  },
  fr: {
    eyebrow: 'Accès anticipé ouvert',
    title: 'Préparez votre séjour à Azilal ou ajoutez votre service local',
    description: 'Nous relions les visiteurs aux services locaux et chaque demande est vérifiée par le propriétaire avant confirmation.',
    visitorTitle: 'Je cherche un séjour ou un service',
    visitorBody: 'Parcourez hôtels, voitures, restaurants et cafés, puis envoyez directement votre demande.',
    visitorAction: 'Commencer la recherche',
    ownerTitle: 'Je gère un service local',
    ownerBody: 'Créez un compte et ajoutez votre service pour rejoindre le premier essai sans engagement de paiement aujourd’hui.',
    ownerAction: 'Ajouter mon service',
    trustOne: 'Informations locales organisées',
    trustTwo: 'Disponibilité confirmée par le propriétaire',
    trustThree: 'Paiement à l’arrivée lorsque disponible',
  },
  ber: {
    eyebrow: 'ⴰⵏⴽⴰⴷ ⴰⵎⵣⵡⴰⵔⵓ ⵉⵍⵍⴰ',
    title: 'ⵙⵡⵓⵔ ⵜⵉⵏⵎⵍ ⵏⵏⴽ ⵖ ⴰⵣⵉⵍⴰⵍ ⵏⵖ ⵔⵏⵓ ⴰⵎⵙⵡⵉⵔ ⵏⵏⴽ',
    description: 'ⵏⵙⵎⵓⵏ ⵉⵎⵔⵣⴰ ⴷ ⵉⵎⵙⵡⵉⵔⵏ ⵉⴷⵖⴰⵔⵏ ⴷ ⵉⵙⵙⵏ ⵎⴰⵙⵙ ⴽⵓ ⵜⵓⵜⵜⵔⴰ ⵣⵉⵣⵡⵔ.',
    visitorTitle: 'ⵔⵉⵖ ⴰⵎⵙⵡⵉⵔ ⵏⵖ ⵜⵉⵏⵎⵍ',
    visitorBody: 'ⵔⵣⵓ ⵙ ⵉⵙⵏⴷⵇⵏ, ⵜⵙⵍⵍⴰⵙⵉⵏ, ⵉⵎⵙⵙⴽⵜⵏ ⴷ ⵉⵇⵀⵡⴰⵢⵏ.',
    visitorAction: 'ⴱⴷⵓ ⴰⵏⴰⴷⵉ',
    ownerTitle: 'ⵙⵙⵡⵓⵔⵖ ⴰⵎⵙⵡⵉⵔ ⵉⴷⵖⴰⵔⴰⵏ',
    ownerBody: 'ⵙⵏⵓⵍⴼⵓ ⴰⵎⵉⴷⴰⵏ ⴷ ⵔⵏⵓ ⴰⵎⵙⵡⵉⵔ ⵏⵏⴽ ⵉ ⵓⵙⵏⴽⴷ ⴰⵎⵣⵡⴰⵔⵓ.',
    ownerAction: 'ⵔⵏⵓ ⴰⵎⵙⵡⵉⵔ ⵏⵏⵓ',
    trustOne: 'ⵉⵙⴼⴽⴰ ⵉⴷⵖⴰⵔⵏ',
    trustTwo: 'ⵎⴰⵙⵙ ⴰⴷ ⵉⵙⵙⵏ ⴰⵙⴰⵔⴰ',
    trustThree: 'ⴰⴷⵔⵉⵎ ⵎⵉ ⵜⵓⵙⵉⴷ',
  },
} as const;

type EarlyAccessIntent = 'visitor-search' | 'owner-onboarding';

function trackEarlyAccess(intent: EarlyAccessIntent) {
  const tracker = (window as Window & { umami?: { track?: (event: string, data?: Record<string, string>) => void } }).umami;
  tracker?.track?.('early-access-cta', { intent });
  window.sessionStorage.setItem('adrar:early-access-intent', intent);
}

export default function EarlyAccessSection() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const isRTL = lang === 'ar' || lang === 'ber';

  return (
    <section id="early-access" dir={isRTL ? 'rtl' : 'ltr'} className="relative overflow-hidden bg-[#f5f5f0] px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d89728] to-transparent" />
      <div className="container relative">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#113c2a] p-5 text-white shadow-[0_22px_70px_rgba(15,61,40,0.26)] sm:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#d89728]/20 px-3 py-1.5 text-xs font-extrabold text-[#ffe0a3]"><BadgeCheck className="h-3.5 w-3.5" />{t.eyebrow}</span>
            <h2 className="mt-4 text-2xl font-black leading-tight sm:text-4xl">{t.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{t.description}</p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
              <CalendarCheck2 className="h-7 w-7 text-[#f6c453]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-extrabold">{t.visitorTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">{t.visitorBody}</p>
              <button type="button" data-umami-event="early-access-visitor-cta" onClick={() => { trackEarlyAccess('visitor-search'); scrollToSection('discover'); }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#14532d] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f6c453]">
                {t.visitorAction}<ArrowUpLeft className="h-4 w-4 rtl:rotate-90" aria-hidden="true" />
              </button>
            </article>
            <article className="rounded-2xl border border-[#f6c453]/30 bg-[#0c2e20] p-5">
              <Store className="h-7 w-7 text-[#f6c453]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-extrabold">{t.ownerTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">{t.ownerBody}</p>
              <a href="/?auth=register&utm_source=early-access&utm_medium=owner-cta" data-umami-event="early-access-owner-cta" onClick={() => trackEarlyAccess('owner-onboarding')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d89728] px-4 py-3 text-sm font-extrabold text-[#163b2a] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f6c453] focus:outline-none focus:ring-2 focus:ring-white">
                {t.ownerAction}<ArrowUpLeft className="h-4 w-4 rtl:rotate-90" aria-hidden="true" />
              </a>
            </article>
          </div>

          <div className="mt-6 grid gap-2 border-t border-white/10 pt-5 text-center text-xs font-bold text-white/70 sm:grid-cols-3">
            <span>{t.trustOne}</span><span>{t.trustTwo}</span><span>{t.trustThree}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
