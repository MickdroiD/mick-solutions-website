'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import type { ModuleProps } from '../types';
import {
  getDirectEffectClasses,
  getIndirectEffectStyles,
  getTitleClasses,
  getSubtitleClasses,
  getBackgroundStyles,
  getFontFamilyStyle,
} from '@/lib/helpers/effects-renderer';
import type { EffectSettings, TextSettings } from '@/lib/schemas/factory';

// ============================================
// HERO UNIFIÉ - Personnalisation Complète
// ============================================
// 🎯 Tous les effets (logo, texte, transparence, couleurs) sont fonctionnels
// 🎯 Plus de variants - Personnalisation via effects/textSettings

export function Hero({ config }: ModuleProps) {
  // ⭐ Récupération des effets et styles
  const effects = (config as { effects?: EffectSettings }).effects;
  const textSettings = (config as { textSettings?: TextSettings }).textSettings;
  
  // 🔧 DEBUG: Log des données reçues
  if (typeof window !== 'undefined') {
    console.log('🎨 Hero DEBUG:', JSON.stringify({
      effects,
      textSettings,
      backgroundUrl: config.heroBackgroundUrl,
      badge: config.badgeHero,
      logoUrl: config.logoUrl,
    }, null, 2));
  }
  
  // Données de contenu
  const logoUrl = config.logoUrl || null;
  const titre = config.titreHero || 'Bienvenue';
  const sousTitre = config.sousTitreHero || '';
  const badge = config.badgeHero || null;
  const ctaPrincipal = config.ctaPrincipal || null;
  const ctaPrincipalUrl = config.ctaPrincipalUrl || '#';
  const ctaSecondaire = config.ctaSecondaire || null;
  const ctaSecondaireUrl = config.ctaSecondaireUrl || '#';
  const trustStat1Value = config.trustStat1Value || null;
  const trustStat1Label = config.trustStat1Label || null;
  const trustStat2Value = config.trustStat2Value || null;
  const trustStat2Label = config.trustStat2Label || null;
  const trustStat3Value = config.trustStat3Value || null;
  const trustStat3Label = config.trustStat3Label || null;
  
  // Options de design (priorité: effects > config legacy)
  const height = effects?.height || config.heroHeight || 'Tall';
  const logoSize = effects?.logoSize || config.heroLogoSize || 280;
  const backgroundUrl = config.heroBackgroundUrl || null;
  const videoUrl = config.heroVideoUrl || null;
  
  // Convertir hauteur en classes CSS
  const heightClass = {
    Short: 'min-h-[70vh]',
    Medium: 'min-h-[85vh]',
    Tall: 'min-h-screen',
    FullScreen: 'min-h-screen h-screen',
  }[height] || 'min-h-screen';
  
  // Styles dynamiques pour le background
  const bgStyles = getBackgroundStyles(effects || {});
  
  // Classes dynamiques pour les effets de logo
  const logoDirectClasses = getDirectEffectClasses(effects || {});
  const logoIndirectStyles = getIndirectEffectStyles(effects || {});
  
  return (
    <section 
      className={`relative ${heightClass} flex items-center justify-center overflow-hidden pt-20`}
      style={getFontFamilyStyle(textSettings?.bodyFontFamily)}
    >
      {/* ========== BACKGROUND ========== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Video background */}
        {videoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={bgStyles}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        
        {/* Image background */}
        {backgroundUrl && !videoUrl && (
          <div className="absolute inset-0" style={bgStyles}>
            <Image
              src={backgroundUrl}
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        {/* Overlay si pas de background custom */}
        {!backgroundUrl && !videoUrl && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 bg-cyan-500/10" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 bg-purple-500/10" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* ========== GAUCHE: TEXTE ========== */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-300">{badge}</span>
              </motion.div>
            )}

            {/* Titre avec styles dynamiques */}
            <h1 
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 ${getTitleClasses(textSettings)}`}
              style={getFontFamilyStyle(textSettings?.titleFontFamily)}
            >
              {titre}
            </h1>

            {/* Sous-titre avec styles dynamiques */}
            {sousTitre && (
              <p 
                className={`text-lg sm:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 ${getSubtitleClasses(textSettings)}`}
                style={getFontFamilyStyle(textSettings?.subtitleFontFamily)}
              >
                {sousTitre}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {ctaPrincipal && (
                <motion.a
                  href={ctaPrincipalUrl}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
                >
                  {ctaPrincipal}
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              )}
              {ctaSecondaire && (
                <motion.a
                  href={ctaSecondaireUrl}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  {ctaSecondaire}
                </motion.a>
              )}
            </div>

            {/* Trust Stats - Support 3+ statistiques */}
            {(trustStat1Value || trustStat2Value || trustStat3Value) && (
              <div className="mt-12 flex flex-wrap items-center gap-6 lg:gap-8 justify-center lg:justify-start pt-8 border-t border-white/5">
                {[
                  { value: trustStat1Value, label: trustStat1Label },
                  { value: trustStat2Value, label: trustStat2Label },
                  { value: trustStat3Value, label: trustStat3Label },
                ].filter(stat => stat.value).map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-cyan-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ========== DROITE: LOGO AVEC EFFETS ========== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            {logoUrl ? (
              <div 
                className="relative"
                style={{
                  width: `${logoSize}px`,
                  height: `${logoSize}px`,
                  ...logoIndirectStyles,
                }}
              >
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={logoSize}
                  height={logoSize}
                  className={`object-contain ${logoDirectClasses}`}
                  priority
                />
              </div>
            ) : (
              // Placeholder si pas de logo
              <div 
                className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 ${logoDirectClasses}`}
                style={{
                  width: `${logoSize}px`,
                  height: `${logoSize}px`,
                  ...logoIndirectStyles,
                }}
              >
                <span className="text-6xl font-bold text-cyan-400">MS</span>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}

