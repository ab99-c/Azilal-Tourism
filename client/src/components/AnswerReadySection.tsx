import { useLanguage, type Lang } from '@/contexts/LanguageContext';

const copy: Record<Lang, { title: string; intro: string; items: Array<{ q: string; a: string }> }> = {
  ar: {
    title: 'إجابات سريعة عن زيارة أزيلال',
    intro: 'معلومات مختصرة تساعدك على التخطيط لزيارة أزيلال واكتشاف الأنشطة المتاحة في ADRAR.',
    items: [
      { q: 'ماذا يمكن اكتشافه في أزيلال؟', a: 'يمكن للزائر اكتشاف البحيرات والشلالات والقرى الجبلية والثقافة الأمازيغية، مع التحقق من الطقس وحالة الطريق قبل الانطلاق.' },
      { q: 'كيف أجد مكاناً للإقامة أو سيارة؟', a: 'استعمل البحث الموحد لاختيار الفنادق أو السيارات أو المطاعم أو المقاهي، ثم افتح صفحة التفاصيل للاطلاع على المعلومات المتاحة.' },
      { q: 'كيف أستعد لنشاط جبلي؟', a: 'احفظ دليل الأنشطة ونقاط المسارات قبل مغادرة منطقة التغطية، وأخبر شخصاً بوجهتك، واحمل الماء ومصباحاً وبطارية إضافية.' },
      { q: 'هل يمكن استعمال دليل الأنشطة دون إنترنت؟', a: 'نعم، يمكن حفظ الدليل ونقاط GPX على الجهاز مسبقاً. نقاط GPX إرشادية وليست مساراً تفصيلياً، لذلك ينبغي التحقق من الطريق والاستعانة بمرشد محلي.' },
    ],
  },
  en: {
    title: 'Quick answers about visiting Azilal',
    intro: 'Short, practical information for planning an Azilal visit and discovering ADRAR activities.',
    items: [
      { q: 'What can visitors discover in Azilal?', a: 'Visitors can explore lakes, waterfalls, mountain villages and Amazigh culture, while checking weather and road conditions before leaving.' },
      { q: 'How can I find accommodation or a car?', a: 'Use unified search to choose hotels, cars, restaurants or cafes, then open the detail page for the available information.' },
      { q: 'How should I prepare for a mountain activity?', a: 'Save the activity guide and trail points before leaving coverage, tell someone your destination, and carry water, a light and a spare battery.' },
      { q: 'Can the activity guide be used offline?', a: 'Yes. Save the guide and GPX points in advance. GPX points are reference waypoints, not turn-by-turn tracks, so check the route and consider a local guide.' },
    ],
  },
  fr: {
    title: 'Réponses rapides pour visiter Azilal',
    intro: 'Des informations pratiques pour préparer une visite d’Azilal et découvrir les activités d’ADRAR.',
    items: [
      { q: 'Que peut-on découvrir à Azilal ?', a: 'Les visiteurs peuvent découvrir des lacs, cascades, villages de montagne et la culture amazighe, en vérifiant la météo et l’état des routes.' },
      { q: 'Comment trouver un hébergement ou une voiture ?', a: 'Utilisez la recherche unifiée, puis ouvrez la page de détails pour consulter les informations disponibles.' },
      { q: 'Comment se préparer à une activité en montagne ?', a: 'Enregistrez le guide et les points des sentiers avant de quitter la couverture, informez un proche et prenez eau, lampe et batterie de secours.' },
      { q: 'Le guide est-il utilisable hors ligne ?', a: 'Oui, en enregistrant le guide et les points GPX. Ces points sont indicatifs et ne remplacent pas un itinéraire détaillé ni un guide local.' },
    ],
  },
  ber: {
    title: 'ⵉⵙⵙⵏⴰⵏ ⵉⵎⵣⵡⴰⵔⴰ ⵅⴼ ⵓⵣⵔⴼ ⵏ ⴰⵣⵉⵍⴰⵍ',
    intro: 'ⵉⵙⴼⴽⴰ ⵉⵎⵣⵡⴰⵔⴰ ⵉ ⵓⵙⵏⵓⴱⵔⵛ ⵏ ⵓⵣⵔⴼ ⴳ ⴰⵣⵉⵍⴰⵍ.',
    items: [
      { q: 'ⵎⴰⵏ ⵉⵙⴽⴽⴰ ⴰⴷ ⵜⵣⵔⵉⴷ ⴳ ⴰⵣⵉⵍⴰⵍ?', a: 'ⵜⵣⵎⵔⴷ ⴰⴷ ⵜⵣⵔⴷ ⵉⵖⵣⵔⴰⵏ، ⵉⵔⵣⵣⵉⵜⵏ، ⵉⵖⵔⵎⴰⵏ ⴷ ⵜⴰⵖⵍⵉⵜ ⵜⴰⵎⴰⵣⵉⵖⵜ.', },
      { q: 'ⵎⴰⵏ ⵉⵎⴽ ⴰⴷ ⵜⴰⴼⴷ ⴰⵎⵙⵙⴰ ⵏⵖ ⵜⴰⵔⵡⴰ?', a: 'ⵙⵙⵎⵔⵙ ⴰⵙⵏⵓⴱⵔⵛ ⴷ ⵙⵙⵏ ⵉⵙⴼⴽⴰ ⵏ ⵓⵎⵙⵙⴰⵡ.', },
      { q: 'ⵎⴰⵏ ⵉⵎⴽ ⴰⴷ ⵜⵙⵙⵏⴷ ⵉⵎⵙⵙⵓⵜⵉⵏ?', a: 'ⵃⴼⴹ ⴰⵎⵏⴰⵡ ⴷ ⵉⵙⵏⵉⵔⴰⵏ ⵙ ⵓⵔ ⵜⵉⵏⵎⵍ.', },
      { q: 'ⵉⵣⵎⵔ ⵓⵎⵏⴰⵡ ⴰⴷ ⵉⵙⵙⵏ ⵙ ⵓⵔ ⵜⵉⵏⵎⵍ?', a: 'ⵢⴰⵀ، ⵉⵙⵏⵉⵔⴰⵏ ⵙ GPX ⵙⵙⵏⴰⵏ ⵉⵎⵙⵙⴰⵡⵏ ⵎⴰⵛⵉ ⴰⵙⵓⵔⵙ ⵏ ⵓⵎⵏⵉⵔ.', },
    ],
  },
};

export default function AnswerReadySection() {
  const { lang } = useLanguage();
  const content = copy[lang];
  const direction = lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr';
  return (
    <section id="answers" dir={direction} className="bg-white py-16">
      <div className="container max-w-5xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wide text-[#b08d26]">ADRAR Guide</p>
          <h2 className="mt-2 text-3xl font-black text-[#1b5e3f]">{content.title}</h2>
          <p className="mt-3 text-lg leading-8 text-slate-600">{content.intro}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {content.items.map((item) => (
            <details key={item.q} className="rounded-2xl border border-[#dce8dd] bg-[#f8fbf8] p-5">
              <summary className="cursor-pointer font-black text-[#1b5e3f]">{item.q}</summary>
              <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
