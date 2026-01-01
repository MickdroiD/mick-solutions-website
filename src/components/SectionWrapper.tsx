'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import Image from 'next/image';
import type { EffectSettings, TextSettings } from '@/lib/schemas/factory';
import { getFontFamilyStyle } from '@/lib/helpers/effects-renderer';
import {
  SPACING_PADDING_Y,
  MAX_WIDTHS,
  BLOB_SIZES,
  type SpacingSize,
  type MaxWidth,
} from '@/lib/design-tokens';

// ============================================
// TYPES
// ============================================

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  effects?: Partial<EffectSettings>;
  textSettings?: TextSettings;
  className?: string;
  // Layout options
  paddingY?: SpacingSize;
  maxWidth?: MaxWidth;
  // Background options
  backgroundUrl?: string | null;
  backgroundColor?: string;
  // Animation
  animateOnScroll?: boolean;
}

interface SectionTitleProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  textSettings?: TextSettings;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

// ============================================
// HELPER: Get Overlay Color
// ============================================

function getOverlayColor(color: string = 'black'): string {
  const colors: Record<string, string> = {
    'black': '0,0,0',
    'white': '255,255,255',
    'primary': 'var(--primary-900)',
    'accent': 'var(--accent-900)',
    'slate': '15,23,42',
  };
  return colors[color] || colors['black'];
}

// ============================================
// SECTION WRAPPER COMPONENT
// ============================================

/**
 * SectionWrapper - Wrapper réutilisable pour toutes les sections
 * 
 * @description Applique automatiquement les effets (background, overlay, blobs)
 * et fournit une structure cohérente pour toutes les sections.
 */
export function SectionWrapper({
  id,
  children,
  effects = {},
  className = '',
  paddingY = 'lg',
  maxWidth = 'xl',
  backgroundUrl,
  backgroundColor,
  animateOnScroll = true,
}: SectionWrapperProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // ========== EFFECTS EXTRACTION ==========
  const bgUrl = backgroundUrl || (effects.backgroundUrl as string | null);
  const bgOpacity = effects.backgroundOpacity !== undefined ? effects.backgroundOpacity / 100 : 1;
  const bgBlur = effects.backgroundBlur || 0;
  const overlayColor = effects.overlayColor || 'black';
  const overlayOpacity = effects.overlayOpacity !== undefined ? effects.overlayOpacity / 100 : 0;
  const showBlobs = effects.showBlobs !== false;
  const blobConfig = BLOB_SIZES[effects.blobSize as SpacingSize || 'lg'];

  // ========== LAYOUT ==========
  const paddingClass = SPACING_PADDING_Y[paddingY];
  const maxWidthClass = MAX_WIDTHS[maxWidth];

  return (
    <section
      id={id}
      ref={ref}
      className={`relative overflow-hidden ${paddingClass} ${className}`}
      style={{ backgroundColor }}
    >
      {/* ===== BACKGROUND LAYER ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Image background */}
        {bgUrl && (
          <Image
            src={bgUrl}
            alt=""
            fill
            className="object-cover"
            style={{
              opacity: bgOpacity,
              filter: bgBlur ? `blur(${bgBlur}px)` : undefined,
            }}
            priority={false}
          />
        )}

        {/* Overlay */}
        {bgUrl && overlayOpacity > 0 && (
          <div
            className="absolute inset-0"
            style={{
              background: `rgba(${getOverlayColor(overlayColor)},${overlayOpacity})`,
            }}
          />
        )}

        {/* Decorative blobs */}
        {showBlobs && (
          <>
            <div
              className="absolute top-0 left-0 rounded-full -translate-x-1/2 -translate-y-1/2 bg-primary-500/5"
              style={{
                width: blobConfig.size,
                height: blobConfig.size,
                filter: `blur(${blobConfig.blur})`,
              }}
            />
            <div
              className="absolute bottom-0 right-0 rounded-full translate-x-1/3 translate-y-1/3 bg-accent-500/5"
              style={{
                width: `calc(${blobConfig.size} * 0.75)`,
                height: `calc(${blobConfig.size} * 0.75)`,
                filter: `blur(${blobConfig.blur})`,
              }}
            />
          </>
        )}
      </div>

      {/* ===== CONTENT ===== */}
      <motion.div
        initial={animateOnScroll ? { opacity: 0, y: 30 } : {}}
        animate={animateOnScroll && isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className={`relative z-10 ${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8`}
      >
        {children}
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION TITLE COMPONENT
// ============================================

/**
 * SectionTitle - Titre de section réutilisable avec textSettings
 * 
 * @description Applique automatiquement les styles de texte configurés.
 */
export function SectionTitle({
  title,
  highlight,
  subtitle,
  textSettings,
  align = 'center',
  className = '',
}: SectionTitleProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const containerClass = {
    left: '',
    center: 'mx-auto',
    right: 'ml-auto',
  }[align];

  return (
    <div className={`mb-12 md:mb-16 ${alignClass} ${className}`}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`
          ${textSettings?.titleFontSize || 'text-3xl sm:text-4xl lg:text-5xl'}
          ${textSettings?.titleFontWeight || 'font-bold'}
          ${textSettings?.titleColor || 'text-foreground'}
          ${textSettings?.titleTransform || ''}
          mb-4
        `}
        style={getFontFamilyStyle(textSettings?.titleFontFamily)}
      >
        {title}
        {highlight && (
          <>
            {' '}
            <span className="text-gradient">{highlight}</span>
          </>
        )}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`
            ${textSettings?.subtitleFontSize || 'text-lg sm:text-xl'}
            ${textSettings?.subtitleColor || 'text-muted-foreground'}
            ${textSettings?.bodyLineHeight || 'leading-relaxed'}
            max-w-3xl ${containerClass}
          `}
          style={getFontFamilyStyle(textSettings?.subtitleFontFamily)}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

// ============================================
// SECTION CARD COMPONENT
// ============================================

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  cardStyle?: 'flat' | 'shadow' | 'border' | 'glass';
  hoverEffect?: 'none' | 'scale' | 'glow' | 'lift';
  onClick?: () => void;
}

/**
 * SectionCard - Carte réutilisable avec styles configurables
 */
export function SectionCard({
  children,
  className = '',
  cardStyle = 'shadow',
  hoverEffect = 'scale',
  onClick,
}: SectionCardProps) {
  const cardClasses = {
    flat: 'bg-white/5 border border-white/10',
    shadow: 'bg-white/5 border border-white/10 shadow-lg shadow-black/10',
    border: 'bg-transparent border-2 border-primary-500/30',
    glass: 'bg-white/5 backdrop-blur-lg border border-white/10',
  }[cardStyle];

  const hoverClasses = {
    none: '',
    scale: 'hover:scale-[1.02] transition-transform',
    glow: 'hover:shadow-xl hover:shadow-primary-500/20 transition-shadow',
    lift: 'hover:-translate-y-2 hover:shadow-xl transition-all',
  }[hoverEffect];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`
        rounded-2xl p-6 
        ${cardClasses} 
        ${hoverClasses} 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default SectionWrapper;

