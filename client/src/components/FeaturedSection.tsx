import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Star } from 'lucide-react';

const features = [
  {
    img: '/manus-storage/destination-binzaid_3d5b2664.jpg',
    badge: 'featured.1.badge',
    title: 'featured.1.title',
    desc: 'featured.1.desc',
  },
  {
    img: '/manus-storage/destination-tisnirt_033ee4ae.jpg',
    badge: 'featured.2.badge',
    title: 'featured.2.title',
    desc: 'featured.2.desc',
  },
  {
    img: '/manus-storage/destination-berber_165bf569.jpg',
    badge: 'featured.3.badge',
    title: 'featured.3.title',
    desc: 'featured.3.desc',
  },
];

export default function FeaturedSection() {
  const { t } = useLanguage();

  return (
    <section id="featured" className="py-20 relative -mt-24 z-10">
      <div className="container">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3"
          >
            {t('featured.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg"
          >
            {t('featured.subtitle')}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={feature.img}
                  alt={t(feature.title)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <span className="absolute top-4 right-4 bg-[#1b5e3f] text-white px-3 py-1 rounded-full text-xs font-bold">
                  {t(feature.badge)}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#c8a951] text-[#c8a951]" />
                  ))}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t(feature.title)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {t(feature.desc)}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#1b5e3f] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#0f3d28] transition-all hover:shadow-lg group-hover:-translate-x-1"
                >
                  {t('destinations.view')}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
