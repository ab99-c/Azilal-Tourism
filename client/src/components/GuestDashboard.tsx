import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { ServerError } from './ServerStateNotice';
import { startLogin } from '@/const';
import { isStaticHost } from '@/lib/utils';

import {
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  Clock,
  Hotel,
  Car,
  MapPin,
  Loader2,
  AlertTriangle,
  CreditCard,
  Banknote,
} from 'lucide-react';

// The full-featured Manus-hosted site (backend + OAuth). On static mirrors
// (e.g. Vercel) login cannot complete locally — redirect users to the main site.
const MAIN_SITE_URL = 'https://azilaltour-j2sx2a5n.manus.space';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { scrollToSection } from '@/lib/scroll';

type Booking = {
  id: number;
  type: 'hotel' | 'car';
  itemName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn?: Date;
  checkOut?: Date;
  pickUpTime?: string;
  dropOffTime?: string;
  guests?: number;
  notes?: string;
  totalPrice?: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt?: Date;
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function GuestDashboard() {
  const { lang, t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: bookings, isLoading, isError, refetch } = trpc.bookings.myBookings.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: 1,
  });

  const cancelMutation = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      utils.bookings.myBookings.invalidate();
      toast.success(t('guest.cancelled_msg'), { duration: 3000 });
    },
    onError: (error) => {
      toast.error(t('guest.error_cancel'), { description: error.message, duration: 4000 });
    },
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'cancelled': return <CalendarX className="w-3.5 h-3.5" />;
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString(lang === 'ber' ? 'fr' : lang === 'ar' ? 'ar-MA' : lang, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return new Date(date).toLocaleDateString();
    }
  };

  return (
    <section id="guest-dashboard" className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b5e3f]/10 text-[#1b5e3f] text-sm font-bold mb-4">
            <CalendarCheck className="w-4 h-4" />
            {isRTL ? 'لوحة الضيوف' : 'Guest Panel'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            {t('guest.title')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">{t('guest.subtitle')}</p>
        </div>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-gradient-to-br from-[#1b5e3f] to-[#0f3d28] rounded-3xl p-10 text-center text-white shadow-xl">
            <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">{t('nav.login')}</h3>
            <p className="text-white/70 text-sm mb-6">
              {lang === 'ar' || lang === 'ber'
                ? 'سجل دخولك باش تشوف حجوزاتك هنا'
                : 'Sign in to view and manage your bookings here'}
            </p>
            <button
              onClick={() => {
                if (isStaticHost()) {
                  window.open(MAIN_SITE_URL, '_blank', 'noopener');
                } else {
                  startLogin();
                }
              }}
              className="bg-white text-[#1b5e3f] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all active:scale-[0.97] hover:shadow-lg"
            >
              {isStaticHost() ? t('nav.loginOnMainSite') : t('nav.login')}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4" role="status" aria-live="polite">
            <Loader2 className="w-8 h-8 animate-spin text-[#1b5e3f]" />
            <p className="text-gray-500 text-sm">
              {lang === 'ar' || lang === 'ber' ? 'كتحمل حجزاتك...' : 'Loading your bookings...'}
            </p>
          </div>
        ) : isError ? (
          <ServerError lang={lang as 'ar' | 'en' | 'fr' | 'ber'} onRetry={() => void refetch()} />
        ) : !bookings || bookings.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="w-9 h-9 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('guest.empty.title')}</h3>
            <p className="text-gray-500 text-sm mb-6">{t('guest.empty.desc')}</p>
            <button
              onClick={() => scrollToSection('hotels')}
              className="bg-[#1b5e3f] text-white px-7 py-3 rounded-full font-bold hover:bg-[#0f3d28] transition-all active:scale-[0.97]"
            >
              {t('guest.empty.cta')}
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {(bookings as Booking[]).map((b) => (
              <div
                key={b.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                  b.status === 'cancelled' ? 'opacity-60 border-red-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      b.type === 'hotel' ? 'bg-[#1b5e3f]/10 text-[#1b5e3f]' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {b.type === 'hotel' ? <Hotel className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{b.itemName}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {t(b.type === 'hotel' ? 'guest.type_hotel' : 'guest.type_car')}
                        {b.guests ? ` · ${b.guests} ${lang === 'ar' || lang === 'ber' ? 'شخص' : 'guest(s)'}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                    statusColors[b.status] || statusColors.pending
                  }`}>
                    {statusIcon(b.status)}
                    {t(`guest.status.${b.status}`)}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                  {(b.checkIn || b.checkOut) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{t('guest.dates')}: {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                      {b.pickUpTime && <span className="text-xs text-gray-400">({b.pickUpTime} → {b.dropOffTime})</span>}
                    </div>
                  )}
                  {b.totalPrice && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-bold text-gray-800">{b.totalPrice} MAD</span>
                      <span className="text-xs text-gray-400">— {t('guest.pay_arrival')}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={cancelMutation.isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-full px-3.5 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <CalendarX className="w-3.5 h-3.5" />
                          {t('guest.cancel')}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            {t('guest.cancel')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>{t('guest.cancelConfirm')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('guest.cancelNo')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelMutation.mutate({ id: b.id })}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {cancelMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              t('guest.cancelYes')
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 ms-auto">
                    <Banknote className="w-3.5 h-3.5" />
                    {t('guest.pay_arrival')} · {t('guest.booking_date')}: {formatDate(b.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
