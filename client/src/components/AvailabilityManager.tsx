import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Car, Building2, Clock3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

type AvailabilityType = 'car' | 'hotel';

const copy = {
  title: { ar: 'تقويم التوفر', en: 'Availability calendar', fr: 'Calendrier de disponibilité', ber: 'ⴰⵙⴽⴰⵍⴰ ⵏ ⵜⵉⵍⵉ' },
  intro: { ar: 'حدّد الأيام التي لا يمكن فيها استقبال حجز. تاريخ النهاية هو أول يوم يصبح فيه المكان متاحاً من جديد.', en: 'Block dates that cannot receive a booking. The end date is the first day available again.', fr: 'Bloquez les dates indisponibles. La date de fin est le premier jour à nouveau disponible.', ber: 'ⵙⴱⴷⴷ ⵉⵙⵙⴰⵏ ⵓⵔ ⵉⵜⵜⵡⴰⵙⵏⴷⵇⵏ. ⴰⵙⵙ ⵏ ⵜⴳⵔⴰ ⴷ ⴰⵙⵙ ⴰⵎⵣⵡⴰⵔⵓ ⵏ ⵜⵉⵍⵉ.' },
  cars: { ar: 'السيارات', en: 'Vehicles', fr: 'Véhicules', ber: 'ⵜⵙⵍⵍⴰⵙⵜ' },
  hotels: { ar: 'الفنادق', en: 'Hotels', fr: 'Hôtels', ber: 'ⵉⵙⵏⴷⵇⵏ' },
  chooseItem: { ar: 'اختر المكان', en: 'Choose the listing', fr: 'Choisir le lieu', ber: 'ⵙⵜⵉ ⴰⵎⴽⴰⵏ' },
  start: { ar: 'من', en: 'From', fr: 'Du', ber: 'ⵙⴳ' },
  end: { ar: 'إلى', en: 'Until', fr: 'Au', ber: 'ⴰⵔ' },
  reason: { ar: 'ملاحظة اختيارية', en: 'Optional note', fr: 'Note facultative', ber: 'ⵜⵉⵔⵔⴰ ⵜⴰⴼⵔⴰⵏⵜ' },
  reasonPlaceholder: { ar: 'مثال: صيانة أو عطلة', en: 'e.g. maintenance or leave', fr: 'ex. maintenance ou congé', ber: 'ⴰⵎⴷⵢⴰ: ⴰⵙⵏⴼⵍ ⵏⵖ ⵜⴰⵙⵏⵙⴰ' },
  block: { ar: 'حظر هذه الفترة', en: 'Block these dates', fr: 'Bloquer cette période', ber: 'ⵙⴱⴷⴷ ⵜⴰⵍⴰⵎⵎⴰⵙⵜ' },
  current: { ar: 'الفترات غير المتاحة', en: 'Unavailable periods', fr: 'Périodes indisponibles', ber: 'ⵜⵉⵍⴰⵎⵎⴰⵙⵉⵏ ⵓⵔ ⵉⵍⵍⵉⵏ' },
  booked: { ar: 'حجز مؤكد', en: 'Confirmed booking', fr: 'Réservation confirmée', ber: 'ⴰⵙⵏⴷⵇ ⵉⵜⵜⵓⵙⵜⵉⵏ' },
  ownerBlock: { ar: 'مغلق من طرفك', en: 'Blocked by you', fr: 'Bloqué par vous', ber: 'ⵉⵜⵜⵓⵙⴱⴷⴷ ⵙⴳ ⴽⵢⵢ' },
  remove: { ar: 'إزالة الحظر', en: 'Remove block', fr: 'Retirer le blocage', ber: 'ⴽⴽⵙ ⴰⵙⴱⴷⴷ' },
  empty: { ar: 'لا توجد فترات محظورة لهذا النوع حالياً.', en: 'No blocked periods for this type yet.', fr: 'Aucune période bloquée pour ce type.', ber: 'ⵓⵍⴰⵛ ⵜⴰⵍⴰⵎⵎⴰⵙⵜ ⵉⵜⵜⵓⵙⴱⴷⴷⵏ.' },
  invalid: { ar: 'اختر مكاناً وتاريخ نهاية بعد تاريخ البداية.', en: 'Choose a listing and an end date after the start date.', fr: 'Choisissez un lieu et une date de fin après le début.', ber: 'ⵙⵜⵉ ⴰⵎⴽⴰⵏ ⴷ ⴰⵙⵙ ⵏ ⵜⴳⵔⴰ ⴷⴼⴼⵉⵔ ⵏ ⵓⵙⵙ ⵏ ⵓⵏⵣⵡⴰⵔ.' },
  saved: { ar: 'تم حظر الفترة بنجاح.', en: 'The period is now blocked.', fr: 'La période est maintenant bloquée.', ber: 'ⵜⴰⵍⴰⵎⵎⴰⵙⵜ ⵜⴻⵜⵜⵓⵙⴱⴷⴷ.' },
  removed: { ar: 'تمت إزالة الحظر.', en: 'The block was removed.', fr: 'Le blocage a été retiré.', ber: 'ⵉⵜⵜⵓⴽⴽⵙ ⵓⵙⴱⴷⴷ.' },
  loading: { ar: 'جاري تحميل التقويم…', en: 'Loading calendar…', fr: 'Chargement du calendrier…', ber: 'ⵉⵜⵜⵓⵙⵎⵓⵜⵜⵉ ⵓⵙⴽⴰⵍⴰ…' },
};

export default function AvailabilityManager({ cars, hotels, bookings }: { cars: any[]; hotels: any[]; bookings: any[] }) {
  const { lang } = useLanguage();
  const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const l = (key: keyof typeof copy) => copy[key][lang as keyof typeof copy[typeof key]] || copy[key].en;
  const [type, setType] = useState<AvailabilityType>('car');
  const [itemId, setItemId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');
  const utils = trpc.useUtils();
  const blocksQuery = trpc.availability.myBlocks.useQuery(undefined, { retry: false });

  const items = useMemo(() => (type === 'car' ? cars : hotels).map((item) => ({
    id: item.id,
    name: lang === 'ar' ? item.nameAr : lang === 'fr' ? item.nameFr : lang === 'ber' ? item.nameBer : item.nameEn,
  })), [cars, hotels, lang, type]);

  useEffect(() => setItemId(''), [type]);

  const refreshAvailability = () => {
    utils.availability.myBlocks.invalidate();
    utils.availability.check.invalidate();
  };
  const createBlock = trpc.availability.createBlock.useMutation({
    onSuccess: () => {
      refreshAvailability();
      setStartsAt(''); setEndsAt(''); setReason('');
      toast.success(l('saved'));
    },
    onError: (error) => toast.error(l('invalid'), { description: error.message }),
  });
  const removeBlock = trpc.availability.removeBlock.useMutation({
    onSuccess: () => { refreshAvailability(); toast.success(l('removed')); },
    onError: (error) => toast.error(l('remove'), { description: error.message }),
  });

  const ownerBlocks = (blocksQuery.data || []).filter((block: any) => block.type === type);
  const confirmedBookings = (bookings || []).filter((booking: any) => booking.type === type && booking.status === 'confirmed');
  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const submit = () => {
    if (!itemId || !startsAt || !endsAt || endsAt <= startsAt) {
      toast.error(l('invalid'));
      return;
    }
    createBlock.mutate({ type, itemId: Number(itemId), startsAt, endsAt, reason: reason.trim() || undefined });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="rounded-2xl border border-[#c8a951]/30 bg-[#102f22]/80 p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#c8a951]/15 p-2.5"><CalendarDays className="h-5 w-5 text-[#c8a951]" /></div>
          <div>
            <h3 className="text-lg font-extrabold text-white">{l('title')}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/65">{l('intro')}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-white/5 p-1 text-sm font-bold">
          {(['car', 'hotel'] as AvailabilityType[]).map((nextType) => (
            <button key={nextType} onClick={() => setType(nextType)} className={`rounded-lg px-3 py-2.5 transition-colors ${type === nextType ? 'bg-[#c8a951] text-[#173c2b]' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
              {nextType === 'car' ? <Car className="me-1.5 inline h-4 w-4" /> : <Building2 className="me-1.5 inline h-4 w-4" />}{nextType === 'car' ? l('cars') : l('hotels')}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-white/75 sm:col-span-2">
            {l('chooseItem')}
            <select value={itemId} onChange={(event) => setItemId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-[#c8a951]/50 focus:ring-2">
              <option value="">{l('chooseItem')}</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.name || `#${item.id}`}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-white/75">{l('start')}<input type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-[#c8a951]/50 focus:ring-2" /></label>
          <label className="text-xs font-semibold text-white/75">{l('end')}<input type="date" min={startsAt || undefined} value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-[#c8a951]/50 focus:ring-2" /></label>
          <label className="text-xs font-semibold text-white/75 sm:col-span-2 lg:col-span-3">{l('reason')}<input value={reason} maxLength={240} onChange={(event) => setReason(event.target.value)} placeholder={l('reasonPlaceholder')} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-[#c8a951]/50 focus:ring-2" /></label>
          <button onClick={submit} disabled={createBlock.isPending || items.length === 0} className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c8a951] px-4 py-2.5 text-sm font-extrabold text-[#173c2b] transition-colors hover:bg-[#d6bd70] disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" />{l('block')}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2 text-white"><Clock3 className="h-4 w-4 text-[#c8a951]" /><h3 className="font-bold">{l('current')}</h3></div>
        {blocksQuery.isLoading ? <p className="py-5 text-center text-sm text-white/60">{l('loading')}</p> : ownerBlocks.length === 0 && confirmedBookings.length === 0 ? <p className="py-5 text-center text-sm text-white/60">{l('empty')}</p> : (
          <div className="space-y-2">
            {ownerBlocks.map((block: any) => {
              const item = items.find((entry) => entry.id === block.itemId);
              return <div key={`block-${block.id}`} className="flex flex-col gap-2 rounded-xl border border-amber-300/20 bg-amber-500/10 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-amber-100">{item?.name || `#${block.itemId}`} <span className="ms-1 text-xs font-medium text-amber-200/75">· {l('ownerBlock')}</span></p><p className="mt-1 text-xs text-white/70">{formatDate(block.startsAt)} → {formatDate(block.endsAt)}{block.reason ? ` · ${block.reason}` : ''}</p></div><button onClick={() => removeBlock.mutate({ id: block.id })} disabled={removeBlock.isPending} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/25 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />{l('remove')}</button></div>;
            })}
            {confirmedBookings.map((booking: any) => {
              const item = items.find((entry) => entry.id === booking.itemId);
              return <div key={`booking-${booking.id}`} className="rounded-xl border border-emerald-300/15 bg-emerald-500/10 p-3"><p className="text-sm font-bold text-emerald-100">{item?.name || booking.itemName} <span className="ms-1 text-xs font-medium text-emerald-200/75">· {l('booked')}</span></p><p className="mt-1 text-xs text-white/70">{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</p></div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
