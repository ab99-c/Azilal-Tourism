import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Wifi, Car, Coffee, Shield, Calendar } from 'lucide-react';
import BookingModal from './BookingModal';

const hotels = [
  {
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    name: {
      ar: 'فندق أدرار الأطلس',
      en: 'ADRAR Atlas Hotel',
      fr: 'Hôtel ADRAR Atlas',
      ber: 'ⴰⵙⵏⴷⵇ ⵏ ⴰⴷⵔⴰⵔ ⴰⵟⵍⴰⵙ',
    },
    desc: {
      ar: 'فندق فاخر بإطلالة بانورامية على جبال الأطلس مع مرافق حديثة وخدمة متميزة',
      en: 'Luxury hotel with panoramic Atlas Mountains views, modern facilities and premium service',
      fr: 'Hôtel de luxe avec vue panoramique sur les montagnes de l\'Atlas, installations modernes',
      ber: 'ⴰⵙⵏⴷⵇ ⵉⵜⵜⵔⵣⵢⵏ ⵙ ⵜⵉⵍⴰⵍ ⵏ ⵉⵡⴷⵉⵡⵏ ⵏ ⴰⵟⵍⴰⵙ',
    },
    location: {
      ar: 'وسط مدينة ادرار',
      en: 'ADRAR City Center',
      fr: 'Centre-ville ADRAR',
      ber: 'ⵜⴰⵎⴷⵉⵏⵜ ⵏ ⴰⴷⵔⴰⵔ',
    },
    rating: 4.8,
    price: { ar: '800 درهم/ليلة', en: '800 MAD/night', fr: '800 MAD/nuit', ber: '800 MAD/ⵉⴷ' },
    amenities: ['wifi', 'parking', 'restaurant', 'pool'],
  },
  {
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    name: {
      ar: 'نزل بيربر التقليدي',
      en: 'Traditional Berber Lodge',
      fr: 'Gîte Berbère Traditionnel',
      ber: 'ⴰⵙⵏⴷⵇ ⴰⵎⴰⵣⵉⵖ',
    },
    desc: {
      ar: 'نزل تقليدي أمازيغي يعكس عادات الضيافة المحلية مع تجربة فريدة في قلب الطبيعة',
      en: 'Traditional Amazigh lodge reflecting local hospitality customs with a unique nature experience',
      fr: 'Gîte amazigh traditionnel reflétant les coutumes d\'hospitalité locales',
      ber: 'ⴰⵙⵏⴷⵇ ⴰⵎⴰⵣⵉⵖ ⵉⴳⵎⴰⵢⵏ ⵜⵉⵖⵍⵉⵜ',
    },
    location: {
      ar: 'قرية أيت بومهدى',
      en: 'Ait Bouhaddou Village',
      fr: 'Village d\'Ait Bouhaddou',
      ber: 'ⵉⵖⵔⵎ ⵏ ⴰⵢⵜ ⴱⵓⵀⴷⴷⵓ',
    },
    rating: 4.5,
    price: { ar: '450 درهم/ليلة', en: '450 MAD/night', fr: '450 MAD/nuit', ber: '450 MAD/ⵉⴷ' },
    amenities: ['wifi', 'restaurant', 'hiking'],
  },
  {
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    name: {
      ar: 'رياد بين الويدان',
      en: 'Bin el Ouidane Riad',
      fr: 'Riad Bin el Ouidane',
      ber: 'ⵔⵉⵢⴰⴷ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    },
    desc: {
      ar: 'رياد ساحر على ضفاف بحيرة بين الويدان مع إطلالات خلابة وخدمات عالية الجودة',
      en: 'Charming riad on the shores of Bin el Ouidane Lake with stunning views and quality services',
      fr: 'Riad charmant au bord du lac Bin el Ouidane avec des vues spectaculaires',
      ber: 'ⵔⵉⵢⴰⴷ ⵉⵜⵜⵔⵣⵢⵏ ⴷⴰⵔ ⵓⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    },
    location: {
      ar: 'بحيرة بين الويدان',
      en: 'Bin el Ouidane Lake',
      fr: 'Lac Bin el Ouidane',
      ber: 'ⴰⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    },
    rating: 4.7,
    price: { ar: '650 درهم/ليلة', en: '650 MAD/night', fr: '650 MAD/nuit', ber: '650 MAD/ⵉⴷ' },
    amenities: ['wifi', 'parking', 'pool', 'restaurant'],
  },
  {
    img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80',
    name: {
      ar: 'مخيم الأطلس المغامر',
      en: 'Atlas Adventure Camp',
      fr: 'Camp d\'Aventure Atlas',
      ber: 'ⴰⴳⵏⵉ ⵏ ⵜⵓⵔⴰⵔⵜ ⴰⵟⵍⴰⵙ',
    },
    desc: {
      ar: 'مخيم متكامل لمحبي المغامرات مع خيام مريحة وأنشطة متنوعة وسط الطبيعة البكر',
      en: 'Full-featured camp for adventure lovers with comfortable tents and diverse activities in pristine nature',
      fr: 'Camp complet pour les amateurs d\'aventure avec tentes confortables et activités variées',
      ber: 'ⴰⴳⵏⵉ ⵏ ⵜⵓⵔⴰⵔⵜ ⵙ ⵉⵜⵎⴰⵢⵏ',
    },
    location: {
      ar: 'وادي ادرار',
      en: 'ADRAR Valley',
      fr: 'Vallée d\'ADRAR',
      ber: 'ⴰⵡⴰⵍⵉ ⵏ ⴰⴷⵔⴰⵔ',
    },
    rating: 4.3,
    price: { ar: '250 درهم/ليلة', en: '250 MAD/night', fr: '250 MAD/nuit', ber: '250 MAD/ⵉⴷ' },
    amenities: ['hiking', 'campfire', 'guide'],
  },
];

const amenityIcons: Record<string, { icon: typeof Wifi; color: string }> = {
  wifi: { icon: Wifi, color: '#1b5e3f' },
  parking: { icon: Car, color: '#1b5e3f' },
  restaurant: { icon: Coffee, color: '#c8a951' },
  pool: { icon: Shield, color: '#1b5e3f' },
  hiking: { icon: MapPin, color: '#c8a951' },
  campfire: { icon: MapPin, color: '#c8a951' },
  guide: { icon: Shield, color: '#1b5e3f' },
};

export default function HotelsSection() {
  const { t, lang } = useLanguage();
  const [selectedHotel, setSelectedHotel] = useState<typeof hotels[0] | null>(null);

  const getName = (item: typeof hotels[0]) => {
    if (lang === 'ar') return item.name.ar;
    if (lang === 'fr') return item.name.fr;
    if (lang === 'ber') return item.name.ber;
    return item.name.en;
  };

  const getDesc = (item: typeof hotels[0]) => {
    if (lang === 'ar') return item.desc.ar;
    if (lang === 'fr') return item.desc.fr;
    if (lang === 'ber') return item.desc.ber;
    return item.desc.en;
  };

  const getLocation = (item: typeof hotels[0]) => {
    if (lang === 'ar') return item.location.ar;
    if (lang === 'fr') return item.location.fr;
    if (lang === 'ber') return item.location.ber;
    return item.location.en;
  };

  const getPrice = (item: typeof hotels[0]) => {
    if (lang === 'ar') return item.price.ar;
    if (lang === 'fr') return item.price.fr;
    if (lang === 'ber') return item.price.ber;
    return item.price.en;
  };

  return (
    <section id="hotels" className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1b5e3f]/10 text-[#1b5e3f] text-sm font-semibold mb-4">
            {lang === 'ar' ? '🏨 الفنادق والمبيت' : lang === 'fr' ? '🏨 Hôtels & Hébergement' : lang === 'ber' ? '🏨 ⵉⵙⵏⴷⵇⵏ' : '🏨 Hotels & Accommodation'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3">
            {lang === 'ar' ? 'أماكن الإقامة' : lang === 'fr' ? 'Hébergement' : lang === 'ber' ? 'ⵉⵎⴰⵍⴰⵢⵏ' : 'Accommodation'}
          </h2>
          <p className="text-gray-500 text-lg">
            {lang === 'ar' ? 'اكتشف أفضل أماكن الإقامة في ادرار' : lang === 'fr' ? 'Découvrez les meilleurs hébergements à ADRAR' : lang === 'ber' ? 'ⵙⵏⵓⴱⵔⵛ ⵉⵎⴰⵍⴰⵢⵏ ⵉⵎⵇⵓⵔⵏ' : 'Find the best places to stay in ADRAR'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.map((hotel, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={hotel.img}
                  alt={getName(hotel)}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-bold text-sm text-[#c8a951]">
                  <Star className="w-3.5 h-3.5 fill-[#c8a951]" />
                  {hotel.rating}
                </div>
                <div className="absolute bottom-3 right-3 bg-[#1b5e3f]/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-bold">
                  {getPrice(hotel)}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-[#1b5e3f] text-xs font-semibold mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {getLocation(hotel)}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{getName(hotel)}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{getDesc(hotel)}</p>
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 mb-3">
                  {hotel.amenities.map((amenity) => {
                    const { icon: Icon } = amenityIcons[amenity] || amenityIcons.wifi;
                    return (
                      <span key={amenity} className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" style={{ color: amenityIcons[amenity]?.color || '#1b5e3f' }} />
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setSelectedHotel(hotel)}
                  className="w-full py-2.5 bg-[#1b5e3f] text-white rounded-xl font-bold text-xs hover:bg-[#0f3d28] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'احجز الآن' : lang === 'fr' ? 'Réserver' : lang === 'ber' ? 'ⵙⵜⵉⵏ' : 'Book Now'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!selectedHotel}
        onClose={() => setSelectedHotel(null)}
        type="hotel"
        itemName={selectedHotel ? getName(selectedHotel) : ''}
        price={selectedHotel ? selectedHotel.price[lang] || selectedHotel.price.en : ''}
        image={selectedHotel?.img}
      />
    </section>
  );
}
