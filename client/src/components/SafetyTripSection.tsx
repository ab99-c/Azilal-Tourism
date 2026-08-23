import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, MapPin, ShieldCheck, Siren } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { isStaticHost } from '@/lib/utils';

type TripRecord = {
  publicToken: string;
  travelerName: string;
  route: string;
  expectedArrivalAt: string | Date;
  status: 'active' | 'safe' | 'overdue' | 'closed';
  lastCheckInAt?: string | Date | null;
  lastLocationLat?: string | null;
  lastLocationLng?: string | null;
};

const copy = {
  ar: {
    title: 'سافر بأمان في المسارات الجبلية', subtitle: 'سجّل رحلتك وخلي عندك تأكيد وصول واضح قبل ما تدخل للمناطق اللي ممكن ما فيهاش تغطية.', name: 'الاسم الكامل', email: 'الإيميل', route: 'المسار أو الوجهة', emergencyName: 'اسم جهة اتصال للطوارئ (اختياري)', emergencyPhone: 'هاتف جهة الاتصال (اختياري)', departure: 'وقت الانطلاق', arrival: 'الوقت المتوقع للوصول', location: 'أوافق على مشاركة آخر موقع أختار مشاركته', consent: 'أوافق على حفظ بيانات الرحلة واستعمالها فقط للسلامة والتواصل عند غياب تأكيد الوصول.', start: 'سجّل الرحلة', status: 'حالة الرحلة', checkIn: 'مازال فالطريق — حدّث الحالة', safe: 'وصلت بخير', active: 'الرحلة نشيطة', safeStatus: 'تم تأكيد الوصول', overdue: 'خاص تأكيد عاجل', static: 'نسخة Vercel خاصها ربط Backend باش التسجيل والتنبيهات يخدمو بشكل دائم.', safety: 'تنبيه: بعض المسارات الجبلية ما فيهاش تغطية. خبر شخصاً بوجهتك، وما تعرّضش حياتك للخطر.', saved: 'تم تسجيل الرحلة. احتافظ بالرابط أو رجع لها من نفس الجهاز.', required: 'عمّر المعلومات المطلوبة ووافق على الشروط.', error: 'وقع مشكل. عاود المحاولة من فضلك.'
  },
  en: {
    title: 'Travel safely on mountain routes', subtitle: 'Register your trip and keep a clear arrival check-in before entering areas with limited coverage.', name: 'Full name', email: 'Email', route: 'Route or destination', emergencyName: 'Emergency contact name (optional)', emergencyPhone: 'Emergency contact phone (optional)', departure: 'Departure time', arrival: 'Expected arrival', location: 'I agree to share the last location I explicitly choose to share', consent: 'I agree to store trip details only for safety and follow-up when arrival is not confirmed.', start: 'Register trip', status: 'Trip status', checkIn: 'Still travelling — check in', safe: 'I arrived safely', active: 'Trip active', safeStatus: 'Arrival confirmed', overdue: 'Urgent check-in needed', static: 'The Vercel version needs a connected backend for durable registration and alerts.', safety: 'Safety notice: some mountain routes have no coverage. Tell someone your destination and do not risk your life.', saved: 'Trip registered. Keep the link or return from this device.', required: 'Complete the required fields and accept the consent.', error: 'Something went wrong. Please try again.'
  },
  fr: {
    title: 'Voyagez en sécurité sur les routes de montagne', subtitle: 'Enregistrez votre trajet et confirmez votre arrivée avant d’entrer dans une zone sans réseau.', name: 'Nom complet', email: 'E-mail', route: 'Itinéraire ou destination', emergencyName: 'Nom du contact d’urgence (facultatif)', emergencyPhone: 'Téléphone du contact (facultatif)', departure: 'Départ', arrival: 'Arrivée prévue', location: 'J’accepte de partager le dernier emplacement que je choisis explicitement', consent: 'J’accepte de conserver les données du trajet uniquement pour la sécurité et le suivi.', start: 'Enregistrer le trajet', status: 'État du trajet', checkIn: 'Je continue — actualiser', safe: 'Je suis arrivé sain et sauf', active: 'Trajet actif', safeStatus: 'Arrivée confirmée', overdue: 'Confirmation urgente nécessaire', static: 'La version Vercel a besoin d’un backend connecté pour les alertes persistantes.', safety: 'Sécurité : certaines routes de montagne sont sans réseau. Prévenez un proche et ne prenez aucun risque.', saved: 'Trajet enregistré. Conservez le lien ou revenez depuis cet appareil.', required: 'Remplissez les champs requis et acceptez le consentement.', error: 'Une erreur est survenue. Réessayez.'
  },
  ber: {
    title: 'ⵙⵙⵉⵡⵍ ⵙ ⵓⵎⵏⵣⵓ ⴳ ⵉⵙⵏⵉⵔⴰⵏ', subtitle: 'ⵙⵏⵎⵍ ⴰⵙⵏⵙⵓ ⵏⵏⴽ ⵓ ⵙⵙⵏ ⵎⴰⵏⵉ ⵜⵙⵙⴰⵡⴹⴷ.', name: 'ⵉⵙⵎ ⵏⵏⴽ', email: 'ⵉⵎⵉⵍ', route: 'ⴰⵙⵏⵙⵓ ⵏⵖ ⵜⴰⵎⵏⴰⴹⵜ', emergencyName: 'ⵉⵙⵎ ⵏ ⵓⵎⵙⵙⵉⵡⴹ (ⵉⵙⵎⵔⴰⵙ)', emergencyPhone: 'ⵓⵟⵟⵓⵏ (ⵉⵙⵎⵔⴰⵙ)', departure: 'ⴰⵙⵙⴰⵔ', arrival: 'ⴰⵎⵎⴰⵙ ⵏ ⵜⵙⵙⴰⵡⴹⵜ', location: 'ⵔⵉⵖ ⴰⴷ ⵙⵙⵉⵡⵍⵖ ⵙ ⵓⵎⵏⵣⵓ ⵏ ⵓⵙⵏⵙⵓ', consent: 'ⵔⵉⵖ ⴰⴷ ⵜⵜⵓⵙⵏⴼⵍⵏ ⵉⵙⴼⴽⴰ ⵏ ⵓⵙⵏⵙⵓ ⵉ ⵜⵏⵎⵍⴰ ⵏ ⵜⵏⴼⵍⵜ.', start: 'ⵙⵏⵎⵍ ⴰⵙⵏⵙⵓ', status: 'ⴰⴷⵔⵉⵙ', checkIn: 'ⵎⵣⵣⵉⵢⵖ — ⵙⵙⵏⵎⵍ', safe: 'ⵙⵙⴰⵡⴹⵖ ⵙ ⵓⵎⵏⵣⵓ', active: 'ⴰⵙⵏⵙⵓ ⵉⵙⵙⵏ', safeStatus: 'ⵙⵙⵏ ⵏ ⵜⵙⵙⴰⵡⴹⵜ', overdue: 'ⵉⵙⵙⵏ ⵓⵔⵎⵉⵙ', static: 'ⵉⵙⵔⴰ Vercel ⵓⵙⵙⵔⵉ ⵏ Backend ⵉ ⵜⵏⵎⵍⴰ.', safety: 'ⵜⵏⴼⵍⵜ: ⵉⵙⵏⵉⵔⴰⵏ ⵓⵔ ⵙⵙⵏⵏ ⵔⵔⴰⴷ. ⵙⵙⵏ ⵉⵎⴷⵓⴽⴽⴰⵍ ⵎⴰⵏⵉ ⵜⵔⵉⴷ.', saved: 'ⵙⵏⵎⵍ ⵓⵙⵏⵙⵓ. ⵃⴼⴹ ⴰⵙⵏⵙⵓ.', required: 'ⵙⵙⵏⵎⵍ ⵉⵙⴼⴽⴰ ⵓ ⵇⴱⵍ ⵜⵏⵎⵍⴰ.', error: 'ⵉⵣⵔⵉ ⵓⵎⵣⵣⵓⵔ. ⵙⵙⵏⵎⵍ ⵜⵉⵙⵙⵉ.'
  }
} as const;

export default function SafetyTripSection() {
  const { lang } = useLanguage();
  const c = copy[lang];
  const [form, setForm] = useState({ name: '', email: '', route: '', emergencyName: '', emergencyPhone: '', departure: '', arrival: '', location: false, consent: false });
  const [trip, setTrip] = useState<TripRecord | null>(() => {
    try { const raw = localStorage.getItem('adrar-safety-trip'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [message, setMessage] = useState('');
  const createTrip = trpc.safetyTrips.create.useMutation({ onSuccess: (result) => { setTrip(result.trip as TripRecord); localStorage.setItem('adrar-safety-trip', JSON.stringify(result.trip)); setMessage(c.saved); }, onError: () => setMessage(c.error) });
  const checkIn = trpc.safetyTrips.checkIn.useMutation({ onSuccess: (result) => { setTrip(result as TripRecord); localStorage.setItem('adrar-safety-trip', JSON.stringify(result)); setMessage(''); }, onError: () => setMessage(c.error) });
  const markSafe = trpc.safetyTrips.markSafe.useMutation({ onSuccess: (result) => { setTrip(result as TripRecord); localStorage.setItem('adrar-safety-trip', JSON.stringify(result)); setMessage(''); }, onError: () => setMessage(c.error) });
  const dateMin = useMemo(() => new Date(Date.now() - 5 * 60_000).toISOString().slice(0, 16), []);

  const update = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const shareLocationAndCheckIn = () => {
    if (!trip) return;
    if (trip.status === 'safe' || !navigator.geolocation) return checkIn.mutate({ token: trip.publicToken });
    navigator.geolocation.getCurrentPosition(
      (position) => checkIn.mutate({ token: trip.publicToken, latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => checkIn.mutate({ token: trip.publicToken }),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8_000 },
    );
  };

  return <section id="safety-trip" className="py-16 px-4 bg-[#f0f4ec]" dir={lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr'}>
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#dceee4] px-4 py-2 text-[#176b4d] text-sm font-bold"><ShieldCheck className="w-4 h-4" /> ADRAR Safety</div>
        <h2 className="mt-4 text-3xl md:text-4xl font-black text-[#164b38]">{c.title}</h2>
        <p className="mt-3 text-[#5b6c63] max-w-2xl mx-auto">{c.subtitle}</p>
      </div>
      <div className="rounded-2xl border border-[#cfe0d3] bg-white p-4 md:p-7 shadow-sm mb-6 flex gap-3 items-start"><Siren className="w-5 h-5 text-[#bb6b2b] mt-0.5 shrink-0" /><p className="text-sm leading-7 text-[#5b554b]">{c.safety}</p></div>
      {isStaticHost() && <div className="rounded-xl bg-[#fff5df] border border-[#ead39f] px-4 py-3 text-sm text-[#7a5d1d] mb-6">{c.static}</div>}
      {!trip ? <form onSubmit={(event) => { event.preventDefault(); if (!form.name || !form.email || !form.route || !form.departure || !form.arrival || !form.consent) return setMessage(c.required); createTrip.mutate({ travelerName: form.name, travelerEmail: form.email, route: form.route, emergencyName: form.emergencyName || undefined, emergencyPhone: form.emergencyPhone || undefined, departureAt: new Date(form.departure), expectedArrivalAt: new Date(form.arrival), locationConsent: form.location, consentAccepted: true }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-white p-4 md:p-7 shadow-sm border border-[#e0e8df]">
        {([['name', c.name], ['email', c.email], ['route', c.route], ['emergencyName', c.emergencyName], ['emergencyPhone', c.emergencyPhone]] as const).map(([key, label]) => <label key={key} className={`grid gap-1.5 text-sm font-bold text-[#315443] ${key === 'route' ? 'md:col-span-2' : ''}`}>{label}<input required={key === 'name' || key === 'email' || key === 'route'} type={key === 'email' ? 'email' : 'text'} value={form[key]} onChange={(e) => update(key, e.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2c8b62] font-normal" /></label>)}
        <label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.departure}<input required type="datetime-local" min={dateMin} value={form.departure} onChange={(e) => update('departure', e.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal" /></label>
        <label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.arrival}<input required type="datetime-local" min={dateMin} value={form.arrival} onChange={(e) => update('arrival', e.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal" /></label>
        <label className="md:col-span-2 flex gap-3 items-start text-sm text-[#4c6154]"><input type="checkbox" checked={form.location} onChange={(e) => update('location', e.target.checked)} className="mt-1 accent-[#176b4d]" />{c.location}</label>
        <label className="md:col-span-2 flex gap-3 items-start text-sm text-[#4c6154]"><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 accent-[#176b4d]" />{c.consent}</label>
        <button disabled={createTrip.isPending} className="md:col-span-2 rounded-xl bg-[#176b4d] text-white py-3 font-bold hover:bg-[#125b40] disabled:opacity-60">{createTrip.isPending ? '…' : c.start}</button>
      </form> : <div className="rounded-2xl bg-white p-5 md:p-7 border border-[#d6e4d8] shadow-sm"><div className="flex flex-wrap justify-between gap-3 items-center"><div><p className="text-sm text-[#6a786e]">{c.status}</p><h3 className="text-2xl font-black text-[#164b38]">{trip.status === 'safe' ? c.safeStatus : trip.status === 'overdue' ? c.overdue : c.active}</h3><p className="mt-2 text-[#56665d] flex items-center gap-2"><MapPin className="w-4 h-4" />{trip.route}</p></div><Clock3 className="w-10 h-10 text-[#c39143]" /></div><div className="mt-6 flex flex-wrap gap-3"><button disabled={trip.status === 'safe' || checkIn.isPending} onClick={shareLocationAndCheckIn} className="rounded-xl bg-[#2c8b62] text-white px-4 py-3 font-bold disabled:opacity-50">{c.checkIn}</button><button disabled={trip.status === 'safe' || markSafe.isPending} onClick={() => markSafe.mutate({ token: trip.publicToken })} className="rounded-xl bg-[#c39143] text-white px-4 py-3 font-bold disabled:opacity-50"><CheckCircle2 className="inline w-4 h-4 mr-1" />{c.safe}</button></div>{trip.lastLocationLat && trip.lastLocationLng && <p className="mt-4 text-xs text-[#68786d]">Last location shared with consent: {trip.lastLocationLat}, {trip.lastLocationLng}</p>}</div>}
      {message && <p role="status" className="mt-4 text-center text-sm font-bold text-[#7a5d1d]">{message}</p>}
    </div>
  </section>;
}
