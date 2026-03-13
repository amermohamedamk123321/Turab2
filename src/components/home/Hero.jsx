import FloatingLines from '@/components/ui/FloatingLines';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#0B0B0D]">
      <div className="absolute inset-0">
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          linesGradient={["#A31621", "#FF6B6B", "#87CEEB", "#4A90D9", "#9B59B6", "#7B2FBE", "#A31621"]}
          lineCount={8}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-3 sm:mb-4 md:mb-6"
        >
          Turab Root
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 font-bold mb-8 sm:mb-10 md:mb-12 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-2"
        >
          {t('hero.slogan')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto"
        >
          <Button
            size="lg"
            onClick={() => navigate('/projects')}
            className="bg-brand-madder hover:bg-brand-madder/90 text-white rounded-full px-6 sm:px-8 gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            {t('hero.viewWork')}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/contact')}
            className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white rounded-full px-6 sm:px-8 gap-2 backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base"
          >
            <Mail className="w-4 h-4" />
            {t('hero.getInTouch')}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
