import { ArrowRight, CalendarDays, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

const labels = {
  ar: { back: 'العودة إلى الرئيسية', loading: 'جاري تحميل التفاصيل…', missing: 'لم يتم العثور على هذه القائمة.', details: 'تفاصيل موثقة', contact: 'اتصل الآن', book: 'احجز الآن', noReviews: 'لا توجد تقييمات منشورة حالياً', noImage: 'لا توجد صورة متاحة حالياً', price: 'السعر', location: 'الموقع' },
  en: { back: 'Back to home', loading: 'Loading details…', missing: 'This listing could not be found.', details: 'Verified details', contact: 'Contact now', book: 'Book now', noReviews: 'No public reviews yet', noImage: 'No image available yet', price: 'Price', location: 'Location' },
  fr: { back: 'Retour à l’accueil', loading: 'Chargement des détails…', missing: 'Cette annonce est introuvable.', details: 'Détails vérifiés', contact: 'Appeler maintenant', book: 'Réserver', noReviews: 'Aucun avis public pour le moment', noImage: 'Aucune image disponible', price: 'Prix', location: 'Lieu' },
  ber: { back: 'ⵓⵖⴰⵍ ⵙ ⵓⵙⵏⵓⴱⵔⵛ', loading: 'ⴰⵙⵙⵉⵔⵉ…', missing: 'ⵓⵔ ⵜⵜⵓⴼⴰ ⵜⵉⵔⵔⴰ ⴰⴷ.', details: 'ⵉⵙⴼⴽⴰ ⵉⵜⵜⵓⵙⵏ', contact: 'ⵙⵙⵉⵡⵍ ⵖⵉⵍⴰⴷ', book: 'ⵙⵜⵉⵏ', noReviews: 'ⵓⵔ ⵍⵍⵉⵏ ⵉⵙⵡⵓⴷⴷⵓⵏ ⵖⵉⵍⴰⴷ', noImage: 'ⵓⵔ ⵜⵍⵍⵉ ⵜⵡⵍⴰⴼⵜ', price: 'ⵜⴰⵙⵙⴰⵔⵜ', location: 'ⴰⵎⵙⵙⴰⵡ' },
} as const;

type ListingType = 'hotel' | 'car' | 'restaurant' | 'cafe';

export default function ListingDetailPage() {
  const { lang } = useLanguage();
  const t = labels[lang];
  const params = new URLSearchParams(window.location.search);
  const type = (params.get('type') as ListingType) || 'hotel';
  const id = Number(params.get('id'));
  const enabled = Number.isInteger(id) && id > 0;
  const hotels = trpc.hotels.list.useQuery(undefined, { enabled: type === 'hotel', retry: 1 });
  const cars = trpc.cars.list.useQuery(undefined, { enabled: type === 'car', retry: 1 });
  const restaurants = trpc.restaurants.list.useQuery(undefined, { enabled: type === 'restaurant', retry: 1 });
  const cafes = trpc.cafes.list.useQuery(undefined, { enabled: type === 'cafe', retry: 1 });
  const query = type === 'hotel' ? hotels : type === 'car' ? cars : type === 'restaurant' ? restaurants : cafes;
  const item = enabled ? (query.data as any[] | undefined)?.find((entry) => entry.id === id) : undefined;
  const field = (prefix: string) => item?.[`${prefix}${lang === 'ar' ? 'Ar' : lang === 'fr' ? 'Fr' : lang === 'ber' ? 'Ber' : 'En'}`] || item?.[prefix] || '';
  const title = field('name');
  const description = field('description');
  const location = field('location');
  const price = type === 'hotel' ? field('price') || item?.priceAr : item?.price || '';
  const image = item?.image;
  const direction = lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr';

  return <main dir={direction} className="min-h-screen bg-[#f5f5f0] pb-16 text-slate-900"><div className="container pt-6">
    <a href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1b5e3f] shadow-sm"><ArrowRight className="h-4 w-4 rtl:rotate-180" />{t.back}</a>
    {query.isLoading && <div className="mt-8 rounded-2xl bg-white p-8 text-center font-bold text-[#1b5e3f]">{t.loading}</div>}
    {!query.isLoading && !item && <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center font-bold text-amber-900">{t.missing}</div>}
    {!query.isLoading && item && <article className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-xl">
      {image ? <img src={image} alt={title} loading="lazy" decoding="async" className="h-64 w-full object-cover md:h-96" /> : <div className="flex h-48 items-center justify-center bg-[#eaf3ec] font-bold text-[#1b5e3f]">{t.noImage}</div>}
      <div className="grid gap-8 p-6 md:grid-cols-[1fr_20rem] md:p-10"><section>
        <div className="flex items-center gap-2 text-sm font-bold text-[#1b5e3f]"><ShieldCheck className="h-4 w-4" />{t.details}</div>
        <h1 className="mt-3 text-3xl font-black text-[#1b5e3f]">{title}</h1>
        {location && <p className="mt-3 flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-[#1b5e3f]" />{location}</p>}
        <p className="mt-5 text-lg leading-8 text-slate-600">{description || t.details}</p>
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{t.noReviews}</p>
      </section><aside className="rounded-2xl bg-[#f7faf7] p-5"><div className="font-bold text-[#1b5e3f]">{t.price}</div><div className="mt-1 text-2xl font-black">{price || '—'}</div><a href={type === 'hotel' || type === 'car' ? `/?booking=${type}&id=${id}` : '/#contact'} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#1b5e3f] px-4 py-3 font-bold text-white"><CalendarDays className="h-4 w-4" />{type === 'hotel' || type === 'car' ? t.book : t.contact}</a>{item?.phone && <a href={`tel:${item.phone}`} className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#1b5e3f]/20 px-4 py-3 font-bold text-[#1b5e3f]"><PhoneCall className="h-4 w-4" />{t.contact}</a>}</aside></div>
    </article>}
  </div></main>;
}
