import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Mountain, Landmark, Sun, X, Star, Phone, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Landmark data for Azilal region
interface Landmark {
  id: string;
  lat: number;
  lng: number;
  name: { ar: string; en: string; fr: string; ber: string };
  desc: { ar: string; en: string; fr: string; ber: string };
  category: 'nature' | 'culture' | 'adventure';
  rating: number;
  hours?: string;
  phone?: string;
}

const rawLandmarks: Landmark[] = [
  {
    id: 'bin-el-ouidane',
    lat: 32.2333,
    lng: -7.1333,
    name: {
      ar: 'بحيرة بين الويدان',
      en: 'Bin el Ouidane Lake',
      fr: 'Lac de Bin el Ouidane',
      ber: 'ⴰⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    },
    desc: {
      ar: 'بحيرة صناعية خلابة تقع بين جبال الأطلس الكبير. محاطة بغابات الصنوبر وتعتبر وجهة مثالية لرياضات الكاياك والتخييم في الطبيعة الخلابة',
      en: 'A stunning artificial lake nestled between the High Atlas Mountains. Surrounded by pine forests, it is a perfect destination for kayaking and camping in the beautiful nature',
      fr: 'Un magnifique lac artificiel niché entre les montagnes du Haut Atlas. Entouré de forêts de pins, c\'est une destination idéale pour le kayak et le camping',
      ber: 'ⴰⵖⵏⵛⴰⵡ ⵉⵜⵜⵔⵣⵢⵏ ⵉⵜⵜⴰⵡⵢⵏ ⵙ ⵉⵡⴷⵉⵡⵏ ⵏ ⴰⵟⵍⴰⵙ ⴰⵎⵇⵇⵔⴰⵏ',
    },
    category: 'nature',
    rating: 4.8,
    hours: '24/7',
  },
  {
    id: 'tisnirt',
    lat: 32.1500,
    lng: -7.0800,
    name: {
      ar: 'شلالات تيسنيرت',
      en: 'Tisnirt Waterfalls',
      fr: 'Cascades de Tisnirt',
      ber: 'ⵉⵔⵣⵣⵉⵜⵏ ⵏ ⵜⵉⵙⵏⵉⵔⵜ',
    },
    desc: {
      ar: 'شلالات طبيعية جميلة تنحدر من صخور الحمرة وسط غابات الأرز والشجر الأخضر. من أجمل المناظر الطبيعية في المنطقة',
      en: 'Beautiful natural waterfalls cascading from red sandstone cliffs amid cedar forests and green vegetation. One of the most beautiful natural views in the region',
      fr: 'De magnifiques cascades naturelles tombant des falaises de grès rouge au milieu des forêts de cèdres. L\'une des plus belles vues naturelles de la région',
      ber: 'ⵉⵔⵣⵣⵉⵜⵏ ⵉⵜⵜⵔⵣⵢⵏ ⵙⴳ ⵉⵣⴳⴰⵏ ⵉⵖⴱⵉⴱⵏ',
    },
    category: 'nature',
    rating: 4.7,
    hours: '08:00 - 18:00',
  },
  {
    id: 'ait-bouhaddou',
    lat: 32.1000,
    lng: -6.9500,
    name: {
      ar: 'قرى أيت بومهدى',
      en: 'Ait Bouhaddou Villages',
      fr: 'Villages d\'Ait Bouhaddou',
      ber: 'ⵉⵖⵔⵎⴰⵏ ⵏ ⴰⵢⵜ ⴱⵓⵀⴷⴷⵓ',
    },
    desc: {
      ar: 'قرى أمازيغية تقليدية تحافظ على التراث الثقافي والعادات والتقاليد العريقة منذ قرون. فرصة لاكتشاف الحياة الأمازيغية الأصيلة',
      en: 'Traditional Amazigh villages preserving rich cultural heritage and ancient customs for centuries. An opportunity to discover authentic Amazigh life',
      fr: 'Des villages amazighs traditionnels préservant un riche patrimoine culturel et des coutumes anciennes depuis des siècles',
      ber: 'ⵉⵖⵔⵎⴰⵏ ⵉⵎⴰⵣⵉⵖⵏ ⵉⵎⵓⵍⵏ ⵉⴳⵎⴰⵢⵏ ⵜⵉⵖⵍⵉⵜ',
    },
    category: 'culture',
    rating: 4.9,
  },
  {
    id: 'toubkal-approach',
    lat: 32.0500,
    lng: -7.1800,
    name: {
      ar: 'قمة الأطلس الكبير',
      en: 'High Atlas Peak',
      fr: 'Sommet du Haut Atlas',
      ber: 'ⴰⵏⵙⴰ ⵏ ⵓⵡⴷⵉⵡ ⴰⵎⵇⵇⵔⴰⵏ',
    },
    desc: {
      ar: 'قمم جبلية شاهقة في قلب جبال الأطلس الكبير، تحفة طبيعية تستحق التسلق والاستكشاف. ارتفاع يتجاوز 3000 متر',
      en: 'Towering mountain peaks in the heart of the High Atlas Mountains. A natural masterpiece worth climbing and exploring, reaching over 3000 meters',
      fr: 'Des sommets montagneux majestueux au cœur du Haut Atlas. Un chef-d\'œuvre naturel qui mérite d\'être escaladé, atteignant plus de 3000 mètres',
      ber: 'ⵉⵡⴷⵉⵡⵏ ⵉⵜⵜⵔⵣⵢⵏ ⴷⴰⵔ ⵓⵡⵜⵜⵓⵏ ⵏ ⴰⵟⵍⴰⵙ',
    },
    category: 'adventure',
    rating: 4.6,
    hours: 'يومي',
  },
  {
    id: 'abirqrak',
    lat: 32.0800,
    lng: -7.1200,
    name: {
      ar: 'وادي أبي رقراق',
      en: 'Abirqrak Valley',
      fr: 'Vallée d\'Abirqrak',
      ber: 'ⴰⵡⴰⵍⵉ ⵏ ⴰⴱⵉⵔⵇⵔⴰⵇ',
    },
    desc: {
      ar: 'وادي أخضر خلاب يتدفق فيه نهر صاف بين الجبال والصخور الطبيعية. مثالي للمشي والاسترخاء في أحضان الطبيعة',
      en: 'A lush green valley with a crystal-clear river flowing between mountains and natural rocks. Ideal for hiking and relaxing in nature',
      fr: 'Une vallée verdoyante avec une rivière cristalline coulant entre les montagnes et les rochers naturels. Idéal pour la randonnée',
      ber: 'ⴰⵡⴰⵍⵉ ⵉⵣⵓⵣⵣⴰⵏ ⵙ ⵓⵙⵏⴳⴰⵔ ⵉⵜⵜⴰⵡⵢⵏ',
    },
    category: 'nature',
    rating: 4.5,
  },
  {
    id: 'azilal-city',
    lat: 32.1667,
    lng: -7.0833,
    name: {
      ar: 'مدينة أزيلال',
      en: 'Azilal City',
      fr: 'Ville d\'Azilal',
      ber: 'ⵜⴰⵎⴷⵉⵏⵜ ⵏ ⴰⵣⵉⵍⴰⵍ',
    },
    desc: {
      ar: 'مدينة أزيلال عاصمة الإقليم، مزيج من الحضارة الحديثة والتراث الأمازيغي العريق. تضم أسواق تقليدية ومطاعم محلية',
      en: 'Azilal city, the capital of the province, a blend of modern civilization and ancient Amazigh heritage. Features traditional markets and local restaurants',
      fr: 'La ville d\'Azilal, capitale de la province, un mélange de civilisation moderne et de patrimoine amazigh ancien',
      ber: 'ⵜⴰⵎⴷⵉⵏⵜ ⵏ ⴰⵣⵉⵍⴰⵍ ⴰⵇⵇⴰ ⵏ ⵜⵎⵏⴰⴹⵜ',
    },
    category: 'culture',
    rating: 4.3,
    phone: '+212 523 000 000',
  },
  {
    id: 'reserva-nature',
    lat: 32.1200,
    lng: -7.0500,
    name: {
      ar: 'محمية أزيلال الطبيعية',
      en: 'Azilal Nature Reserve',
      fr: 'Réserve naturelle d\'Azilal',
      ber: 'ⴰⴳⵏⵉ ⵏ ⵜⴰⴷⴰⵍⵉⵜ ⵏ ⴰⵣⵉⵍⴰⵍ',
    },
    desc: {
      ar: 'محمية طبيعية تضم أنواعاً نادرة من النباتات والحيوانات في بيئة جبلية فريدة. مثالية لعشاق الطبيعة والحياة البرية',
      en: 'A natural reserve with rare species of plants and animals in a unique mountain environment. Perfect for nature and wildlife lovers',
      fr: 'Une réserve naturelle avec des espèces rares de plantes et d\'animaux dans un environnement montagnard unique',
      ber: 'ⴰⴳⵏⵉ ⵏ ⵜⴰⴷⴰⵍⵉⵜ ⵉⵜⵜⵓⵙⵏ ⵉ ⵜⵉⵙⵉⵔⵉⵏ',
    },
    category: 'nature',
    rating: 4.7,
    hours: '09:00 - 17:00',
  },
  {
    id: 'berber-museum',
    lat: 32.1580,
    lng: -7.0780,
    name: {
      ar: 'المتحف الأمازيغي',
      en: 'Amazigh Museum',
      fr: 'Musée Amazigh',
      ber: 'ⵜⵓⵙⵏⴰⵖⵜ ⵜⴰⵎⴰⵣⵉⵖⵜ',
    },
    desc: {
      ar: 'متحف يعرض التراث الأمازيغي العريق من أدوات تقليدية وملابس وكتب ومخطوطات تيفيناغ. نافذة على ثقافة عريقة',
      en: 'A museum showcasing ancient Amazigh heritage through traditional tools, clothing, books, and Tifinagh manuscripts. A window into an ancient culture',
      fr: 'Un musée présentant le riche patrimoine amazigh à travers des outils traditionnels, des vêtements et des manuscrits Tifinagh',
      ber: 'ⵜⵓⵙⵏⴰⵖⵜ ⵉⵜⵜⵓⵔⵏⵏ ⵜⴰⵖⵍⵉⵜ ⵜⴰⵎⴰⵣⵉⵖⵜ',
    },
    category: 'culture',
    rating: 4.8,
    hours: '09:00 - 17:00',
    phone: '+212 523 100 200',
  },
];

// Category colors
const categoryColors: Record<string, string> = {
  nature: '#1b5e3f',
  culture: '#c8a951',
  adventure: '#c0392b',
};

function createCustomIcon(category: string) {
  const color = categoryColors[category] || '#1b5e3f';
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 26 16 26s16-14.8 16-26C32 7.163 24.837 0 16 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="16" cy="14" r="5.5" fill="white" opacity="0.95"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

export default function MapSection() {
  const { t, lang } = useLanguage();
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const features = [
    { icon: Mountain, title: 'map.f1.title', desc: 'map.f1.desc' },
    { icon: Landmark, title: 'map.f2.title', desc: 'map.f2.desc' },
    { icon: Sun, title: 'map.f3.title', desc: 'map.f3.desc' },
  ];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [32.1300, -7.0900],
      zoom: 10,
      zoomControl: true,
      attributionControl: false,
    });

    // Beautiful tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add markers for each landmark
    rawLandmarks.forEach((landmark) => {
      const marker = L.marker([landmark.lat, landmark.lng], {
        icon: createCustomIcon(landmark.category),
      }).addTo(map);

      // Click handler
      marker.on('click', () => {
        setSelectedLandmark(landmark);
        map.flyTo([landmark.lat, landmark.lng], 14, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      });
    });

    // Store map reference
    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const getFieldName = (item: Landmark) => item.name[lang] || item.name.en;
  const getDesc = (item: Landmark) => item.desc[lang] || item.desc.en;

  const categoryIcons: Record<string, string> = {
    nature: '🌿',
    culture: '🏛️',
    adventure: '🏔️',
  };

  const categoryLabels: Record<string, string> = {
    nature: lang === 'ar' ? 'طبيعة' : lang === 'fr' ? 'Nature' : lang === 'ber' ? 'ⵜⴰⴷⴰⵍⵉⵜ' : 'Nature',
    culture: lang === 'ar' ? 'ثقافة' : lang === 'fr' ? 'Culture' : lang === 'ber' ? 'ⵜⴰⵖⵍⵉⵜ' : 'Culture',
    adventure: lang === 'ar' ? 'مغامرة' : lang === 'fr' ? 'Aventure' : lang === 'ber' ? 'ⵜⴰⵔⴰⵔⵜ' : 'Adventure',
  };

  return (
    <section id="about" className="py-20 bg-[#f5f5f0]">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3">
            {t('map.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t('map.desc')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Info + Legend */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            {/* Features */}
            <div className="space-y-5 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1b5e3f]/10 text-[#1b5e3f] flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t(f.title)}</h4>
                    <p className="text-sm text-gray-500">{t(f.desc)}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1b5e3f]" />
                {lang === 'ar' ? 'دليل الخرائط' : lang === 'fr' ? 'Légende' : lang === 'ber' ? 'ⵜⴰⵎⴰⵜⴰⵔⵜ' : 'Map Legend'}
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[key] }}
                    />
                    <span className="text-sm text-gray-600">
                      {categoryIcons[key]} {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                {lang === 'ar'
                  ? 'انقر على أي دبوس لعرض المعلومات'
                  : lang === 'fr'
                  ? 'Cliquez sur un marqueur pour voir les détails'
                  : lang === 'ber'
                  ? 'ⵙⵙⵏⴼⵍ ⵉ ⵜⴰⵎⴰⵜⴰⵔⵜ ⵉ ⵉⵜⵜⵔⵏⵏ'
                  : 'Click on any pin to view details'}
              </p>
            </div>

            {/* Selected Landmark Info */}
            {selectedLandmark && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-[#1b5e3f]/20 mt-6 relative"
              >
                <button
                  onClick={() => setSelectedLandmark(null)}
                  className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg mb-4"
                  style={{ backgroundColor: categoryColors[selectedLandmark.category] }}
                >
                  {categoryIcons[selectedLandmark.category]}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {getFieldName(selectedLandmark)}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(selectedLandmark.rating)
                          ? 'fill-[#c8a951] text-[#c8a951]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ms-1">{selectedLandmark.rating}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {getDesc(selectedLandmark)}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  {selectedLandmark.hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#1b5e3f]" />
                      <span>{selectedLandmark.hours}</span>
                    </div>
                  )}
                  {selectedLandmark.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#1b5e3f]" />
                      <span>{selectedLandmark.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 rounded-2xl overflow-hidden shadow-2xl h-[500px] border-4 border-white"
          >
            <div
              ref={mapContainerRef}
              className="w-full h-full"
              style={{ minHeight: '500px' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
