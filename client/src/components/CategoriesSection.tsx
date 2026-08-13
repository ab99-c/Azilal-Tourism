import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mountain, Compass, Landmark, Bike } from 'lucide-react';

export default function CategoriesSection() {
  const { t } = useLanguage();

  const categories = [
    {
      icon: Mountain,
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
      title: 'cat.nature',
      count: 'cat.nature.count',
    },
    {
      icon: Compass,
      img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
      title: 'cat.adventure',
      count: 'cat.adventure.count',
    },
    {
      icon: Landmark,
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
      title: 'cat.culture',
      count: 'cat.culture.count',
    },
    {
      icon: Bike,
      img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
      title: 'cat.sports',
      count: 'cat.sports.count',
    },
  ];

  return (
    <section id="activities" className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3">
            {t('categories.title')}
          </h2>
          <p className="text-gray-500 text-lg">{t('categories.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <img
                src={cat.img}
                alt={t(cat.title)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f3d28]/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <cat.icon className="w-8 h-8 mb-3 opacity-80" />
                <h3 className="text-lg font-bold">{t(cat.title)}</h3>
                <p className="text-sm opacity-75 mt-1">{t(cat.count)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
