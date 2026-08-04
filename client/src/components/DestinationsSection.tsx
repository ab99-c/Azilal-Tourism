import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, ArrowUpRight } from 'lucide-react';

const destinations = [
  {
    img: '/manus-storage/destination-binzaid_3d5b2664.jpg',
    location: 'ادرار - الأطلس الكبير',
    title_ar: 'بحيرة بين الويدان',
    title_en: 'Bin el Ouidane Lake',
    title_fr: 'Lac de Bin el Ouidane',
    title_ber: 'ⴰⵖⵏⵛⴰⵡ ⵏ ⴱⵉⵏ ⵍⵡⵉⴷⴰⵏ',
    desc_ar: 'بحيرة صناعية خلابة تقع بين جبال الأطلس، محاطة بغابات الصنوبر. مثالية لرياضات الكاياك والتخييم في الطبيعة',
    desc_en: 'A stunning artificial lake nestled between Atlas Mountains, surrounded by pine forests. Perfect for kayaking and nature camping',
    desc_fr: 'Un magnifique lac artificiel niché entre les montagnes de l\'Atlas, entouré de forêts de pins. Idéal pour le kayak et le camping',
    desc_ber: 'ⴰⵖⵏⵛⴰⵡ ⵉⵜⵜⵔⵣⵢⵏ ⵉⵜⵜⴰⵡⵢⵏ ⵙ ⵉⵡⴷⵉⵡⵏ ⵏ ⴰⵟⵍⴰⵙ',
  },
  {
    img: '/manus-storage/destination-tisnirt_033ee4ae.jpg',
    location: 'ادرار - وادي ادرار',
    title_ar: 'شلالات تيسنيرت',
    title_en: 'Tisnirt Waterfalls',
    title_fr: 'Cascades de Tisnirt',
    title_ber: 'ⵉⵔⵣⵣⵉⵜⵏ ⵏ ⵜⵉⵙⵏⵉⵔⵜ',
    desc_ar: 'شلالات طبيعية جميلة تنحدر من صخور الحمرة وسط غابات الأرز والشجر الأخضر',
    desc_en: 'Beautiful natural waterfalls cascading from red sandstone cliffs amid cedar forests and green vegetation',
    desc_fr: 'De magnifiques cascades naturelles tombant des falaises de grès rouge au milieu des forêts de cèdres',
    desc_ber: 'ⵉⵔⵣⵣⵉⵜⵏ ⵉⵜⵜⵔⵣⵢⵏ ⵙⴳ ⵉⵣⴳⴰⵏ ⵉⵖⴱⵉⴱⵏ',
  },
  {
    img: '/manus-storage/destination-berber_165bf569.jpg',
    location: 'ادرار - الجبل',
    title_ar: 'قرى أيت بومهدى',
    title_en: 'Ait Bouhaddou Villages',
    title_fr: 'Villages d\'Ait Bouhaddou',
    title_ber: 'ⵉⵖⵔⵎⴰⵏ ⵏ ⴰⵢⵜ ⴱⵓⵀⴷⴷⵓ',
    desc_ar: 'قرى أمازيغية تقليدية تحافظ على التراث الثقافي والعادات والتقاليد العريقة منذ قرون',
    desc_en: 'Traditional Amazigh villages preserving rich cultural heritage and ancient customs for centuries',
    desc_fr: 'Des villages amazighs traditionnels préservant un riche patrimoine culturel et des coutumes anciennes',
    desc_ber: 'ⵉⵖⵔⵎⴰⵏ ⵉⵎⴰⵣⵉⵖⵏ ⵉⵎⵓⵍⵏ ⵉⴳⵎⴰⵢⵏ ⵜⵉⵖⵍⵉⵜ',
  },
  {
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600https://images.unsplash.com/photo-1548018560-c7196e453dc8?w=600&q=80q=80',
    location: 'ادرار - الأطلس',
    title_ar: 'جبل توبقال',
    title_en: 'Toubkal Mountain',
    title_fr: 'Mont Toubkal',
    title_ber: 'ⴰⴷⵔⴰⵔ ⵏ ⵜⵓⴱⵇⴰⵍ',
    desc_ar: 'أعلى قمة في شمال أفريقيا، تحفة طبيعية تستحق التسلق والاستكشاف',
    desc_en: 'The highest peak in North Africa, a natural masterpiece worth climbing and exploring',
    desc_fr: 'Le plus haut sommet d\'Afrique du Nord, un chef-d\'œuvre naturel qui mérite d\'être exploré',
    desc_ber: 'ⴰⵏⵙⴰ ⵉⵜⵜⵔⵣⵢⵏ ⵉⵖⵔⴰⵏ ⵏ ⵜⴰⴼⵔⵉⵇⵜ ⵜⴰⴳⴰⴼⴰⵢⵜ',
  },
  {
    img: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=600&q=80q=80',
    location: 'ادرار - الوديان',
    title_ar: 'وادي أبي رقراق',
    title_en: 'Abirqrak Valley',
    title_fr: 'Vallée d\'Abirqrak',
    title_ber: 'ⴰⵡⴰⵍⵉ ⵏ ⴰⴱⵉⵔⵇⵔⴰⵇ',
    desc_ar: 'وادي أخضر خلاب يتدفق فيه نهر صاف بين الجبال والصخور الطبيعية',
    desc_en: 'A lush green valley with a crystal-clear river flowing between mountains and natural rocks',
    desc_fr: 'Une vallée verdoyante avec une rivière cristalline coulant entre les montagnes',
    desc_ber: 'ⴰⵡⴰⵍⵉ ⵉⵣⵓⵣⵣⴰⵏ ⵙ ⵓⵙⵏⴳⴰⵔ ⵉⵜⵜⴰⵡⵢⵏ',
  },
  {
    img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=600&q=80q=80',
    location: 'ادرار - الصحراء',
    title_ar: 'محمية ادرار',
    title_en: 'ADRAR Reserve',
    title_fr: 'Réserve d\'ADRAR',
    title_ber: 'ⴰⴳⵏⵉ ⵏ ⴰⴷⵔⴰⵔ',
    desc_ar: 'محمية طبيعية تضم أنواعاً نادرة من النباتات والحيوانات في بيئة جبلية فريدة',
    desc_en: 'A natural reserve with rare species of plants and animals in a unique mountain environment',
    desc_fr: 'Une réserve naturelle avec des espèces rares de plantes et d\'animaux dans un environnement montagnard unique',
    desc_ber: 'ⴰⴳⵏⵉ ⵏ ⵜⴰⴷⴰⵍⵉⵜ ⵉⵜⵜⵓⵙⵏ ⵉ ⵜⵉⵙⵉⵔⵉⵏ',
  },
];

export default function DestinationsSection() {
  const { t, lang } = useLanguage();

  const getTitle = (d: typeof destinations[0]) => {
    if (lang === 'ar') return d.title_ar;
    if (lang === 'fr') return d.title_fr;
    if (lang === 'ber') return d.title_ber;
    return d.title_en;
  };

  const getDesc = (d: typeof destinations[0]) => {
    if (lang === 'ar') return d.desc_ar;
    if (lang === 'fr') return d.desc_fr;
    if (lang === 'ber') return d.desc_ber;
    return d.desc_en;
  };

  return (
    <section id="destinations" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b5e3f] mb-3">
            {t('destinations.title')}
          </h2>
          <p className="text-gray-500 text-lg">{t('destinations.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={dest.img}
                  alt={getTitle(dest)}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 font-bold text-sm text-[#c8a951]">
                  <MapPin className="w-3.5 h-3.5" />
                  4.8
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-[#1b5e3f] text-sm font-semibold mb-2">
                  <MapPin className="w-4 h-4" />
                  {dest.location}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {getTitle(dest)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {getDesc(dest)}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-[#1b5e3f] text-base">
                    {lang === 'ar' ? 'مجاني' : lang === 'fr' ? 'Gratuit' : lang === 'ber' ? 'ⴱⴷⴷⵓ' : 'Free'}
                  </span>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#1b5e3f] text-white flex items-center justify-center hover:bg-[#0f3d28] transition-all hover:rotate-[-45deg]"
                  >
                    <ArrowUpRight className="w-5 h-5 rtl:rotate-180" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
