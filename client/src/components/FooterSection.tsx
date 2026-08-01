import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function FooterSection() {
  const { t, lang } = useLanguage();

  const quickLinks = [
    { key: 'nav.home', href: '#home' },
    { key: 'nav.destinations', href: '#destinations' },
    { key: 'nav.activities', href: '#activities' },
    { key: 'nav.about', href: '#about' },
    { key: 'nav.contact', href: '#contact' },
  ];

  return (
    <footer id="contact" className="bg-[#0f3d28] text-white pt-16 pb-8">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/manus-storage/logo-yaz_23b00a4a.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <h3 className="text-xl font-extrabold">
                {lang === 'ber' ? 'ⴰⵣⵉⵍⴰⵍ' : lang === 'ar' ? 'أزيلال' : 'Azilal'}
              </h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {t('footer.about')}
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#2e8b57] transition-all hover:-translate-y-1"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-5">{t('footer.links')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-white/60 text-sm hover:text-white transition-all hover:translate-x-[-3px] rtl:hover:translate-x-[-3px]"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-5">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                {lang === 'ar' ? 'أزيلال، المغرب' : lang === 'fr' ? 'Azilal, Maroc' : lang === 'ber' ? 'ⴰⵣⵉⵍⴰⵍ, ⵎⵓⵔⴰⴽⵓⵛ' : 'Azilal, Morocco'}
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <Phone className="w-4 h-4 shrink-0" />
                +212 523 000 000
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                info@azilal-tourism.ma
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-5">{t('footer.newsletter')}</h4>
            <p className="text-white/60 text-sm mb-4">{t('footer.newsletter.desc')}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('footer.email')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#2e8b57] text-start"
                dir={lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr'}
              />
              <button className="px-5 py-2.5 rounded-xl bg-[#c8a951] text-[#0f3d28] text-sm font-bold hover:bg-[#b89840] transition-colors shrink-0">
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} {lang === 'ar' ? 'السياحة في أزيلال' : lang === 'fr' ? 'Tourisme Azilal' : lang === 'ber' ? 'ⵜⴰⵎⵙⵉⴷⴰⵜ ⵏ ⴰⵣⵉⵍⴰⵍ' : 'Azilal Tourism'}. {t('footer.copyright')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
