import { HandHeart, MessageCircle, PackageSearch } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  ar: {
    eyebrow: 'منتجات أدرار والجمعيات المحلية',
    title: 'اكتشف ما تنتجه المنطقة',
    description: 'مساحة مخصصة للمنتجات الطبيعية المحلية والجمعيات التي تساهم في تنمية أزيلال بطريقة مسؤولة.',
    products: 'المنتجات الطبيعية',
    productsText: 'العسل، زيت الزيتون، الأعشاب والمنتجات المحلية بعد التحقق من مصدرها.',
    associations: 'الجمعيات المحلية',
    associationsText: 'مبادرات وجمعيات أزيلال التي تقدم أنشطة أو منتجات لفائدة الزوار والمجتمع.',
    empty: 'ستظهر العروض والجهات الموثقة هنا قريباً.',
    contact: 'تواصل مع ADRAR',
  },
  en: {
    eyebrow: 'ADRAR products and local associations',
    title: 'Discover what the region produces',
    description: 'A dedicated space for local natural products and associations contributing to Azilal in a responsible way.',
    products: 'Natural products',
    productsText: 'Honey, olive oil, herbs and local products listed after source verification.',
    associations: 'Local associations',
    associationsText: 'Azilal initiatives and associations offering activities or products for visitors and the community.',
    empty: 'Verified offers and organizations will appear here soon.',
    contact: 'Contact ADRAR',
  },
  fr: {
    eyebrow: 'Produits ADRAR et associations locales',
    title: 'Découvrez les savoir-faire de la région',
    description: 'Un espace dédié aux produits naturels locaux et aux associations qui contribuent au développement responsable d’Azilal.',
    products: 'Produits naturels',
    productsText: 'Miel, huile d’olive, plantes et produits locaux après vérification de leur origine.',
    associations: 'Associations locales',
    associationsText: 'Initiatives et associations d’Azilal proposant des activités ou des produits aux visiteurs et à la communauté.',
    empty: 'Les offres et organismes vérifiés apparaîtront bientôt ici.',
    contact: 'Contacter ADRAR',
  },
  ber: {
    eyebrow: 'ⵉⵎⵥⵍⴰⵢ ⵏ ADRAR ⴷ ⵜⵎⵙⵙⵉⵔⵉⵏ ⵏ ⵓⵎⵣⵔⵓⵢ',
    title: 'ⵙⵏⵓⴱⵔⵛ ⵎⴰⵢ ⵜⵙⵙⵓⴼⵖ ⵜⵎⵏⴰⴹⵜ',
    description: 'ⴰⵎⴽⴰⵏ ⵉ ⵉⵎⵥⵍⴰⵢ ⵏ ⵓⵎⵣⵔⵓⵢ ⴷ ⵜⵎⵙⵙⵉⵔⵉⵏ ⵉ ⵙⵙⵏⵓⴱⵔⵏ ⴰⵣⵉⵍⴰⵍ ⵙ ⵓⵙⵏⵓⴱⴳ ⵉⵎⵎⵖⵓⵔ.',
    products: 'ⵉⵎⵥⵍⴰⵢ ⵏ ⵓⵎⵣⵔⵓⵢ',
    productsText: 'ⵜⴰⵎⵎⵏⵜ, ⵣⵉⵜ ⵏ ⵓⵣⵎⵎⵓⵔ, ⵉⵎⴰⵣⵉⵖⵏ ⴷ ⵉⵎ⥴ⵍⴰⵢ ⵏ ⵜⵎⵏⴰⴹⵜ.',
    associations: 'ⵜⵉⵎⵙⵙⵉⵔⵉⵏ ⵏ ⵓⵎⵣⵔⵓⵢ',
    associationsText: 'ⵜⵉⵏⵎⵍⵉⵏ ⴷ ⵜⵎⵙⵙⵉⵔⵉⵏ ⵏ ⵣⵉⵍⴰⵍ ⵉ ⵉⵎⵙⵙⴰⵙⵏ ⴷ ⵉⵎⵣⵡⴰⵔⵏ.',
    empty: 'ⵔⴰⴷ ⴷⴷⵔⵏ ⴷⴰ ⵜⵉⵔⵔⴰ ⴷ ⵜⵎⵙⵙⵉⵔⵉⵏ ⵉⵜⵜⵓⵙⵏⵏ.',
    contact: 'ⵏⵎⵥⴰ ADRAR',
  },
} as const;

export default function LocalProductsSection() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const isRtl = lang === 'ar';
  return (
    <div id="local-products" className="mt-16 scroll-mt-24 rounded-[2rem] border border-[#c8a951]/25 bg-[#fbfcf7] p-5 sm:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full bg-[#c8a951]/15 px-3 py-1.5 text-xs font-extrabold text-[#725b1d]">{t.eyebrow}</span>
        <h3 className="mt-4 text-2xl font-black text-[#1b5e3f] sm:text-3xl">{t.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{t.description}</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#1b5e3f]/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1b5e3f] text-white"><PackageSearch className="h-5 w-5" /></span><h4 className="font-black text-[#163b2a]">{t.products}</h4></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{t.productsText}</p>
        </article>
        <article className="rounded-2xl border border-[#1b5e3f]/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1b5e3f] text-white"><HandHeart className="h-5 w-5" /></span><h4 className="font-black text-[#163b2a]">{t.associations}</h4></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{t.associationsText}</p>
        </article>
      </div>
      <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#1b5e3f]/5 p-4 text-center sm:flex-row sm:text-start">
        <p className="text-sm font-semibold text-[#163b2a]">{t.empty}</p>
        <a href="/#contact" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1b5e3f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#164d34] focus:outline-none focus:ring-4 focus:ring-[#1b5e3f]/20"><MessageCircle className="h-4 w-4" />{t.contact}</a>
      </div>
    </div>
  );
}
