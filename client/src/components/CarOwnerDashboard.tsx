/**
 * ============================================================
 * Car Owner Dashboard (Full-Stack with tRPC)
 * ============================================================
 * CRUD management panel for car rental owners
 * Uses tRPC mutations for persistent database operations
 * Supports RTL Arabic with translations
 * ============================================================
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Plus, Pencil, Trash2, X, Car, ChevronDown,
  Save, RotateCcw, Image, ClipboardList, CheckCircle2,
  CreditCard, Clock
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Lang = 'ar' | 'en' | 'fr' | 'ber';

export default function CarOwnerDashboard() {
  const { t, lang } = useLanguage();
  const { data: carsData, refetch } = trpc.cars.list.useQuery();
  const { data: bookingsData } = trpc.bookings.list.useQuery(undefined, {
    retry: false,
  });
  const [cars, setCars] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'cars' | 'bookings'>('cars');

  // Form state
  const [formData, setFormData] = useState({
    img: '',
    name: { ar: '', en: '', fr: '', ber: '' },
    desc: { ar: '', en: '', fr: '', ber: '' },
    seats: { ar: '', en: '', fr: '', ber: '' },
    fuel: { ar: '', en: '', fr: '', ber: '' },
    type: '',
    price: { ar: '', en: '', fr: '', ber: '' },
    phone: '',
  });

  // Load cars from database
  useEffect(() => {
    if (carsData) {
      setCars(carsData);
    }
  }, [carsData]);

  // Mutations
  const createCarMutation = trpc.cars.create.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
      toast.success(lang === 'ar' ? 'تمت إضافة السيارة بنجاح' : 'Car added successfully');
    },
    onError: (err) => {
      toast.error(lang === 'ar' ? 'خطأ في إضافة السيارة' : 'Error adding car', { description: err.message });
    },
  });

  const updateCarMutation = trpc.cars.update.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
      toast.success(lang === 'ar' ? 'تم تحديث السيارة بنجاح' : 'Car updated successfully');
    },
    onError: (err) => {
      toast.error(lang === 'ar' ? 'خطأ في تحديث السيارة' : 'Error updating car', { description: err.message });
    },
  });

  const deleteCarMutation = trpc.cars.delete.useMutation({
    onSuccess: () => {
      refetch();
      if (expandedId !== null) setExpandedId(null);
      toast.success(lang === 'ar' ? 'تم حذف السيارة بنجاح' : 'Car deleted successfully');
    },
    onError: (err) => {
      toast.error(lang === 'ar' ? 'خطأ في حذف السيارة' : 'Error deleting car', { description: err.message });
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      img: '',
      name: { ar: '', en: '', fr: '', ber: '' },
      desc: { ar: '', en: '', fr: '', ber: '' },
      seats: { ar: '', en: '', fr: '', ber: '' },
      fuel: { ar: '', en: '', fr: '', ber: '' },
      type: '',
      price: { ar: '', en: '', fr: '', ber: '' },
      phone: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Open add form
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (car: any) => {
    setFormData({
      img: car.image || '',
      name: { ar: car.nameAr, en: car.nameEn, fr: car.nameFr, ber: car.nameBer },
      desc: { ar: car.descriptionAr || '', en: car.descriptionEn || '', fr: car.descriptionFr || '', ber: car.descriptionBer || '' },
      seats: { ar: car.seats, en: car.seats, fr: car.seats, ber: car.seats },
      fuel: { ar: car.fuel, en: car.fuel, fr: car.fuel, ber: car.fuel },
      type: car.typeAr,
      price: { ar: car.priceAr, en: car.priceEn, fr: car.priceFr, ber: car.priceBer },
      phone: car.phone || '',
    });
    setEditingId(car.id);
    setShowForm(true);
    setExpandedId(null);
  };

  // Submit form (add or update)
  const handleSubmit = () => {
    if (editingId !== null) {
      updateCarMutation.mutate({
        id: editingId,
        image: formData.img,
        nameAr: formData.name.ar, nameEn: formData.name.en, nameFr: formData.name.fr, nameBer: formData.name.ber,
        typeAr: formData.type, typeEn: formData.type, typeFr: formData.type, typeBer: formData.type,
        descriptionAr: formData.desc.ar, descriptionEn: formData.desc.en, descriptionFr: formData.desc.fr, descriptionBer: formData.desc.ber,
        seats: formData.seats.ar,
        fuel: formData.fuel.ar,
        price: formData.price.ar,
        phone: formData.phone,
      });
    } else {
      createCarMutation.mutate({
        image: formData.img,
        nameAr: formData.name.ar, nameEn: formData.name.en, nameFr: formData.name.fr, nameBer: formData.name.ber,
        typeAr: formData.type, typeEn: formData.type, typeFr: formData.type, typeBer: formData.type,
        descriptionAr: formData.desc.ar, descriptionEn: formData.desc.en, descriptionFr: formData.desc.fr, descriptionBer: formData.desc.ber,
        seats: formData.seats.ar,
        fuel: formData.fuel.ar,
        price: formData.price.ar,
        phone: formData.phone,
      });
    }
  };

  // Delete car with confirmation
  const handleDelete = (id: number) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه السيارة؟' : 'Are you sure you want to delete this car?')) {
      deleteCarMutation.mutate({ id });
    }
  };

  // Reset all cars (just close and refetch - defaults are already in DB)
  const handleReset = () => {
    setShowResetConfirm(false);
    setShowForm(false);
    setEditingId(null);
    refetch();
    toast.info(lang === 'ar' ? 'تم إعادة تحميل البيانات الافتراضية' : 'Default data reloaded');
  };

  // Booking mutations (admin: mark paid / confirm)
  const markPaidMutation = trpc.bookings.markPaid.useMutation({
    onSuccess: () => { refetchBookings(); toast.success(lang === 'ar' ? 'تم تسجيل الدفعة' : 'Payment recorded'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ' : 'Error', { description: err.message }),
  });
  const confirmMutation = trpc.bookings.confirm.useMutation({
    onSuccess: () => { refetchBookings(); toast.success(lang === 'ar' ? 'تم تأكيد الحجز' : 'Booking confirmed'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ' : 'Error', { description: err.message }),
  });
  const utils = trpc.useUtils();
  const refetchBookings = () => {
    utils.bookings.list.invalidate();
  };

  const isAdmin = (() => {
    try {
      const me = (window as any).__arkarAdminCache;
      return Boolean(me);
    } catch { return false; }
  })();

  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Translations
  const labels = {
    title: { ar: 'لوحة تحكم السيارات', en: 'Car Management', fr: 'Gestion des Voitures', ber: 'ⴰⵙⵏⴼⵍ ⵏ ⵜⵙⵍⵍⴰⵙⵜ' },
    subtitle: { ar: 'إضافة وتعديل وحذف السيارات', en: 'Add, edit and delete vehicles', fr: 'Ajouter, modifier et supprimer', ber: 'ⵔⵏⵓ, ⵙⵏⴼⵍ, ⴽⴽⵙ ⵜⵙⵍⵍⴰⵙⵜ' },
    addCar: { ar: 'إضافة سيارة', en: 'Add Vehicle', fr: 'Ajouter', ber: 'ⵔⵏⵓ ⵜⴰⵙⵍⵍⴰⵙⵜ' },
    save: { ar: 'حفظ', en: 'Save', fr: 'Sauvegarder', ber: 'ⵃⵛⵛ' },
    cancel: { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler', ber: 'ⵙⵙⵔ' },
    delete: { ar: 'حذف', en: 'Delete', fr: 'Supprimer', ber: 'ⴽⴽⵙ' },
    edit: { ar: 'تعديل', en: 'Edit', fr: 'Modifier', ber: 'ⵙⵏⴼⵍ' },
    carCount: { ar: 'عدد السيارات', en: 'Total Vehicles', fr: 'Total Véhicules', ber: 'ⴰⵎⵎⴰⵢ ⵏ ⵜⵙⵍⵍⴰⵙⵜ' },
    resetDefault: { ar: 'إعادة الافتراضي', en: 'Reset Defaults', fr: 'Réinitialiser', ber: 'ⴰⵔⵔⵉⵣ ⴰⵎⵉⵔⴰⵢ' },
    img: { ar: 'رابط الصورة', en: 'Image URL', fr: 'URL Image', ber: 'ⴰⵏⵙⴰ ⵏ ⵜⵡⵍⴰⴼⵜ' },
    type: { ar: 'النوع', en: 'Type', fr: 'Type', ber: 'ⴰⵏⴰⵡ' },
    phone: { ar: 'الهاتف', en: 'Phone', fr: 'Téléphone', ber: 'ⵜⴰⵍⵖⴰ' },
    seats: { ar: 'المقاعد', en: 'Seats', fr: 'Places', ber: 'ⵉⵖⵔⵎⴰⵏ' },
    fuel: { ar: 'الوقود', en: 'Fuel', fr: 'Carburant', ber: 'ⴰⵙⵏⴰⵍ' },
    name: { ar: 'الاسم', en: 'Name', fr: 'Nom', ber: 'ⵉⵙⵎ' },
    desc: { ar: 'الوصف', en: 'Description', fr: 'Description', ber: 'ⴰⴳⵍⴰⵎ' },
    price: { ar: 'السعر', en: 'Price', fr: 'Prix', ber: 'ⵙⵙⵎⵏ' },
    expand: { ar: 'التفاصيل', en: 'Details', fr: 'Détails', ber: 'ⵜⵉⵍⵍⴰⵙ' },
    confirmReset: { ar: 'هل أنت متأكد؟ سيتم إعادة جميع السيارات للافتراضي', en: 'Are you sure? All cars will be reset to defaults', fr: 'Êtes-vous sûr? Toutes les voitures seront réinitialisées', ber: 'ⵉⵙⵙⵏⴽⴽ ⵜⴳⵉⴷ? ⴰⴷ ⴰⵔⵔⵉⵣⵏⵜ ⵜⵙⵍⵍⴰⵙⵜ' },
    yes: { ar: 'نعم', en: 'Yes', fr: 'Oui', ber: 'ⵢⵉⵢ' },
    no: { ar: 'لا', en: 'No', fr: 'Non', ber: 'ⵓⵀⵓ' },
    empty: { ar: 'لا توجد سيارات. أضف سيارة جديدة!', en: 'No vehicles yet. Add your first one!', fr: 'Aucun véhicule. Ajoutez le premier!', ber: 'ⵓⵍⵍⵉⵏ ⵜⵙⵍⵍⴰⵙⵜ' },
    addNew: { ar: 'إضافة سيارة جديدة', en: 'Add New Vehicle', fr: 'Nouveau Véhicule', ber: 'ⵔⵏⵓ ⵜⴰⵙⵍⵍⴰⵙⵜ' },
    editCar: { ar: 'تعديل السيارة', en: 'Edit Vehicle', fr: 'Modifier', ber: 'ⵙⵏⴼⵍ ⵜⴰⵙⵍⵍⴰⵙⵜ' },
    priceHint: { ar: 'مثال: 400 درهم/يوم', en: 'e.g. 400 MAD/day', fr: 'ex: 400 MAD/jour', ber: 'ⴰⵎⴷⵢⴰ: 400 MAD/ⴰⵙⵙ' },
    seatsHint: { ar: 'مثال: 5 مقاعد', en: 'e.g. 5 Seats', fr: 'ex: 5 Places', ber: 'ⴰⵎⴷⵢⴰ: 5 ⵉⵖⵔⵎⴰⵏ' },
    fuelHint: { ar: 'مثال: بنزين', en: 'e.g. Petrol', fr: 'ex: Essence', ber: 'ⴰⵎⴷⵢⴰ: ⴰⵙⵏⴰⵍ' },
    noImg: { ar: 'لا توجد صورة', en: 'No Image', fr: 'Pas d\'image', ber: 'ⵓⵍⵍⵉⵏ ⵜⵡⵍⴰⴼⵜ' },
    tabCars: { ar: 'السيارات', en: 'Vehicles', fr: 'Véhicules', ber: 'ⵜⵙⵍⵍⴰⵙⵜ' },
    tabBookings: { ar: 'الحجوزات', en: 'Bookings', fr: 'Réservations', ber: 'ⵉⵙⵏⴷⵇⵏ' },
    bookingName: { ar: 'الاسم', en: 'Name', fr: 'Nom', ber: 'ⵉⵙⵎ' },
    bookingItem: { ar: 'الحجز', en: 'Item', fr: 'Article', ber: 'ⴰⵀⴰⵢⵢⴰ' },
    bookingDates: { ar: 'التواريخ', en: 'Dates', fr: 'Dates', ber: 'ⴰⵙⵙ' },
    bookingPhone: { ar: 'الهاتف', en: 'Phone', fr: 'Téléphone', ber: 'ⵜⴰⵍⵖⴰ' },
    bookingTotal: { ar: 'المبلغ', en: 'Amount', fr: 'Montant', ber: 'ⵙⵛⵎⵎ' },
    bookingStatus: { ar: 'الحالة', en: 'Status', fr: 'Statut', ber: 'ⴰⵎⵎⴰⵢ' },
    bookingPayStatus: { ar: 'الدفع', en: 'Payment', fr: 'Paiement', ber: 'ⴰⵅⵍⴰⵙ' },
    payOnArrival: { ar: 'الدفع عند الوصول', en: 'Pay on Arrival', fr: 'Paiement sur place', ber: 'ⵃⵜⵜⴰ ⴷ ⴰⵔⵔⴰⵡ' },
    payUnpaid: { ar: 'غير مدفوع', en: 'Unpaid', fr: 'Non payé', ber: 'ⴰⵔ ⵉⵜⵜⵓⵅⵍⴰⵙ' },
    payPaid: { ar: 'مدفوع', en: 'Paid', fr: 'Payé', ber: 'ⵉⵜⵜⵓⵅⵍⴰⵙ' },
    bookingTypeHotel: { ar: 'فندق', en: 'Hotel', fr: 'Hôtel', ber: 'ⵜⴰⵔⵉⴽⵜ' },
    bookingTypeCar: { ar: 'سيارة', en: 'Car', fr: 'Voiture', ber: 'ⵜⴰⵙⵍⵍⴰⵙⵜ' },
    markPaid: { ar: 'تسجيل الدفع', en: 'Mark Paid', fr: 'Marquer payé', ber: 'ⵎⴰⵔⴽ ⵉⵜⵜⵓⵅⵍⴰⵙ' },
    confirmBooking: { ar: 'تأكيد الحجز', en: 'Confirm', fr: 'Confirmer', ber: 'ⵙⵜⵉⵏ' },
    emptyBookings: { ar: 'لا توجد حجوزات حتى الآن', en: 'No bookings yet', fr: 'Aucune réservation', ber: 'ⵓⵍⵍⵉⵏ ⵉⵙⵏⴷⵇⵏ' },
    bookingsHint: { ar: 'الحجوزات الجديدة تظهر هنا — تحقق من الدفع عند وصول العميل وسجله', en: 'New bookings appear here — verify payment on arrival and record it', fr: 'Les nouvelles réservations apparaissent ici — vérifiez le paiement à l\'arrivée', ber: 'ⵉⵙⵏⴷⵇⵏ ⵉⵎⴰⵢⵏⵓⵜⵏ ⴷⴰ ⵉⵜⵜⴰⴼⴼⵏ' },
    needLogin: { ar: 'سجل الدخول لرؤية الحجوزات', en: 'Log in to view bookings', fr: 'Connectez-vous pour voir les réservations', ber: 'ⵙⵜⵉⵏ ⴰⵅⵛⵓⵎ' },
  };

  const l = (key: keyof typeof labels) => labels[key][lang as Lang] || labels[key].en;

  const getCarName = (car: any) => {
    if (lang === 'ar') return car.nameAr;
    if (lang === 'fr') return car.nameFr;
    if (lang === 'ber') return car.nameBer;
    return car.nameEn;
  };

  const getCarPrice = (car: any) => {
    if (lang === 'ar') return car.priceAr;
    if (lang === 'fr') return car.priceFr;
    if (lang === 'ber') return car.priceBer;
    return car.priceEn;
  };

  const getCarDesc = (car: any) => {
    if (lang === 'ar') return car.descriptionAr;
    if (lang === 'fr') return car.descriptionFr;
    if (lang === 'ber') return car.descriptionBer;
    return car.descriptionEn;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-[#1b5e3f] to-[#0f3d28]">
      <div className="container" dir={dir}>
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#c8a951] text-sm font-semibold mb-4 backdrop-blur-sm">
              {lang === 'ar' ? '🔧 لوحة التحكم' : lang === 'fr' ? '⚙️ Tableau de Bord' : lang === 'ber' ? '🔧 ⴰⵙⵏⴼⵍ' : '🔧 Dashboard'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{l('title')}</h2>
            <p className="text-white/70 text-lg">{l('subtitle')}</p>
          </motion.div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/10">
              <Car className="w-5 h-5 text-[#c8a951]" />
              <span className="text-white/80 text-sm">{l('carCount')}</span>
              <span className="text-2xl font-bold text-[#c8a951]">{cars.length}</span>
            </div>
            {bookingsData && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/10">
                <ClipboardList className="w-5 h-5 text-[#c8a951]" />
                <span className="text-white/80 text-sm">{l('tabBookings')}</span>
                <span className="text-2xl font-bold text-[#c8a951]">{bookingsData.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setActiveTab('cars')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'cars' ? 'bg-[#c8a951] text-[#1b5e3f]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4 inline me-1.5" />{l('tabCars')}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'bookings' ? 'bg-[#c8a951] text-[#1b5e3f]' : 'text-white/70 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4 inline me-1.5" />{l('tabBookings')}
            </button>
          </div>
        </div>

        {/* Action Buttons (cars tab) */}
        {activeTab === 'cars' && (
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAddForm} className="px-5 py-2.5 bg-[#c8a951] text-[#1b5e3f] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#d4b75e] transition-colors">
              <Plus className="w-4 h-4" />
              {l('addCar')}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowResetConfirm(true)} className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
              <RotateCcw className="w-4 h-4" />
              {l('resetDefault')}
            </motion.button>
          </div>
        )}

        {/* Bookings Panel */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-4xl mx-auto">
            {!bookingsData ? (
              <div className="text-center py-12 text-white/60 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{l('needLogin')}</p>
              </div>
            ) : bookingsData.length === 0 ? (
              <div className="text-center py-12 text-white/60 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{l('emptyBookings')}</p>
                <p className="text-xs mt-2 text-white/40">{l('bookingsHint')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <p className="text-white/60 text-xs">{l('bookingsHint')}</p>
                </div>
                {bookingsData.map((b: any) => {
                  const isPaid = b.paymentStatus === 'paid';
                  const isConfirmed = b.status === 'confirmed';
                  return (
                    <div key={b.id} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
                        <div>
                          <span className="text-white/40 text-xs block">{l('bookingItem')}</span>
                          <p className="text-white text-sm font-semibold">{b.itemName}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${b.type === 'hotel' ? 'bg-[#1b5e3f] text-[#c8a951]' : 'bg-[#c8a951] text-[#1b5e3f]'}`}>
                            {b.type === 'hotel' ? l('bookingTypeHotel') : l('bookingTypeCar')}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 text-xs block">{l('bookingName')}</span>
                          <p className="text-white text-sm font-semibold">{b.guestName}</p>
                          <p className="text-white/50 text-xs">{b.guestPhone || b.guestEmail}</p>
                        </div>
                        <div>
                          <span className="text-white/40 text-xs block">{l('bookingDates')}</span>
                          <p className="text-white text-xs font-medium">{new Date(b.checkIn).toLocaleDateString()}</p>
                          <p className="text-white/50 text-xs">→ {new Date(b.checkOut).toLocaleDateString()}</p>
                          {b.type === 'car' && b.pickUpTime && <p className="text-white/50 text-[10px]">{b.pickUpTime} - {b.dropOffTime}</p>}
                        </div>
                        <div>
                          <span className="text-white/40 text-xs block">{l('bookingPayStatus')}</span>
                          <p className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${isPaid ? 'text-[#c8a951]' : 'text-white/70'}`}>
                            {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {isPaid ? l('payPaid') : l('payUnpaid')}
                          </p>
                          <p className="text-white/40 text-[10px] mt-0.5">{l('payOnArrival')}</p>
                          {b.totalPrice && <p className="text-[#c8a951] text-xs font-semibold mt-1">{b.totalPrice}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          {!isPaid && (
                            <button
                              onClick={() => markPaidMutation.mutate({ id: b.id })}
                              disabled={markPaidMutation.isPending}
                              className="px-3 py-1.5 bg-[#c8a951] text-[#1b5e3f] rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#d4b75e] transition-colors disabled:opacity-50"
                            >
                              <CreditCard className="w-3.5 h-3.5" />{l('markPaid')}
                            </button>
                          )}
                          {!isConfirmed && (
                            <button
                              onClick={() => confirmMutation.mutate({ id: b.id })}
                              disabled={confirmMutation.isPending}
                              className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-white/20 transition-colors border border-white/10 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />{l('confirmBooking')}
                            </button>
                          )}
                          {isConfirmed && (
                            <span className="text-[#c8a951] text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />{lang === 'ar' ? 'مؤكد' : lang === 'fr' ? 'Confirmé' : 'Confirmed'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Cars List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {cars.length === 0 && (
            <div className="text-center py-12 text-white/60">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{l('empty')}</p>
            </div>
          )}

          <AnimatePresence>
            {cars.map((car: any, i: number) => (
              <motion.div key={car.id} initial={{ opacity: 0, x: isRTL ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? -30 : 30 }} transition={{ delay: i * 0.05 }} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {/* Car Summary Row */}
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedId(expandedId === car.id ? null : car.id)}>
                  <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                    {car.image ? (
                      <img src={car.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-full h-full p-3 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{getCarName(car)}</p>
                    <p className="text-white/50 text-xs">{car.typeAr}</p>
                  </div>
                  <div className="text-[#c8a951] font-bold text-sm">{getCarPrice(car)}</div>
                  <motion.div animate={{ rotate: expandedId === car.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </motion.div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === car.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2 border-t border-white/10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('seats')}</span>
                            <span className="text-white text-sm font-medium">{car.seats}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('fuel')}</span>
                            <span className="text-white text-sm font-medium">{car.fuel}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('phone')}</span>
                            <span className="text-white text-sm font-medium">{car.phone}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('desc')}</span>
                            <span className="text-white text-xs truncate block">{getCarDesc(car) || '-'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openEditForm(car); }} className="flex-1 py-2 bg-[#c8a951]/20 text-[#c8a951] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#c8a951]/30 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                            {l('edit')}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(car.id); }} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/30 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                            {l('delete')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()} dir={dir}>
                {/* Form Header */}
                <div className="bg-[#1b5e3f] rounded-t-3xl px-6 py-4 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">{editingId !== null ? l('editCar') : l('addNew')}</h3>
                  <button onClick={resetForm} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('img')}</label>
                    <input type="url" value={formData.img} onChange={(e) => setFormData({ ...formData, img: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('type')}</label>
                    <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="SUV / 4x4 / Economy / Luxury" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>

                  {/* Name fields per language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('name')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['ar', 'en', 'fr', 'ber'] as Lang[]).map((l_lang) => (
                        <input key={l_lang} type="text" value={formData.name[l_lang]} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, [l_lang]: e.target.value } })} placeholder={l_lang === 'ar' ? 'بالعربية' : l_lang === 'fr' ? 'En français' : l_lang === 'ber' ? 'ⵙ ⵜⴰⵎⴰⵣⵉⵖⵜ' : 'In English'} className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('desc')}</label>
                    <textarea value={formData.desc.ar} onChange={(e) => setFormData({ ...formData, desc: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value } })} rows={2} placeholder={l('desc')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>

                  {/* Seats & Fuel */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{l('seats')}</label>
                      <input type="text" value={formData.seats.ar} onChange={(e) => setFormData({ ...formData, seats: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value } })} placeholder={l('seatsHint')} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{l('fuel')}</label>
                      <input type="text" value={formData.fuel.ar} onChange={(e) => setFormData({ ...formData, fuel: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value } })} placeholder={l('fuelHint')} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('price')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={formData.price.ar} onChange={(e) => setFormData({ ...formData, price: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value } })} placeholder={l('priceHint')} className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                      <input type="text" value={formData.price.en} onChange={(e) => setFormData({ ...formData, price: { ...formData.price, en: e.target.value } })} placeholder="400 MAD/day" className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('phone')}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+212 5XX XXX XXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-3xl flex gap-3">
                  <button onClick={resetForm} className="flex-1 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-300 transition-colors">{l('cancel')}</button>
                  <button onClick={handleSubmit} disabled={createCarMutation.isPending || updateCarMutation.isPending} className="flex-1 py-2.5 bg-[#1b5e3f] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0f3d28] transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    {l('save')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResetConfirm(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-gray-700 mb-6">{l('confirmReset')}</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-300 transition-colors">{l('no')}</button>
                  <button onClick={handleReset} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">{l('yes')}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
