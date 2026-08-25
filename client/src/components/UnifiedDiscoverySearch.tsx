import { useMemo, useState } from 'react';
import { Car, Coffee, Compass, Hotel, MapPin, Search, Utensils } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { scrollToSection } from '@/lib/scroll';

type DiscoveryKind = 'hotel' | 'car' | 'restaurant' | 'cafe';

const labels = {
  eyebrow: { ar: 'اكتشف أزيلال', en: 'Explore Azilal', fr: 'Explorer Azilal', ber: 'ⵔⵣⵓ ⴰⵣⵉⵍⴰⵍ' },
  title: { ar: 'اعثر على الإقامة أو وسيلة النقل أو المطعم الذي تبحث عنه', en: 'Find stays, transport and local places', fr: 'Trouvez séjours, transport et bonnes adresses', ber: 'ⴰⴼ ⵜⵉⵏⵎⵍ ⵏ ⵜⵉⵎⵣⵉⵣⵍⵜ ⴷ ⵉⴷⵖⴰⵔⵏ' },
  description: { ar: 'يجمع بحث واحد العروض المتاحة في ADRAR، ويمكنك الانتقال منه مباشرةً إلى القسم المناسب.', en: 'One search brings together ADRAR listings and takes you straight to the matching section.', fr: 'Une seule recherche réunit les annonces ADRAR et vous mène à la bonne section.', ber: 'ⴰⵏⴰⴷⵉ ⵢⴰⵏ ⴰⴷ ⵉⵙⵎⵓⵏ ⵜⵉⵔⵔⴰ ⵏ ADRAR ⴷ ⴰⴷ ⴽ ⵉⵙⵙⵉⵡⴹ ⵙ ⵓⵏⴳⵔⴰⵡ.' },
  placeholder: { ar: 'ابحث بالاسم أو المكان أو الوصف…', en: 'Search by name, place or description…', fr: 'Rechercher par nom, lieu ou description…', ber: 'ⵔⵣⵓ ⵙ ⵉⵙⵎ, ⴰⵏⵙⴰ ⵏⵖ ⴰⴳⵍⴰⵎ…' },
  all: { ar: 'الكل', en: 'All', fr: 'Tout', ber: 'ⴽⵓⵍⵍⵓ' },
  hotel: { ar: 'الفنادق', en: 'Hotels', fr: 'Hôtels', ber: 'ⵉⵙⵏⴷⵇⵏ' },
  car: { ar: 'السيارات', en: 'Cars', fr: 'Voitures', ber: 'ⵜⵙⵍⵍⴰⵙⵜ' },
  restaurant: { ar: 'المطاعم', en: 'Restaurants', fr: 'Restaurants', ber: 'ⵉⵎⵙⵙⴽⵜⵏ' },
  cafe: { ar: 'المقاهي', en: 'Cafés', fr: 'Cafés', ber: 'ⵉⵇⵀⵡⴰⵢⵏ' },
  results: { ar: 'نتائج', en: 'results', fr: 'résultats', ber: 'ⵉⴳⵎⴰⴹⵏ' },
  open: { ar: 'عرض القسم', en: 'View section', fr: 'Voir la section', ber: 'ⵙⴽⵏ ⴰⵏⴳⵔⴰⵡ' },
  empty: { ar: 'لم نعثر على نتائج مطابقة. جرّب كلمة أخرى أو اختر نوعاً مختلفاً.', en: 'No matching results. Try another word or category.', fr: 'Aucun résultat. Essayez un autre mot ou une autre catégorie.', ber: 'ⵓⵔ ⵏⵓⴼⵉ ⴰⵔⵏⵏⴰⵡ. ⵔⵣⵓ ⵙ ⵢⴰⵏ ⵓⵡⴰⵍ ⵏⵖ ⴰⵏⴰⵡ ⵢⴰⴹⵏ.' },
  loading: { ar: 'جارٍ تحميل العروض…', en: 'Loading listings…', fr: 'Chargement des annonces…', ber: 'ⴰⵔ ⵏⵙⵎⵓⵜⵜⵉ ⵜⵉⵔⵔⴰ…' },
};

const sectionByKind: Record<DiscoveryKind, string> = {
  hotel: 'hotels', car: 'cars', restaurant: 'restaurants', cafe: 'cafes',
};

const iconByKind = { hotel: Hotel, car: Car, restaurant: Utensils, cafe: Coffee };

export default function UnifiedDiscoverySearch() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';
  const l = (key: keyof typeof labels) => labels[key][lang as keyof typeof labels[typeof key]] || labels[key].en;
  const [query, setQuery] = useState('');
  const [type, setType] = useState<DiscoveryKind | 'all'>('all');
  const hotelsQuery = trpc.hotels.list.useQuery(undefined, { retry: false });
  const carsQuery = trpc.cars.list.useQuery(undefined, { retry: false });
  const restaurantsQuery = trpc.restaurants.list.useQuery(undefined, { retry: false });
  const cafesQuery = trpc.cafes.list.useQuery(undefined, { retry: false });
  const loading = hotelsQuery.isLoading || carsQuery.isLoading || restaurantsQuery.isLoading || cafesQuery.isLoading;

  const results = useMemo(() => {
    const toItem = (kind: DiscoveryKind, item: any) => {
      const name = lang === 'ar' ? item.nameAr : lang === 'fr' ? item.nameFr : lang === 'ber' ? item.nameBer : item.nameEn;
      const description = lang === 'ar' ? item.descriptionAr : lang === 'fr' ? item.descriptionFr : lang === 'ber' ? item.descriptionBer : item.descriptionEn;
      const location = lang === 'ar' ? item.locationAr : lang === 'fr' ? item.locationFr : lang === 'ber' ? item.locationBer : item.locationEn;
      return { id: item.id, kind, name: name || '', description: description || '', location: location || '', image: item.image || null };
    };
    const all = [
      ...(hotelsQuery.data || []).map((item: any) => toItem('hotel', item)),
      ...(carsQuery.data || []).map((item: any) => toItem('car', item)),
      ...(restaurantsQuery.data || []).map((item: any) => toItem('restaurant', item)),
      ...(cafesQuery.data || []).map((item: any) => toItem('cafe', item)),
    ];
    const needle = query.trim().toLocaleLowerCase();
    return all.filter((item) => {
      if (type !== 'all' && item.kind !== type) return false;
      if (!needle) return true;
      return `${item.name} ${item.description} ${item.location}`.toLocaleLowerCase().includes(needle);
    }).slice(0, 8);
  }, [carsQuery.data, cafesQuery.data, hotelsQuery.data, lang, query, restaurantsQuery.data, type]);

  const visible = Boolean(query.trim()) || type !== 'all';
  const filters: Array<DiscoveryKind | 'all'> = ['all', 'hotel', 'car', 'restaurant', 'cafe'];

  return (
    <section id="discover" className="bg-[#f5f5f0] py-12 sm:py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#1b5e3f]/10 bg-white p-5 shadow-[0_18px_50px_rgba(27,94,63,0.10)] sm:p-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1b5e3f]/10 px-3 py-1.5 text-xs font-extrabold text-[#1b5e3f]"><Compass className="h-3.5 w-3.5" />{l('eyebrow')}</span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#163b2a] sm:text-3xl">{l('title')}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">{l('description')}</p>
          </div>
          <div className="relative mt-6">
            <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1b5e3f]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={l('placeholder')} aria-label={l('placeholder')} className="w-full rounded-2xl border border-[#1b5e3f]/20 bg-[#fbfcfa] py-3.5 ps-12 pe-4 text-sm text-slate-800 outline-none transition-shadow placeholder:text-slate-400 focus:ring-4 focus:ring-[#1b5e3f]/10" />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label={l('title')}>
            {filters.map((filter) => {
              const Icon = filter === 'all' ? Compass : iconByKind[filter];
              return <button key={filter} onClick={() => setType(filter)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-colors ${type === filter ? 'bg-[#1b5e3f] text-white shadow-sm' : 'bg-[#f5f5f0] text-slate-600 hover:bg-[#1b5e3f]/10 hover:text-[#1b5e3f]'}`}><Icon className="h-3.5 w-3.5" />{l(filter)}</button>;
            })}
          </div>
          {visible && <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-bold text-slate-500">{loading ? l('loading') : `${results.length} ${l('results')}`}</p>
            {!loading && results.length === 0 ? <p className="rounded-xl bg-[#f5f5f0] px-4 py-5 text-center text-sm text-slate-500">{l('empty')}</p> : <div className="grid gap-2 sm:grid-cols-2">
              {results.map((item) => {
                const Icon = iconByKind[item.kind];
                return <button key={`${item.kind}-${item.id}`} onClick={() => scrollToSection(sectionByKind[item.kind])} className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 p-3 text-start transition-colors hover:border-[#1b5e3f]/25 hover:bg-[#1b5e3f]/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1b5e3f]/10 text-[#1b5e3f]">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4" />}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{item.name || `#${item.id}`}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.location || l(item.kind)}</p></div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#1b5e3f]">{l('open')}<MapPin className="h-3 w-3" /></span>
                </button>;
              })}
            </div>}
          </div>}
        </div>
      </div>
    </section>
  );
}
