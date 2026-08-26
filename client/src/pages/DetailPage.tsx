import { ArrowRight, CalendarDays, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const detailData = {
  lake: {
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663817279330/NToyBNlacJDpjOIV.jpg',
    ar: { title: 'بحيرة بين الويدان', location: 'إقليم أزيلال — الأطلس الكبير', description: 'بحيرة خلابة محاطة بجبال الأطلس والغابات، مناسبة لاستكشاف الطبيعة والأنشطة المائية والتخييم المسؤول.', facts: ['الطبيعة', 'الأنشطة المائية', 'التخييم المسؤول'] },
    en: { title: 'Bin el Ouidane Lake', location: 'Azilal Province — High Atlas', description: 'A scenic lake surrounded by Atlas Mountains and forests, suited to nature discovery, water activities and responsible camping.', facts: ['Nature', 'Water activities', 'Responsible camping'] },
    fr: { title: 'Lac de Bin el Ouidane', location: 'Province d’Azilal — Haut Atlas', description: 'Un lac entouré de montagnes et de forêts, idéal pour découvrir la nature, pratiquer des activités nautiques et camper de façon responsable.', facts: ['Nature', 'Activités nautiques', 'Camping responsable'] },
    ber: { title: 'ⴰⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ', location: 'ⵜⵎⵏⴰⴹⵜ ⵏ ⴰⵣⵉⵍⴰⵍ — ⴰⵟⵍⴰⵙ ⴰⵎⵇⵔⴰⵏ', description: 'ⴰⵖⵏⵛⴰⵡ ⵉⵎⵓⵍⵏ ⵙ ⵉⴷⵔⴰⵔⵏ ⴷ ⵉⵙⵏⴰⵏ ⵏ ⴰⵟⵍⴰⵙ.', facts: ['ⵜⴰⴷⴰⵍⵉⵜ', 'ⵜⵉⵔⴰⵔⵉⵏ ⵏ ⵡⴰⵎⴰⵏ', 'ⴰⵙⵏⵙⵓ ⴰⵎⵙⵙⴰⵏ'] },
  },
  waterfalls: {
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663817279330/YYvpyYbTLJRQRuNJ.jpg',
    ar: { title: 'شلالات تيسنيرت', location: 'أزيلال — وادي أزيلال', description: 'شلالات طبيعية ومسارات للمشي وسط الصخور والغابات. تحقق من الطقس وحالة الطريق قبل الانطلاق.', facts: ['مسارات طبيعية', 'تصوير الطبيعة', 'رحلة يومية'] },
    en: { title: 'Tisnirt Waterfalls', location: 'Azilal — Azilal Valley', description: 'Natural waterfalls and walking routes among rocks and forests. Check weather and road conditions before leaving.', facts: ['Nature trails', 'Nature photography', 'Day trip'] },
    fr: { title: 'Cascades de Tisnirt', location: 'Azilal — vallée d’Azilal', description: 'Des cascades naturelles et des sentiers entre rochers et forêts. Vérifiez la météo et l’état de la route avant le départ.', facts: ['Sentiers naturels', 'Photographie', 'Excursion à la journée'] },
    ber: { title: 'ⵉⵔⵣⵣⵉⵜⵏ ⵏ ⵜⵉⵙⵏⵉⵔⵜ', location: 'ⴰⵣⵉⵍⴰⵍ — ⴰⵡⴰⵍⵉ ⵏ ⴰⵣⵉⵍⴰⵍ', description: 'ⵉⵔⵣⵣⵉⵜⵏ ⴷ ⵉⵙⵏⵉⵔⴰⵏ ⵏ ⵓⵎⵏⵉⵔ. ⵙⵙⵉⵡⵍ ⵉ ⵡⴰⵙⵙ ⴷ ⵓⵙⵏⴰⵙ ⵏ ⵓⴱⵔⵉⴷ.', facts: ['ⵉⵙⵏⵉⵔⴰⵏ', 'ⵜⵉⵔⵔⴰ ⵏ ⵜⵎⵏⴰⴹⵜ', 'ⴰⵙⵏⵙⵓ ⵏ ⵡⴰⵙⵙ'] },
  },
  villages: {
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663817279330/KGpeWLOJRkcROyxb.jpg',
    ar: { title: 'قرى أيت بومهدى', location: 'أزيلال — القرى الجبلية', description: 'قرى أمازيغية تقليدية تتيح للزائر التعرف على العمارة والحرف والثقافة المحلية باحترام للمجتمع.', facts: ['ثقافة أمازيغية', 'حرف محلية', 'تجربة مجتمعية'] },
    en: { title: 'Ait Bouhaddou Villages', location: 'Azilal — mountain villages', description: 'Traditional Amazigh villages where visitors can discover architecture, crafts and local culture with respect for the community.', facts: ['Amazigh culture', 'Local crafts', 'Community experience'] },
    fr: { title: 'Villages d’Ait Bouhaddou', location: 'Azilal — villages de montagne', description: 'Des villages amazighs traditionnels pour découvrir architecture, artisanat et culture locale dans le respect de la communauté.', facts: ['Culture amazighe', 'Artisanat local', 'Expérience communautaire'] },
    ber: { title: 'ⵉⵖⵔⵎⴰⵏ ⵏ ⴰⵢⵜ ⴱⵓⵀⴷⴷⵓ', location: 'ⴰⵣⵉⵍⴰⵍ — ⵉⵖⵔⵎⴰⵏ ⵏ ⵉⴷⵔⴰⵔⵏ', description: 'ⵉⵖⵔⵎⴰⵏ ⵉⵎⴰⵣⵉⵖⵏ ⵉⵎⵓⵍⵏ ⵉ ⵜⵎⵙⵙⵉⵔⵜ ⴷ ⵜⵎⵏⴰⴹⵜ.', facts: ['ⵜⵉⵖⵔⵉ ⵜⴰⵎⴰⵣⵉⵖⵜ', 'ⵜⵉⵏⵎⵍⵉⵏ', 'ⵜⵉⵎⵙⵙⵉⵔⵜ'] },
  },
} as const;

type Slug = keyof typeof detailData;

const copy = {
  ar: { back: 'العودة إلى الرئيسية', label: 'تفاصيل الوجهة', plan: 'خطّط لزيارتك', contact: 'تواصل معنا', verified: 'معلومات تعريفية', note: 'تحقق من الطقس والطريق قبل الانطلاق. لا يوجد تقييم منشور لهذه الوجهة حالياً.' },
  en: { back: 'Back to home', label: 'Destination details', plan: 'Plan your visit', contact: 'Contact us', verified: 'Informational details', note: 'Check weather and road conditions before leaving. No public review is currently shown for this destination.' },
  fr: { back: 'Retour à l’accueil', label: 'Détails de la destination', plan: 'Planifier la visite', contact: 'Nous contacter', verified: 'Informations descriptives', note: 'Vérifiez la météo et l’état de la route avant le départ. Aucun avis public n’est affiché actuellement.' },
  ber: { back: 'ⵓⵖⴰⵍ ⵙ ⵓⵙⵏⵓⴱⵔⵛ', label: 'ⵉⵙⴼⴽⴰ ⵏ ⵓⵎⵙⵙⴰⵡ', plan: 'ⵙⵙⵏⵓⴱⵔⵛ ⵜⵉⵔⴰ', contact: 'ⵙⵙⵉⵡⵍ ⴰⵏⵖ', verified: 'ⵉⵙⴼⴽⴰ ⵏ ⵜⵎⵙⵙⵉⵔⵜ', note: 'ⵙⵙⵉⵡⵍ ⵉ ⵡⴰⵙⵙ ⴷ ⵓⴱⵔⵉⴷ. ⵓⵔ ⵍⵍⵉⵏ ⵉⵙⵡⵓⴷⴷⵓⵏ ⵏ ⵓⵎⵙⵙⴰⵡ ⵖⵉⵍⴰⴷ.' },
} as const;

export default function DetailPage() {
  const { lang } = useLanguage();
  const params = new URLSearchParams(window.location.search);
  const slug = (params.get('slug') as Slug) || 'lake';
  const item = detailData[slug] ?? detailData.lake;
  const text = item[lang];
  const t = copy[lang];
  const direction = lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr';

  return (
    <main dir={direction} className="min-h-screen bg-[#f5f5f0] pb-16 text-slate-900">
      <div className="container pt-6">
        <a href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1b5e3f] shadow-sm hover:bg-[#eef6f0]">
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />{t.back}
        </a>
        <div className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-xl">
          <div className="relative h-72 md:h-[28rem]">
            <img src={item.image} alt={text.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-6 start-6 end-6 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1b5e3f]"><MapPin className="h-3.5 w-3.5" />{text.location}</span>
              <h1 className="mt-3 text-3xl font-black md:text-5xl">{text.title}</h1>
            </div>
          </div>
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_20rem] md:p-10">
            <section>
              <div className="flex items-center gap-2 text-sm font-bold text-[#1b5e3f]"><ShieldCheck className="h-4 w-4" />{t.verified}</div>
              <p className="mt-4 text-lg leading-8 text-slate-600">{text.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">{text.facts.map((fact) => <span key={fact} className="rounded-full bg-[#eef6f0] px-3 py-2 text-sm font-bold text-[#1b5e3f]">{fact}</span>)}</div>
              <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">{t.note}</p>
            </section>
            <aside className="rounded-2xl bg-[#f7faf7] p-5">
              <h2 className="text-lg font-black text-[#1b5e3f]">{t.plan}</h2>
              <a href="/visitor-planning" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#1b5e3f] px-4 py-3 font-bold text-white hover:bg-[#0f3d28]"><CalendarDays className="h-4 w-4" />{t.plan}</a>
              <a href="/#contact" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#1b5e3f]/20 px-4 py-3 font-bold text-[#1b5e3f] hover:bg-white"><PhoneCall className="h-4 w-4" />{t.contact}</a>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
