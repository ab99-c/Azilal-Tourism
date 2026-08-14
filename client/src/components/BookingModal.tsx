import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Calendar, Clock, Users, Mail, Phone, CheckCircle, AlertCircle, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'hotel' | 'car';
  itemId?: number;
  itemName: string;
  price: string;
  image?: string;
}
export default function BookingModal({ isOpen, onClose, type, itemId, itemName, price, image }: BookingModalProps) {
  const { lang, t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    guests: '1',
    pickupTime: '09:00',
    returnTime: '18:00',
    notes: '',
  });
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Compute total price: hotels = nights * per-night rate; cars = days * per-day rate
  const computedTotal = (() => {
    if (!formData.startDate || !formData.endDate) return null;
    const a = new Date(formData.startDate);
    const b = new Date(formData.endDate);
    if (isNaN(a.getTime()) || isNaN(b.getTime()) || b.getTime() < a.getTime()) return null;
    const nights = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
    const num = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
    return nights * num;
  })();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = lang === 'ar';

  const t_book = (key: string) => {
    const translations: Record<Lang, Record<string, string>> = {
      ar: {
        'booking.title.hotel': 'حجز فندق',
        'booking.title.car': 'حجز سيارة',
        'booking.step1': 'التواريخ',
        'booking.step2': 'المعلومات الشخصية',
        'booking.step3': 'طريقة الدفع',
        'booking.step4': 'التأكيد',
        'booking.name': 'الاسم الكامل',
        'booking.namePh': 'أدخل اسمك الكامل',
        'booking.email': 'البريد الإلكتروني',
        'booking.emailPh': 'example@email.com',
        'booking.phone': 'رقم الهاتف',
        'booking.phonePh': '+212 6XX XXX XXX',
        'booking.startDate': 'تاريخ الوصول / الاستلام',
        'booking.endDate': 'تاريخ المغادرة / الإرجاع',
        'booking.guests': 'عدد النزلاء',
        'booking.guestsLabel': 'شخص',
        'booking.pickupTime': 'وقت الاستلام',
        'booking.returnTime': 'وقت الإرجاع',
        'booking.notes': 'ملاحظات إضافية',
        'booking.notesPh': 'أي طلبات خاصة...',
        'booking.next': 'التالي',
        'booking.prev': 'السابق',
        'booking.confirm': 'تأكيد الحجز',
        'booking.success': 'تم تأكيد حجزك بنجاح!',
        'booking.successDesc': 'سنتواصل معك قريباً لتأكيد التفاصيل',
        'booking.close': 'إغلاق',
        'booking.price': 'السعر',
        'booking.item': 'المكان',
        'booking.perNight': '/ليلة',
        'booking.perDay': '/يوم',
        'booking.required': 'هذا الحقل مطلوب',
        'booking.payMethod': 'طريقة الدفع',
        'booking.payOnArrival': 'الدفع عند الوصول',
        'booking.payOnArrivalDesc': 'أنت تدفع مباشرة للفندق أو صاحب السيارة عند الوصول — بدون أي رسوم إضافية',
        'booking.payOnArrivalNote': '⚠️ الدفع عند الوصول / الدفع نقدًا أو بتحويل بنكي',
        'booking.total': 'المجموع التقديري',
        'booking.nights': 'ليلة',
        'booking.days': 'يوم',
        'booking.pleaseLogin': 'يرجى تسجيل الدخول لإكمال الحجز',
        'booking.confirmPay': 'تأكيد الحجز — الدفع عند الوصول',
      },
      en: {
        'booking.title.hotel': 'Book Hotel',
        'booking.title.car': 'Book Car',
        'booking.step1': 'Dates',
        'booking.step2': 'Personal Info',
        'booking.step3': 'Payment',
        'booking.step4': 'Confirmation',
        'booking.name': 'Full Name',
        'booking.namePh': 'Enter your full name',
        'booking.email': 'Email',
        'booking.emailPh': 'example@email.com',
        'booking.phone': 'Phone Number',
        'booking.phonePh': '+212 6XX XXX XXX',
        'booking.startDate': 'Check-in / Pickup Date',
        'booking.endDate': 'Check-out / Return Date',
        'booking.guests': 'Guests',
        'booking.guestsLabel': 'guest(s)',
        'booking.pickupTime': 'Pickup Time',
        'booking.returnTime': 'Return Time',
        'booking.notes': 'Additional Notes',
        'booking.notesPh': 'Any special requests...',
        'booking.next': 'Next',
        'booking.prev': 'Back',
        'booking.confirm': 'Confirm Booking',
        'booking.success': 'Booking Confirmed!',
        'booking.successDesc': 'We will contact you shortly to confirm details',
        'booking.close': 'Close',
        'booking.price': 'Price',
        'booking.item': 'Place',
        'booking.perNight': '/night',
        'booking.perDay': '/day',
        'booking.required': 'This field is required',
        'booking.payMethod': 'Payment Method',
        'booking.payOnArrival': 'Pay on Arrival',
        'booking.payOnArrivalDesc': 'You pay directly to the hotel or car owner upon arrival — no extra fees',
        'booking.payOnArrivalNote': '⚠️ Pay on arrival / pay in cash or by bank transfer',
        'booking.total': 'Estimated Total',
        'booking.nights': 'night(s)',
        'booking.days': 'day(s)',
        'booking.confirmPay': 'Confirm Booking — Pay on Arrival',
      },
      fr: {
        'booking.title.hotel': 'Réserver Hôtel',
        'booking.title.car': 'Louer Voiture',
        'booking.step1': 'Dates',
        'booking.step2': 'Informations',
        'booking.step3': 'Paiement',
        'booking.step4': 'Confirmation',
        'booking.name': 'Nom Complet',
        'booking.namePh': 'Entrez votre nom complet',
        'booking.email': 'Email',
        'booking.emailPh': 'example@email.com',
        'booking.phone': 'Téléphone',
        'booking.phonePh': '+212 6XX XXX XXX',
        'booking.startDate': 'Arrivée / Ramassage',
        'booking.endDate': 'Départ / Retour',
        'booking.guests': 'Invités',
        'booking.guestsLabel': 'personne(s)',
        'booking.pickupTime': 'Heure de départ',
        'booking.returnTime': 'Heure de retour',
        'booking.notes': 'Notes Supplémentaires',
        'booking.notesPh': 'Demandes spéciales...',
        'booking.next': 'Suivant',
        'booking.prev': 'Retour',
        'booking.confirm': 'Confirmer',
        'booking.success': 'Réservation Confirmée!',
        'booking.successDesc': 'Nous vous contacterons bientôt pour confirmer',
        'booking.close': 'Fermer',
        'booking.price': 'Prix',
        'booking.item': 'Lieu',
        'booking.perNight': '/nuit',
        'booking.perDay': '/jour',
        'booking.required': 'Ce champ est requis',
        'booking.payMethod': 'Mode de Paiement',
        'booking.payOnArrival': 'Paiement sur place',
        'booking.payOnArrivalDesc': 'Vous payez directement à l\'hôtel ou au propriétaire de la voiture à votre arrivée — sans frais supplémentaires',
        'booking.payOnArrivalNote': '⚠️ Paiement sur place / en espèces ou par virement',
        'booking.total': 'Total estimé',
        'booking.nights': 'nuit(s)',
        'booking.days': 'jour(s)',
        'booking.confirmPay': 'Confirmer — Paiement sur place',
      },
      ber: {
        'booking.title.hotel': 'ⵙⵏⴷⵇ',
        'booking.title.car': 'ⵜⵔⵎ ⵜⴰⵙⵍⵍⴰⵙⵜ',
        'booking.step1': 'ⴰⵙⵙ',
        'booking.step2': 'ⵉⵙⴼⴽⴰ',
        'booking.step3': 'ⴰⵅⵍⴰⵙ',
        'booking.step4': 'ⵙⵜⵉⵏ',
        'booking.name': 'ⵉⵙⵎ',
        'booking.namePh': 'ⴰⵔⵔⴰ ⵉⵙⵎ ⵏⵏⴽ',
        'booking.email': 'ⵉⵎⴰⵢⵍ',
        'booking.emailPh': 'example@email.com',
        'booking.phone': 'ⵓⵟⵟⵓⵏ',
        'booking.phonePh': '+212 6XX XXX XXX',
        'booking.startDate': 'ⴰⵙⵙ ⵏ ⵜⴰⵡⵉⵢⵜ',
        'booking.endDate': 'ⴰⵙⵙ ⵏ ⵜⴰⵀⵓⵖⴰ',
        'booking.guests': 'ⵉⵎⴷⴷⴰⵏ',
        'booking.guestsLabel': 'ⴰⵎⴷⴷⴰ',
        'booking.pickupTime': 'ⵜⴰⵙⵏⴰⵜ',
        'booking.returnTime': 'ⵜⴰⵙⵏⴰⵜ ⵏ ⵜⵓⵖⵍⴰ',
        'booking.notes': 'ⵉⵙⴼⴽⴰ',
        'booking.notesPh': 'ⵉⵙⵓⵜⵔⵏ...',
        'booking.next': 'ⴰⵢⵢⴰⴷ',
        'booking.prev': 'ⵓⵖⴰⵍ',
        'booking.confirm': 'ⵙⵜⵉⵏ',
        'booking.success': 'ⵉⵜⵜⵓⵙⵜⵉⵏ!',
        'booking.successDesc': 'ⴰⵔⴰ ⵏⵎⵥⴰ ⵎⵛⵛ',
        'booking.close': 'ⵔⵥⵎ',
        'booking.price': 'ⵙⵛⵎⵎ',
        'booking.item': 'ⴰⵎⴷⴰⵏ',
        'booking.perNight': '/ⵉⴷ',
        'booking.perDay': '/ⴰⵙⵙ',
        'booking.required': 'ⵉⵍⴰ ⴰⴷ ⵜⵎⵍⴰⵜ',
        'booking.payMethod': 'ⵜⴰⵍⵍⴰⵙⵜ ⵏ ⵓⵅⵍⴰⵙ',
        'booking.payOnArrival': 'ⵃⵜⵜⴰ ⴷ ⴰⵔⵔⴰⵡ',
        'booking.payOnArrivalDesc': 'ⵜⵅⵍⴰⵙⴷ ⵉ ⵜⴰⵔⵉⴽⵜ ⵏⵖ ⴱⴰⴱ ⵏ ⵜⴰⵙⵍⵍⴰⵙⵜ ⵃⵜⵜⴰ ⴷ ⴰⵔⵔⴰⵡ',
        'booking.payOnArrivalNote': 'ⵃⵜⵜⴰ ⴷ ⴰⵔⵔⴰⵡ — ⵙ ⵜⴰⵀⴰⵎⵜ ⵏⵖ ⵙ ⵓⵡⵜⵜⴰⵙ',
        'booking.total': 'ⵓⵎⴷⴷⴰⵢ',
        'booking.nights': 'ⵉⴷⴷⵉⵙⵏ',
        'booking.days': 'ⴰⵙⵙⵏ',
        'booking.confirmPay': 'ⵙⵜⵉⵏ — ⵃⵜⵜⴰ ⴷ ⴰⵔⵔⴰⵡ',
      },
    };
    return translations[lang]?.[key] || key;
  };

  const totalLabel = computedTotal ? (
    `${Math.round(computedTotal).toLocaleString()} MAD — ${computedTotal === Math.round(computedTotal) ? '' : ''}${type === 'hotel' ? `${Math.max(1, Math.round((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 86400000))} ${t_book('booking.nights')}` : `${Math.max(1, Math.round((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 86400000))} ${t_book('booking.days')}`}`
  ) : null;

  type Lang = 'ar' | 'en' | 'fr' | 'ber';

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.startDate) newErrors.startDate = true;
    if (!formData.endDate) newErrors.endDate = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (!formData.email.trim()) newErrors.email = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrev = () => {
    setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 | 4 : 1));
  };

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success(t_book('booking.success'), {
        description: t_book('booking.successDesc'),
        duration: 4000,
      });
      onClose();
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(t_book('booking.error'), {
        description: error.message,
        duration: 4000,
      });
    },
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    createBookingMutation.mutate({
      type: type,
      itemId: itemId ?? 0,
      itemName: itemName,
      guestName: formData.fullName,
      guestEmail: formData.email,
      guestPhone: formData.phone,
      checkIn: formData.startDate,
      checkOut: formData.endDate,
      pickUpTime: type === 'car' ? formData.pickupTime : undefined,
      dropOffTime: type === 'car' ? formData.returnTime : undefined,
      guests: parseInt(formData.guests) || 1,
      notes: formData.notes,
      totalPrice: price,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${
              isRTL ? 'text-right' : 'text-left'
            }`}
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1b5e3f] to-[#0f3d28] p-6 pb-8">
              <button
                onClick={onClose}
                className="absolute top-4 end-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {image && (
                <div className="w-full h-24 rounded-xl overflow-hidden mb-4">
                  <img src={image} alt={itemName} className="w-full h-full object-cover" />
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-1">
                {t_book(type === 'hotel' ? 'booking.title.hotel' : 'booking.title.car')}
              </h3>
              <p className="text-white/80 text-sm">{itemName}</p>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-5">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        s <= step
                          ? 'bg-[#c8a951] text-[#1b5e3f]'
                          : 'bg-white/20 text-white/60'
                      }`}
                    >
                      {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                    </div>
                    <span className="text-xs text-white/70 hidden sm:block">
                      {s === 1 && t_book('booking.step1')}
                      {s === 2 && t_book('booking.step2')}
                      {s === 3 && t_book('booking.step3')}
                    </span>
                    {s < 4 && <div className="flex-1 h-px bg-white/20" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Calendar className="w-3.5 h-3.5 inline me-1" />
                        {t_book('booking.startDate')}
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        min={today}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        } focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Calendar className="w-3.5 h-3.5 inline me-1" />
                        {t_book('booking.endDate')}
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        min={formData.startDate || today}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        } focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm`}
                      />
                    </div>
                  </div>

                  {type === 'hotel' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Users className="w-3.5 h-3.5 inline me-1" />
                        {t_book('booking.guests')}
                      </label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {t_book('booking.guestsLabel')}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          <Clock className="w-3.5 h-3.5 inline me-1" />
                          {t_book('booking.pickupTime')}
                        </label>
                        <select
                          value={formData.pickupTime}
                          onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm bg-white"
                        >
                          {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          <Clock className="w-3.5 h-3.5 inline me-1" />
                          {t_book('booking.returnTime')}
                        </label>
                        <select
                          value={formData.returnTime}
                          onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm bg-white"
                        >
                          {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {t_book('booking.notes')}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t_book('booking.notesPh')}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm resize-none"
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="bg-[#f5f5f0] rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t_book('booking.price')}</span>
                    <span className="text-lg font-bold text-[#1b5e3f]">
                      {price} <span className="text-xs font-normal text-gray-400">
                        {type === 'hotel' ? t_book('booking.perNight') : t_book('booking.perDay')}
                      </span>
                    </span>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <Users className="w-3.5 h-3.5 inline me-1" />
                      {t_book('booking.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t_book('booking.namePh')}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <Mail className="w-3.5 h-3.5 inline me-1" />
                      {t_book('booking.email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t_book('booking.emailPh')}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <Phone className="w-3.5 h-3.5 inline me-1" />
                      {t_book('booking.phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t_book('booking.phonePh')}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:border-[#1b5e3f] focus:outline-none transition-colors text-sm`}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Banknote className="w-3.5 h-3.5 inline me-1" />
                      {t_book('booking.payMethod')}
                    </label>
                    <div className="border-2 border-[#1b5e3f] bg-[#1b5e3f]/5 rounded-xl p-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#1b5e3f] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{t_book('booking.payOnArrival')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t_book('booking.payOnArrivalDesc')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Total estimate */}
                  <div className="bg-[#f5f5f0] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {price} <span className="text-xs font-normal text-gray-400">
                          {type === 'hotel' ? t_book('booking.perNight') : t_book('booking.perDay')}
                        </span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {type === 'hotel'
                          ? `${Math.max(1, Math.round((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 86400000))} ${t_book('booking.nights')}`
                          : `${Math.max(1, Math.round((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 86400000))} ${t_book('booking.days')}`
                        }
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{t_book('booking.total')}</span>
                      <span className="text-xl font-bold text-[#1b5e3f]">
                        {computedTotal !== null ? `${Math.round(computedTotal).toLocaleString()} MAD` : price}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    {t_book('booking.payOnArrivalNote')}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  {isSubmitting ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-[#1b5e3f]/20 border-t-[#1b5e3f] rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">
                        {lang === 'ar' ? 'جاري تأكيد الحجز...' : lang === 'fr' ? 'Confirmation en cours...' : lang === 'ber' ? 'ⴰⴷ ⵉⵜⵜⵓⵙⵜⵉⵏ...' : 'Confirming booking...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[#1b5e3f]/5 rounded-2xl p-5 space-y-3 mb-4">
                        <h4 className="font-bold text-[#1b5e3f] text-sm mb-3">
                          {lang === 'ar' ? 'ملخص الحجز' : lang === 'fr' ? 'Résumé de la réservation' : lang === 'ber' ? 'ⴰⵎⵣⵔⵓⵢ' : 'Booking Summary'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400 text-xs">{t_book('booking.payMethod')}</span>
                            <p className="font-semibold text-gray-800">{t_book('booking.payOnArrival')}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">{t_book('booking.total')}</span>
                            <p className="font-semibold text-[#1b5e3f]">
                              {computedTotal !== null ? `${Math.round(computedTotal).toLocaleString()} MAD` : price}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400 text-xs">{t_book('booking.item')}</span>
                            <p className="font-semibold text-gray-800">{itemName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">{t_book('booking.price')}</span>
                            <p className="font-semibold text-gray-800">{price}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">
                              {type === 'hotel' ? (lang === 'ar' ? 'الوصول' : lang === 'fr' ? 'Arrivée' : 'Check-in') : t_book('booking.pickupTime')}
                            </span>
                            <p className="font-semibold text-gray-800">{formData.startDate}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">
                              {type === 'hotel' ? (lang === 'ar' ? 'المغادرة' : lang === 'fr' ? 'Départ' : 'Check-out') : t_book('booking.returnTime')}
                            </span>
                            <p className="font-semibold text-gray-800">{formData.endDate}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">{t_book('booking.name')}</span>
                            <p className="font-semibold text-gray-800">{formData.fullName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">{t_book('booking.email')}</span>
                            <p className="font-semibold text-gray-800">{formData.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">{t_book('booking.phone')}</span>
                            <p className="font-semibold text-gray-800">{formData.phone}</p>
                          </div>
                          {type === 'hotel' && (
                            <div>
                              <span className="text-gray-400 text-xs">{t_book('booking.guests')}</span>
                              <p className="font-semibold text-gray-800">{formData.guests} {t_book('booking.guestsLabel')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleSubmit}
                        className="w-full py-3.5 bg-[#1b5e3f] text-white rounded-xl font-bold text-sm hover:bg-[#0f3d28] transition-all hover:shadow-lg hover:shadow-[#1b5e3f]/30 active:scale-[0.98]"
                      >
                        <CheckCircle className="w-4 h-4 inline me-2" />
                        {t_book('booking.confirmPay')}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer Navigation */}
            {step < 3 && !isSubmitting && (
              <div className="px-6 pb-6 flex items-center justify-between">
                <button
                  onClick={step === 1 ? onClose : handlePrev}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {step === 1 ? t_book('booking.close') : t_book('booking.prev')}
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-[#1b5e3f] text-white rounded-xl font-bold text-sm hover:bg-[#0f3d28] transition-all hover:shadow-lg hover:shadow-[#1b5e3f]/30 active:scale-[0.98]"
                >
                  {t_book('booking.next')}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
