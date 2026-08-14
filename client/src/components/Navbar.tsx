import { useState, useEffect } from 'react';
import { useLanguage, type Lang } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, MessageCircle, CalendarCheck, LogIn } from 'lucide-react';
import { scrollToSection } from '@/lib/scroll';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { startLogin } from '@/const';

const langNames: Record<Lang, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
  ber: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
};

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { key: 'nav.home', href: '#home' },
    { key: 'nav.destinations', href: '#destinations' },
    { key: 'nav.hotels', href: '#hotels' },
    { key: 'nav.restaurants', href: '#restaurants' },
    { key: 'nav.cafes', href: '#cafes' },
    { key: 'nav.cars', href: '#cars' },
    { key: 'nav.activities', href: '#activities' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}
          className="flex items-center gap-3 transition-colors"
        >
          <img
            src="/manus-storage/logo-yaz_23b00a4a.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <span
            className="text-xl font-extrabold transition-colors"
            style={{ color: scrolled ? '#1b5e3f' : '#ffffff' }}
          >
            {lang === 'ber' ? 'ⴰⴷⵔⴰⵔ' : lang === 'ar' ? 'ادرار' : 'ADRAR'}
          </span>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.key}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`text-sm font-medium transition-colors relative py-1 whitespace-nowrap ${
                  scrolled ? 'text-gray-700 hover:text-[#1b5e3f]' : 'text-white/90 hover:text-white'
                }`}
              >
                {t(link.key)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1b5e3f] transition-all duration-300 hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* Language Switcher + Contact */}
        <div className="flex items-center gap-3">
          {/* Language Dropdown */}
          <div className="relative group">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                scrolled
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{langNames[lang]}</span>
            </button>
            <div className="absolute top-full mt-2 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white rounded-xl shadow-xl p-2 min-w-[140px]">
              {Object.entries(langNames).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setLang(key as Lang)}
                  className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                    lang === key
                      ? 'bg-[#1b5e3f] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* My Bookings (authenticated guests only) */}
          {isAuthenticated ? (
            <button
              onClick={() => scrollToSection('guest-dashboard')}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                scrolled
                  ? 'bg-[#1b5e3f]/10 text-[#1b5e3f] hover:bg-[#1b5e3f]/20'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              {t('nav.myBookings')}
            </button>
          ) : (
            <button
              onClick={() => startLogin()}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                scrolled
                  ? 'bg-[#1b5e3f]/10 text-[#1b5e3f] hover:bg-[#1b5e3f]/20'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              <LogIn className="w-4 h-4" />
              {t('nav.login')}
            </button>
          )}

          {/* Chat Button (contact via WhatsApp/chat) */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
            className="hidden sm:flex items-center gap-2 bg-[#1b5e3f] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#0f3d28] transition-all hover:shadow-lg hover:shadow-[#1b5e3f]/30"
          >
            <MessageCircle className="w-4 h-4" />
            {t('nav.contact')}
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: scrolled ? '#1b5e3f' : '#ffffff' }}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                    setMobileOpen(false);
                  }}
                  className="text-gray-700 hover:text-[#1b5e3f] font-medium py-2 transition-colors"
                >
                  {t(link.key)}
                </a>
              ))}
              {/* Guest / auth actions on mobile */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      scrollToSection('guest-dashboard');
                      setMobileOpen(false);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-[#1b5e3f] text-white hover:bg-[#0f3d28] transition-colors"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    {t('nav.myBookings')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      startLogin();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-[#1b5e3f] text-white hover:bg-[#0f3d28] transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {t('nav.login')}
                  </button>
                )}
                {Object.entries(langNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => { setLang(key as Lang); setMobileOpen(false); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      lang === key
                        ? 'bg-[#1b5e3f] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
