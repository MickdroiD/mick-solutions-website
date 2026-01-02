'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import type { ModuleProps } from '../types';

/**
 * HeroCorporate - Variante professionnelle et entreprise.
 * 
 * @description Style corporate avec mise en page asymétrique,
 * typographie serif, et card de présentation. Utilise les CSS variables
 * --primary et --accent pour les couleurs thémables.
 */
export function HeroCorporate({ config }: ModuleProps) {
  // Parser le titre pour les 3 lignes
  const titreParts = config.titreHero.split('.');

  return (
    // Thème Corporate Light - fond bleu clair (#EFF6FF) sans mode dark
    <section className="relative min-h-screen bg-gradient-to-b from-blue-50 to-blue-100/50 overflow-hidden">
      {/* Pattern de fond corporate */}
      <div className="absolute inset-0 opacity-[0.03] pattern-bg">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Accent gradient - utilise la couleur primaire */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-5"
        style={{
          background: `linear-gradient(to left, var(--primary-500), transparent)`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col lg:flex-row gap-16 items-center w-full">
          {/* Content */}
          <div className="w-full lg:w-1/2">
            {/* Badge corporate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-8"
            >
              <Building2 className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
                {config.badgeHero || "Enterprise Solution"}
              </span>
            </motion.div>

            {/* Titre corporate avec serif */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary-950 leading-[1.15] mb-6"
            >
              {titreParts[0]?.trim() || "Excellence"}
              <br />
              <span className="text-primary-600">{titreParts[1]?.trim() || "Corporate"}</span>
              {titreParts[2] && (
                <>
                  <br />
                  <span className="text-primary-400">{titreParts[2].trim()}</span>
                </>
              )}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-primary-700 mb-8 leading-relaxed max-w-lg"
            >
              {config.sousTitreHero}
            </motion.p>

            {/* Trust points */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-10"
            >
              {[config.trustStat1Label, config.trustStat2Label, config.trustStat3Label]
                .filter(Boolean)
                .slice(0, 3)
                .map((label, i) => (
                  <li key={i} className="flex items-center gap-3 text-primary-800">
                    <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0" />
                    <span>{label}</span>
                  </li>
                ))}
            </motion.ul>

            {/* CTAs corporate - utilise les boutons thémables */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href={config.ctaPrincipalUrl || '#contact'}
                className="btn-primary"
              >
                {config.ctaPrincipal}
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={config.ctaSecondaireUrl || '#services'}
                className="btn-secondary"
              >
                {config.ctaSecondaire}
              </a>
            </motion.div>
          </div>

          {/* Visual corporate */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative w-full lg:w-1/2"
          >
            {/* Card principale */}
            <div className="relative bg-white rounded-theme-xl shadow-2xl p-8 border border-primary-200">
              {/* Header card */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-theme-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: `linear-gradient(135deg, var(--primary-500), var(--primary-600))`
                    }}
                  >
                    {config.initialesLogo}
                  </div>
                  <div>
                    <div className="font-semibold text-primary-900">{config.nomSite}</div>
                    <div className="text-sm text-primary-500">{config.slogan}</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-accent-100 text-accent-700 text-xs font-semibold rounded-full">
                  Actif
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/50 rounded-theme-lg">
                  <div className="text-3xl font-bold text-primary-900 dark:text-white">{config.trustStat1Value}</div>
                  <div className="text-xs text-primary-500 mt-1">{config.trustStat1Label}</div>
                </div>
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/50 rounded-theme-lg">
                  <div className="text-3xl font-bold text-primary-600">{config.trustStat2Value}</div>
                  <div className="text-xs text-primary-500 mt-1">{config.trustStat2Label}</div>
                </div>
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/50 rounded-theme-lg">
                  <div className="text-3xl font-bold text-primary-900 dark:text-white">{config.trustStat3Value}</div>
                  <div className="text-xs text-primary-500 mt-1">{config.trustStat3Label}</div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div
              className="absolute -top-4 -right-4 px-4 py-2 text-white text-sm font-semibold rounded-full shadow-lg"
              style={{ background: `var(--primary-600)` }}
            >
              Enterprise Ready
            </div>
            <div
              className="absolute -bottom-4 -left-4 px-4 py-2 text-white text-sm font-semibold rounded-full shadow-lg"
              style={{ background: `var(--accent-600)` }}
            >
              {config.paysHebergement}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
