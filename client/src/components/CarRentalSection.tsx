import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Fuel, Gauge, Shield, Phone, MapPin } from 'lucide-react';

const cars = [
  {
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80',
    name: {
      ar: 'سيارة عائلية',
      en: 'Family SUV',
      fr: 'SUV Familial',
      ber: 'ⵜⴰⵙⵍⵍⴰⵙⵜ ⵏ ⵜⵡⴰⵛⵉⵜ',
    },
    desc: {
      ar: 'سيارة دفع رباعي مريحة للعائلات مع مساحة واسعة ومساحة تخزين كبيرة',
      en: 'Comfortable 4x4 SUV for families with spacious interior and large storage',
      fr: 'SUV 4x4 confortable pour familles avec intérieur spacieux et grand coffre',
      ber: 'ⵜⴰⵙⵍⵍⴰⵙⵜ 4x4 ⵉⵜⵜⵓⴷⵏ ⵉ ⵜⵡⴰⵛⵉⵜ',
    },
    seats: { ar: '7 مقاعد', en: '7 Seats', fr: '7 Places', ber: '7 ⵉⵖⵔⵎⴰⵏ' },
    fuel: { ar: 'ديزل', en: 'Diesel', fr: 'Diesel', ber: 'ⴷⵉⵣⵉⵍ' },
    type: '4x4',
    price: { ar: '400 درهم/يوم', en: '400 MAD/day', fr: '400 MAD/jour', ber: '400 MAD/ⴰⵙⵙ' },
    phone: '+212 523 555 000',
  },
  {
    img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80',
    name: {
      ar: 'سيارة اقتصادية',
      en: 'Economy Car',
      fr: 'Voiture Économique',
      ber: 'ⵜⴰⵙⵍⵍⴰⵙⵜ ⵜⴰⵎⴳⵏⵉⵜ',
    },
    desc: {
      ar: 'سيارة صغيرة اقتصادية مثالية للتنقل في المدينة واستكشاف المنطقة',
      en: 'Small economical car perfect for city travel and exploring the region',
      fr: 'Petite voiture économique idéale pour la ville et l\'exploration de la région',
      ber: 'ⵜⴰⵙⵍⵍⴰⵙⵜ ⵜⴰⵎⵥⵥⵢⴰⵏⵜ ⵉⵜⵜⵓⴷⵏ ⵉ ⵜⵎⴷⵉⵏⵜ',
    },
    seats: { ar: '5 مقاعد', en: '5 Seats', fr: '5 Places', ber: '5 ⵉⵖⵔⵎⴰⵏ' },
    fuel: { ar: 'بنزين', en: 'Petrol', fr: 'Essence', ber: 'ⴰⵙⵏⴰⵍ' },
    type: 'Economy',
    price: { ar: '200 درهم/يوم', en: '200 MAD/day', fr: '200 MAD/jour', ber: '200 MAD/ⴰⵙⵙ' },
    phone: '+212 523 555 111',
  },
  {
    img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80',
    name: {
      ar: 'سيارة فاخرة',
      en: 'Luxury Sedan',
      fr: 'Berline de Luxe',
      ber: 'ⵜⴰⵙⵍⵍⴰⵙⵜ ⵉⵜⵜⵔⵣⵢⵏ',
    },
    desc: {
      ar: 'سيارة فاخرة مع تجهيزات حديثة ومكيف هواء مثالية لرحلات الأعمال والراحة',
      en: 'Luxury sedan with modern amenities and air conditioning, perfect for business trips',
      fr: 'Berline de luxe avec équipements modernes et climatisation, idéale pour voyages d\'affaires',
      ber: 'ⵜⴰⵙⵍⵍⴰⵙⵜ ⵉⵜⵜⵔⵣⵢⵏ ⵙ ⵉⵖⵔⵓⴷⵏ',
    },
    seats: { ar: '5 مقاعد', en: '5 Seats', fr: '5 Places', ber: '5 ⵉⵖⵔⵎⴰⵏ' },
    fuel: { ar: 'ديزل', en: 'Diesel', fr: 'Diesel', ber: 'ⴷⵉⵣⵉⵍ' },
    type: 'Luxury',
    price: { ar: '700 درهم/يوم', en: '700 MAD/day', fr: '700 MAD/jour', ber: '700 MAD/ⴰⵙⵙ' },
    phone: '+212 523 555 222',
  },
  {
    img: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600&q=80',
    name: {
      ar: 'دراجة نارية',
      en: 'Motorcycle',
      fr: 'Moto',
      ber: 'ⴰⵎⵓⵜⵓⵔ',
    },
    desc: {
      ar: 'دراجة نارية للمغامرين الراغبين في استكشاف الطرق الجبلية بحرية',
      en: 'Motorcycle for adventurers wanting to explore mountain roads freely',
      fr: 'Moto pour les aventuriers souhaitant explorer les routes de montagne librement',
      ber: 'ⴰⵎⵓⵜⵓⵔ ⵉ ⵜⵓⵔⴰⵔⵉⵏ ⵏ ⵉⵡⴷⵉⵡⵏ',
    },
    seats: { ar: '2 مقاعد', en: '2 Seats', fr: '2 Places', ber: '2 ⵉⵖⵔⵎⴰⵏ' },
    fuel: { ar: 'بنزين', en: 'Petrol', fr: 'Essence', ber: 'ⴰⵙⵏⴰⵍ' },
    type: 'Adventure',
    price: { ar: '150 درهم/يوم', en: '150 MAD/day', fr: '150 MAD/jour', ber: '150 MAD/ⴰⵙⵙ' },
    phone: '+212 523 555 333',
  },
];

export default function CarRentalSection() {
  const { t, lang } = useLanguage();

  const getName = (item: typeof cars[0]) => {
    if (lang === 'ar') return item.name.ar;
    if (lang === 'fr') return item.name.fr;
    if (lang === 'ber') return item.name.ber;
    return item.name.en;
  };

  const getDesc = (item: typeof cars[0]) => {
    if (lang === 'ar') return item.desc.ar;
    if (lang === 'fr') return item.desc.fr;
    if (lang === 'ber') return item.desc.ber;
    return item.desc.en;
  };

  const getSeats = (item: typeof cars[0]) => {
    if (lang === 'ar') return item.seats.ar;
    if (lang === 'fr') return item.seats.fr;
    if (lang === 'ber') return item.seats.ber;
    return item.seats.en;
  };

  const getFuel = (item: typeof cars[0]) => {
    if (lang === 'ar') return item.fuel.ar;
    if (lang === 'fr') return item.fuel.fr;
    if (lang === 'ber') return item.fuel.ber;
    return item.fuel.en;
  };

  const getPrice = (item: typeof cars[0]) => {
    if (lang === 'ar') return item.price.ar;
    if (lang === 'fr') return item.price.fr;
    if (lang === 'ber') return item.price.ber;
    return item.price.en;
  };

  return (
    <section id="cars" className="py-20 bg-[#f5f5f0]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#c8a951]/10 text-[#c8a951] text-sm font-semibold mb-4">
            {lang === 'ar' ? '🚗 كراء السيارات' : lang === 'fr' ? '🚗 Location de Voitures' : lang === 'ber' ? '🚗 ⵜⴰⵙⵍⵍⴰⵙⵜ' : '🚗 Car Rental'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3">
            {lang === 'ar' ? 'كراء السيارات' : lang === 'fr' ? 'Location de Voitures' : lang === 'ber' ? 'ⵜⴰⵙⵍⵍⴰⵙⵜ ⵏ ⵜⵔⵎⵉⵜ' : 'Car Rental'}
          </h2>
          <p className="text-gray-500 text-lg">
            {lang === 'ar' ? 'اختر السيارة المناسبة لرحلتك في جبال الأطلس' : lang === 'fr' ? 'Choisissez le véhicule adapté à votre voyage dans l\'Atlas' : lang === 'ber' ? 'ⵙⵜⵉ ⵜⴰⵙⵍⵍⴰⵙⵜ ⵉ ⴰⵏⴰⵡⵏ ⵏⵏⴽ' : 'Choose the right vehicle for your Atlas journey'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={car.img}
                  alt={getName(car)}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 bg-[#1b5e3f]/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-bold">
                  {car.type}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 mb-1">{getName(car)}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{getDesc(car)}</p>
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {getSeats(car)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5" />
                    {getFuel(car)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-[#1b5e3f]">{getPrice(car)}</span>
                  <a href={`tel:${car.phone}`} className="flex items-center gap-1 text-xs text-[#c8a951] hover:text-[#1b5e3f] transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'اتصل' : lang === 'fr' ? 'Appeler' : lang === 'ber' ? 'ⵙⵉⵙ' : 'Call'}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
