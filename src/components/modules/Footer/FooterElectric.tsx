'use client';

import { motion, Transition, TargetAndTransition } from 'framer-motion';
import { ArrowRight, Mail, Linkedin, Github, Instagram } from 'lucide-react';
import Image from 'next/image';
import type { FooterModuleProps } from '../types';
import { hexToRgb } from '@/lib/helpers/effects-renderer';
import type { LogoAnimation } from '@/lib/types/global-settings';
import AnimatedLogoFrame from '../../AnimatedLogoFrame';
import { CSSProperties } from 'react';

// ============================================
// LOGO WITH ANIMATION (Local to this file)
// ============================================
interface AnimationVariants {
  animate: TargetAndTransition;
  transition: Transition;
  style?: CSSProperties;
}

function FooterLogoWithAnimation({
  logoUrl,
  logoSvgCode,
  nomSite,
  animation,
  size = 40,
  forceElectric = false // 🔧 FIX: Nouveau prop pour forcer l'effet électrique
}: {
  logoUrl: string;
  logoSvgCode?: string | null;
  nomSite: string;
  animation?: LogoAnimation | null;
  size?: number | null;
  forceElectric?: boolean;
}) {
  const logoSize = size || 40;
  const normalizedAnimation = animation?.toLowerCase() || 'none';

  const getAnimationVariants = (): AnimationVariants => {
    switch (normalizedAnimation) {
      case 'spin-glow':
      case 'spin_glow':
        return {
          animate: { rotate: 360 },
          transition: { duration: 8, repeat: Infinity, ease: 'linear' as const },
          style: { filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' }
        };
      case 'spin':
      case 'rotate':
        return {
          animate: { rotate: 360 },
          transition: { duration: 8, repeat: Infinity, ease: 'linear' as const }
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity }
        };
      case 'bounce':
        return {
          animate: { y: [0, -5, 0] },
          transition: { duration: 1.5, repeat: Infinity }
        };
      case 'electric':
      case 'lightning_circle':
        return {
          animate: {},
          transition: {},
          style: { filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))' }
        };
      case 'none':
      default:
        // 🔧 FIX: Si forceElectric est true, appliquer le glow même si animation est 'none'
        if (forceElectric) {
          return {
            animate: {},
            transition: {},
            style: { filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))' }
          };
        }
        return { animate: {}, transition: {} };
    }
  };

  const animProps = getAnimationVariants();
  // 🔧 FIX: L'effet électrique est actif si l'animation est 'electric' OU si forceElectric
  const isElectric = normalizedAnimation === 'electric' || normalizedAnimation === 'lightning_circle' || forceElectric;

  return (
    <motion.div
      className="flex-shrink-0 relative"
      whileHover={{ scale: 1.05 }}
      animate={animProps.animate}
      transition={animProps.transition}
      style={animProps.style}
    >
      {logoSvgCode ? (
        // ✅ SVG Inline prioritaire
        <div
          className="object-contain"
          style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
          dangerouslySetInnerHTML={{ __html: logoSvgCode }}
        />
      ) : (
        // Fallback: Image classique
        <Image
          src={logoUrl}
          alt={nomSite}
          width={logoSize}
          height={logoSize}
          className="object-contain"
          style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
          unoptimized
        />
      )}
      {isElectric && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 10px rgba(34, 211, 238, 0.3)',
              '0 0 20px rgba(168, 139, 250, 0.4)',
              '0 0 10px rgba(34, 211, 238, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/**
 * FooterElectric - Variante dynamique "Electric" pour White Label Factory.
 * 
 * @description Footer avec gradient animé, CTA final, effet glass.
 * Idéal pour tech, startups, SaaS.
 * 
 * Logo Source Priority: logoSvgCode > logoDarkUrl > logoUrl > initiales (fallback)
 */
export function FooterElectric({ config, legalDocs = [] }: FooterModuleProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Linkedin, url: config.lienLinkedin, label: 'LinkedIn' },
    { icon: Github, url: config.lienGithub, label: 'GitHub' },
    { icon: Instagram, url: config.lienInstagram, label: 'Instagram' },
  ].filter(s => s.url);

  // 🔧 FIX: Forcer l'effet électrique si le style global est 'mick-electric' ou thème 'Electric'
  const animationStyle = config.animationStyle || 'mick-electric';
  const themeGlobal = config.themeGlobal || 'Electric';
  const forceElectricEffect = (
    ['mick-electric', 'Mick Electric', 'Mick-Electrique'].includes(animationStyle as string) ||
    themeGlobal === 'Electric'
  );

  // 🆕 Couleurs personnalisées footer
  const footerBgColor = config.footerBgColor || null;
  const footerTextColor = config.footerTextColor || null;
  const footerBorderColor = config.footerBorderColor || null;

  // 🆕 Effets footer (padding, background, opacity, blur)
  const paddingYClass = config.footerEffects?.paddingY === 'none' ? 'py-0' :
    config.footerEffects?.paddingY === 'sm' ? 'py-12' :
      config.footerEffects?.paddingY === 'lg' ? 'py-28' :
        config.footerEffects?.paddingY === 'xl' ? 'py-32' :
          'py-20';

  const bgOpacity = config.footerEffects?.backgroundOpacity !== undefined ? config.footerEffects.backgroundOpacity / 100 : 1;
  const bgBlur = config.footerEffects?.backgroundBlur || 0;

  // 🆕 Overlay configuration
  const overlayColor = config.footerEffects?.overlayColor || 'black';
  const overlayOpacity = config.footerEffects?.overlayOpacity !== undefined ? config.footerEffects.overlayOpacity / 100 : 0.5;
  const getOverlayColorValue = (color: string) => {
    switch (color) {
      case 'white': return '255, 255, 255';
      case 'primary': return 'var(--primary-900)';
      case 'accent': return 'var(--accent-900)';
      case 'slate': return '15, 23, 42';
      case 'black': default: return '0, 0, 0';
    }
  };

  // 🆕 Typography Settings
  const titleFontFamily = config.footerTextSettings?.titleFontFamily || 'var(--font-heading)';
  const bodyFontFamily = config.footerTextSettings?.bodyFontFamily || 'var(--font-primary)';
  const bodyFontSize = config.footerTextSettings?.bodyFontSize || 'text-base';

  // Helper pour injecter le style de font
  const getFontStyle = (family: string) => {
    if (family.startsWith('var(')) return { fontFamily: family };
    return { fontFamily: `'${family}', sans-serif` };
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        backgroundColor: config.footerEffects?.backgroundUrl
          ? 'transparent'
          : (footerBgColor
            ? `rgba(${hexToRgb(footerBgColor) || '15, 23, 42'}, ${bgOpacity})`
            : undefined), // Si bg personnalisé, on applique l'opacité ici

        backgroundImage: config.footerEffects?.backgroundUrl ? `url(${config.footerEffects.backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backdropFilter: bgBlur ? `blur(${bgBlur}px)` : undefined,
        color: footerTextColor || undefined,
        borderTop: footerBorderColor ? `1px solid ${footerBorderColor}` : undefined,
        ...getFontStyle(bodyFontFamily)
      }}
    >
      {/* Gradient background - désactivé si couleur personnalisée ou image de fond */}
      {!footerBgColor && !config.footerEffects?.backgroundUrl && (
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary-950/50 to-background pointer-events-none" />
      )}

      {/* Pattern grid - désactivé si couleur personnalisée ou image de fond */}
      {!footerBgColor && !config.footerEffects?.backgroundUrl && (
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                             linear-gradient(to right, var(--primary) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Overlay optionnel pour image de fond */}
      {config.footerEffects?.backgroundUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(${getOverlayColorValue(overlayColor)}, ${overlayOpacity})`
          }}
        />
      )}

      <div className={`relative max-w-7xl mx-auto px-6 ${paddingYClass}`}>
        {/* CTA Final */}
        {config.footerCtaText && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              style={getFontStyle(titleFontFamily)}
            >
              {config.footerCtaText}
            </h2>
            {config.footerCtaUrl && (
              <a
                href={config.footerCtaUrl}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full 
                         bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium
                         hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300
                         hover:scale-105"
              >
                {config.ctaPrincipal}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </motion.div>
        )}

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          {/* Logo & description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              {/* Logo: 🆕 Priorité footerLogoUrl/footerLogoSvgCode > logoDarkUrl/logoSvgCode */}
              {(config.footerLogoSvgCode || config.footerLogoUrl || config.logoSvgCode || config.logoDarkUrl || config.logoUrl) ? (
                <FooterLogoWithAnimation
                  logoUrl={config.footerLogoUrl || config.logoDarkUrl || config.logoUrl || ''}
                  logoSvgCode={config.footerLogoSvgCode || config.logoSvgCode}
                  nomSite={config.nomSite}
                  animation={config.footerLogoAnimation}
                  size={config.footerLogoSize}
                  forceElectric={forceElectricEffect}
                />
              ) : (
                <AnimatedLogoFrame
                  initiales={config.initialesLogo || config.nomSite.split(' ').map(w => w[0]).join('')}
                  size="md"
                  variant={config.logoFrameStyle}
                />
              )}
              <span className="text-xl font-bold" style={getFontStyle(titleFontFamily)}>
                {config.nomSite.split(' ')[0]}{' '}
                <span className="text-gradient">{config.nomSite.split(' ').slice(1).join(' ')}</span>
              </span>
            </div>
            <p className={`text-primary-300/70 mb-6 ${bodyFontSize}`}>
              {config.slogan}
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10
                           flex items-center justify-center text-primary-300
                           hover:bg-primary-500 hover:border-primary-500 hover:text-white
                           transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Contact - Afficher seulement si titre configuré ou email/adresse présents */}
          {(config.footerContactTitle || config.email || config.adresse) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {config.footerContactTitle && (
                <h4
                  className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
                  style={getFontStyle(titleFontFamily)}
                >
                  {config.footerContactTitle}
                </h4>
              )}
              <ul className="space-y-3">
                {config.email && (
                  <li>
                    <a
                      href={`mailto:${config.email}`}
                      className={`flex items-center gap-3 text-primary-300/70 hover:text-primary-400 transition-colors ${bodyFontSize}`}
                    >
                      <Mail className="w-4 h-4" />
                      {config.email}
                    </a>
                  </li>
                )}
                {config.adresse && (
                  <li className={`text-primary-300/70 ${bodyFontSize}`}>
                    {config.adresse}
                  </li>
                )}
                {config.paysHebergement && (
                  <li className="text-primary-500 text-xs">
                    {config.paysHebergement}
                  </li>
                )}
              </ul>
            </motion.div>
          )}

          {/* Legal - Afficher seulement si titre configuré et liens légaux actifs */}
          {config.footerLegalTitle && legalDocs.filter(d => d.isActive).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4
                className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
                style={getFontStyle(titleFontFamily)}
              >
                {config.footerLegalTitle}
              </h4>
              <ul className="space-y-3">
                {legalDocs.filter(d => d.isActive).map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`/legal/${doc.slug}`}
                      className={`text-primary-300/70 hover:text-primary-400 transition-colors ${bodyFontSize}`}
                    >
                      {doc.titre}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Copyright - Configurable depuis l'admin */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          {/* Copyright text - configurable ou rien */}
          {config.copyrightTexte && (
            <p className="text-xs text-primary-500">
              {config.copyrightTexte.replace('{YEAR}', String(currentYear)).replace('{SITE}', config.nomSite)}
            </p>
          )}
          {/* Powered by - optionnel et configurable */}
          {config.showFooterPoweredBy && config.footerPoweredByText && (
            <p className="text-xs text-primary-600/50">
              {config.footerPoweredByText}
            </p>
          )}
        </motion.div>
      </div>
    </footer>
  );
}

