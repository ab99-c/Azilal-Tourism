import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Mountain, Landmark, Sun } from 'lucide-react';

export default function MapSection() {
  const { t } = useLanguage();

  const features = [
    { icon: Mountain, title: 'map.f1.title', desc: 'map.f1.desc' },
    { icon: Landmark, title: 'map.f2.title', desc: 'map.f2.desc' },
    { icon: Sun, title: 'map.f3.title', desc: 'map.f3.desc' },
  ];

  return (
    <section id="about" className="py-20 bg-[#f5f5f0]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-4">
              {t('map.title')}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              {t('map.desc')}
            </p>
            <div className="space-y-5 mb-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1b5e3f]/10 text-[#1b5e3f] flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t(f.title)}</h4>
                    <p className="text-sm text-gray-500">{t(f.desc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d216072.5!2d-7.15!3d32.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda61b8f1e0a8d49%3A0x3c2b8e8b8e8b8e8b!2sAzilal!5e0!3m2!1sen!2sma!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Azilal Map"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
