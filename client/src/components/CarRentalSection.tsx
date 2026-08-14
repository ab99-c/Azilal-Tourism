import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Fuel, Phone, Calendar, Filter, Search, SlidersHorizontal, ChevronDown, RotateCcw, Car as CarIcon } from 'lucide-react';
import BookingModal from './BookingModal';
import { trpc } from '@/lib/trpc';
import type { Car } from '../../../drizzle/schema';

// Normalize car from DB shape to component shape
interface NormalizedCar {
  id: number;
  img: string;
  name: { ar: string; en: string; fr: string; ber: string };
  desc: { ar: string; en: string; fr: string; ber: string };
  seats: { ar: string; en: string; fr: string; ber: string };
  fuel: { ar: string; en: string; fr: string; ber: string };
  type: string;
  price: { ar: string; en: string; fr: string; ber: string };
  phone: string;
}

function normalizeCar(car: any): NormalizedCar {
  return {
    id: car.id,
    img: car.image || '',
    name: { ar: car.nameAr, en: car.nameEn, fr: car.nameFr, ber: car.nameBer },
    desc: { ar: car.descriptionAr || '', en: car.descriptionEn || '', fr: car.descriptionFr || '', ber: car.descriptionBer || '' },
    seats: { ar: car.seats, en: car.seats, fr: car.seats, ber: car.seats },
    fuel: { ar: car.fuel, en: car.fuel, fr: car.fuel, ber: car.fuel },
    type: car.typeAr,
    price: { ar: car.price, en: car.price, fr: car.price, ber: car.price },
    phone: car.phone || '',
  };
}

type Lang = 'ar' | 'en' | 'fr' | 'ber';

function extractPriceNum(price: string): number {
  const match = price.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function extractSeatCount(seats: string): number {
  const match = seats.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export default function CarRentalSection() {
  const { t, lang } = useLanguage();
  const { data: carsData, isLoading } = trpc.cars.list.useQuery();
  const [cars, setCars] = useState<NormalizedCar[]>([]);
  const [selectedCar, setSelectedCar] = useState<NormalizedCar | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [seatsFilter, setSeatsFilter] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (carsData) {
      setCars(carsData.map(normalizeCar));
    }
  }, [carsData]);

  const getName = (item: NormalizedCar) => {
    if (lang === 'ar') return item.name.ar;
    if (lang === 'fr') return item.name.fr;
    if (lang === 'ber') return item.name.ber;
    return item.name.en;
  };

  const getDesc = (item: NormalizedCar) => {
    if (lang === 'ar') return item.desc.ar;
    if (lang === 'fr') return item.desc.fr;
    if (lang === 'ber') return item.desc.ber;
    return item.desc.en;
  };

  const getSeats = (item: NormalizedCar) => item.seats.ar;
  const getFuel = (item: NormalizedCar) => item.fuel.ar;
  const getPrice = (item: NormalizedCar) => item.price.ar;

  const labels = {
    search: lang === 'ar' ? 'ابحث عن سيارة...' : lang === 'fr' ? 'Rechercher un véhicule...' : lang === 'ber' ? 'ⵔⵣⵓ ⵅⴼ ⵜⴰⵙⵍⵍⴰⵙⵜ...' : 'Search for a car...',
    filters: lang === 'ar' ? 'التصفية والفرز' : lang === 'fr' ? 'Filtrer et Trier' : lang === 'ber' ? 'ⵙⵍⵉ ⴷ ⵙⵙⴱⴷⴷ' : 'Filter & Sort',
    fuelType: lang === 'ar' ? 'نوع الوقود' : lang === 'fr' ? 'Type de carburant' : lang === 'ber' ? 'ⴰⵏⴰⵡ ⵏ ⵓⵙⵏⴰⵍ' : 'Fuel Type',
    seats: lang === 'ar' ? 'عدد المقاعد' : lang === 'fr' ? 'Nombre de places' : lang === 'ber' ? 'ⴰⵎⴹⴰⵏ ⵏ ⵉⵖⵔⵎⴰⵏ' : 'Seats',
    priceRange: lang === 'ar' ? 'السعر الأقصى' : lang === 'fr' ? 'Prix maximum' : lang === 'ber' ? 'ⵙⵎⵓⵙ ⵏ ⵜⵎⵢⵉⵔⵉ' : 'Max Price',
    sortBy: lang === 'ar' ? 'ترتيب حسب' : lang === 'fr' ? 'Trier par' : lang === 'ber' ? 'ⵙⵙⴱⴷⴷ ⵙ' : 'Sort by',
    all: lang === 'ar' ? 'الكل' : lang === 'fr' ? 'Tous' : lang === 'ber' ? 'ⴰⴽⴽ' : 'All',
    petrol: lang === 'ar' ? 'بنزين' : lang === 'fr' ? 'Essence' : lang === 'ber' ? 'ⴰⵙⵏⴰⵍ' : 'Petrol',
    diesel: lang === 'ar' ? 'ديزل' : lang === 'fr' ? 'Diesel' : lang === 'ber' ? 'ⴷⵉⵣⵉⵍ' : 'Diesel',
    anySeats: lang === 'ar' ? 'أي عدد' : lang === 'fr' ? 'N\'importe' : lang === 'ber' ? 'ⵎⴰ ⵜⵜⴰⵙ' : 'Any',
    priceLowHigh: lang === 'ar' ? 'السعر: من الأقل للأعلى' : lang === 'fr' ? 'Prix croissant' : lang === 'ber' ? 'ⵜⵎⵢⵉⵔⵉ ⵙ ⵓⵡⴰⵏ' : 'Price: Low to High',
    priceHighLow: lang === 'ar' ? 'السعر: من الأعلى للأقل' : lang === 'fr' ? 'Prix décroissant' : lang === 'ber' ? 'ⵜⵎⵢⵉⵔⵉ ⵙ ⵓⵏⵣⵡⵉ' : 'Price: High to Low',
    seatsMore: lang === 'ar' ? 'المقاعد: من الأكثر' : lang === 'fr' ? 'Places croissant' : lang === 'ber' ? 'ⵉⵖⵔⵎⴰⵏ ⵙ ⵓⵡⴰⵏ' : 'Seats: Most First',
    default: lang === 'ar' ? 'افتراضي' : lang === 'fr' ? 'Défaut' : lang === 'ber' ? 'ⴰⵎⵣⵡⴰⵔⵓ' : 'Default',
    reset: lang === 'ar' ? 'إعادة تعيين' : lang === 'fr' ? 'Réinitialiser' : lang === 'ber' ? 'ⵔⵣⵣⵉ' : 'Reset',
    results: lang === 'ar' ? 'نتيجة' : lang === 'fr' ? 'résultats' : lang === 'ber' ? 'ⵉⴳⵎⴰⴹⵏ' : 'results',
    noResults: lang === 'ar' ? 'لا توجد سيارات مطابقة للبحث' : lang === 'fr' ? 'Aucun véhicule ne correspond à la recherche' : lang === 'ber' ? 'ⵓⵔ ⵉⵍⵍⵉ ⵜⴰⵙⵍⵍⴰⵙⵜ ⵉⵖⵔⴰⴷⵏ' : 'No cars match your search',
    dirhams: lang === 'ar' ? 'درهم/يوم' : lang === 'fr' ? 'MAD/jour' : lang === 'ber' ? 'MAD/ⴰⵙⵙ' : 'MAD/day',
    maxPrice: lang === 'ar' ? 'الحد الأقصى' : lang === 'fr' ? 'Maximum' : lang === 'ber' ? 'ⴰⵎⵓⵔ' : 'Maximum',
  };

  const filteredCars = useMemo(() => {
    let result = [...cars];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(car =>
        getName(car).toLowerCase().includes(query) ||
        getDesc(car).toLowerCase().includes(query) ||
        getSeats(car).toLowerCase().includes(query) ||
        getFuel(car).toLowerCase().includes(query)
      );
    }

    if (fuelFilter !== 'all') {
      result = result.filter(car => {
        if (fuelFilter === 'petrol') return getFuel(car).includes('بنزين');
        if (fuelFilter === 'diesel') return getFuel(car).includes('ديزل');
        return true;
      });
    }

    if (seatsFilter !== 'all') {
      const minSeats = parseInt(seatsFilter);
      result = result.filter(car => extractSeatCount(getSeats(car)) >= minSeats);
    }

    result = result.filter(car => extractPriceNum(getPrice(car)) <= priceMax);

    if (sortBy === 'price-low') {
      result.sort((a, b) => extractPriceNum(getPrice(a)) - extractPriceNum(getPrice(b)));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => extractPriceNum(getPrice(b)) - extractPriceNum(getPrice(a)));
    } else if (sortBy === 'seats-more') {
      result.sort((a, b) => extractSeatCount(getSeats(b)) - extractSeatCount(getSeats(a)));
    }

    return result;
  }, [cars, searchQuery, fuelFilter, seatsFilter, priceMax, sortBy, lang]);

  const resetFilters = () => {
    setSearchQuery('');
    setFuelFilter('all');
    setSeatsFilter('all');
    setPriceMax(1000);
    setSortBy('default');
  };

  const hasActiveFilters = searchQuery || fuelFilter !== 'all' || seatsFilter !== 'all' || priceMax < 1000 || sortBy !== 'default';

  return (
    <section id="cars" className="py-20 bg-[#f5f5f0]">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
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

        {isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e3f]/30 text-gray-700"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-center mb-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1b5e3f] text-white rounded-xl hover:bg-[#14522f] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">{labels.filters}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">{labels.fuelType}</label>
                    <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      <option value="all">{labels.all}</option>
                      <option value="petrol">{labels.petrol}</option>
                      <option value="diesel">{labels.diesel}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">{labels.seats}</label>
                    <select value={seatsFilter} onChange={(e) => setSeatsFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      <option value="all">{labels.anySeats}</option>
                      <option value="5">{lang === 'ar' ? '5+' : '5+'}</option>
                      <option value="7">{lang === 'ar' ? '7+' : '7+'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">{labels.maxPrice}: {priceMax} {labels.dirhams.split('/')[0]}</label>
                    <input type="range" min="100" max="1000" step="50" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-[#1b5e3f]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">{labels.sortBy}</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      <option value="default">{labels.default}</option>
                      <option value="price-low">{labels.priceLowHigh}</option>
                      <option value="price-high">{labels.priceHighLow}</option>
                      <option value="seats-more">{labels.seatsMore}</option>
                    </select>
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      <RotateCcw className="w-3.5 h-3.5" />
                      {labels.reset}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="text-center mb-6">
          <span className="text-sm text-gray-500">
            {filteredCars.length} {labels.results}
            {hasActiveFilters && (lang === 'ar' ? ' (مفلتر)' : ' (filtered)')}
          </span>
        </div>

        {/* Cars Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-10 text-gray-400">{labels.noResults}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars.map((car, index) => (
              <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedCar(car)}>
                <div className="relative h-44 overflow-hidden">
                  {car.img ? (
                    <img src={car.img} alt={getName(car)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1b5e3f] to-[#0f3d28] flex items-center justify-center">
                      <CarIcon className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-[#1b5e3f]">{car.type}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 mb-2">{getName(car)}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{getDesc(car)}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{getSeats(car)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Fuel className="w-4 h-4" />
                      <span>{getFuel(car)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>{car.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-lg font-extrabold text-[#1b5e3f]">{getPrice(car)}</span>
                    <button className="px-4 py-2 bg-[#1b5e3f] text-white text-sm rounded-xl hover:bg-[#14522f] transition-colors">
                      {lang === 'ar' ? 'احجز الآن' : lang === 'fr' ? 'Réserver' : lang === 'ber' ? 'ⵔⵣⵓ' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        <BookingModal isOpen={!!selectedCar} onClose={() => setSelectedCar(null)} type="car" itemId={selectedCar?.id} itemName={selectedCar ? getName(selectedCar) : ''} price={selectedCar ? getPrice(selectedCar) : ''} image={selectedCar?.img} />
      </div>
    </section>
  );
}
