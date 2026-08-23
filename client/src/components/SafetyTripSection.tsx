import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, MapPin, ShieldCheck, Siren } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

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

type FormState = {
  name: string;
  email: string;
  route: string;
  emergencyName: string;
  emergencyPhone: string;
  departure: string;
  arrival: string;
  location: boolean;
  consent: boolean;
};

const copy = {
  ar: {
    title: 'سافر بأمان في المسارات الجبلية',
    noticeTitle: 'قبل ما تسجل الرحلة',
    noticeContinue: 'فهمت، نكمل التسجيل',
    subtitle: 'سجّل رحلتك وخلي عندك تأكيد وصول واضح قبل ما تدخل للمناطق اللي ممكن ما فيهاش تغطية.',
    name: 'الاسم الكامل',
    email: 'الإيميل',
    route: 'المسار أو الوجهة',
    emergencyName: 'اسم جهة اتصال للطوارئ (اختياري)',
    emergencyPhone: 'رقم شخص للطوارئ',
    departure: 'وقت الانطلاق',
    arrival: 'الوقت المتوقع للوصول',
    location: 'أوافق على مشاركة آخر موقع أختار مشاركته',
    consent: 'أوافق على حفظ بيانات الرحلة واستعمالها فقط للسلامة والتواصل عند غياب تأكيد الوصول.',
    start: 'سجّل الرحلة',
    status: 'حالة الرحلة',
    checkIn: 'مازال فالطريق — حدّث الحالة',
    safe: 'وصلت بخير',
    active: 'الرحلة نشيطة',
    safeStatus: 'تم تأكيد الوصول',
    overdue: 'خاص تأكيد عاجل',
    safety: 'تنبيه: بعض المسارات الجبلية ما فيهاش تغطية. خبر شخصاً بوجهتك، وما تعرّضش حياتك للخطر.',
    tracking: 'إلى سجلتي الرحلة ووافقتي، ADRAR كتحتافظ بالمسار ووقت الوصول وكتحدّث غير آخر موقع كتشاركو أنت. ماشي تتبع مباشر وما كنعوضوش خدمات الإنقاذ.',
    saved: 'تم تسجيل الرحلة. احتافظ بالرابط أو رجع لها من نفس الجهاز.',
    required: 'عمّر المعلومات المطلوبة، زيد رقم شخص للطوارئ، ووافق على الشروط.',
    error: 'وقع مشكل. عاود المحاولة من فضلك.',
  },
  en: {
    title: 'Travel safely on mountain routes',
    noticeTitle: 'Before registering your trip',
    noticeContinue: 'I understand, continue',
    subtitle: 'Register your trip and keep a clear arrival check-in before entering areas with limited coverage.',
    name: 'Full name',
    email: 'Email',
    route: 'Route or destination',
    emergencyName: 'Emergency contact name (optional)',
    emergencyPhone: 'Emergency contact phone number',
    departure: 'Departure time',
    arrival: 'Expected arrival',
    location: 'I agree to share the last location I explicitly choose to share',
    consent: 'I agree to store trip details only for safety and follow-up when arrival is not confirmed.',
    start: 'Register trip',
    status: 'Trip status',
    checkIn: 'Still travelling — check in',
    safe: 'I arrived safely',
    active: 'Trip active',
    safeStatus: 'Arrival confirmed',
    overdue: 'Urgent check-in needed',
    safety: 'Safety notice: some mountain routes have no coverage. Tell someone your destination and do not risk your life.',
    tracking: 'With your consent, ADRAR stores the route and arrival time and updates only the last location you explicitly share. This is not live tracking and does not replace rescue services.',
    saved: 'Trip registered. Keep the link or return from this device.',
    required: 'Complete the required fields, add an emergency contact number, and accept the consent.',
    error: 'Something went wrong. Please try again.',
  },
  fr: {
    title: 'Voyagez en sécurité sur les routes de montagne',
    noticeTitle: 'Avant d’enregistrer votre trajet',
    noticeContinue: 'J’ai compris, continuer',
    subtitle: 'Enregistrez votre trajet et confirmez votre arrivée avant d’entrer dans une zone sans réseau.',
    name: 'Nom complet',
    email: 'E-mail',
    route: 'Itinéraire ou destination',
    emergencyName: 'Nom du contact d’urgence (facultatif)',
    emergencyPhone: 'Numéro du contact d’urgence',
    departure: 'Départ',
    arrival: 'Arrivée prévue',
    location: 'J’accepte de partager le dernier emplacement que je choisis explicitement',
    consent: 'J’accepte de conserver les données du trajet uniquement pour la sécurité et le suivi.',
    start: 'Enregistrer le trajet',
    status: 'État du trajet',
    checkIn: 'Je continue — actualiser',
    safe: 'Je suis arrivé sain et sauf',
    active: 'Trajet actif',
    safeStatus: 'Arrivée confirmée',
    overdue: 'Confirmation urgente nécessaire',
    safety: 'Sécurité : certaines routes de montagne sont sans réseau. Prévenez un proche et ne prenez aucun risque.',
    tracking: 'Avec votre consentement, ADRAR conserve l’itinéraire et l’heure d’arrivée et actualise uniquement le dernier emplacement que vous partagez. Ce n’est pas un suivi en direct et cela ne remplace pas les secours.',
    saved: 'Trajet enregistré. Conservez le lien ou revenez depuis cet appareil.',
    required: 'Remplissez les champs requis, ajoutez un numéro d’urgence et acceptez le consentement.',
    error: 'Une erreur est survenue. Réessayez.',
  },
  ber: {
    title: 'ⵙⵙⵉⵡⵍ ⵙ ⵓⵎⵏⵣⵓ ⴳ ⵉⵙⵏⵉⵔⴰⵏ',
    noticeTitle: 'ⵣⵔⵉ ⵙ ⵓⵎⵏⵣⵓ ⵏ ⵓⵙⵏⵙⵓ',
    noticeContinue: 'ⵙⵙⵏⵖ، ⵙⵙⵔⵙ',
    subtitle: 'ⵙⵏⵎⵍ ⴰⵙⵏⵙⵓ ⵏⵏⴽ ⵓ ⵙⵙⵏ ⵎⴰⵏⵉ ⵜⵙⵙⴰⵡⴹⴷ.',
    name: 'ⵉⵙⵎ ⵏⵏⴽ',
    email: 'ⵉⵎⵉⵍ',
    route: 'ⴰⵙⵏⵙⵓ ⵏⵖ ⵜⴰⵎⵏⴰⴹⵜ',
    emergencyName: 'ⵉⵙⵎ ⵏ ⵓⵎⵙⵙⵉⵡⴹ (ⵉⵙⵎⵔⴰⵙ)',
    emergencyPhone: 'ⵓⵟⵟⵓⵏ ⵏ ⵓⵎⵙⵙⵉⵡⴹ',
    departure: 'ⴰⵙⵙⴰⵔ',
    arrival: 'ⴰⵎⵎⴰⵙ ⵏ ⵜⵙⵙⴰⵡⴹⵜ',
    location: 'ⵔⵉⵖ ⴰⴷ ⵙⵙⵉⵡⵍⵖ ⵙ ⵓⵎⵏⵣⵓ ⵏ ⵓⵙⵏⵙⵓ',
    consent: 'ⵔⵉⵖ ⴰⴷ ⵜⵜⵓⵙⵏⴼⵍⵏ ⵉⵙⴼⴽⴰ ⵏ ⵓⵙⵏⵙⵓ ⵉ ⵜⵏⵎⵍⴰ ⵏ ⵜⵏⴼⵍⵜ.',
    start: 'ⵙⵏⵎⵍ ⴰⵙⵏⵙⵓ',
    status: 'ⴰⴷⵔⵉⵙ',
    checkIn: 'ⵎⵣⵣⵉⵢⵖ — ⵙⵙⵏⵎⵍ',
    safe: 'ⵙⵙⴰⵡⴹⵖ ⵙ ⵓⵎⵏⵣⵓ',
    active: 'ⴰⵙⵏⵙⵓ ⵉⵙⵙⵏ',
    safeStatus: 'ⵙⵙⵏ ⵏ ⵜⵙⵙⴰⵡⴹⵜ',
    overdue: 'ⵉⵙⵙⵏ ⵓⵔⵎⵉⵙ',
    safety: 'ⵜⵏⴼⵍⵜ: ⵉⵙⵏⵉⵔⴰⵏ ⵓⵔ ⵙⵙⵏⵏ ⵔⵔⴰⴷ. ⵙⵙⵏ ⵉⵎⴷⵓⴽⴽⴰⵍ ⵎⴰⵏⵉ ⵜⵔⵉⴷ.',
    tracking: 'ⵙ ⵓⵙⵙⵏⵣⵉ ⵏⵏⴽ، ADRAR ⵜⵃⴼⴹ ⴰⵙⵏⵙⵓ ⵓ ⵓⵙⵙⴰⵔ ⵏ ⵜⵙⵙⴰⵡⴹⵜ، ⵜⵙⵙⵏ ⴽⴰ ⴰⵎⵏⵣⵓ ⵏ ⵓⵙⵏⵙⵓ ⵉ ⵜⵙⵙⵉⵡⵍⴷ. ⵓⵔ ⵉⵍⵉ ⵓⵙⵙⵏⵣⵉ ⵙ ⵓⵎⵏⵣⵓ.',
    saved: 'ⵙⵏⵎⵍ ⵓⵙⵏⵙⵓ. ⵃⴼⴹ ⴰⵙⵏⵙⵓ.',
    required: 'ⵙⵙⵏⵎⵍ ⵉⵙⴼⴽⴰ، ⵔⵏⵓ ⵓⵟⵟⵓⵏ ⵏ ⵓⵎⵙⵙⵉⵡⴹ، ⵓ ⵇⴱⵍ ⵜⵏⵎⵍⴰ.',
    error: 'ⵉⵣⵔⵉ ⵓⵎⵣⵣⵓⵔ. ⵙⵙⵏⵎⵍ ⵜⵉⵙⵙⵉ.',
  },
} as const;

export default function SafetyTripSection() {
  const { lang } = useLanguage();
  const c = copy[lang];
  const [showTripForm, setShowTripForm] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    route: '',
    emergencyName: '',
    emergencyPhone: '',
    departure: '',
    arrival: '',
    location: false,
    consent: false,
  });
  const [trip, setTrip] = useState<TripRecord | null>(() => {
    try {
      const raw = localStorage.getItem('adrar-safety-trip');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [message, setMessage] = useState('');
  const createTrip = trpc.safetyTrips.create.useMutation({
    onSuccess: (result) => {
      setTrip(result.trip as TripRecord);
      localStorage.setItem('adrar-safety-trip', JSON.stringify(result.trip));
      setMessage(c.saved);
    },
    onError: () => setMessage(c.error),
  });
  const checkIn = trpc.safetyTrips.checkIn.useMutation({
    onSuccess: (result) => {
      setTrip(result as TripRecord);
      localStorage.setItem('adrar-safety-trip', JSON.stringify(result));
      setMessage('');
    },
    onError: () => setMessage(c.error),
  });
  const markSafe = trpc.safetyTrips.markSafe.useMutation({
    onSuccess: (result) => {
      setTrip(result as TripRecord);
      localStorage.setItem('adrar-safety-trip', JSON.stringify(result));
      setMessage('');
    },
    onError: () => setMessage(c.error),
  });
  const dateMin = useMemo(() => new Date(Date.now() - 5 * 60_000).toISOString().slice(0, 16), []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const shareLocationAndCheckIn = () => {
    if (!trip || trip.status === 'safe') return;
    if (!navigator.geolocation) {
      checkIn.mutate({ token: trip.publicToken });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => checkIn.mutate({ token: trip.publicToken, latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => checkIn.mutate({ token: trip.publicToken }),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8_000 },
    );
  };

  const fieldDefinitions = [
    ['name', c.name, 'text'],
    ['email', c.email, 'email'],
    ['route', c.route, 'text'],
    ['emergencyName', c.emergencyName, 'text'],
    ['emergencyPhone', c.emergencyPhone, 'tel'],
  ] as const;

  return (
    <section id="safety-trip" className="mt-14 border-t border-[#dce8dd] pt-14" dir={lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#dceee4] px-4 py-2 text-sm font-bold text-[#176b4d]"><ShieldCheck className="h-4 w-4" /> ADRAR Safety</div>
          <h2 className="mt-4 text-3xl font-black text-[#164b38] md:text-4xl">{c.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#5b6c63]">{c.subtitle}</p>
        </div>


        {!trip && !showTripForm && (
          <div className="rounded-2xl border border-[#ead39f] bg-[#fff8e8] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Siren className="mt-1 h-5 w-5 shrink-0 text-[#bb6b2b]" />
              <div>
                <h3 className="font-black text-[#6f541e]">{c.noticeTitle}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5b554b]">{c.safety}</p>
                <p className="mt-2 text-sm leading-7 text-[#5b554b]">{c.tracking}</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowTripForm(true)} className="mt-5 w-full rounded-xl bg-[#176b4d] px-4 py-3 font-bold text-white transition hover:bg-[#125b40] focus:outline-none focus:ring-4 focus:ring-[#176b4d]/30">{c.noticeContinue}</button>
          </div>
        )}

        {!trip && showTripForm && (
          <form onSubmit={(event) => {
            event.preventDefault();
            if (!form.name || !form.email || !form.route || !form.emergencyPhone || !form.departure || !form.arrival || !form.consent) {
              setMessage(c.required);
              return;
            }
            createTrip.mutate({
              travelerName: form.name,
              travelerEmail: form.email,
              route: form.route,
              emergencyName: form.emergencyName || undefined,
              emergencyPhone: form.emergencyPhone,
              departureAt: new Date(form.departure),
              expectedArrivalAt: new Date(form.arrival),
              locationConsent: form.location,
              consentAccepted: true,
            });
          }} className="grid grid-cols-1 gap-4 rounded-2xl border border-[#e0e8df] bg-white p-4 shadow-sm md:grid-cols-2 md:p-7">
            {fieldDefinitions.map(([key, label, type]) => (
              <label key={key} className={`grid gap-1.5 text-sm font-bold text-[#315443] ${key === 'route' ? 'md:col-span-2' : ''}`}>
                {label}
                <input required={key === 'name' || key === 'email' || key === 'route' || key === 'emergencyPhone'} type={type} value={form[key]} onChange={(event) => update(key, event.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]" />
              </label>
            ))}
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.departure}<input required type="datetime-local" min={dateMin} value={form.departure} onChange={(event) => update('departure', event.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal" /></label>
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.arrival}<input required type="datetime-local" min={dateMin} value={form.arrival} onChange={(event) => update('arrival', event.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal" /></label>
            <label className="flex items-start gap-3 text-sm text-[#4c6154] md:col-span-2"><input type="checkbox" checked={form.location} onChange={(event) => update('location', event.target.checked)} className="mt-1 accent-[#176b4d]" />{c.location}</label>
            <label className="flex items-start gap-3 text-sm text-[#4c6154] md:col-span-2"><input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} className="mt-1 accent-[#176b4d]" />{c.consent}</label>
            <button disabled={createTrip.isPending} className="rounded-xl bg-[#176b4d] py-3 font-bold text-white hover:bg-[#125b40] disabled:opacity-60 md:col-span-2">{createTrip.isPending ? '…' : c.start}</button>
          </form>
        )}

        {trip && <div className="rounded-2xl border border-[#d6e4d8] bg-white p-5 shadow-sm md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-[#6a786e]">{c.status}</p><h3 className="text-2xl font-black text-[#164b38]">{trip.status === 'safe' ? c.safeStatus : trip.status === 'overdue' ? c.overdue : c.active}</h3><p className="mt-2 flex items-center gap-2 text-[#56665d]"><MapPin className="h-4 w-4" />{trip.route}</p></div><Clock3 className="h-10 w-10 text-[#c39143]" /></div><div className="mt-6 flex flex-wrap gap-3"><button disabled={trip.status === 'safe' || checkIn.isPending} onClick={shareLocationAndCheckIn} className="rounded-xl bg-[#2c8b62] px-4 py-3 font-bold text-white disabled:opacity-50">{c.checkIn}</button><button disabled={trip.status === 'safe' || markSafe.isPending} onClick={() => markSafe.mutate({ token: trip.publicToken })} className="rounded-xl bg-[#c39143] px-4 py-3 font-bold text-white disabled:opacity-50"><CheckCircle2 className="mr-1 inline h-4 w-4" />{c.safe}</button></div>{trip.lastLocationLat && trip.lastLocationLng && <p className="mt-4 text-xs text-[#68786d]">Last location shared with consent: {trip.lastLocationLat}, {trip.lastLocationLng}</p>}</div>}
        {message && <p role="status" className="mt-4 text-center text-sm font-bold text-[#7a5d1d]">{message}</p>}
      </div>
    </section>
  );
}
