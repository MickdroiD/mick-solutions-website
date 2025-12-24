'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import type { ModuleProps } from '../types';

/**
 * HeroBold - Variante audacieuse et impactante.
 * 
 * @description Style brutal avec typographie massive,
 * contrastes forts et animations percutantes. Utilise les CSS variables
 * --primary et --accent pour les couleurs thémables.
 */
export function HeroBold({ config }: ModuleProps) {
  // Parser le titre
  const titreParts = config.titreHero.split('.');
  
  return (
    <section className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background avec effet noise */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          filter: 'contrast(150%) brightness(50%)'
        }}
      />

      {/* Accent color splash */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-20"
        style={{
          background: `linear-gradient(135deg, var(--primary-500), transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-screen flex items-center">
        <div className="w-full">
          {/* Badge audacieux */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div 
              className="w-12 h-1 bg-primary-500"
            />
            <span className="text-sm font-black uppercase tracking-[0.4em] text-primary-400">
              {config.badgeHero}
            </span>
          </motion.div>

          {/* Titre MASSIF */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] mb-8 tracking-tighter font-heading"
          >
            {titreParts[0]?.trim().toUpperCase() || "BOLD"}
            <br />
            <span className="text-gradient">
              {titreParts[1]?.trim().toUpperCase() || "STATEMENT"}
            </span>
          </motion.h1>

          {/* Sous-titre avec ligne */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-6 mb-12 max-w-2xl"
          >
            <div className="w-1 h-20 flex-shrink-0 bg-primary-500" />
            <p className="text-xl md:text-2xl text-primary-300/60 font-light leading-relaxed">
              {config.sousTitreHero}
            </p>
          </motion.div>

          {/* CTAs bold */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6"
          >
            <a
              href={config.ctaPrincipalUrl || '#contact'}
              className="group relative inline-flex items-center gap-3 px-10 py-5 font-black text-lg uppercase tracking-wider overflow-hidden bg-primary-500 text-white rounded-theme"
            >
              {/* Hover effect */}
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3">
                <Zap className="w-5 h-5" />
                {config.ctaPrincipal}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </a>
            
            <a
              href={config.ctaSecondaireUrl || '#services'}
              className="group inline-flex items-center gap-3 px-10 py-5 font-black text-lg uppercase tracking-wider 
                         border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-theme"
            >
              {config.ctaSecondaire}
            </a>
          </motion.div>

          {/* Stats en grand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-12 left-6 right-6 flex justify-between items-end"
          >
            <div className="flex gap-16">
              <div>
                <div className="text-5xl md:text-6xl font-black text-primary-400">
                  {config.trustStat1Value}
                </div>
                <div className="text-sm uppercase tracking-wider text-primary-600 mt-2">
                  {config.trustStat1Label}
                </div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-black text-foreground">
                  {config.trustStat2Value}
                </div>
                <div className="text-sm uppercase tracking-wider text-primary-600 mt-2">
                  {config.trustStat2Label}
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="text-xs uppercase tracking-[0.3em] text-primary-700 rotate-90 origin-bottom-right">
              Scroll
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
