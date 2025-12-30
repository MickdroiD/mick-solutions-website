'use client';

import { motion, Transition, TargetAndTransition } from 'framer-motion';
import { ArrowRight, Mail, Linkedin, Github, Instagram } from 'lucide-react';
import Image from 'next/image';
import type { FooterModuleProps } from '../types';
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

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary-950/50 to-background pointer-events-none" />
      
      {/* Pattern grid */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                           linear-gradient(to right, var(--primary) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* CTA Final */}
        {config.footerCtaText && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
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
              {/* Logo: SVG inline prioritaire, sinon Image, sinon initiales */}
              {(config.logoSvgCode || config.logoDarkUrl || config.logoUrl) ? (
                <FooterLogoWithAnimation 
                  logoUrl={config.logoDarkUrl || config.logoUrl || ''}
                  logoSvgCode={config.logoSvgCode}
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
              <span className="text-xl font-bold">
                {config.nomSite.split(' ')[0]}{' '}
                <span className="text-gradient">{config.nomSite.split(' ').slice(1).join(' ')}</span>
              </span>
            </div>
            <p className="text-primary-300/70 text-sm mb-6">
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

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${config.email}`}
                  className="flex items-center gap-3 text-primary-300/70 hover:text-primary-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {config.email}
                </a>
              </li>
              <li className="text-primary-300/70 text-sm">
                {config.adresse}
              </li>
              <li className="text-primary-500 text-xs">
                {config.paysHebergement}
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Légal
            </h4>
            <ul className="space-y-3">
              {legalDocs.filter(d => d.isActive).map((doc) => (
                <li key={doc.id}>
                  <a
                    href={`/legal/${doc.slug}`}
                    className="text-primary-300/70 hover:text-primary-400 transition-colors text-sm"
                  >
                    {doc.titre}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs text-primary-500">
            © {currentYear} {config.nomSite}. Tous droits réservés.
          </p>
          <p className="text-xs text-primary-600/50">
            Propulsé par White Label Factory
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

