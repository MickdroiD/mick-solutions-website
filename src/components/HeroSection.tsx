'use client';

import { motion } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { GlobalSettingsComplete } from '@/lib/types/global-settings';
import { DEFAULT_SETTINGS } from '@/lib/types/global-settings';

interface HeroSectionProps {
  globalSettings: GlobalSettingsComplete;
}

export default function HeroSection({ globalSettings }: HeroSectionProps) {
  // Données dynamiques avec fallback
  const settings = globalSettings || DEFAULT_SETTINGS;
  const titreHero = settings.titreHero;
  const sousTitreHero = settings.sousTitreHero;
  const badgeHero = settings.badgeHero;
  const ctaPrincipal = settings.ctaPrincipal;
  const ctaSecondaire = settings.ctaSecondaire;
  const trustStat1Value = settings.trustStat1Value;
  const trustStat1Label = settings.trustStat1Label;
  const trustStat2Value = settings.trustStat2Value;
  const trustStat2Label = settings.trustStat2Label;
  const trustStat3Value = settings.trustStat3Value;
  const trustStat3Label = settings.trustStat3Label;

  // Parser le titre pour créer le gradient sur la 2e ligne
  const titreParts = titreHero.split('.');
  const ligne1 = titreParts[0] ? titreParts[0].trim() + '.' : 'Gagnez du temps.';
  const ligne2 = titreParts[1] ? titreParts[1].trim() + '.' : 'Économisez de l\'argent.';
  const ligne3 = titreParts[2] ? titreParts[2].trim() + (titreParts[2].endsWith('.') ? '' : '.') : 'Restez concentrés.';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-background">
        {/* Top-left gradient */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        {/* Bottom-right gradient */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3" />
        {/* Center subtle gradient */}
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">{badgeHero}</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {ligne1}
              <br />
              <span className="text-gradient">{ligne2}</span>
              <br />
              {ligne3}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
              {sousTitreHero}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white
                         bg-gradient-to-r from-primary-500 to-accent-500
                         shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40
                         transition-all duration-300"
              >
                {ctaPrincipal}
                <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium text-slate-300
                         bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
                         transition-all duration-300"
              >
                {ctaSecondaire}
              </motion.a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{trustStat1Value}</div>
                <div className="text-xs text-slate-500">{trustStat1Label}</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{trustStat2Value}</div>
                <div className="text-xs text-slate-500">{trustStat2Label}</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{trustStat3Value}</div>
                <div className="text-xs text-slate-500">{trustStat3Label}</div>
              </div>
            </div>
          </motion.div>

          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <AnimatedLogo className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
