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
import { useAuth } from '@/_core/hooks/useAuth';
import {
  Plus, Pencil, Trash2, X, Car, ChevronDown,
  Save, RotateCcw, Image, ClipboardList, CheckCircle2,
  CreditCard, Clock, Utensils, Coffee, Upload, MessageCircle, Building2
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import WhatsAppButton from './WhatsAppButton';
import { getCustomerWhatsAppMessage } from '@/lib/whatsapp';

type Lang = 'ar' | 'en' | 'fr' | 'ber';

export default function CarOwnerDashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const dbHealthQuery = trpc.system.dbHealth.useQuery(undefined, {
    enabled: user?.role === 'admin',
    retry: false,
    refetchInterval: 60_000,
  });
  const { data: dashboardData, refetch } = trpc.dashboard.myCars.useQuery(undefined, {
    retry: false,
  });
  const { data: myHotels, refetch: refetchHotels } = trpc.dashboard.myHotels.useQuery(undefined, { retry: false });
  const { data: myRestaurants, refetch: refetchRestaurants } = trpc.dashboard.myRestaurants.useQuery(undefined, { retry: false });
  const { data: myCafes, refetch: refetchCafes } = trpc.dashboard.myCafes.useQuery(undefined, { retry: false });
  const { data: bookingsData } = trpc.dashboard.myBookings.useQuery(undefined, {
    retry: false,
  });
  const [cars, setCars] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'cars' | 'hotels' | 'restaurants' | 'cafes' | 'bookings'>('cars');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'all' | 'hotel' | 'car' | 'restaurant' | 'cafe'>('all');
  const [hotelWhatsAppDrafts, setHotelWhatsAppDrafts] = useState<Record<number, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    img: '',
    name: { ar: '', en: '', fr: '', ber: '' },
    desc: { ar: '', en: '', fr: '', ber: '' },
    seats: { ar: '', en: '', fr: '', ber: '' },
    fuel: { ar: '', en: '', fr: '', ber: '' },
    type: '',
    price: { ar: '', en: '', fr: '', ber: '' },
    cuisine: { ar: '', en: '', fr: '', ber: '' },
    location: { ar: '', en: '', fr: '', ber: '' },
    rating: '4.5',
    hours: '',
    phone: '',
    whatsapp: '',
  });

  // Load cars from database
  useEffect(() => {
    if (dashboardData) {
      setCars(dashboardData);
    }
  }, [dashboardData]);
  useEffect(() => {
    if (myRestaurants) setRestaurants(myRestaurants);
  }, [myRestaurants]);
  useEffect(() => {
    if (myCafes) setCafes(myCafes);
  }, [myCafes]);

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

  const updateHotelContactMutation = trpc.hotels.updateContact.useMutation({
    onSuccess: () => { refetchHotels(); toast.success(lang === 'ar' ? 'تم تحديث واتساب الفندق' : 'Hotel WhatsApp updated'); },
    onError: (err) => toast.error(lang === 'ar' ? 'فشل تحديث واتساب الفندق' : 'Failed to update hotel WhatsApp', { description: err.message }),
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

  // Restaurants & Cafes mutations
  const createRestaurantMutation = trpc.restaurants.create.useMutation({
    onSuccess: () => { refetchRestaurants(); resetForm(); toast.success(lang === 'ar' ? 'تمت إضافة المطعم بنجاح' : 'Restaurant added successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ في إضافة المطعم' : 'Error adding restaurant', { description: err.message }),
  });
  const updateRestaurantMutation = trpc.restaurants.update.useMutation({
    onSuccess: () => { refetchRestaurants(); resetForm(); toast.success(lang === 'ar' ? 'تم تحديث المطعم بنجاح' : 'Restaurant updated successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ في تحديث المطعم' : 'Error updating restaurant', { description: err.message }),
  });
  const deleteRestaurantMutation = trpc.restaurants.delete.useMutation({
    onSuccess: () => { refetchRestaurants(); setExpandedId(null); toast.success(lang === 'ar' ? 'تم حذف المطعم بنجاح' : 'Restaurant deleted successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ في حذف المطعم' : 'Error deleting restaurant', { description: err.message }),
  });
  const createCafeMutation = trpc.cafes.create.useMutation({
    onSuccess: () => { refetchCafes(); resetForm(); toast.success(lang === 'ar' ? 'تمت إضافة المقهى بنجاح' : 'Café added successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ في إضافة المقهى' : 'Error adding café', { description: err.message }),
  });
  const updateCafeMutation = trpc.cafes.update.useMutation({
    onSuccess: () => { refetchCafes(); resetForm(); toast.success(lang === 'ar' ? 'تم تحديث المقهى بنجاح' : 'Café updated successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ في تحديث المقهى' : 'Error updating café', { description: err.message }),
  });
  const deleteCafeMutation = trpc.cafes.delete.useMutation({
    onSuccess: () => { refetchCafes(); setExpandedId(null); toast.success(lang === 'ar' ? 'تم حذف المقهى بنجاح' : 'Café deleted successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'خطأ في حذف المقهى' : 'Error deleting café', { description: err.message }),
  });

  // Image upload (restaurants & cafes)
  const uploadRestaurantImageMutation = trpc.restaurants.uploadImage.useMutation({
    onSuccess: () => { refetchRestaurants(); toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image', { description: err.message }),
  });
  const uploadCafeImageMutation = trpc.cafes.uploadImage.useMutation({
    onSuccess: () => { refetchCafes(); toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image', { description: err.message }),
  });

  // Image removal (restaurants & cafes)
  const removeRestaurantImageMutation = trpc.restaurants.removeImage.useMutation({
    onSuccess: () => { refetchRestaurants(); toast.success(lang === 'ar' ? 'تم حذف الصورة بنجاح' : 'Image removed successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'فشل حذف الصورة' : 'Failed to remove image', { description: err.message }),
  });
  const removeCafeImageMutation = trpc.cafes.removeImage.useMutation({
    onSuccess: () => { refetchCafes(); toast.success(lang === 'ar' ? 'تم حذف الصورة بنجاح' : 'Image removed successfully'); },
    onError: (err) => toast.error(lang === 'ar' ? 'فشل حذف الصورة' : 'Failed to remove image', { description: err.message }),
  });
  const handleRemoveRestaurantImage = (id: number) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف الصورة؟' : 'Remove this photo?')) {
      removeRestaurantImageMutation.mutate({ id });
    }
  };
  const handleRemoveCafeImage = (id: number) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف الصورة؟' : 'Remove this photo?')) {
      removeCafeImageMutation.mutate({ id });
    }
  };

  // Convert a file to base64 data URL for upload
  const handleImageFile = (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error(lang === 'ar' ? 'الصورة كبيرة جداً (الحد الأقصى 4 ميغابايت)' : 'Image too large (max 4MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (formKind === 'restaurant') {
        if (editingId !== null) uploadRestaurantImageMutation.mutate({ id: editingId, base64, fileName: file.name });
        else {
          // No item yet: store preview in form, will be uploaded after create via item id
          setFormData({ ...formData, img: base64 });
          setPendingImage({ base64, fileName: file.name });
        }
      } else if (formKind === 'cafe') {
        if (editingId !== null) uploadCafeImageMutation.mutate({ id: editingId, base64, fileName: file.name });
        else {
          setFormData({ ...formData, img: base64 });
          setPendingImage({ base64, fileName: file.name });
        }
      }
    };
    reader.readAsDataURL(file);
  };

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
      cuisine: { ar: '', en: '', fr: '', ber: '' },
      location: { ar: '', en: '', fr: '', ber: '' },
      rating: '4.5',
      hours: '',
      phone: '',
      whatsapp: '',
    });
    setPendingImage(null);
    setEditingId(null);
    setShowForm(false);
  };

  // Track which entity type the shared form targets: 'car' | 'restaurant' | 'cafe'
  const [formKind, setFormKind] = useState<'car' | 'restaurant' | 'cafe'>('car');
  // Image pending upload for a brand-new restaurant/cafe (uploaded once created)
  const [pendingImage, setPendingImage] = useState<{ base64: string; fileName: string } | null>(null);

  // Open add form
  const openAddForm = (kind: 'car' | 'restaurant' | 'cafe' = 'car') => {
    resetForm();
    setFormKind(kind);
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (item: any, kind: 'car' | 'restaurant' | 'cafe' = 'car') => {
    setFormKind(kind);
    setFormData({
      img: item.image || '',
      name: { ar: item.nameAr, en: item.nameEn, fr: item.nameFr, ber: item.nameBer },
      desc: { ar: item.descriptionAr || '', en: item.descriptionEn || '', fr: item.descriptionFr || '', ber: item.descriptionBer || '' },
      seats: { ar: item.seats ?? '', en: item.seats ?? '', fr: item.seats ?? '', ber: item.seats ?? '' },
      fuel: { ar: item.fuel ?? '', en: item.fuel ?? '', fr: item.fuel ?? '', ber: item.fuel ?? '' },
      type: kind === 'car' ? item.typeAr : '',
      price: kind === 'car' ? { ar: item.priceAr ?? '', en: item.priceEn ?? '', fr: item.priceFr ?? '', ber: item.priceBer ?? '' } : { ar: '', en: '', fr: '', ber: '' },
      cuisine: { ar: item.cuisineAr ?? '', en: item.cuisineEn ?? '', fr: item.cuisineFr ?? '', ber: item.cuisineBer ?? '' },
      location: { ar: item.locationAr ?? '', en: item.locationEn ?? '', fr: item.locationFr ?? '', ber: item.locationBer ?? '' },
      rating: item.rating ?? '4.5',
      hours: item.hours ?? '',
      phone: item.phone || '',
      whatsapp: item.whatsapp || '',
    });
    setEditingId(item.id);
    setShowForm(true);
    setExpandedId(null);
  };

  // Restaurant / cafe helpers
  const openEditRestaurant = (item: any) => openEditForm(item, 'restaurant');
  const uploadExistingRestaurantImage = (item: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        toast.error(lang === 'ar' ? 'الصورة كبيرة جداً (الحد الأقصى 4 ميغابايت)' : 'Image too large (max 4MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => uploadRestaurantImageMutation.mutate({ id: item.id, base64: reader.result as string, fileName: file.name });
      reader.readAsDataURL(file);
    };
    input.click();
  };
  const uploadExistingCafeImage = (item: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        toast.error(lang === 'ar' ? 'الصورة كبيرة جداً (الحد الأقصى 4 ميغابايت)' : 'Image too large (max 4MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => uploadCafeImageMutation.mutate({ id: item.id, base64: reader.result as string, fileName: file.name });
      reader.readAsDataURL(file);
    };
    input.click();
  };
  const openEditCafe = (item: any) => openEditForm(item, 'cafe');
  const handleDeleteRestaurant = (id: number) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المطعم؟' : 'Delete this restaurant?')) deleteRestaurantMutation.mutate({ id });
  };
  const handleDeleteCafe = (id: number) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المقهى؟' : 'Delete this café?')) deleteCafeMutation.mutate({ id });
  };

  // Submit form (add or update) — supports cars, restaurants, and cafes
  const handleSubmit = () => {
    const base = {
      image: formData.img,
      nameAr: formData.name.ar, nameEn: formData.name.en, nameFr: formData.name.fr, nameBer: formData.name.ber,
      descriptionAr: formData.desc.ar, descriptionEn: formData.desc.en, descriptionFr: formData.desc.fr, descriptionBer: formData.desc.ber,
      locationAr: formData.location.ar, locationEn: formData.location.en, locationFr: formData.location.fr, locationBer: formData.location.ber,
      rating: formData.rating,
      hours: formData.hours,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
    };
    if (formKind === 'restaurant') {
      const payload = { ...base, cuisineAr: formData.cuisine.ar, cuisineEn: formData.cuisine.en, cuisineFr: formData.cuisine.fr, cuisineBer: formData.cuisine.ber };
      if (editingId !== null) {
        updateRestaurantMutation.mutate({ id: editingId, ...payload } as any);
        return;
      }
      const pending = pendingImage;
      createRestaurantMutation.mutate(payload as any, {
        onSuccess: (res) => {
          // Upload the pending image for the newly created restaurant (create then upload)
          if (pending && res?.id) {
            uploadRestaurantImageMutation.mutate({ id: res.id, base64: pending.base64, fileName: pending.fileName });
            setPendingImage(null);
          }
        },
      });
      return;
    }
    if (formKind === 'cafe') {
      if (editingId !== null) {
        updateCafeMutation.mutate({ id: editingId, ...base } as any);
        return;
      }
      const pending = pendingImage;
      createCafeMutation.mutate(base as any, {
        onSuccess: (res) => {
          if (pending && res?.id) {
            uploadCafeImageMutation.mutate({ id: res.id, base64: pending.base64, fileName: pending.fileName });
            setPendingImage(null);
          }
        },
      });
      return;
    }
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
        whatsapp: formData.whatsapp,
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
        whatsapp: formData.whatsapp,
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
    utils.dashboard.myBookings.invalidate();
    utils.dashboard.myCars.invalidate();
    utils.dashboard.myHotels.invalidate();
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
    whatsapp: { ar: 'واتساب', en: 'WhatsApp', fr: 'WhatsApp', ber: 'ⵡⴰⵜⵙⴰⴱ' },
    whatsappHint: { ar: 'مثال: 0612345678 أو +212612345678', en: 'e.g. 0612345678 or +212612345678', fr: 'ex. 0612345678 ou +212612345678', ber: 'ⴰⵎⴷⵢⴰ: 0612345678' },
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
    imgUpload: { ar: 'صورة المكان', en: 'Photo', fr: 'Photo', ber: 'ⵜⵡⵍⴰⴼⵜ' },
    chooseFile: { ar: 'اختيار صورة من الجهاز', en: 'Choose Photo', fr: 'Choisir une photo', ber: 'ⵙⵜⵉ ⵜⵡⵍⴰⴼⵜ' },
    imgHint: { ar: 'JPG أو PNG أو WEBP — الحد الأقصى 4 ميغابايت', en: 'JPG, PNG or WEBP — max 4MB', fr: 'JPG, PNG ou WEBP — max 4Mo', ber: 'JPG/PNG/WEBP — ⴰⴼⵓⵙ 4MB' },
    uploadPhoto: { ar: 'رفع صورة', en: 'Upload Photo', fr: 'Téléverser', ber: 'ⵙⵍⵉ ⵜⵡⵍⴰⴼⵜ' },
    removePhoto: { ar: 'حذف الصورة', en: 'Remove Photo', fr: 'Supprimer', ber: 'ⴽⴽⵙ ⵜⵡⵍⴰⴼⵜ' },
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
    tabHotels: { ar: 'الفنادق', en: 'Hotels', fr: 'Hôtels', ber: 'ⵉⵙⵏⴷⵇⵏ' },
    emptyHotel: { ar: 'لا توجد فنادق بعد', en: 'No hotels yet', fr: 'Aucun hôtel', ber: 'ⵓⵍⵍⵉⵏ ⵉⵙⵏⴷⵇⵏ' },
    tabRestaurants: { ar: 'المطاعم', en: 'Restaurants', fr: 'Restaurants', ber: 'ⵉⵎⵙⵙⴽⵜⵏ' },
    tabCafes: { ar: 'المقاهي', en: 'Cafés', fr: 'Cafés', ber: 'ⵉⵇⵀⵡⴰⵢⵏ' },
    addRestaurant: { ar: 'إضافة مطعم', en: 'Add Restaurant', fr: 'Ajouter Restaurant', ber: 'ⵔⵏⵓ ⵉⵎⵙⵙⴽ' },
    addCafe: { ar: 'إضافة مقهى', en: 'Add Café', fr: 'Ajouter Café', ber: 'ⵔⵏⵓ ⴰⵇⵀⵡⴰ' },
    editRestaurant: { ar: 'تعديل المطعم', en: 'Edit Restaurant', fr: 'Modifier Restaurant', ber: 'ⵙⵏⴼⵍ ⵉⵎⵙⵙⴽ' },
    editCafe: { ar: 'تعديل المقهى', en: 'Edit Café', fr: 'Modifier Café', ber: 'ⵙⵏⴼⵍ ⴰⵇⵀⵡⴰ' },
    emptyRestaurant: { ar: 'لا توجد مطاعم. أضف مطعمك!', en: 'No restaurants yet. Add yours!', fr: 'Aucun restaurant. Ajoutez le vôtre!', ber: 'ⵓⵍⵍⵉⵏ ⵉⵎⵙⵙⴽⵜⵏ' },
    emptyCafe: { ar: 'لا توجد مقاهي. أضف مقهاك!', en: 'No cafés yet. Add yours!', fr: 'Aucun café. Ajoutez le vôtre!', ber: 'ⵓⵍⵍⵉⵏ ⵉⵇⵀⵡⴰⵢⵏ' },
    cuisine: { ar: 'نوع المأكولات', en: 'Cuisine', fr: 'Cuisine', ber: 'ⵜⴰⵎⴰⵛⴰⵏⵜ' },
    location: { ar: 'المكان', en: 'Location', fr: 'Lieu', ber: 'ⴰⵏⵙⴰ' },
    rating: { ar: 'التقييم', en: 'Rating', fr: 'Note', ber: 'ⴰⵙⵡⵓⴷⴷⵓ' },
    hours: { ar: 'أوقات العمل', en: 'Working Hours', fr: 'Heures d\'ouverture', ber: 'ⴰⴽⵓⴷ ⵏ ⵜⵡⵓⵔⵉ' },
    confirmDeleteRestaurant: { ar: 'هل أنت متأكد؟ سيتم حذف هذا المطعم', en: 'Are you sure? This restaurant will be deleted', fr: 'Êtes-vous sûr? Ce restaurant sera supprimé', ber: 'ⵉⵙⵙⵏⴽⴽ ⵜⴳⵉⴷ? ⴰⴷ ⵉⵜⵜⵡⴰⴽⴽⵙ ⵉⵎⵙⵙⴽ' },
    confirmDeleteCafe: { ar: 'هل أنت متأكد؟ سيتم حذف هذا المقهى', en: 'Are you sure? This café will be deleted', fr: 'Êtes-vous sûr? Ce café sera supprimé', ber: 'ⵉⵙⵙⵏⴽⴽ ⵜⴳⵉⴷ? ⴰⴷ ⵉⵜⵜⵡⴰⴽⴽⵙ ⴰⵇⵀⵡⴰ' },
    bookingTypeRestaurant: { ar: 'مطعم', en: 'Restaurant', fr: 'Restaurant', ber: 'ⵉⵎⵙⵙⴽ' },
    bookingTypeCafe: { ar: 'مقهى', en: 'Café', fr: 'Café', ber: 'ⴰⵇⵀⵡⴰ' },
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

  const getHotelWhatsAppDraft = (hotel: any) => hotelWhatsAppDrafts[hotel.id] ?? hotel.whatsapp ?? '';

  const setHotelWhatsAppDraft = (id: number, value: string) => {
    setHotelWhatsAppDrafts((current) => ({ ...current, [id]: value }));
  };

  return (
    <section id="owner-dashboard" className="py-16 bg-gradient-to-b from-[#1b5e3f] to-[#0f3d28]">
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

          {user?.role === 'admin' && (
          <div role="status" className={`mx-auto mt-5 max-w-md rounded-xl border px-4 py-3 text-center text-sm ${dbHealthQuery.isLoading ? 'border-white/20 bg-white/10 text-white/70' : dbHealthQuery.data?.ok ? 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-300/40 bg-amber-500/15 text-amber-100'}`}>
            {dbHealthQuery.isLoading ? 'كنفحصو الاتصال بقاعدة البيانات...' : dbHealthQuery.data?.ok ? `قاعدة البيانات خدامة · ${dbHealthQuery.data.latencyMs}ms` : 'تنبيه: تعذر الاتصال بقاعدة البيانات'}
          </div>
        )}

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
              onClick={() => setActiveTab('hotels')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'hotels' ? 'bg-[#c8a951] text-[#1b5e3f]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 inline me-1.5" />{l('tabHotels')}
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'restaurants' ? 'bg-[#c8a951] text-[#1b5e3f]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4 inline me-1.5" />{l('tabRestaurants')}
            </button>
            <button
              onClick={() => setActiveTab('cafes')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'cafes' ? 'bg-[#c8a951] text-[#1b5e3f]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4 inline me-1.5" />{l('tabCafes')}
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
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => openAddForm('car')} className="px-5 py-2.5 bg-[#c8a951] text-[#1b5e3f] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#d4b75e] transition-colors">
              <Plus className="w-4 h-4" />
              {l('addCar')}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowResetConfirm(true)} className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
              <RotateCcw className="w-4 h-4" />
              {l('resetDefault')}
            </motion.button>
          </div>
        )}

        {/* Action Buttons (restaurants tab) */}
        {activeTab === 'restaurants' && (
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => openAddForm('restaurant')} className="px-5 py-2.5 bg-[#c8a951] text-[#1b5e3f] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#d4b75e] transition-colors">
              <Plus className="w-4 h-4" />
              {l('addRestaurant')}
            </motion.button>
          </div>
        )}

        {/* Action Buttons (cafes tab) */}
        {activeTab === 'cafes' && (
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => openAddForm('cafe')} className="px-5 py-2.5 bg-[#c8a951] text-[#1b5e3f] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#d4b75e] transition-colors">
              <Plus className="w-4 h-4" />
              {l('addCafe')}
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
                            {b.type === 'hotel' ? l('bookingTypeHotel') : b.type === 'restaurant' ? l('bookingTypeRestaurant') : b.type === 'cafe' ? l('bookingTypeCafe') : l('bookingTypeCar')}
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
                          <WhatsAppButton
                            phone={b.guestPhone}
                            message={getCustomerWhatsAppMessage(lang, b.itemName)}
                            label={lang === 'ar' ? 'مراسلة الزبون' : lang === 'fr' ? 'Écrire au client' : lang === 'ber' ? 'ⵙⵉⵡⵍ ⵉ ⵓⵎⵙⵙⵉⵡⴹ' : 'Message customer'}
                            className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-bold hover:bg-[#1ebe5b]"
                          />
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
        {activeTab === 'cars' && (
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
        )}

        {/* Hotels WhatsApp List */}
        {activeTab === 'hotels' && (
          <div className="max-w-3xl mx-auto space-y-3">
            {!myHotels ? (
              <div className="text-center py-12 text-white/60 bg-white/10 rounded-2xl border border-white/10">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{l('needLogin')}</p>
              </div>
            ) : myHotels.length === 0 ? (
              <div className="text-center py-12 text-white/60 bg-white/10 rounded-2xl border border-white/10">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{l('emptyHotel')}</p>
              </div>
            ) : (
              <AnimatePresence>
                {myHotels.map((hotel: any, i: number) => (
                  <motion.div key={hotel.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                        {hotel.image ? <img src={hotel.image} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-full h-full p-3 text-white/30" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold text-sm truncate">{lang === 'ar' ? hotel.nameAr : lang === 'fr' ? hotel.nameFr : lang === 'ber' ? hotel.nameBer : hotel.nameEn}</p>
                        <p className="text-white/50 text-xs truncate">{lang === 'ar' ? hotel.locationAr : lang === 'fr' ? hotel.locationFr : lang === 'ber' ? hotel.locationBer : hotel.locationEn}</p>
                      </div>
                    </div>
                    <label className="block text-white/80 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />{l('whatsapp')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={getHotelWhatsAppDraft(hotel)}
                        onChange={(e) => setHotelWhatsAppDraft(hotel.id, e.target.value)}
                        placeholder={l('whatsappHint')}
                        className="min-w-0 flex-1 px-4 py-2.5 rounded-xl bg-white text-gray-800 border border-white/20 focus:ring-2 focus:ring-[#25D366]/40 outline-none text-sm"
                      />
                      <button
                        onClick={() => updateHotelContactMutation.mutate({ id: hotel.id, whatsapp: getHotelWhatsAppDraft(hotel) })}
                        disabled={updateHotelContactMutation.isPending}
                        className="px-4 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#1ebe5b] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />{l('save')}
                      </button>
                    </div>
                    <p className="text-white/40 text-[11px] mt-2">{l('whatsappHint')}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Restaurants List */}
        {activeTab === 'restaurants' && (
        <div className="max-w-3xl mx-auto space-y-3">
          {restaurants.length === 0 && (
            <div className="text-center py-12 text-white/60">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{l('emptyRestaurant')}</p>
            </div>
          )}
          <AnimatePresence>
            {restaurants.map((item: any, i: number) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: isRTL ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? -30 : 30 }} transition={{ delay: i * 0.05 }} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-full h-full p-3 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{lang === 'ar' ? item.nameAr : lang === 'fr' ? item.nameFr : lang === 'ber' ? item.nameBer : item.nameEn}</p>
                    <p className="text-white/50 text-xs">{lang === 'ar' ? item.locationAr : lang === 'fr' ? item.locationFr : lang === 'ber' ? item.locationBer : item.locationEn}</p>
                  </div>
                  <div className="text-[#c8a951] font-bold text-sm">★ {Number(item.rating) || item.rating}</div>
                  <motion.div animate={{ rotate: expandedId === item.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2 border-t border-white/10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('cuisine')}</span>
                            <span className="text-white text-sm font-medium">{lang === 'ar' ? item.cuisineAr : lang === 'fr' ? item.cuisineFr : lang === 'ber' ? item.cuisineBer : item.cuisineEn}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('hours')}</span>
                            <span className="text-white text-sm font-medium">{item.hours}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('phone')}</span>
                            <span className="text-white text-sm font-medium">{item.phone}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('desc')}</span>
                            <span className="text-white text-xs truncate block">{lang === 'ar' ? item.descriptionAr : lang === 'fr' ? item.descriptionFr : lang === 'ber' ? item.descriptionBer : item.descriptionEn}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openEditRestaurant(item); }} className="flex-1 py-2 bg-[#c8a951]/20 text-[#c8a951] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#c8a951]/30 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                            {l('edit')}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); uploadExistingRestaurantImage(item); }} disabled={uploadRestaurantImageMutation.isPending} className="flex-1 py-2 bg-white/10 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-white/20 transition-colors disabled:opacity-50">
                            <Upload className="w-3.5 h-3.5" />
                            {l('uploadPhoto')}
                          </button>
                          {item.image && (
                            <button onClick={(e) => { e.stopPropagation(); handleRemoveRestaurantImage(item.id); }} disabled={removeRestaurantImageMutation.isPending} className="flex-1 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-orange-500/30 transition-colors disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5" />
                              {l('removePhoto')}
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(item.id); }} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/30 transition-colors">
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
        )}

        {/* Cafes List */}
        {activeTab === 'cafes' && (
        <div className="max-w-3xl mx-auto space-y-3">
          {cafes.length === 0 && (
            <div className="text-center py-12 text-white/60">
              <Coffee className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{l('emptyCafe')}</p>
            </div>
          )}
          <AnimatePresence>
            {cafes.map((item: any, i: number) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: isRTL ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? -30 : 30 }} transition={{ delay: i * 0.05 }} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-full h-full p-3 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{lang === 'ar' ? item.nameAr : lang === 'fr' ? item.nameFr : lang === 'ber' ? item.nameBer : item.nameEn}</p>
                    <p className="text-white/50 text-xs">{lang === 'ar' ? item.locationAr : lang === 'fr' ? item.locationFr : lang === 'ber' ? item.locationBer : item.locationEn}</p>
                  </div>
                  <div className="text-[#c8a951] font-bold text-sm">★ {Number(item.rating) || item.rating}</div>
                  <motion.div animate={{ rotate: expandedId === item.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2 border-t border-white/10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-xs">
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('hours')}</span>
                            <span className="text-white text-sm font-medium">{item.hours}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('phone')}</span>
                            <span className="text-white text-sm font-medium">{item.phone}</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <span className="text-white/40 block">{l('desc')}</span>
                            <span className="text-white text-xs truncate block">{lang === 'ar' ? item.descriptionAr : lang === 'fr' ? item.descriptionFr : lang === 'ber' ? item.descriptionBer : item.descriptionEn}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openEditCafe(item); }} className="flex-1 py-2 bg-[#c8a951]/20 text-[#c8a951] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#c8a951]/30 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                            {l('edit')}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); uploadExistingCafeImage(item); }} disabled={uploadCafeImageMutation.isPending} className="flex-1 py-2 bg-white/10 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-white/20 transition-colors disabled:opacity-50">
                            <Upload className="w-3.5 h-3.5" />
                            {l('uploadPhoto')}
                          </button>
                          {item.image && (
                            <button onClick={(e) => { e.stopPropagation(); handleRemoveCafeImage(item.id); }} disabled={removeCafeImageMutation.isPending} className="flex-1 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-orange-500/30 transition-colors disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5" />
                              {l('removePhoto')}
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCafe(item.id); }} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/30 transition-colors">
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
        )}

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
                  {/* Image: file upload for restaurants & cafes (with preview), URL input for cars */}
                  {formKind !== 'car' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('imgUpload')}</label>
                    {formData.img && (
                      <div className="mb-2 relative">
                        <img src={formData.img} alt="preview" className="w-32 h-24 object-cover rounded-xl border border-gray-200" />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#1b5e3f]/30 bg-[#1b5e3f]/5 text-sm font-medium text-[#1b5e3f] cursor-pointer hover:bg-[#1b5e3f]/10 transition-colors">
                      <Upload className="w-4 h-4" />
                      {l('chooseFile')}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageFile(f);
                        e.target.value = '';
                      }} />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">{l('imgHint')}</p>
                  </div>
                  ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('img')}</label>
                    <input type="url" value={formData.img} onChange={(e) => setFormData({ ...formData, img: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>
                  )}

                  {/* Type (cars only) */}
                  {formKind === 'car' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('type')}</label>
                    <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="SUV / 4x4 / Economy / Luxury" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>
                  )}

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

                  {/* Cuisine (restaurants only) */}
                  {formKind === 'restaurant' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('cuisine')}</label>
                    <input type="text" value={formData.cuisine.ar} onChange={(e) => setFormData({ ...formData, cuisine: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value } })} placeholder={lang === 'ar' ? 'مثال: أمازيغي تقليدي' : 'e.g. Traditional Amazigh'} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>
                  )}

                  {/* Seats & Fuel (cars only) */}
                  {formKind === 'car' && (
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
                  )}

                  {/* Price (cars only) */}
                  {formKind === 'car' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('price')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={formData.price.ar} onChange={(e) => setFormData({ ...formData, price: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value } })} placeholder={l('priceHint')} className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                      <input type="text" value={formData.price.en} onChange={(e) => setFormData({ ...formData, price: { ...formData.price, en: e.target.value } })} placeholder="400 MAD/day" className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                    </div>
                  </div>
                  )}

                  {/* Rating & Hours (restaurants & cafes) */}
                  {formKind !== 'car' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{l('rating')}</label>
                      <input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} placeholder="4.5" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{l('hours')}</label>
                      <input type="text" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} placeholder="9:00 - 23:00" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-xs" />
                    </div>
                  </div>
                  )}

                  {/* Location (restaurants & cafes) */}
                  {formKind !== 'car' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('location')}</label>
                    <input type="text" value={formData.location.ar} onChange={(e) => setFormData({ ...formData, location: { ar: e.target.value, en: e.target.value, fr: e.target.value, ber: e.target.value } })} placeholder={lang === 'ar' ? 'مثال: وسط مدينة أزيلال' : 'e.g. Azilal City Center'} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l('phone')}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+212 5XX XXX XXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1b5e3f]/20 focus:border-[#1b5e3f] outline-none text-sm" />
                  </div>
                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      {l('whatsapp')}
                    </label>
                    <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder={l('whatsappHint')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] outline-none text-sm" />
                    <p className="mt-1 text-[11px] text-gray-400">{l('whatsappHint')}</p>
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
