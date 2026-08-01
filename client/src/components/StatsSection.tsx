import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Route, Landmark, Home } from 'lucide-react';

export default function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, number: '250K+', label: 'stats.visitors' },
    { icon: Route, number: '45+', label: 'stats.trails' },
    { icon: Landmark, number: '120+', label: 'stats.heritage' },
    { icon: Home, number: '80+', label: 'stats.hospitality' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#0f3d28] to-[#1b5e3f] relative overflow-hidden">
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center text-white"
            >
              <stat.icon className="w-10 h-10 mx-auto mb-4 opacity-80" />
              <div className="text-4xl md:text-5xl font-extrabold mb-2">
                {stat.number}
              </div>
              <div className="text-sm opacity-75">{t(stat.label)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
