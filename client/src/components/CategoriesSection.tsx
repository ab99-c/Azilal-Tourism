import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mountain, Compass, Landmark, Bike, Leaf } from 'lucide-react';

export default function CategoriesSection() {
  const { t } = useLanguage();

  const categories = [
    {
      icon: Mountain,
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
      title: 'cat.nature',
      count: 'cat.nature.count',
      safety: true,
    },
    {
      icon: Compass,
      img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
      title: 'cat.adventure',
      count: 'cat.adventure.count',
      safety: true,
    },
    {
      icon: Landmark,
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
      title: 'cat.culture',
      count: 'cat.culture.count',
      safety: false,
    },
    {
      icon: Bike,
      img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
      title: 'cat.sports',
      count: 'cat.sports.count',
      safety: true,
    },
    {
      icon: Leaf,
      title: 'cat.localProducts',
      count: 'cat.localProducts.count',
      safety: false,
      page: true,
    },
  ];

  const openActivity = (category: (typeof categories)[number]) => {
    if (category.page) {
      window.location.assign('/products');
      return;
    }
    if (!category.safety) return;
    const activity = category.title.replace('cat.', '');
    window.location.assign(`/safety-trip?activity=${encodeURIComponent(activity)}`);
  };

  return (
    <section id="activities" className="w-full overflow-hidden bg-white py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-extrabold text-[#1b5e3f] md:text-4xl">
            {t('categories.title')}
          </h2>
          <p className="text-lg text-gray-500">{t('categories.subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.title}
              type="button"
              onClick={() => openActivity(cat)}
              aria-label={t(cat.title)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-72 cursor-pointer overflow-hidden rounded-2xl text-start shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#2c8b62]/40"
            >
              {cat.img ? (
                <img
                  src={cat.img}
                  alt={t(cat.title)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1b5e3f] via-[#287853] to-[#c8a951] transition-transform duration-700 group-hover:scale-110">
                  <Leaf className="h-20 w-20 text-white/80" aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f3d28]/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <cat.icon className="mb-3 h-8 w-8 opacity-80" />
                <h3 className="text-lg font-bold">{t(cat.title)}</h3>
                <p className="mt-1 text-sm opacity-75">{t(cat.count)}</p>
                {cat.safety && <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">Safety Trip</span>}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
