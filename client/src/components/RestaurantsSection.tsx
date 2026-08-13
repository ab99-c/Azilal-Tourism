import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Clock, Phone } from 'lucide-react';

const restaurants = [
  {
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    name: {
      ar: 'مطعم أدرار التقليدي',
      en: 'Azilal Traditional Restaurant',
      fr: 'Restaurant Traditionnel Azilal',
      ber: 'ⵉⵎⵙⵙⴽ ⴰⵎⴰⵣⵉⵖ ⵏ ⴰⵣⵉⵍⴰⵍ',
    },
    desc: {
      ar: 'مطعم يقدم أشهى الأطباق الأمازيغية التقليدية مثل الطاجين والكسكس والحريرة بإطلالة جبلية',
      en: 'Restaurant serving authentic Amazigh dishes like tagine, couscous, and harira with mountain views',
      fr: 'Restaurant servant des plats amazighs authentiques comme le tajine, le couscous et la harira',
      ber: 'ⵉⵎⵙⵙⴽ ⵏ ⵉⵛⵏⵏⵉⵜⵏ ⵉⵎⴰⵣⵉⵖⵏ',
    },
    location: {
      ar: 'وسط مدينة أزيلال',
      en: 'Azilal City Center',
      fr: 'Centre-ville Azilal',
      ber: 'ⵜⴰⵎⴷⵉⵏⵜ ⵏ ⴰⵣⵉⵍⴰⵍ',
    },
    rating: 4.7,
    cuisine: { ar: 'أمازيغي تقليدي', en: 'Traditional Amazigh', fr: 'Amazigh Traditionnel', ber: 'ⴰⵎⴰⵣⵉⵖ' },
    hours: '9:00 - 23:00',
    phone: '+212 523 111 111',
  },
  {
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    name: {
      ar: 'مطعم البحيرة',
      en: 'Lake View Restaurant',
      fr: 'Restaurant Vue sur le Lac',
      ber: 'ⵉⵎⵙⵙⴽ ⵏ ⵓⵖⵏⵛⴰⵡ',
    },
    desc: {
      ar: 'مطعم على ضفاف بحيرة بين الويدان يقدم أطباقاً طازجة من السمك والأسماك المشوية',
      en: 'Restaurant on Bin el Ouidane Lake shores serving fresh fish and grilled specialties',
      fr: 'Restaurant au bord du lac Bin el Ouidane servant des spécialités de poisson frais',
      ber: 'ⵉⵎⵙⵙⴽ ⴷⴰⵔ ⵓⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    },
    location: {
      ar: 'بحيرة بين الويدان',
      en: 'Bin el Ouidane Lake',
      fr: 'Lac Bin el Ouidane',
      ber: 'ⴰⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    },
    rating: 4.5,
    cuisine: { ar: 'أسماك ومأكولات بحرية', en: 'Seafood & Fish', fr: 'Fruits de Mer', ber: 'ⵉⵃⴰⵜⵏ' },
    hours: '11:00 - 22:00',
    phone: '+212 523 222 222',
  },
  {
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    name: {
      ar: 'مطعم الشفق',
      en: 'Twilight Restaurant',
      fr: 'Restaurant Crépuscule',
      ber: 'ⵉⵎⵙⵙⴽ ⵏ ⵜⴰⴼⵓⴽⵜ',
    },
    desc: {
      ar: 'مطعم راقٍ يجمع بين المأكولات المغربية والعالمية في أجواء هادئة مع موسيقى حية',
      en: 'Upscale restaurant combining Moroccan and international cuisine in a serene atmosphere with live music',
      fr: 'Restaurant raffiné combinant cuisine marocaine et internationale avec musique live',
      ber: 'ⵉⵎⵙⵙⴽ ⵉⵜⵜⵔⵣⵢⵏ ⵙ ⵉⵛⵏⵏⵉⵜⵏ',
    },
    location: {
      ar: 'شارع الأطلس',
      en: 'Atlas Avenue',
      fr: 'Avenue de l\'Atlas',
      ber: 'ⴰⴱⵔⵉⴷ ⵏ ⴰⵟⵍⴰⵙ',
    },
    rating: 4.8,
    cuisine: { ar: 'عالمي ومغربي', en: 'International & Moroccan', fr: 'International & Marocain', ber: 'ⴰⵎⴰⴹⵍⴰⵍ' },
    hours: '18:00 - 00:00',
    phone: '+212 523 333 333',
  },
  {
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    name: {
      ar: 'مطعم الجبل الأخضر',
      en: 'Green Mountain Restaurant',
      fr: 'Restaurant Montagne Verte',
      ber: 'ⵉⵎⵙⵙⴽ ⵏ ⵓⴷⵔⴰⵔ ⴰⵣⵓⵣⵣⴰⵏ',
    },
    desc: {
      ar: 'مطعم عائلي يقدم أطباقاً صحية طازجة من المنتجات المحلية في بيئة طبيعية خلابة',
      en: 'Family restaurant serving fresh healthy dishes from local produce in a stunning natural setting',
      fr: 'Restaurant familial servant des plats sains et frais à base de produits locaux',
      ber: 'ⵉⵎⵙⵙⴽ ⵏ ⵜⵡⴰⵛⵉⵜ ⵙ ⵉⵛⵏⵏⵉⵜⵏ ⵉⴳⵏⵉⵜⵏ',
    },
    location: {
      ar: 'وادي أزيلال',
      en: 'Azilal Valley',
      fr: 'Vallée d\'Azilal',
      ber: 'ⴰⵡⴰⵍⵉ ⵏ ⴰⵣⵉⵍⴰⵍ',
    },
    rating: 4.4,
    cuisine: { ar: 'أطعمة صحية ونباتية', en: 'Healthy & Vegetarian', fr: 'Sain & Végétarien', ber: 'ⵉⴳⵏⵉⵜⵏ' },
    hours: '8:00 - 20:00',
    phone: '+212 523 444 444',
  },
];

export default function RestaurantsSection() {
  const { t, lang } = useLanguage();

  const getName = (item: typeof restaurants[0]) => {
    if (lang === 'ar') return item.name.ar;
    if (lang === 'fr') return item.name.fr;
    if (lang === 'ber') return item.name.ber;
    return item.name.en;
  };

  const getDesc = (item: typeof restaurants[0]) => {
    if (lang === 'ar') return item.desc.ar;
    if (lang === 'fr') return item.desc.fr;
    if (lang === 'ber') return item.desc.ber;
    return item.desc.en;
  };

  const getLocation = (item: typeof restaurants[0]) => {
    if (lang === 'ar') return item.location.ar;
    if (lang === 'fr') return item.location.fr;
    if (lang === 'ber') return item.location.ber;
    return item.location.en;
  };

  const getCuisine = (item: typeof restaurants[0]) => {
    if (lang === 'ar') return item.cuisine.ar;
    if (lang === 'fr') return item.cuisine.fr;
    if (lang === 'ber') return item.cuisine.ber;
    return item.cuisine.en;
  };

  return (
    <section id="restaurants" className="py-20 bg-[#f5f5f0]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#c8a951]/10 text-[#c8a951] text-sm font-semibold mb-4">
            {lang === 'ar' ? '🍽️ المطاعم' : lang === 'fr' ? '🍽️ Restaurants' : lang === 'ber' ? '🍽️ ⵉⵎⵙⵙⴽⵏ' : '🍽️ Restaurants'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3">
            {lang === 'ar' ? 'أفضل المطاعم' : lang === 'fr' ? 'Meilleurs Restaurants' : lang === 'ber' ? 'ⵉⵎⵙⵙⴽⵏ ⵉⵎⵇⵓⵔⵏ' : 'Top Restaurants'}
          </h2>
          <p className="text-gray-500 text-lg">
            {lang === 'ar' ? 'تذوق أشهى المأكولات المحلية والعالمية' : lang === 'fr' ? 'Savourez les meilleures cuisines locales et internationales' : lang === 'ber' ? 'ⵛⵛ ⵉⵛⵏⵏⵉⵜⵏ ⵉⵎⵇⵓⵔⵏ' : 'Enjoy the finest local and international cuisine'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {restaurants.map((restaurant, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row"
            >
              <div className="relative w-full md:w-2/5 h-48 md:h-auto overflow-hidden shrink-0">
                <img
                  src={restaurant.img}
                  alt={getName(restaurant)}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
              </div>
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#1b5e3f]/10 text-[#1b5e3f] text-xs font-semibold">
                      {getCuisine(restaurant)}
                    </span>
                    <div className="flex items-center gap-1 text-[#c8a951] text-sm font-bold">
                      <Star className="w-4 h-4 fill-[#c8a951]" />
                      {restaurant.rating}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{getName(restaurant)}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{getDesc(restaurant)}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {getLocation(restaurant)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {restaurant.hours}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {restaurant.phone}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
