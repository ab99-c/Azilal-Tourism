import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Fuel, Phone, Calendar } from 'lucide-react';
import BookingModal from './BookingModal';
import { getCars, type CarData } from '@/lib/carStore';

type Lang = 'ar' | 'en' | 'fr' | 'ber';

export default function CarRentalSection() {
  const { t, lang } = useLanguage();
  const [cars, setCars] = useState<CarData[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  useEffect(() => {
    setCars(getCars());
  }, []);

  const getName = (item: CarData) => {
    if (lang === 'ar') return item.name.ar;
    if (lang === 'fr') return item.name.fr;
    if (lang === 'ber') return item.name.ber;
    return item.name.en;
  };

  const getDesc = (item: CarData) => {
    if (lang === 'ar') return item.desc.ar;
    if (lang === 'fr') return item.desc.fr;
    if (lang === 'ber') return item.desc.ber;
    return item.desc.en;
  };

  const getSeats = (item: CarData) => {
    if (lang === 'ar') return item.seats.ar;
    if (lang === 'fr') return item.seats.fr;
    if (lang === 'ber') return item.seats.ber;
    return item.seats.en;
  };

  const getFuel = (item: CarData) => {
    if (lang === 'ar') return item.fuel.ar;
    if (lang === 'fr') return item.fuel.fr;
    if (lang === 'ber') return item.fuel.ber;
    return item.fuel.en;
  };

  const getPrice = (item: CarData) => {
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
              key={car.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={car.img || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'}
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
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-3">
                  <span className="text-sm font-bold text-[#1b5e3f]">{getPrice(car)}</span>
                  <a href={`tel:${car.phone}`} className="flex items-center gap-1 text-xs text-[#c8a951] hover:text-[#1b5e3f] transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'اتصل' : lang === 'fr' ? 'Appeler' : lang === 'ber' ? 'ⵙⵉⵙ' : 'Call'}
                  </a>
                </div>
                <button
                  onClick={() => setSelectedCar(car)}
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
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        type="car"
        itemName={selectedCar ? getName(selectedCar) : ''}
        price={selectedCar ? getPrice(selectedCar) : ''}
        image={selectedCar?.img}
      />
    </section>
  );
}
