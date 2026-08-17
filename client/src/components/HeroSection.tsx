import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, MapPin } from 'lucide-react';
import { scrollToSection } from '@/lib/scroll';

/** CDN hero background — fails over to an embedded data-URI when blocked. */
const CDN_BG = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663817279330/JbWhaFzOFzgfRJac.jpg';

/**
 * Embedded fallback image, code-split into its own chunk so the hero's
 * ~370KB data-URI never inflates the initial JavaScript bundle. Phones with
 * slow/limited connections still get instant page paint; the fallback chunk
 * loads in parallel and activates only if the CDN image fails.
 */
export default function HeroSection() {
  const { t } = useLanguage();

  // Start with CDN; swap to embedded fallback on load failure (browsers that block external images)
  const [bgUrl, setBgUrl] = useState(CDN_BG);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  // Load the embedded fallback chunk eagerly (it's needed within seconds of
  // paint on devices that block external images), but keep it out of the
  // critical initial bundle.
  useEffect(() => {
    let cancelled = false;
    import('@/lib/heroFallback').then(m => {
      if (!cancelled) setFallbackSrc(m.HERO_BG_FALLBACK);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleImageError = () => {
    if (fallbackSrc) {
      setBgUrl(fallbackSrc);
    } else {
      // Fallback chunk not yet available — wait for it then switch
      import('@/lib/heroFallback').then(m => setBgUrl(m.HERO_BG_FALLBACK));
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image — CSS background-image for max compatibility, with embedded data-URI fallback so the hero is NEVER empty/black */}
      <div
        key={bgUrl}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${bgUrl}")` }}
      >
        {/* Hidden <img> that detects CDN failure and triggers the embedded fallback */}
        <img
          src={CDN_BG}
          alt=""
          className="hidden"
          loading="eager"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f3d28]/85 via-[#1b5e3f]/70 to-[#0f3d28]/90" />
        {/* Berber Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-2 rounded-full text-sm text-white/90 border border-white/20 mb-6">
            <MapPin className="w-4 h-4" />
            {t('hero.badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          href="#featured"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('featured');
          }}
          className="inline-flex items-center gap-3 bg-white text-[#1b5e3f] px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all hover:-translate-y-1"
        >
          {t('hero.cta')}
        </motion.a>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => scrollToSection('featured')}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
