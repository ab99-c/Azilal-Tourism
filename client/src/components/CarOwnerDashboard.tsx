/**
 * Car Owner Dashboard
 * ============================================================
 * CRUD management panel for car rental owners
 * Features: Add, Edit, Delete cars + Car count display
 * Uses localStorage for persistence
 * Supports RTL Arabic with translations
 * ============================================================
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Plus, Pencil, Trash2, X, Car, ChevronDown, ChevronUp,
  Save, RotateCcw, Image
} from 'lucide-react';
import {
  getCars, addCar, updateCar, deleteCar, resetCars,
  type CarData
} from '@/lib/carStore';

type Lang = 'ar' | 'en' | 'fr' | 'ber';

export default function CarOwnerDashboard() {
  const { t, lang } = useLanguage();
  const [cars, setCars] = useState<CarData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  // Load cars on mount
  useEffect(() => {
    setCars(getCars());
  }, []);

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
  const openEditForm = (car: CarData) => {
    setFormData({
      img: car.img,
      name: { ...car.name },
      desc: { ...car.desc },
      seats: { ...car.seats },
      fuel: { ...car.fuel },
      type: car.type,
      price: { ...car.price },
      phone: car.phone,
    });
    setEditingId(car.id);
    setShowForm(true);
    setExpandedId(null);
  };

  // Submit form (add or update)
  const handleSubmit = () => {
    if (editingId) {
      const updated = updateCar(editingId, formData);
      if (updated) {
        setCars(getCars());
        resetForm();
      }
    } else {
      addCar(formData);
      setCars(getCars());
      resetForm();
    }
  };

  // Delete car with confirmation
  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه السيارة؟' : 'Are you sure you want to delete this car?')) {
      deleteCar(id);
      setCars(getCars());
      if (expandedId === id) setExpandedId(null);
    }
  };

  // Reset all cars to defaults
  const handleReset = () => {
    resetCars();
    setCars(getCars());
    setShowResetConfirm(false);
    setShowForm(false);
    setEditingId(null);
  };

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
  };

  const l = (key: keyof typeof labels) => labels[key][lang as Lang] || labels[key].en;

  return (
    <section className="py-16 bg-gradient-to-b from-[#1b5e3f] to-[#0f3d28]">
      <div className="container" dir={dir}>
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#c8a951] text-sm font-semibold mb-4 backdrop-blur-sm">
              {lang === 'ar' ? '🔧 لوحة التحكم' : lang === 'fr' ? '⚙️ Tableau de Bord' : lang === 'ber' ? '🔧 ⴰⵙⵏⴼⵍ' : '🔧 Dashboard'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              {l('title')}
            </h2>
            <p className="text-white/70 text-lg">{l('subtitle')}</p>
          </motion.div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/10">
              <Car className="w-5 h-5 text-[#c8a951]" />
              <span className="text-white/80 text-sm">{l('carCount')}</span>
              <span className="text-2xl font-bold text-[#c8a951]">{cars.length}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAddForm}
            className="px-5 py-2.5 bg-[#c8a951] text-[#1b5e3f] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#d4b75e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {l('addCar')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowResetConfirm(true)}
            className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
          >
            <RotateCcw className="w-4 h-4" />
            {l('resetDefault')}
          </motion.button>
        </div>

        {/* Cars List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {cars.length === 0 && (
            <div className="text-center py-12 text-white/60">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{l('empty')}</p>
            </div>
          )}

          <AnimatePresence>
            {cars.map((car, i) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -30 : 30 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Car Summary Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(expandedId === car.id ? null : car.id)}
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                    {car.img ? (
                      <img src={car.img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-full h-full p-3 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {lang === 'ar' ? car.name.ar : lang === 'fr' ? car.name.fr : lang === 'ber' ? car.name.ber : car.name.en}
                    </p>
                    <p className="text-white/50 text-xs">{car.type}</p>
                  </div>
                  <div className="text-[#c8a951] font-bold text-sm">
                    {lang === 'ar' ? car.price.ar : lang === 'fr' ? car.price.fr : lang === 'ber' ? car.price.ber : car.price.en}
                  </div>
                  <motion.div
                    animate={{ rotate: expandedId === car.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </motion.div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === car.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-white/10">
                        {/* Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('seats')}</span>
                            <span className="text-white text-sm font-medium">
                              {lang === 'ar' ? car.seats.ar : lang === 'fr' ? car.seats.fr : lang === 'ber' ? car.seats.ber : car.seats.en}
                            </span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('fuel')}</span>
                            <span className="text-white text-sm font-medium">
                              {lang === 'ar' ? car.fuel.ar : lang === 'fr' ? car.fuel.fr : lang === 'ber' ? car.fuel.ber : car.fuel.en}
                            </span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('phone')}</span>
                            <span className="text-white text-sm font-medium">{car.phone}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('img')}</span>
                            <span className="text-white text-xs truncate block">{car.img || '-'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditForm(car); }}
                            className="flex-1 py-2 bg-[#c8a951]/20 text-[#c8a951] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#c8a951]/30 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            {l('edit')}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(car.id); }}
                            className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/30 transition-colors"
                          >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => resetForm()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                dir={dir}
              >
                {/* Form Header */}
                <div className="bg-[#1b5e3f] rounded-t-3xl px-6 py-4 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">
                    {editingId ? l('editCar') : l('addNew')}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('img')}</label>
                    <input
                      type="url"
                      value={formData.img}
                      onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('type')}</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="SUV / 4x4 / Economy / Luxury"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm"
                    />
                  </div>

                  {/* Name fields per language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('name')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['ar', 'en', 'fr', 'ber'] as Lang[]).map((l_lang) => (
                        <input
                          key={l_lang}
                          type="text"
                          value={formData.name[l_lang]}
                          onChange={(e) => setFormData({
                            ...formData,
                            name: { ...formData.name, [l_lang]: e.target.value }
                          })}
                          placeholder={l_lang === 'ar' ? 'بالعربية' : l_lang === 'fr' ? 'En français' : l_lang === 'ber' ? 'ⵙ ⵜⴰⵎⴰⵣⵉⵖⵜ' : 'In English'}
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('desc')}</label>
                    <textarea
                      value={formData.desc.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        desc: { ...formData.desc, ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value }
                      })}
                      rows={2}
                      placeholder={l('desc')}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm"
                    />
                  </div>

                  {/* Seats & Fuel */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{l('seats')}</label>
                      <input
                        type="text"
                        value={formData.seats.ar}
                        onChange={(e) => setFormData({
                          ...formData,
                          seats: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value }
                        })}
                        placeholder={l('seatsHint')}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{l('fuel')}</label>
                      <input
                        type="text"
                        value={formData.fuel.ar}
                        onChange={(e) => setFormData({
                          ...formData,
                          fuel: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value }
                        })}
                        placeholder={l('fuelHint')}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('price')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.price.ar}
                        onChange={(e) => setFormData({
                          ...formData,
                          price: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value }
                        })}
                        placeholder={l('priceHint')}
                        className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs"
                      />
                      <input
                        type="text"
                        value={formData.price.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          price: { ...formData.price, en: e.target.value }
                        })}
                        placeholder="400 MAD/day"
                        className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('phone')}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+212 5XX XXX XXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-3xl flex gap-3">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-300 transition-colors"
                  >
                    {l('cancel')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 bg-[#1b5e3f] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0f3d28] transition-colors"
                  >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowResetConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {l('confirmReset')}
                </h3>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                  >
                    {l('no')}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
                  >
                    {l('yes')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
