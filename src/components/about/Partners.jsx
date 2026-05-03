import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { partnersApi } from '@/services/api';
import SectionHeading from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/glass-card';

export default function Partners() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Load partners on mount
  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(false);
      const data = await partnersApi.list();
      setPartners(data);
    } catch (err) {
      console.error('Failed to load partners:', err);
      setLoading(false);
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay || partners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [isAutoPlay, partners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? partners.length - 1 : prev - 1
    );
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % partners.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  // Don't render section if no partners
  if (partners.length === 0) return null;

  const currentPartner = partners[currentIndex];

  // Get visible slides (for desktop carousel effect)
  const visibleSlides = [
    partners[currentIndex],
    partners[(currentIndex + 1) % partners.length],
    partners[(currentIndex + 2) % partners.length],
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          title={t('about.partners.title') || 'Our'}
          highlight={t('about.partners.highlight') || 'Partners'}
          subtitle={t('about.partners.subtitle') || 'Trusted partnerships that drive success'}
          align="center"
          showLine={true}
        />

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="mt-16">
            {/* Mobile: Single card view */}
            <div className="block md:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PartnerCard partner={currentPartner} />
                </motion.div>
              </AnimatePresence>

              {/* Mobile Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={goToPrevious}
                  className="p-2 rounded-full bg-blue-600/20 text-blue-600 hover:bg-blue-600/30 transition"
                  aria-label="Previous partner"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Indicators */}
                <div className="flex gap-2">
                  {partners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition ${
                        index === currentIndex
                          ? 'w-8 bg-blue-600'
                          : 'w-2 bg-gray-400'
                      }`}
                      aria-label={`Go to partner ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  className="p-2 rounded-full bg-blue-600/20 text-blue-600 hover:bg-blue-600/30 transition"
                  aria-label="Next partner"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Desktop: Carousel with 3 cards */}
            <div className="hidden md:block">
              <div
                className="flex gap-6 overflow-hidden"
                onMouseEnter={() => setIsAutoPlay(false)}
                onMouseLeave={() => setIsAutoPlay(true)}
              >
                <AnimatePresence mode="wait">
                  {visibleSlides.map((partner, idx) => (
                    <motion.div
                      key={`${currentIndex}-${idx}`}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex-1 min-w-0"
                    >
                      <PartnerCard partner={partner} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Desktop Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={goToPrevious}
                  className="p-3 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 text-gray-900 dark:text-white hover:from-white/20 hover:to-white/10 transition shadow-lg"
                  aria-label="Previous partner"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Indicators */}
                <div className="flex gap-3">
                  {partners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-3 rounded-full transition ${
                        index === currentIndex
                          ? 'w-10 bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'w-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to partner ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  className="p-3 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 text-gray-900 dark:text-white hover:from-white/20 hover:to-white/10 transition shadow-lg"
                  aria-label="Next partner"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Slide counter */}
              <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {partners.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * PartnerCard component
 * Displays a partner with glassmorphism design
 */
function PartnerCard({ partner }) {
  return (
    <GlassCard className="overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      {/* Image Container */}
      {partner.image_base64 && (
        <div className="relative h-40 md:h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <img
            src={partner.image_base64}
            alt={partner.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}

      {/* Content Container */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        {/* Name */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {partner.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
          {partner.description}
        </p>

        {/* Decorative bottom accent */}
        <div className="flex gap-1 pt-2 border-t border-white/10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
            ></div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
