import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Wifi, Car, Coffee, Shield, Calendar, Building2 } from 'lucide-react';
import BookingModal from './BookingModal';
import WhatsAppButton from './WhatsAppButton';
import { getWhatsAppMessage } from '@/lib/whatsapp';
import { trpc } from '@/lib/trpc';
import { ServerError } from './ServerStateNotice';
import TourismLoadingSkeleton from './TourismLoadingSkeleton';

interface NormalizedHotel {
  id: number;
  img: string;
  name: { ar: string; en: string; fr: string; ber: string };
  desc: { ar: string; en: string; fr: string; ber: string };
  location: { ar: string; en: string; fr: string; ber: string };
  rating: number;
  price: { ar: string; en: string; fr: string; ber: string };
  amenities: string[];
  whatsapp: string;
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
    whatsapp: hotel.whatsapp || '',
  };
}

// Static fallback dataset — mirrors the seeded DB rows so sections render
// content on static hosts (Vercel) that have no backend.
const DEFAULT_HOTELS: any[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', nameAr: 'فندق أدرار الأطلس', nameEn: 'ADRAR Atlas Hotel', nameFr: 'Hôtel ADRAR Atlas', nameBer: 'ⴰⵙⵏⴷⵇ ⵏ ⴰⴷⵔⴰⵔ ⴰⵟⵍⴰⵙ', descriptionAr: 'فندق عصري وسط المدينة مع إطلالات خلابة على جبال الأطلس وخدمة راقية.', descriptionEn: 'Modern hotel in the city center with stunning Atlas views.', descriptionFr: 'Hôtel moderne au centre-ville avec vue sur l\'Atlas.', descriptionBer: 'ⴰⵙⵏⴷⵇ ⴰⵏⴰⵎⵉⵔ ⴷ ⵜⴰⵡⵉⵙⵉ ⵉⵍⵍⴰⵏ.', locationAr: 'وسط مدينة أزيلال', locationEn: 'Azilal city center', locationFr: 'Centre-ville d\'Azilal', locationBer: 'ⵜⴰⵎⴷⵉⵏⵜ ⵏ ⴰⵣⵉⵍⴰⵍ', rating: '4.8', priceAr: '800 درهم/ليلة', priceEn: '800 MAD/night', priceFr: '800 MAD/nuit', priceBer: '800 MAD', amenities: '["wifi","parking","restaurant","pool"]' },
  { id: 2, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', nameAr: 'نزل بيربر التقليدي', nameEn: 'Traditional Berber Lodge', nameFr: 'Gîte Berbère Traditionnel', nameBer: 'ⴰⵙⵏⴷⵇ ⴰⵎⴰⵣⵉⵖ', descriptionAr: 'تجربة أمازيغية أصيلة في قلب القرى الجبلية مع الطعام المحلي.', descriptionEn: 'Authentic Amazigh experience in mountain villages with local food.', descriptionFr: 'Expérience amazighe authentique dans les villages.', descriptionBer: 'ⵜⴰⵔⵎⵉⵜ ⵜⴰⵎⴰⵣⵉⵖⵜ ⵜⴰⵏⴰⵎⵉⵔⵜ.', locationAr: 'قرية أيت بومهدي', locationEn: 'Ait Boumehdi village', locationFr: 'Village Ait Boumehdi', locationBer: 'ⴰⵢⵜ ⴱⵓⵎⵀⴷⵉ', rating: '4.5', priceAr: '450 درهم/ليلة', priceEn: '450 MAD/night', priceFr: '450 MAD/nuit', priceBer: '450 MAD', amenities: '["wifi","restaurant","hiking"]' },
  { id: 3, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', nameAr: 'رياد بين الويدان', nameEn: 'Bin el Ouidane Riad', nameFr: 'Riad Bin el Ouidane', nameBer: 'ⵔⵉⵢⴰⴷ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ', descriptionAr: 'رياد هادئ على ضفاف بحيرة بين الويدان، مثالي للراحة والاسترخاء.', descriptionEn: 'Peaceful riad by Bin el Ouidane lake, perfect for relaxation.', descriptionFr: 'Riad paisible au bord du lac Bin el Ouidane.', descriptionBer: 'ⵔⵉⵢⴰⴷ ⵏ ⵓⴹⵍⵉⵙ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ.', locationAr: 'بحيرة بين الويدان', locationEn: 'Bin el Ouidane Lake', locationFr: 'Lac Bin el Ouidane', locationBer: 'ⴰⴳⴰⵎⴰⵎ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ', rating: '4.7', priceAr: '650 درهم/ليلة', priceEn: '650 MAD/night', priceFr: '650 MAD/nuit', priceBer: '650 MAD', amenities: '["wifi","parking","pool","restaurant"]' },
  { id: 4, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80', nameAr: 'مخيم الأطلس المغامر', nameEn: 'Atlas Adventure Camp', nameFr: 'Camp d\'Aventure Atlas', nameBer: 'ⴰⴳⵏⵉ ⵏ ⵜⵓⵔⴰⵔⵜ ⴰⵟⵍⴰⵙ', descriptionAr: 'مخيم في الطبيعة مع مرشدين محليين وجولات استكشافية في الجبال.', descriptionEn: 'Nature camp with local guides and mountain exploration tours.', descriptionFr: 'Camp nature avec guides locaux.', descriptionBer: 'ⴰⴳⵏⵉ ⴷ ⵉⵎⵙⴼⴰⵔ ⵉⵏⴰⵎⵉⵔⵏ.', locationAr: 'وادي أدرار', locationEn: 'Ait Bougmez Valley', locationFr: 'Vallée d\'Ait Bougmez', locationBer: 'ⴰⵙⵉⴼ ⵏ ⴰⴷⵔⴰⵔ', rating: '4.3', priceAr: '250 درهم/ليلة', priceEn: '250 MAD/night', priceFr: '250 MAD/nuit', priceBer: '250 MAD', amenities: '["hiking","campfire","guide"]' },
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
  const { data: hotelsData, isLoading, isError, refetch } = trpc.hotels.list.useQuery(undefined, { retry: 1 });
  const [hotels, setHotels] = useState<NormalizedHotel[]>(() => DEFAULT_HOTELS.map(normalizeHotel));
  const [selectedHotel, setSelectedHotel] = useState<NormalizedHotel | null>(null);

  useEffect(() => {
    if (hotelsData && hotelsData.length > 0) {
      setHotels(hotelsData.map(normalizeHotel));
    }
  }, [hotelsData]);

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
            {lang === 'ar' ? 'اكتشف أفضل أماكن الإقامة في أزيلال' : lang === 'fr' ? 'Découvrez les meilleurs hébergements à Azilal' : lang === 'ber' ? 'ⵙⵏⵓⴱⵔⵛ ⵉⵎⴰⵍⴰⵢⵏ ⵉⵎⵇⵓⵔⵏ' : 'Find the best places to stay in Azilal'}
          </p>
        </motion.div>

        {isLoading && <TourismLoadingSkeleton kind="hotels" lang={lang as 'ar' | 'en' | 'fr' | 'ber'} count={4} />}
        {isError && <ServerError lang={lang as 'ar' | 'en' | 'fr' | 'ber'} onRetry={() => void refetch()} />}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.map((hotel, i) => (
            <motion.div key={hotel.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
              <div className="relative h-48 overflow-hidden">
                {hotel.img ? (
                  <img src={hotel.img} alt={getName(hotel)} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1b5e3f] to-[#0f3d28] flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-white/30" />
                  </div>
                )}
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
                <div className="flex gap-2">
                  <button onClick={() => setSelectedHotel(hotel)} className="flex-1 py-2.5 bg-[#1b5e3f] text-white rounded-xl font-bold text-xs hover:bg-[#0f3d28] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Calendar className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'احجز الآن' : lang === 'fr' ? 'Réserver' : lang === 'ber' ? 'ⵙⵜⵉⵏ' : 'Book Now'}
                  </button>
                  <WhatsAppButton
                    phone={hotel.whatsapp}
                    message={getWhatsAppMessage(lang, getName(hotel), 'hotel')}
                    label={lang === 'ar' ? 'واتساب' : lang === 'fr' ? 'WhatsApp' : lang === 'ber' ? 'ⵡⴰⵜⵙⴰⴱ' : 'WhatsApp'}
                    className="px-3 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-xs hover:bg-[#1ebe5b]"
                  />
                </div>
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
        itemId={selectedHotel?.id}
        itemName={selectedHotel ? getName(selectedHotel) : ''}
        price={selectedHotel ? getPrice(selectedHotel) : ''}
        image={selectedHotel?.img}
      />
    </section>
  );
}
