import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, LayoutDashboard, X } from 'lucide-react';
import { scrollToSection } from '@/lib/scroll';

/**
 * Post-login choice dialog: appears after a user authenticates so they can
 * decide between booking (browse the sections) and owning (open the owner
 * dashboard). The choice is remembered in sessionStorage so it only shows
 * once per session.
 */
export default function LoginChoiceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, t } = useLanguage();

  const choose = (kind: 'guest' | 'owner') => {
    onClose();
    if (kind === 'guest') {
      // Booking sections: scroll to hotels, then the user can browse further
      scrollToSection('hotels');
    } else {
      scrollToSection('owner-dashboard');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as const }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 text-center overflow-hidden"
          >
            {/* Amazigh-inspired geometric top band */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1b5e3f] via-[#c8a951] to-[#1b5e3f]" />

            <button
              onClick={onClose}
              aria-label={t('choice.skip')}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src="/manus-storage/logo-yaz_23b00a4a.png"
              alt="ADRAR"
              className="w-14 h-14 object-contain mx-auto mb-4"
            />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{t('choice.title')}</h2>

            <div className="grid gap-4 mt-6">
              <button
                onClick={() => choose('guest')}
                className="group flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 text-start hover:border-[#1b5e3f] hover:bg-[#1b5e3f]/5 transition-all active:scale-[0.98]"
              >
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1b5e3f] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-6 h-6" />
                </span>
                <span>
                  <span className="block font-bold text-gray-900 text-lg">{t('choice.guestTitle')}</span>
                  <span className="block text-gray-500 text-sm mt-1">{t('choice.guestDesc')}</span>
                </span>
              </button>

              <button
                onClick={() => choose('owner')}
                className="group flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 text-start hover:border-[#c8a951] hover:bg-[#c8a951]/10 transition-all active:scale-[0.98]"
              >
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#c8a951] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </span>
                <span>
                  <span className="block font-bold text-gray-900 text-lg">{t('choice.ownerTitle')}</span>
                  <span className="block text-gray-500 text-sm mt-1">{t('choice.ownerDesc')}</span>
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-4 transition-colors"
            >
              {t('choice.skip')}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
