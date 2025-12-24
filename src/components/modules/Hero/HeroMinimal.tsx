'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ModuleProps } from '../types';

/**
 * HeroMinimal - Variante épurée et moderne.
 * 
 * @description Style minimaliste avec beaucoup d'espace blanc,
 * typographie légère et animations subtiles. Utilise les CSS variables
 * pour les couleurs thémables.
 */
export function HeroMinimal({ config }: ModuleProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        {/* Badge discret */}
        {config.badgeHero && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs tracking-[0.3em] uppercase text-primary-500 mb-8"
          >
            {config.badgeHero}
          </motion.span>
        )}

        {/* Titre principal - Typographie épurée */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-5xl md:text-7xl font-light text-primary-900 dark:text-foreground leading-[1.1] mb-8 tracking-tight font-heading"
        >
          {config.titreHero.split('.')[0]?.trim() || "Titre Minimal"}
          <span className="text-primary-300 dark:text-primary-700">.</span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl text-primary-600 dark:text-primary-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          {config.sousTitreHero}
        </motion.p>

        {/* CTA minimaliste */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href={config.ctaPrincipalUrl || '#contact'}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900 
                       text-sm font-medium tracking-wide transition-all duration-300 hover:gap-5 rounded-theme"
          >
            {config.ctaPrincipal}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
          
          {config.ctaSecondaire && (
            <a
              href={config.ctaSecondaireUrl || '#services'}
              className="inline-flex items-center justify-center px-8 py-4 text-primary-700 dark:text-primary-300 
                         text-sm font-medium tracking-wide border-b-2 border-transparent hover:border-primary-600 
                         dark:hover:border-primary-400 transition-all duration-300"
            >
              {config.ctaSecondaire}
            </a>
          )}
        </motion.div>

        {/* Stats minimales en ligne */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-20 flex items-center justify-center gap-12 text-sm"
        >
          <div className="text-center">
            <div className="text-2xl font-light text-primary-900 dark:text-foreground">{config.trustStat1Value}</div>
            <div className="text-primary-500 tracking-wide uppercase text-[10px]">{config.trustStat1Label}</div>
          </div>
          <div className="w-px h-8 bg-primary-200 dark:bg-primary-800" />
          <div className="text-center">
            <div className="text-2xl font-light text-primary-900 dark:text-foreground">{config.trustStat2Value}</div>
            <div className="text-primary-500 tracking-wide uppercase text-[10px]">{config.trustStat2Label}</div>
          </div>
          <div className="w-px h-8 bg-primary-200 dark:bg-primary-800" />
          <div className="text-center">
            <div className="text-2xl font-light text-primary-900 dark:text-foreground">{config.trustStat3Value}</div>
            <div className="text-primary-500 tracking-wide uppercase text-[10px]">{config.trustStat3Label}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
