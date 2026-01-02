'use client';

import { motion, Transition, TargetAndTransition } from 'framer-motion';
import Image from 'next/image';
import type { FooterModuleProps } from '../types';
import type { LogoAnimation } from '@/lib/types/global-settings';
import AnimatedLogoFrame from '../../AnimatedLogoFrame';
import { CSSProperties } from 'react';

// ============================================
// LOGO WITH ANIMATION
// ============================================
interface AnimationVariants {
  animate: TargetAndTransition;
  transition: Transition;
  style?: CSSProperties;
}

function FooterLogoWithAnimation({ 
  logoUrl, 
  nomSite, 
  animation, 
  size = 32 
}: { 
  logoUrl: string; 
  nomSite: string; 
  animation?: LogoAnimation | null; 
  size?: number | null;
}) {
  const logoSize = size || 32;
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
      case 'electric':
      case 'lightning_circle':
        return {
          animate: {},
          transition: {},
          style: { filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))' }
        };
      case 'none':
      default:
        return { animate: {}, transition: {} };
    }
  };

  const animProps = getAnimationVariants();

  return (
    <motion.div
      className="flex-shrink-0 relative"
      whileHover={{ scale: 1.05 }}
      animate={animProps.animate}
      transition={animProps.transition}
      style={animProps.style}
    >
      <Image
        src={logoUrl}
        alt={nomSite}
        width={logoSize}
        height={logoSize}
        className="object-contain"
        style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
        unoptimized
      />
    </motion.div>
  );
}

/**
 * FooterMinimal - Variante épurée et discrète avec cohérence dark theme.
 * 
 * @description Footer sur une seule ligne avec logo animé, copyright,
 * et liens légaux. Idéal pour portfolios, landing pages simples.
 */
export function FooterMinimal({ config, legalDocs = [] }: FooterModuleProps) {
  const currentYear = new Date().getFullYear();
  
  // Initiales du logo
  const initiales = config.initialesLogo || config.nomSite.split(' ').map(w => w[0]).join('');
  
  // Couleurs personnalisées ou globales
  const siteBgColor = config.couleurBackground || '#0a0a0f';
  const footerBgColor = config.footerBgColor || siteBgColor;

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-6 px-6 border-t border-white/10"
      style={{ backgroundColor: `${footerBgColor}80` }} // 50% opacity
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo avec animation si URL définie, sinon initiales */}
        <div className="flex items-center gap-2">
          {(config.logoDarkUrl || config.logoUrl) ? (
            <FooterLogoWithAnimation 
              logoUrl={config.logoDarkUrl || config.logoUrl || ''}
              nomSite={config.nomSite}
              animation={config.footerLogoAnimation}
              size={config.footerLogoSize || 32}
            />
          ) : (
            <AnimatedLogoFrame initiales={initiales} size="sm" variant={config.logoFrameStyle} />
          )}
          <span className="text-sm text-primary-300">
            {config.nomSite}
          </span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-primary-500">
          © {currentYear} {config.nomSite}
        </p>

        {/* Liens légaux */}
        <div className="flex items-center gap-4">
          {config.showLegalLinks && legalDocs.filter(d => d.isActive).map((doc) => (
            <a
              key={doc.id}
              href={`/legal/${doc.slug}`}
              className="text-xs text-primary-500 hover:text-primary-300 transition-colors"
            >
              {doc.titre}
            </a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}

