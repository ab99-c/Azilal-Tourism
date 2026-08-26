import { CheckCircle2, Download, Trash2, WifiOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage, type Lang } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'adrar-mountain-activities-offline-v1';

type ActivityGuide = {
  title: string;
  summary: string;
  safety: string;
};

type EmergencyContact = {
  number: string;
  label: Record<Lang, string>;
};

type TrailPoint = {
  id: string;
  lat: number;
  lng: number;
  name: Record<Lang, string>;
  category: 'nature' | 'adventure';
};

type OfflineSnapshot = {
  version: 1;
  savedAt: string;
  activities: Record<Lang, ActivityGuide[]>;
  emergencyContacts: EmergencyContact[];
  trailPoints: TrailPoint[];
};

const trailPoints: TrailPoint[] = [
  { id: 'bin-el-ouidane', lat: 32.2853, lng: -6.6106, category: 'nature', name: { ar: 'بحيرة بين الويدان', en: 'Bin el Ouidane Lake', fr: 'Lac de Bin el Ouidane', ber: 'ⴰⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ' } },
  { id: 'tisnirt', lat: 32.1287, lng: -6.7736, category: 'nature', name: { ar: 'شلالات تيسنيرت', en: 'Tisnirt Waterfalls', fr: 'Cascades de Tisnirt', ber: 'ⵉⵔⵣⵣⵉⵜⵏ ⵏ ⵜⵉⵙⵏⵉⵔⵜ' } },
  { id: 'high-atlas-peak', lat: 32.35, lng: -6.48, category: 'adventure', name: { ar: 'قمم الأطلس الكبير', en: 'High Atlas Peaks', fr: 'Sommets du Haut Atlas', ber: 'ⵉⵡⴷⵉⵡⵏ ⵏ ⵓⵟⵍⴰⵙ' } },
];

const emergencyContacts: EmergencyContact[] = [
  { number: '141', label: { ar: 'الطوارئ الطبية', en: 'Emergency medical services', fr: 'Urgences médicales', ber: 'ⵜⵉⵏⵎⵍ ⵜⴰⵙⵏⴰⵎⵜ' } },
  { number: '150', label: { ar: 'الوقاية المدنية والإسعاف والإطفاء', en: 'Civil Protection, ambulance and fire', fr: 'Protection civile, ambulance et incendie', ber: 'ⵜⴰⵏⴼⵍⵜ ⵜⴰⵎⴰⵙⵙⵜ، ⴰⵙⵙⵉⵔⵉ ⴷ ⵓⵙⵙⵉⵔ' } },
  { number: '177', label: { ar: 'الدرك الملكي — الطرق والمناطق القروية', en: 'Royal Gendarmerie — rural and mountain roads', fr: 'Gendarmerie royale — routes rurales et montagne', ber: 'ⴰⵙⵏⴰⵎ ⴰⵎⵔⵔⵓⵙ — ⵉⵙⵏⵉⵔⴰⵏ ⴷ ⵜⵉⵔⵔⴰ' } },
  { number: '190', label: { ar: 'الشرطة', en: 'Police', fr: 'Police', ber: 'ⵙⵙⵓⵔⵜⴰ' } },
];

const emergencyCopy = {
  ar: { title: 'أرقام الطوارئ والإنقاذ', note: 'احفظ هذه الأرقام قبل الانطلاق. قد تختلف إمكانية الاتصال بحسب الشبكة والمكان، وهذه الأرقام لا تغني عن إخبار شخص بوجهتك.', call: 'اتصال' },
  en: { title: 'Emergency and rescue contacts', note: 'Save these numbers before leaving. Calling may depend on network and location; also tell someone your destination.', call: 'Call' },
  fr: { title: 'Contacts d’urgence et de secours', note: 'Enregistrez ces numéros avant de partir. L’appel dépend du réseau et du lieu ; informez aussi un proche de votre destination.', call: 'Appeler' },
  ber: { title: 'ⵉⵙⵏⵙⴰ ⵏ ⵜⵏⴼⵍⵜ ⴷ ⵓⵙⵙⵉⵔ', note: 'ⵃⴼⴹ ⵉⵙⵏⵙⴰ ⴰⴷ ⵣⵔⵉⴷ. ⵉⵣⵎⵔ ⵓⵙⵙⵉⵡⵍ ⴰⴷ ⵉⵏⵙⵙ ⵙ ⵜⵉⵏⵎⵍ ⴷ ⵓⵙⵏⴰⵙ.', call: 'ⵙⵙⵉⵡⵍ' },
} as const;

const activities: Record<Lang, ActivityGuide[]> = {
  ar: [
    { title: 'السياحة الطبيعية', summary: 'استكشاف الشلالات والوديان والبحيرات والمسارات الطبيعية.', safety: 'تحقق من حالة الطقس، وأخبر شخصاً بوجهتك قبل الانطلاق.' },
    { title: 'المغامرات', summary: 'مسارات المشي والاستكشاف في تضاريس الأطلس.', safety: 'لا تسلك مساراً مجهولاً وحدك، واحمل ماءً ومصباحاً وبطارية إضافية.' },
    { title: 'الرياضات الجبلية', summary: 'أنشطة جبلية تحتاج إلى استعداد وتجهيز مناسبين.', safety: 'احترم حدودك، وتوقف عند سوء الطقس أو ضعف الرؤية.' },
  ],
  en: [
    { title: 'Nature tourism', summary: 'Explore waterfalls, valleys, lakes, and natural trails.', safety: 'Check the weather and tell someone your destination before leaving.' },
    { title: 'Adventure', summary: 'Hiking and exploration routes across the Atlas terrain.', safety: 'Do not take an unknown route alone; carry water, a light, and a spare battery.' },
    { title: 'Mountain sports', summary: 'Mountain activities that require suitable preparation and equipment.', safety: 'Respect your limits and stop when weather or visibility worsens.' },
  ],
  fr: [
    { title: 'Tourisme nature', summary: 'Découvrez les cascades, vallées, lacs et sentiers naturels.', safety: 'Vérifiez la météo et informez un proche de votre destination avant le départ.' },
    { title: 'Aventure', summary: 'Des itinéraires de randonnée et d’exploration dans l’Atlas.', safety: 'Ne partez pas seul sur un itinéraire inconnu ; prenez de l’eau, une lampe et une batterie de secours.' },
    { title: 'Sports de montagne', summary: 'Des activités qui demandent une préparation et un équipement adaptés.', safety: 'Respectez vos limites et arrêtez-vous si la météo ou la visibilité se dégrade.' },
  ],
  ber: [
    { title: 'ⵜⵓⵔⵉⵙⵎ ⵏ ⵜⵎⴰⵜⴰⵔⵜ', summary: 'ⵣⵔ ⵉⵔⵣⵣⵉⵜⵏ، ⵉⵡⴰⵍⵉⵡⵏ، ⵉⵖⵣⵔⴰⵏ ⴷ ⵉⵙⵏⵉⵔⴰⵏ.', safety: 'ⵙⵙⵏ ⴰⵙⵏⵙⵓ ⵏ ⵓⵙⵙⴰⵏ ⴷ ⵙⵙⵏ ⵎⴷⵏ ⵎⴰⵏⵉ ⵜⵔⵉⴷ ⴰⴷ ⵜⴷⴷⵓⴷ.' },
    { title: 'ⵜⵉⵎⵙⵙⵉⵔⵉⵏ', summary: 'ⵉⵙⵏⵉⵔⴰⵏ ⵏ ⵓⵙⵏⵙⵓ ⴷ ⵓⵙⵏⵓⴱⵔⵛ ⴳ ⵓⵟⵍⴰⵙ.', safety: 'ⵓⵔ ⵜⴷⴷⵓ ⵙ ⵓⵎⴰⵏ ⴳ ⵓⵙⵏⵙⵓ ⵓⵔ ⵜⵙⵙⵏⴷ; ⴰⵡⵉ ⴰⵎⴰⵏ ⴷ ⵜⴰⴼⴰⵡⵜ.' },
    { title: 'ⵉⵎⵙⵙⵓⵜⵉⵏ ⵏ ⵉⵙⵏⵉⵔⴰⵏ', summary: 'ⵉⵎⵙⵙⵓⵜⵉⵏ ⵉ ⵉⵙⵙⵏⵏ ⴰⵙⵏⵓⴱⴳ ⴷ ⵉⵙⴽⴽⵉⵍⵏ.', safety: 'ⵃⴼⴹ ⵉⵎⵉⵣⵣⴰⵏⵏ ⵏⵏⴽ ⴷ ⵃⴱⵙ ⵎⵉ ⵉⵙⵙⵏ ⵓⵙⵙⴰⵏ ⵏⵖ ⵜⵉⵔⴰ.' },
  ],
};

const copy = {
  ar: { title: 'حفظ أنشطة الجبال بلا إنترنت', description: 'احفظ هذا الدليل على جهازك قبل التوجه إلى منطقة قد تضعف فيها الشبكة.', save: 'حفظ الدليل على الجهاز', saved: 'الدليل محفوظ على هذا الجهاز', available: 'يمكنك الرجوع إلى هذه المعلومات عند انقطاع الإنترنت.', delete: 'حذف الدليل', privacy: 'هذه معلومات عامة عن الأنشطة، ولا تتضمن اسمك أو رقم هاتفك أو موقعك.', maps: 'تحميل نقاط المسارات', mapsSaved: 'حزمة المسارات محفوظة', mapsDescription: 'حمّل نقاطاً إرشادية بصيغة GPX لفتحها في تطبيق خرائط يدعم العمل دون اتصال.', mapsDisclaimer: 'هذه نقاط إرشادية وليست مساراً تفصيلياً أو بديلاً عن مرشد محلي أو التحقق من الطريق.' },
  en: { title: 'Save mountain activities offline', description: 'Save this guide before entering an area where coverage may be limited.', save: 'Save guide on this device', saved: 'Guide saved on this device', available: 'You can return to this information when offline.', delete: 'Delete guide', privacy: 'This is general activity information; it does not include your name, phone number, or location.', maps: 'Download trail points', mapsSaved: 'Trail pack saved', mapsDescription: 'Download GPX waypoints to open in an offline-capable mapping app.', mapsDisclaimer: 'These are waypoints, not a turn-by-turn trail or a substitute for a local guide and route check.' },
  fr: { title: 'Enregistrer les activités hors ligne', description: 'Enregistrez ce guide avant d’entrer dans une zone où le réseau peut être limité.', save: 'Enregistrer sur cet appareil', saved: 'Guide enregistré sur cet appareil', available: 'Vous pourrez consulter ces informations hors ligne.', delete: 'Supprimer le guide', privacy: 'Ces informations générales ne contiennent ni votre nom, ni votre numéro, ni votre position.', maps: 'Télécharger les points des sentiers', mapsSaved: 'Pack des sentiers enregistré', mapsDescription: 'Téléchargez les points GPX pour les ouvrir dans une application cartographique hors ligne.', mapsDisclaimer: 'Ces points sont indicatifs et ne remplacent ni un itinéraire détaillé ni un guide local.' },
  ber: { title: 'ⵃⴼⴹ ⵉⵎⵙⵙⵓⵜⵉⵏ ⵙ ⵓⵔ ⵜⵉⵏⵎⵍ', description: 'ⵃⴼⴹ ⴰⵎⵏⴰⵡ ⴰⴷ ⵏ ⵣⵔⵉ ⵙ ⵓⵔ ⵜⵉⵏⵎⵍ.', save: 'ⵃⴼⴹ ⴳ ⵓⵎⴰⵙⵙ', saved: 'ⵉⵜⵜⵓⵃⴼⴹ ⴳ ⵓⵎⴰⵙⵙ', available: 'ⵜⵣⵎⵔⴷ ⴰⴷ ⵜⵙⵙⵏⴷ ⵉⵙⴼⴽⴰ ⵙ ⵓⵔ ⵜⵉⵏⵎⵍ.', delete: 'ⴽⴽⵙ ⴰⵎⵏⴰⵡ', privacy: 'ⵉⵙⴼⴽⴰ ⴰⴷ ⵓⵔ ⵙⵙⵏⵏ ⵉⵙⵎ، ⵓⵟⵟⵓⵏ ⵏⵖ ⴰⵎⵏⵣⵓ.', maps: 'ⵙⵙⵉⵔⵉ ⵉⵙⵏⵉⵔⴰⵏ', mapsSaved: 'ⵉⵜⵜⵓⵃⴼⴹ ⵓⵎⵏⴰⵡ', mapsDescription: 'ⵙⵙⵉⵔⵉ ⵉⵙⴼⴽⴰ GPX ⵉ ⵓⵙⵏⵓⴱⵔⵛ ⵙ ⵓⵔ ⵜⵉⵏⵎⵍ.', mapsDisclaimer: 'ⵉⵙⵏⵉⵔⴰⵏ ⴰⴷ ⵉⵎⵙⵙⴰⵡⵏ, ⵓⵔ ⴽⴽⴰⵏ ⴰⵙⵓⵔⵙ ⵏ ⵓⵎⵏⵉⵔ.' },
};

export default function MountainActivitiesOfflineCard() {
  const { lang } = useLanguage();
  const [saved, setSaved] = useState<OfflineSnapshot | null>(null);
  const c = copy[lang];
  const direction = lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr';
  const currentActivities = useMemo(() => saved?.activities[lang] ?? activities[lang], [saved, lang]);
  const currentEmergencyContacts = saved?.emergencyContacts ?? emergencyContacts;
  const emergency = emergencyCopy[lang];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as OfflineSnapshot;
      if (parsed.version === 1 && parsed.activities && parsed.trailPoints) setSaved(parsed);
    } catch {
      setSaved(null);
    }
  }, []);

  const saveGuide = () => {
    const snapshot: OfflineSnapshot = { version: 1, savedAt: new Date().toISOString(), activities, emergencyContacts, trailPoints };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      setSaved(snapshot);
    } catch {
      setSaved(null);
    }
  };

  const deleteGuide = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
    setSaved(null);
  };

  const downloadTrailPack = () => {
    const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&apos;');
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="ADRAR" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>ADRAR mountain activity waypoints</name><desc>Reference waypoints from ADRAR. These are not turn-by-turn tracks.</desc></metadata>\n${trailPoints.map((point) => `  <wpt lat="${point.lat}" lon="${point.lng}"><name>${escapeXml(point.name.en)}</name><type>${point.category}</type></wpt>`).join('\\n')}\n</gpx>`;
    const snapshot: OfflineSnapshot = { version: 1, savedAt: new Date().toISOString(), activities, emergencyContacts, trailPoints };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      setSaved(snapshot);
    } catch { /* the file download can still work if storage is full */ }
    const url = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'adrar-mountain-waypoints.gpx';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-6 rounded-3xl border border-[#c8a951]/30 bg-[#fffdf4] p-5 shadow-sm sm:p-7" dir={direction} aria-labelledby="offline-activities-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${saved ? 'bg-[#1b5e3f] text-white' : 'bg-orange-100 text-orange-700'}`}>
            {saved ? <CheckCircle2 className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </span>
          <div>
            <h2 id="offline-activities-title" className="text-lg font-black text-[#163b2a]">{saved ? c.saved : c.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{saved ? c.available : c.description}</p>
          </div>
        </div>
        {saved ? (
          <button type="button" onClick={deleteGuide} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />{c.delete}
          </button>
        ) : (
          <button type="button" onClick={saveGuide} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b5e3f] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#164d34] focus:outline-none focus:ring-4 focus:ring-[#1b5e3f]/20">
            <Download className="h-4 w-4" />{c.save}
          </button>
        )}
      </div>
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/60 p-4">
        <div className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-red-700" aria-hidden="true" />
          <h3 className="font-black text-red-800">{emergency.title}</h3>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {currentEmergencyContacts.map((contact) => (
            <a key={contact.number} href={`tel:${contact.number}`} className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-white px-3 py-3 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-200" aria-label={`${contact.label[lang]}: ${contact.number}`}>
              <span className="text-sm font-bold text-red-900">{contact.label[lang]}</span>
              <span className="shrink-0 rounded-full bg-red-700 px-3 py-1 text-sm font-black text-white">{contact.number}</span>
            </a>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-red-800">{emergency.note}</p>
      </div>
      <div className="mt-5 rounded-2xl border border-[#1b5e3f]/15 bg-[#eef6f0] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-black text-[#1b5e3f]">{saved ? c.mapsSaved : c.maps}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{c.mapsDescription}</p>
          </div>
          <button type="button" onClick={downloadTrailPack} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1b5e3f] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#164d34] focus:outline-none focus:ring-4 focus:ring-[#1b5e3f]/20">
            <Download className="h-4 w-4" />{c.maps}
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#725b1d]">{c.mapsDisclaimer}</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {currentActivities.map((activity) => (
          <article key={activity.title} className="rounded-2xl border border-[#1b5e3f]/10 bg-white p-4">
            <h3 className="font-black text-[#1b5e3f]">{activity.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{activity.summary}</p>
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-semibold leading-5 text-[#725b1d]">{activity.safety}</p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{c.privacy}</p>
    </section>
  );
}

