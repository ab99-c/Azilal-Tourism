import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Clock, Wifi, Coffee } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const fallbackCafes = [
  {
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
    name: {
      ar: 'مقهى الأطلس',
      en: 'Atlas Café',
      fr: 'Café Atlas',
      ber: 'ⴰⵇⵀⵡⴰ ⵏ ⴰⵟⵍⴰⵙ',
    },
    desc: {
      ar: 'مقهى عصري يقدم أفضل أنواع القهوة المغربية مع حلويات محلية وشاي بالنعناع',
      en: 'Modern café serving the finest Moroccan coffee with local pastries and mint tea',
      fr: 'Café moderne servant les meilleurs cafés marocains avec pâtisseries locales et thé à la menthe',
      ber: 'ⴰⵇⵀⵡⴰ ⵉⵜⵜⵔⵣⵢⵏ ⵙ ⵜⴰⵇⵀⵡⴰ ⵜⴰⵎⴰⵖⵔⵉⴱⵉⵜ',
    },
    location: {
      ar: 'وسط مدينة أزيلال',
      en: 'Azilal City Center',
      fr: 'Centre-ville Azilal',
      ber: 'ⵜⴰⵎⴷⵉⵏⵜ ⵏ ⴰⵣⵉⵍⴰⵍ',
    },
    rating: 4.6,
    hours: '7:00 - 23:00',
    hasWifi: true,
    specialty: { ar: 'شاي بالنعناع', en: 'Mint Tea', fr: 'Thé à la Menthe', ber: 'ⴰⵜⴰⵢ ⵏ ⵏⵏⴰⵄⵏⴰⵄ' },
  },
  {
    img: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80',
    name: {
      ar: 'مقهى الوادي',
      en: 'Valley Café',
      fr: 'Café de la Vallée',
      ber: 'ⴰⵇⵀⵡⴰ ⵏ ⵓⵡⴰⵍⵉ',
    },
    desc: {
      ar: 'مقهى هادئ بإطلالة على الوادي يقدم مشروبات طازجة ووجبات خفيفة صحية',
      en: 'Quiet café with valley views serving fresh drinks and healthy light meals',
      fr: 'Café calme avec vue sur la vallée servant des boissons fraîches et repas légers sains',
      ber: 'ⴰⵇⵀⵡⴰ ⵉⵣⵓⵣⵣⴰⵏ ⵙ ⵜⵉⵍⴰⵍ ⵏ ⵓⵡⴰⵍⵉ',
    },
    location: {
      ar: 'وادي أزيلال',
      en: 'Azilal Valley',
      fr: 'Vallée d\'Azilal',
      ber: 'ⴰⵡⴰⵍⵉ ⵏ ⴰⵣⵉⵍⴰⵍ',
    },
    rating: 4.4,
    hours: '8:00 - 21:00',
    hasWifi: true,
    specialty: { ar: 'عصائر طبيعية', en: 'Fresh Juices', fr: 'Jus Frais', ber: 'ⵜⵉⵙⵉⵎⴰⵏ ⵜⵉⴳⵏⵉⵜⵉⵏ' },
  },
  {
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    name: {
      ar: 'مقهى الأمازيغ',
      en: 'Amazigh Café',
      fr: 'Café Amazigh',
      ber: 'ⴰⵇⵀⵡⴰ ⴰⵎⴰⵣⵉⵖ',
    },
    desc: {
      ar: 'مقهى تراثي بتصميم أمازيغي تقليدي يقدم القهوة بالطريقة الأمازيغية مع الخبز التقليدي',
      en: 'Heritage café with traditional Amazigh design serving coffee Amazigh-style with traditional bread',
      fr: 'Café patrimoine avec design amazigh traditionnel servant le café à la manière amazighe',
      ber: 'ⴰⵇⵀⵡⴰ ⴰⵎⴰⵣⵉⵖ ⵙ ⵜⵖⵔⵉ ⵜⴰⵎⴰⵣⵉⵖⵜ',
    },
    location: {
      ar: 'قرية أيت بومهدى',
      en: 'Ait Bouhaddou Village',
      fr: 'Village d\'Ait Bouhaddou',
      ber: 'ⵉⵖⵔⵎ ⵏ ⴰⵢⵜ ⴱⵓⵀⴷⴷⵓ',
    },
    rating: 4.7,
    hours: '6:00 - 20:00',
    hasWifi: false,
    specialty: { ar: 'قهوة أمازيغية', en: 'Amazigh Coffee', fr: 'Café Amazigh', ber: 'ⵜⴰⵇⵀⵡⴰ ⵜⴰⵎⴰⵣⵉⵖⵜ' },
  },
  {
    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    name: {
      ar: 'مقهى البحيرة',
      en: 'Lakeside Café',
      fr: 'Café du Lac',
      ber: 'ⴰⵇⵀⵡⴰ ⵏ ⵓⵖⵏⵛⴰⵡ',
    },
    desc: {
      ar: 'مقهى رومانسي على ضفاف البحيرة مع إمكانية تناول القهوة في الهواء الطلق',
      en: 'Romantic café on the lake shore with outdoor seating option',
      fr: 'Café romantique au bord du lac avec terrasse extérieure',
      ber: 'ⴰⵇⵀⵡⴰ ⵉⵜⵜⵔⵣⵢⵏ ⴷⴰⵔ ⵓⵖⵏⵛⴰⵡ',
    },
    location: {
      ar: 'بحيرة بين الويدان',
      en: 'Bin el Ouidane Lake',
      fr: 'Lac Bin el Ouidane',
      ber: 'ⴰⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    },
    rating: 4.5,
    hours: '9:00 - 22:00',
    hasWifi: true,
    specialty: { ar: 'كابتشينو بالنعناع', en: 'Mint Cappuccino', fr: 'Cappuccino à la Menthe', ber: 'ⴽⴰⴱⵓⵜⵛⵉⵏⵓ ⵙ ⵏⵏⴰⵄⵏⴰⵄ' },
  },
];

export default function CafesSection() {
  const { t, lang } = useLanguage();
  const { data: dbCafes, isLoading } = trpc.cafes.list.useQuery();

  // Merge DB rows with the legacy static data as a fallback so nothing disappears.
  const list = dbCafes && dbCafes.length > 0 ? dbCafes : fallbackCafes;
  const fromDb = Boolean(dbCafes && dbCafes.length > 0);

  const getName = (item: any) => {
    if (fromDb) {
      if (lang === 'ar') return item.nameAr;
      if (lang === 'fr') return item.nameFr;
      if (lang === 'ber') return item.nameBer;
      return item.nameEn;
    }
    if (lang === 'ar') return item.name.ar;
    if (lang === 'fr') return item.name.fr;
    if (lang === 'ber') return item.name.ber;
    return item.name.en;
  };

  const getDesc = (item: any) => {
    if (fromDb) {
      if (lang === 'ar') return item.descriptionAr;
      if (lang === 'fr') return item.descriptionFr;
      if (lang === 'ber') return item.descriptionBer;
      return item.descriptionEn;
    }
    if (lang === 'ar') return item.desc.ar;
    if (lang === 'fr') return item.desc.fr;
    if (lang === 'ber') return item.desc.ber;
    return item.desc.en;
  };

  const getLocation = (item: any) => {
    if (fromDb) {
      if (lang === 'ar') return item.locationAr;
      if (lang === 'fr') return item.locationFr;
      if (lang === 'ber') return item.locationBer;
      return item.locationEn;
    }
    if (lang === 'ar') return item.location.ar;
    if (lang === 'fr') return item.location.fr;
    if (lang === 'ber') return item.location.ber;
    return item.location.en;
  };

  const getSpecialty = (item: any) => {
    if (fromDb) {
      if (lang === 'ar') return item.specialtyAr;
      if (lang === 'fr') return item.specialtyFr;
      if (lang === 'ber') return item.specialtyBer;
      return item.specialtyEn;
    }
    if (lang === 'ar') return item.specialty.ar;
    if (lang === 'fr') return item.specialty.fr;
    if (lang === 'ber') return item.specialty.ber;
    return item.specialty.en;
  };

  return (
    <section id="cafes" className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1b5e3f]/10 text-[#1b5e3f] text-sm font-semibold mb-4">
            {lang === 'ar' ? '☕ المقاهي' : lang === 'fr' ? '☕ Cafés' : lang === 'ber' ? '☕ ⵉⵇⵀⵡⴰⵢⵏ' : '☕ Cafés'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3">
            {lang === 'ar' ? 'المقاهي المميزة' : lang === 'fr' ? 'Cafés Remarquables' : lang === 'ber' ? 'ⵉⵇⵀⵡⴰⵢⵏ ⵉⵎⵇⵓⵔⵏ' : 'Special Cafés'}
          </h2>
          <p className="text-gray-500 text-lg">
            {lang === 'ar' ? 'استمتع بأجود أنواع القهوة في أجواء مميزة' : lang === 'fr' ? 'Profitez des meilleurs cafés dans une ambiance unique' : lang === 'ber' ? 'ⵙⵏⵓⴱⵔⵛ ⵜⴰⵇⵀⵡⴰ ⵉⵜⵜⵔⵣⵢⵏ' : 'Enjoy premium coffee in unique atmospheres'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#f5f5f0] rounded-2xl overflow-hidden shadow-lg h-60 animate-pulse" />
            ))
          ) : list.length === 0 ? null : list.map((cafe: any, i: number) => (
            <motion.div
              key={cafe.id ?? i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-[#f5f5f0] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-44 overflow-hidden bg-[#e8e8e0] flex items-center justify-center">
                {(() => {
                  const imgSrc = fromDb ? cafe.image : cafe.img;
                  return imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={getName(cafe)}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : null;
                })()}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-bold text-sm text-[#c8a951]">
                  <Star className="w-3.5 h-3.5 fill-[#c8a951]" />
                  {Number(cafe.rating) ?? cafe.rating}
                </div>
                {cafe.hasWifi && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-[#1b5e3f] rounded-full flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 mb-1">{getName(cafe)}</h3>
                <div className="flex items-center gap-1 text-[#1b5e3f] text-xs font-semibold mb-2">
                  <MapPin className="w-3 h-3" />
                  {getLocation(cafe)}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{getDesc(cafe)}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs font-bold text-[#c8a951]">{getSpecialty(cafe)}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cafe.hours}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
