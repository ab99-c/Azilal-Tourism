import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Fuel, Phone, Calendar, Filter, Search, SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import BookingModal from './BookingModal';
import { getCars, type CarData } from '@/lib/carStore';

type Lang = 'ar' | 'en' | 'fr' | 'ber';

// Helper to extract numeric price value from price string
function extractPriceNum(price: string): number {
  const match = price.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Helper to extract seat count
function extractSeatCount(seats: string): number {
  const match = seats.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export default function CarRentalSection() {
  const { t, lang } = useLanguage();
  const [cars, setCars] = useState<CarData[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [seatsFilter, setSeatsFilter] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>('default');

  // UI state
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setCars(getCars());
  }, []);

  // Listen for car store changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCars(getCars());
    }, 1000);
    return () => clearInterval(interval);
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

  // Labels translations
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

  // Filter and sort logic
  const filteredCars = useMemo(() => {
    let result = [...cars];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(car =>
        getName(car).toLowerCase().includes(query) ||
        getDesc(car).toLowerCase().includes(query) ||
        getSeats(car).toLowerCase().includes(query) ||
        getFuel(car).toLowerCase().includes(query) ||
        getSeats(car).toLowerCase().includes(query)
      );
    }

    // Fuel filter
    if (fuelFilter !== 'all') {
      const fuelKey = fuelFilter;
      result = result.filter(car => {
        const fuelAr = car.fuel.ar;
        const fuelEn = car.fuel.en;
        if (fuelKey === 'petrol') return fuelAr.includes('بنزين') || fuelEn.toLowerCase().includes('petrol');
        if (fuelKey === 'diesel') return fuelAr.includes('ديزل') || fuelEn.toLowerCase().includes('diesel');
        return true;
      });
    }

    // Seats filter
    if (seatsFilter !== 'all') {
      const minSeats = parseInt(seatsFilter);
      result = result.filter(car => extractSeatCount(getSeats(car)) >= minSeats);
    }

    // Price max filter
    result = result.filter(car => extractPriceNum(getPrice(car)) <= priceMax);

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => extractPriceNum(getPrice(a)) - extractPriceNum(getPrice(b)));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => extractPriceNum(getPrice(b)) - extractPriceNum(getPrice(a)));
    } else if (sortBy === 'seats-more') {
      result.sort((a, b) => extractSeatCount(getSeats(b)) - extractSeatCount(getSeats(a)));
    }

    return result;
  }, [cars, searchQuery, fuelFilter, seatsFilter, priceMax, sortBy, lang]);

  // Get unique fuel types from current cars
  const fuelOptions = useMemo(() => {
    const fuels = new Set<string>();
    cars.forEach(car => {
      const fuel = getFuel(car);
      if (fuel.includes('ديزل') || car.fuel.en.toLowerCase().includes('diesel')) fuels.add('diesel');
      if (fuel.includes('بنزين') || car.fuel.en.toLowerCase().includes('petrol')) fuels.add('petrol');
    });
    return Array.from(fuels);
  }, [cars, lang]);

  // Reset all filters
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
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

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={labels.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-3.5 px-5 rounded-xl bg-white border-2 border-gray-200 focus:border-[#1b5e3f] focus:ring-2 focus:ring-[#1b5e3f]/10 outline-none transition-all text-gray-700 ${lang === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              hasActiveFilters
                ? 'bg-[#1b5e3f] text-white shadow-lg shadow-[#1b5e3f]/20'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-[#1b5e3f]/30'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {labels.filters}
            {hasActiveFilters && (
              <span className="bg-[#c8a951] text-[#1b5e3f] text-xs font-bold px-1.5 py-0.5 rounded-full">
                {[searchQuery, fuelFilter !== 'all', seatsFilter !== 'all', priceMax < 1000, sortBy !== 'default'].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-[#c8a951] hover:text-[#1b5e3f] bg-white border-2 border-gray-200 hover:border-[#c8a951] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {labels.reset}
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {/* Fuel Type Filter */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {labels.fuelType}
                    </label>
                    <div className="relative">
                      <select
                        value={fuelFilter}
                        onChange={(e) => setFuelFilter(e.target.value)}
                        className={`w-full py-2.5 px-4 rounded-lg bg-gray-50 border-2 border-gray-200 focus:border-[#1b5e3f] outline-none text-sm font-medium text-gray-700 appearance-none cursor-pointer transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                      >
                        <option value="all">{labels.all}</option>
                        {fuelOptions.map(f => (
                          <option key={f} value={f}>{f === 'petrol' ? labels.petrol : labels.diesel}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${lang === 'ar' ? 'left-3' : 'right-3'}`} />
                    </div>
                  </div>

                  {/* Seats Filter */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {labels.seats}
                    </label>
                    <div className="relative">
                      <select
                        value={seatsFilter}
                        onChange={(e) => setSeatsFilter(e.target.value)}
                        className={`w-full py-2.5 px-4 rounded-lg bg-gray-50 border-2 border-gray-200 focus:border-[#1b5e3f] outline-none text-sm font-medium text-gray-700 appearance-none cursor-pointer transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                      >
                        <option value="all">{labels.anySeats}</option>
                        <option value="2">2+ {lang === 'ar' ? 'مقاعد' : lang === 'fr' ? 'places' : lang === 'ber' ? 'ⵉⵖⵔⵎⴰⵏ' : 'seats'}</option>
                        <option value="5">5+ {lang === 'ar' ? 'مقاعد' : lang === 'fr' ? 'places' : lang === 'ber' ? 'ⵉⵖⵔⵎⴰⵏ' : 'seats'}</option>
                        <option value="7">7+ {lang === 'ar' ? 'مقاعد' : lang === 'fr' ? 'places' : lang === 'ber' ? 'ⵉⵖⵔⵎⴰⵏ' : 'seats'}</option>
                      </select>
                      <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${lang === 'ar' ? 'left-3' : 'right-3'}`} />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {labels.priceRange}: <span className="text-[#1b5e3f]">{priceMax} {labels.dirhams}</span>
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1b5e3f]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>100</span>
                      <span>1000+</span>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {labels.sortBy}
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`w-full py-2.5 px-4 rounded-lg bg-gray-50 border-2 border-gray-200 focus:border-[#1b5e3f] outline-none text-sm font-medium text-gray-700 appearance-none cursor-pointer transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                      >
                        <option value="default">{labels.default}</option>
                        <option value="price-low">{labels.priceLowHigh}</option>
                        <option value="price-high">{labels.priceHighLow}</option>
                        <option value="seats-more">{labels.seatsMore}</option>
                      </select>
                      <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${lang === 'ar' ? 'left-3' : 'right-3'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4 text-[#c8a951]" />
            {filteredCars.length} {labels.results}
          </span>
        </div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars.map((car, i) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">{labels.noResults}</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2.5 bg-[#1b5e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0f3d28] transition-all"
            >
              {labels.reset}
            </button>
          </motion.div>
        )}
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
