import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Wifi, Car, Coffee, Shield, Calendar } from 'lucide-react';
import BookingModal from './BookingModal';
import { trpc } from '@/lib/trpc';

interface NormalizedHotel {
  id: number;
  img: string;
  name: { ar: string; en: string; fr: string; ber: string };
  desc: { ar: string; en: string; fr: string; ber: string };
  location: { ar: string; en: string; fr: string; ber: string };
  rating: number;
  price: { ar: string; en: string; fr: string; ber: string };
  amenities: string[];
}

function normalizeHotel(hotel: any): NormalizedHotel {
  let amenities: string[] = [];
  try {
    amenities = JSON.parse(hotel.amenities || '[]');
  } catch { amenities = []; }
  return {
    id: hotel.id,
    img: hotel.image || '',
    name: { ar: hotel.nameAr, en: hotel.nameEn, fr: hotel.nameFr, ber: hotel.nameBer },
    desc: { ar: hotel.descriptionAr || '', en: hotel.descriptionEn || '', fr: hotel.descriptionFr || '', ber: hotel.descriptionBer || '' },
    location: { ar: hotel.locationAr || '', en: hotel.locationEn || '', fr: hotel.locationFr || '', ber: hotel.locationBer || '' },
    rating: parseFloat(hotel.rating || '4.5'),
    price: { ar: hotel.priceAr, en: hotel.priceEn, fr: hotel.priceFr, ber: hotel.priceBer },
    amenities,
  };
}

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
  const { data: hotelsData, isLoading } = trpc.hotels.list.useQuery();
  const [hotels, setHotels] = useState<NormalizedHotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<NormalizedHotel | null>(null);

  if (hotelsData && hotels.length === 0) {
    setHotels(hotelsData.map(normalizeHotel));
  }

  const getName = (item: NormalizedHotel) => {
    if (lang === 'ar') return item.name.ar;
    if (lang === 'fr') return item.name.fr;
    if (lang === 'ber') return item.name.ber;
    return item.name.en;
  };

  const getDesc = (item: NormalizedHotel) => {
    if (lang === 'ar') return item.desc.ar;
    if (lang === 'fr') return item.desc.fr;
    if (lang === 'ber') return item.desc.ber;
    return item.desc.en;
  };

  const getLocation = (item: NormalizedHotel) => {
    if (lang === 'ar') return item.location.ar;
    if (lang === 'fr') return item.location.fr;
    if (lang === 'ber') return item.location.ber;
    return item.location.en;
  };

  const getPrice = (item: NormalizedHotel) => item.price.ar;

  return (
    <section id="hotels" className="py-20 bg-white">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
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

        {isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.map((hotel, i) => (
            <motion.div key={hotel.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
              <div className="relative h-48 overflow-hidden">
                <img src={hotel.img} alt={getName(hotel)} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
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
                <button onClick={() => setSelectedHotel(hotel)} className="w-full py-2.5 bg-[#1b5e3f] text-white rounded-xl font-bold text-xs hover:bg-[#0f3d28] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
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
        price={selectedHotel ? getPrice(selectedHotel) : ''}
        image={selectedHotel?.img}
      />
    </section>
  );
}
