'use client';

import { motion, type Transition, type TargetAndTransition } from 'framer-motion';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import type { LogoAnimation } from '@/lib/types/global-settings';
import TechHUDWrapper from '@/components/animations/TechHUDWrapper';

// ============================================
// TYPES
// ============================================

export interface AnimatedMediaProps {
  /** Code SVG inline (prioritaire si présent) */
  svgCode?: string | null;
  /** URL de l'image (fallback si pas de SVG) */
  imageUrl?: string | null;
  /** Type d'animation à appliquer */
  animationType?: LogoAnimation | string | null;
  /** Taille en pixels (largeur = hauteur) */
  size?: number | string | null;
  /** Texte alternatif pour l'image */
  alt?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Fallback si ni SVG ni image (ex: initiales) */
  fallback?: ReactNode;
  /** Activer l'effet électrique (cercles lumineux) */
  showElectricEffect?: boolean;
  /** Couleur primaire pour les effets (CSS variable ou hex) */
  primaryColor?: string;
  /** Couleur accent pour les effets (CSS variable ou hex) */
  accentColor?: string;
}

interface AnimationConfig {
  animate: TargetAndTransition;
  transition: Transition;
  style?: CSSProperties;
  className?: string;
}

// ============================================
// NORMALISATION DES ANIMATIONS
// ============================================

/**
 * Normalise les valeurs d'animation de Baserow vers des valeurs canoniques
 * Supporte: string directe, snake_case, kebab-case, emojis, accents, etc.
 */
function normalizeAnimationType(raw: string | null | undefined): string {
  if (!raw) return 'none';
  
  // Nettoyer: lowercase, supprimer caractères spéciaux, accents
  const cleaned = raw
    .toLowerCase()
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/[^a-z0-9_\s-]/g, '')
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')
    .trim();
  
  // Map vers valeurs canoniques
  // ⚠️ STANDARDISÉ: Supporte snake_case ET camelCase
  const animationMap: Record<string, string> = {
    // Tech HUD variants (Cyberpunk Brackets + Cercle tirets)
    'tech_hud': 'tech_hud',
    'techhud': 'tech_hud',
    'techHud': 'tech_hud',         // camelCase support
    'hud': 'tech_hud',
    'brackets': 'tech_hud',
    'cyberpunk': 'tech_hud',
    'viewfinder': 'tech_hud',
    'lightning_circle': 'tech_hud', // Remap ancien nom
    'lightning-circle': 'tech_hud', // Remap ancien nom avec tiret
    'lightningcircle': 'tech_hud',  // Sans séparateur
    'cercle_eclairs': 'tech_hud',   // Remap ancien nom français
    
    // Electric variants (flickering effect)
    'electric': 'electric',
    'lightning': 'electric',
    'eclairs': 'electric',
    'flicker': 'electric',
    
    // Rotation variants
    'spin': 'rotation',
    'rotate': 'rotation',
    'rotation': 'rotation',
    'spin_slow': 'rotation',
    
    // Spin-glow variants
    'spin_glow': 'spin-glow',
    'spinglow': 'spin-glow',
    'spin_+_glow': 'spin-glow',
    
    // Pulse variants
    'pulse': 'pulse',
    'pulsation': 'pulse',
    'pulse_fast': 'pulse',
    
    // Shake variants
    'shake': 'shake',
    'shake_hard': 'shake',
    'vibration': 'shake',
    
    // Bounce variants
    'bounce': 'bounce',
    'rebond': 'bounce',
    
    // None variants
    'none': 'none',
    'aucun': 'none',
    'aucune': 'none',
    'static': 'none',
    'statique': 'none',
  };
  
  return animationMap[cleaned] || 'none';
}

/**
 * Génère la configuration d'animation Framer Motion selon le type
 */
function getAnimationConfig(animationType: string): AnimationConfig {
  switch (animationType) {
    case 'electric':
      return {
        animate: {},
        transition: {},
        style: { 
          filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.6))',
        },
        className: 'animate-electric-flicker',
      };
    
    case 'rotation':
      return {
        animate: { rotate: 360 },
        transition: { duration: 8, repeat: Infinity, ease: 'linear' as const },
        className: 'animate-spin-slow',
      };
    
    case 'spin-glow':
      return {
        animate: { rotate: 360 },
        transition: { duration: 8, repeat: Infinity, ease: 'linear' as const },
        style: { filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))' },
        className: 'animate-spin-glow',
      };
    
    case 'pulse':
      return {
        animate: { scale: [1, 1.08, 1] },
        transition: { duration: 2, repeat: Infinity },
        className: 'animate-pulse-fast',
      };
    
    case 'shake':
      return {
        animate: {},
        transition: {},
        className: 'animate-shake-hard',
      };
    
    case 'bounce':
      return {
        animate: { y: [0, -10, 0] },
        transition: { duration: 1.5, repeat: Infinity },
        className: 'animate-bounce-soft',
      };
    
    case 'none':
    default:
      return {
        animate: {},
        transition: {},
      };
  }
}

/**
 * Retourne la classe Tailwind correspondant au type d'animation
 * Utile pour les cas où Framer Motion n'est pas utilisé
 */
export function getAnimationClass(animationType: LogoAnimation | string | null | undefined): string {
  const normalized = normalizeAnimationType(animationType as string);
  
  const classMap: Record<string, string> = {
    'tech_hud': '', // TechHUD uses wrapper component, not CSS class
    'electric': 'animate-electric-flicker',
    'rotation': 'animate-spin-slow',
    'spin-glow': 'animate-spin-glow',
    'pulse': 'animate-pulse-fast',
    'shake': 'animate-shake-hard',
    'bounce': 'animate-bounce-soft',
    'none': '',
  };
  
  return classMap[normalized] || '';
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * AnimatedMedia - Composant réutilisable pour afficher des logos/images avec animations
 * 
 * @description Gère l'affichage de médias (SVG inline ou images) avec différentes
 * animations configurables depuis Baserow. Utilisé dans Header, Hero et Footer.
 * 
 * @example
 * ```tsx
 * // Usage basique avec image
 * <AnimatedMedia imageUrl="/logo.png" animationType="electric" size={200} />
 * 
 * // Usage avec SVG inline (prioritaire)
 * <AnimatedMedia svgCode={config.logoSvgCode} animationType="rotation" size={280} />
 * 
 * // Usage avec fallback (initiales)
 * <AnimatedMedia 
 *   imageUrl={config.logoUrl}
 *   animationType="pulse" 
 *   size={40}
 *   fallback={<span className="text-xl font-bold">MS</span>}
 * />
 * ```
 */
export default function AnimatedMedia({
  svgCode,
  imageUrl,
  animationType,
  size = 200,
  alt = 'Logo',
  className = '',
  fallback,
  showElectricEffect = false,
  primaryColor = 'rgba(34, 211, 238, 0.5)',
  accentColor = 'rgba(168, 139, 250, 0.5)',
}: AnimatedMediaProps) {
  // Normaliser le type d'animation
  const normalizedAnimation = normalizeAnimationType(animationType as string);
  const animConfig = getAnimationConfig(normalizedAnimation);
  
  // Calculer la taille
  const numericSize = typeof size === 'string' ? parseInt(size, 10) || 200 : size || 200;
  
  // Déterminer si l'effet électrique doit être affiché
  const isElectric = normalizedAnimation === 'electric' || showElectricEffect;
  
  // Vérifier si on a du contenu à afficher
  const hasSvg = Boolean(svgCode && svgCode.trim());
  const hasImage = Boolean(imageUrl && imageUrl.trim());
  const hasContent = hasSvg || hasImage || Boolean(fallback);
  
  if (!hasContent) {
    return null;
  }

  // ============================================
  // RENDU DU CONTENU MÉDIA (Image/SVG/Fallback)
  // ============================================
  
  const renderMediaContent = (applyFilter = false) => {
    if (hasSvg) {
      // SVG Inline - Prioritaire
      return (
        <div
          className="w-full h-full object-contain [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgCode! }}
        />
      );
    } else if (hasImage) {
      // Image classique
      return (
        <Image
          src={imageUrl!}
          alt={alt}
          width={numericSize}
          height={numericSize}
          className="w-full h-full object-contain"
          style={{ 
            filter: applyFilter ? `drop-shadow(0 0 15px ${primaryColor})` : undefined 
          }}
          unoptimized
        />
      );
    } else {
      // Fallback (ex: initiales)
      return (
        <div className="w-full h-full flex items-center justify-center">
          {fallback}
        </div>
      );
    }
  };

  // ============================================
  // CAS SPÉCIAL: Animation TECH_HUD (Wrapper Pattern)
  // ============================================
  
  if (normalizedAnimation === 'tech_hud') {
    return (
      <div 
        className={`relative ${className}`}
        style={{ width: numericSize, height: numericSize }}
      >
        <TechHUDWrapper active={true} variant="storm">
          <div className="w-full h-full flex items-center justify-center">
            {renderMediaContent()}
          </div>
        </TechHUDWrapper>
      </div>
    );
  }

  // ============================================
  // AUTRES ANIMATIONS (CSS / Framer Motion)
  // ============================================
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: numericSize, height: numericSize }}
    >
      {/* Effet électrique - Cercles lumineux animés */}
      {isElectric && (
        <>
          {/* Arc électrique intérieur */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              width: '115%', 
              height: '115%',
              left: '-7.5%',
              top: '-7.5%',
              border: '2px solid transparent',
              borderTopColor: primaryColor,
              borderRightColor: primaryColor,
              filter: `drop-shadow(0 0 8px ${primaryColor})`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Arc électrique extérieur - rotation inverse */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              width: '130%', 
              height: '130%',
              left: '-15%',
              top: '-15%',
              border: '1.5px solid transparent',
              borderBottomColor: accentColor,
              borderLeftColor: accentColor,
              filter: `drop-shadow(0 0 6px ${accentColor})`,
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Glow pulsant */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              width: '140%', 
              height: '140%',
              left: '-20%',
              top: '-20%',
              boxShadow: `0 0 40px ${primaryColor}, inset 0 0 40px ${primaryColor.replace('0.5', '0.1')}`,
            }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Contenu principal avec animation */}
      <motion.div
        className={`relative z-10 w-full h-full flex items-center justify-center ${animConfig.className || ''}`}
        animate={animConfig.animate}
        transition={animConfig.transition}
        style={animConfig.style}
        whileHover={{ scale: 1.05 }}
      >
        {renderMediaContent(isElectric)}
      </motion.div>
    </div>
  );
}

// ============================================
// EXPORT DES HELPERS
// ============================================

export { normalizeAnimationType };

