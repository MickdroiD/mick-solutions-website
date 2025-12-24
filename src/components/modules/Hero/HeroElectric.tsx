'use client';

import { motion } from 'framer-motion';
import AnimatedLogo from '@/components/AnimatedLogo';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ModuleProps } from '../types';

/**
 * HeroElectric - Variante dynamique et moderne (style Mick Solutions).
 * 
 * @description Style futuriste avec gradients cyan/violet,
 * logo animé et effets de glow. Utilise les CSS variables
 * --primary et --accent pour les couleurs thémables.
 */
export function HeroElectric({ config }: ModuleProps) {
  // Parser le titre pour créer le gradient sur la 2e ligne
  const titreParts = config.titreHero.split('.');
  const ligne1 = titreParts[0] ? titreParts[0].trim() + '.' : 'Gagnez du temps.';
  const ligne2 = titreParts[1] ? titreParts[1].trim() + '.' : 'Économisez de l\'argent.';
  const ligne3 = titreParts[2] ? titreParts[2].trim() + (titreParts[2].endsWith('.') ? '' : '.') : 'Restez concentrés.';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradients - utilise les CSS variables */}
      <div className="absolute inset-0 bg-background">
        {/* Top-left gradient */}
        <div 
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: 'color-mix(in srgb, var(--primary-500) 10%, transparent)' }}
        />
        {/* Bottom-right gradient */}
        <div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] translate-x-1/3 translate-y-1/3"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent-500) 10%, transparent)' }}
        />
        {/* Center subtle gradient */}
        <div 
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: 'color-mix(in srgb, var(--primary-500) 5%, transparent)' }}
        />
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
              <span className="text-sm text-primary-300">{config.badgeHero}</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-heading">
              {ligne1}
              <br />
              <span className="text-gradient">{ligne2}</span>
              <br />
              {ligne3}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-primary-300/70 mb-8 max-w-xl mx-auto lg:mx-0">
              {config.sousTitreHero}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href={config.ctaPrincipalUrl || '#contact'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white
                         bg-gradient-to-r from-primary-500 to-accent-500
                         shadow-xl transition-all duration-300 hover-glow"
                style={{
                  boxShadow: '0 10px 30px color-mix(in srgb, var(--primary-500) 25%, transparent)'
                }}
              >
                {config.ctaPrincipal}
                <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={config.ctaSecondaireUrl || '#services'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium text-primary-200
                         bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
                         transition-all duration-300"
              >
                {config.ctaSecondaire}
              </motion.a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{config.trustStat1Value}</div>
                <div className="text-xs text-primary-500">{config.trustStat1Label}</div>
              </div>
              <div className="w-px h-10 bg-primary-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{config.trustStat2Value}</div>
                <div className="text-xs text-primary-500">{config.trustStat2Label}</div>
              </div>
              <div className="w-px h-10 bg-primary-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{config.trustStat3Value}</div>
                <div className="text-xs text-primary-500">{config.trustStat3Label}</div>
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
          className="w-6 h-10 rounded-full border-2 border-primary-700 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
