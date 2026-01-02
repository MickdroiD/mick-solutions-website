'use client';

import { motion, Transition, TargetAndTransition } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
 * FooterBold - Variante audacieuse et impactante avec cohérence dark theme.
 * 
 * @description Footer avec grande typographie, CTA imposant,
 * fond sombre. Idéal pour agences créatives, landing pages.
 */
export function FooterBold({ config, legalDocs = [] }: FooterModuleProps) {
  const currentYear = new Date().getFullYear();
  
  // Initiales du logo
  const initiales = config.initialesLogo || config.nomSite.split(' ').map(w => w[0]).join('');

  return (
    <footer className="bg-gradient-to-b from-background to-primary-950/80 text-foreground">
      <div className="max-w-7xl mx-auto px-6">
        {/* CTA massif - Configurable depuis l'admin */}
        {config.footerCtaHeading && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-20 md:py-32 border-b border-background/20"
          >
            <a
              href={config.footerCtaUrl || '#contact'}
              className="group block"
            >
              <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-none">
                {config.footerCtaHeading.split('\n').map((line, index, arr) => (
                  <span key={index}>
                    {index === arr.length - 1 ? (
                      <span className="flex items-center gap-4">
                        {line}
                        <ArrowUpRight className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 
                                               transform group-hover:translate-x-2 group-hover:-translate-y-2 
                                               transition-transform duration-300" />
                      </span>
                    ) : (
                      <>{line}<br /></>
                    )}
                  </span>
                ))}
              </h2>
            </a>
          </motion.div>
        )}

        {/* Info row - Colonnes conditionnelles */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Email - seulement si configuré */}
          {config.email && config.footerContactTitle && (
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-2">{config.footerContactTitle}</p>
              <a 
                href={`mailto:${config.email}`}
                className="text-lg font-medium hover:opacity-70 transition-opacity"
              >
                {config.email}
              </a>
            </div>
          )}

          {/* Adresse - seulement si configurée */}
          {config.adresse && (
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-2">{config.paysHebergement || ''}</p>
              <p className="text-lg font-medium">
                {config.adresseCourte || config.adresse.split(',')[0]}
              </p>
            </div>
          )}

          {/* Social - seulement si liens configurés */}
          {(config.lienLinkedin || config.lienInstagram || config.lienTwitter) && (
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Social</p>
              <div className="flex gap-4">
                {config.lienLinkedin && (
                  <a href={config.lienLinkedin} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:opacity-70">
                    Li
                  </a>
                )}
                {config.lienInstagram && (
                  <a href={config.lienInstagram} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:opacity-70">
                    Ig
                  </a>
                )}
                {config.lienTwitter && (
                  <a href={config.lienTwitter} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:opacity-70">
                    X
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Légal - seulement si titre et liens configurés */}
          {config.footerLegalTitle && legalDocs.filter(d => d.isActive).length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-2">{config.footerLegalTitle}</p>
              <div className="flex flex-wrap gap-4">
                {legalDocs.filter(d => d.isActive).map((doc) => (
                  <a
                    key={doc.id}
                    href={`/legal/${doc.slug}`}
                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                  >
                    {doc.titre}
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Copyright bar */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
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
            <p className="text-sm font-medium">
              {config.nomSite}
            </p>
          </div>
          <p className="text-xs text-primary-500">
            © {currentYear} — {config.paysHebergement}
          </p>
        </div>
      </div>
    </footer>
  );
}

