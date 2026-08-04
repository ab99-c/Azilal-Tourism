/**
 * Car Store - localStorage-based data store for car rental CRUD operations
 * Persists cars data across sessions using localStorage
 */

export interface CarData {
  id: string;
  img: string;
  name: { ar: string; en: string; fr: string; ber: string };
  desc: { ar: string; en: string; fr: string; ber: string };
  seats: { ar: string; en: string; fr: string; ber: string };
  fuel: { ar: string; en: string; fr: string; ber: string };
  type: string;
  price: { ar: string; en: string; fr: string; ber: string };
  phone: string;
}

const STORAGE_KEY = 'adrar_cars';

// Default cars that come pre-loaded
const defaultCars: CarData[] = [
  {
    id: 'car-1',
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
    id: 'car-2',
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
    id: 'car-3',
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
    id: 'car-4',
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

// Generate unique ID
function generateId(): string {
  return `car-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

// Get all cars from localStorage
export function getCars(): CarData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default cars
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCars));
    return defaultCars;
  } catch {
    return defaultCars;
  }
}

// Save all cars to localStorage
export function saveCars(cars: CarData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

// Add a new car
export function addCar(car: Omit<CarData, 'id'>): CarData {
  const cars = getCars();
  const newCar: CarData = { ...car, id: generateId() };
  cars.push(newCar);
  saveCars(cars);
  return newCar;
}

// Update an existing car
export function updateCar(id: string, updates: Partial<CarData>): CarData | null {
  const cars = getCars();
  const index = cars.findIndex(c => c.id === id);
  if (index === -1) return null;
  cars[index] = { ...cars[index], ...updates };
  saveCars(cars);
  return cars[index];
}

// Delete a car
export function deleteCar(id: string): boolean {
  const cars = getCars();
  const filtered = cars.filter(c => c.id !== id);
  if (filtered.length === cars.length) return false;
  saveCars(filtered);
  return true;
}

// Reset to default cars
export function resetCars(): CarData[] {
  saveCars(defaultCars);
  return defaultCars;
}

// Get car count
export function getCarCount(): number {
  return getCars().length;
}
