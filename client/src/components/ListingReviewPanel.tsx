import { CheckCircle2, EyeOff, ShieldCheck } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const copy = {
  title: { ar: 'مراجعة القوائم', en: 'Listing review', fr: 'Révision des annonces', ber: 'ⴰⵙⵙⵉⵇⵙⵉ ⵏ ⵜⵉⵔⵔⴰ' },
  description: { ar: 'هذه القوائم غير ظاهرة للزوار حتى تتم الموافقة عليها.', en: 'These listings remain hidden from visitors until approved.', fr: 'Ces annonces restent invisibles aux visiteurs jusqu’à leur approbation.', ber: 'ⵜⵉⵔⵔⴰ ⴰⴷ ⵓⵔ ⵜⵜⵓⵙⴽⴰⵏⵏⵜ ⵉ ⵉⵎⵔⵣⴰ ⴰⵔ ⴰⴷ ⵜⵜⵓⵇⴱⴰⵍⵏⵜ.' },
  empty: { ar: 'ما كايناش دابا قوائم كتسنى المراجعة.', en: 'There are no listings awaiting review.', fr: 'Aucune annonce n’attend de révision.', ber: 'ⵓⵔ ⵉⵍⵍⵉ ⵓⵍⴰ ⵢⴰⵏ ⵓⵔⴰⵔ ⵉⵜⵜⵔⴰⵊⵓⵏ ⴰⵙⵙⵉⵇⵙⵉ.' },
  approve: { ar: 'نشر', en: 'Publish', fr: 'Publier', ber: 'ⵙⵙⵓⴼⵖ' },
  keepHidden: { ar: 'خليه مخفي', en: 'Keep hidden', fr: 'Garder masquée', ber: 'ⵊⵊ ⵜ ⵜⴼⴼⵔ' },
  done: { ar: 'تم تحديث حالة القائمة', en: 'Listing status updated', fr: 'Statut de l’annonce mis à jour', ber: 'ⵉⵜⵜⵓⵙⵏⴼⵍ ⵡⴰⴷⴷⴰⴷ ⵏ ⵜⵉⵔⵔⴰ' },
};

export default function ListingReviewPanel() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof copy) => copy[key][lang] || copy[key].en;
  const utils = trpc.useUtils();
  const queue = trpc.listingReview.queue.useQuery(undefined, { retry: false });
  const refresh = () => {
    utils.listingReview.queue.invalidate();
    utils.cars.list.invalidate();
    utils.hotels.list.invalidate();
    utils.restaurants.list.invalidate();
    utils.cafes.list.invalidate();
    utils.dashboard.myCars.invalidate();
    utils.dashboard.myHotels.invalidate();
    utils.dashboard.myRestaurants.invalidate();
    utils.dashboard.myCafes.invalidate();
  };
  const approve = trpc.listingReview.approve.useMutation({ onSuccess: () => { refresh(); toast.success(t('done')); } });
  const hide = trpc.listingReview.hide.useMutation({ onSuccess: () => { refresh(); toast.success(t('done')); } });
  const label = (item: any) => lang === 'ar' ? item.nameAr : lang === 'fr' ? item.nameFr : lang === 'ber' ? item.nameBer : item.nameEn;
  const kind = (type: string) => ({ ar: { car: 'سيارة', hotel: 'فندق', restaurant: 'مطعم', cafe: 'مقهى' }, en: { car: 'Car', hotel: 'Hotel', restaurant: 'Restaurant', cafe: 'Café' }, fr: { car: 'Voiture', hotel: 'Hôtel', restaurant: 'Restaurant', cafe: 'Café' }, ber: { car: 'ⵜⴰⵙⵍⵍⴰⵙⵜ', hotel: 'ⴰⵙⵏⴷⵇ', restaurant: 'ⴰⵎⵙⵙⴽⵜ', cafe: 'ⴰⵇⵀⵡⴰ' } } as any)[lang]?.[type] || type;

  return <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-6">
    <div className="flex items-start gap-3"><div className="rounded-xl bg-[#c8a951] p-2 text-[#1b5e3f]"><ShieldCheck className="h-5 w-5" /></div><div><h3 className="font-bold text-white">{t('title')}</h3><p className="mt-1 text-sm leading-6 text-white/65">{t('description')}</p></div></div>
    {queue.isLoading ? <p className="mt-6 text-sm text-white/60">…</p> : (queue.data || []).length === 0 ? <p className="mt-6 rounded-xl bg-white/5 p-4 text-center text-sm text-white/65">{t('empty')}</p> : <div className="mt-5 space-y-3">{queue.data?.map((item: any) => <div key={`${item.type}-${item.id}`} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#163b2a]/30 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="truncate font-bold text-white">{label(item)}</p><p className="mt-1 text-xs text-[#c8a951]">{kind(item.type)}</p></div><div className="flex gap-2"><button onClick={() => approve.mutate({ type: item.type, id: item.id })} disabled={approve.isPending || hide.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8a951] px-3 py-2 text-xs font-bold text-[#163b2a] disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" />{t('approve')}</button><button onClick={() => hide.mutate({ type: item.type, id: item.id })} disabled={approve.isPending || hide.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><EyeOff className="h-3.5 w-3.5" />{t('keepHidden')}</button></div></div>)}</div>}
  </div>;
}
