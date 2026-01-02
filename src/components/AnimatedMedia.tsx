'use client';

import { motion, type Transition, type TargetAndTransition } from 'framer-motion';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import type { LogoAnimation } from '@/lib/types/global-settings';
import TechHUDWrapper from '@/components/animations/TechHUDWrapper';
import {
  getIndirectEffectStyles,
  getFrameStyles,
  getFrameAnimationClass,
  resolveColor,
} from '@/lib/helpers/effects-renderer';

// ============================================
// V2 EFFECT CONFIG INTERFACE
// ============================================
// Matches ExtendedEffectSettings from HeroElectric.tsx
// This is the "gold standard" for V2 architecture.

export interface V2EffectConfig {
  // ========== LOGO ANIMATIONS & EFFECTS ==========
  logoDirectEffect?: string | null;       // 'none', 'float', 'pulse', 'spin', 'bounce', 'swing', 'shake'
  logoIndirectEffect?: string | null;     // 'none', 'neon-outline', 'aura-glow', 'neon-glow'
  logoFrameShape?: string | null;         // 'none', 'circle', 'square', 'rounded-square', 'rounded', 'pill'
  logoFrameAnimation?: string | null;     // 'none', 'color-flow', 'glow-pulse', 'spin-border', 'neon-sign'
  logoFrameColor?: string | null;         // Color name or hex
  logoFrameThickness?: number | null;     // 1-10
  
  // ========== ANIMATION PHYSICS ==========
  animationSpeed?: 'slow' | 'normal' | 'fast' | string | null;
  animationIntensity?: 'subtle' | 'normal' | 'strong' | 'intense' | string | null;
  
  // ========== EFFECT COLORS ==========
  effectPrimaryColor?: string | null;
  effectSecondaryColor?: string | null;
  
  // ========== LEGACY SUPPORT ==========
  logoAnimation?: LogoAnimation | string | null;  // For backward compatibility
  
  // Index signature for passthrough
  [key: string]: unknown;
}

// ============================================
// TYPES (Legacy + V2)
// ============================================

export interface AnimatedMediaProps {
  /** Code SVG inline (prioritaire si présent) */
  svgCode?: string | null;
  /** URL de l'image (fallback si pas de SVG) */
  imageUrl?: string | null;
  
  // === V2 CONFIG (NEW - PREFERRED) ===
  /** V2 Effect configuration object - use this for full V2 features */
  effectConfig?: V2EffectConfig | null;
  
  // === LEGACY PROPS (Backward compatibility) ===
  /** @deprecated Use effectConfig.logoAnimation instead */
  animationType?: LogoAnimation | string | null;
  /** @deprecated Use effectConfig.effectPrimaryColor instead */
  primaryColor?: string;
  /** @deprecated Use effectConfig.effectSecondaryColor instead */
  accentColor?: string;
  /** @deprecated Use effectConfig with logoAnimation='electric' instead */
  showElectricEffect?: boolean;
  
  // === COMMON PROPS ===
  /** Taille en pixels (largeur = hauteur) */
  size?: number | string | null;
  /** Texte alternatif pour l'image */
  alt?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Fallback si ni SVG ni image (ex: initiales) */
  fallback?: ReactNode;
}

interface AnimationConfig {
  animate: TargetAndTransition;
  transition: Transition;
  style?: CSSProperties;
  className?: string;
}

// ============================================
// V2 DEFAULT VALUES (Robust Fallbacks)
// ============================================

const V2_DEFAULTS: Required<Pick<V2EffectConfig, 
  'logoDirectEffect' | 'logoIndirectEffect' | 'logoFrameShape' | 
  'logoFrameAnimation' | 'logoFrameColor' | 'logoFrameThickness' |
  'animationSpeed' | 'animationIntensity' | 'effectPrimaryColor' | 'effectSecondaryColor'
>> = {
  logoDirectEffect: 'none',
  logoIndirectEffect: 'none',
  logoFrameShape: 'none',
  logoFrameAnimation: 'none',
  logoFrameColor: 'cyan',
  logoFrameThickness: 2,
  animationSpeed: 'normal',
  animationIntensity: 'normal',
  effectPrimaryColor: 'cyan',
  effectSecondaryColor: 'purple',
};

// ============================================
// SPEED & INTENSITY MULTIPLIERS
// ============================================

const SPEED_MULTIPLIERS: Record<string, number> = {
  'slow': 2,
  'normal': 1,
  'fast': 0.5,
};

const INTENSITY_MULTIPLIERS: Record<string, number> = {
  'subtle': 0.5,
  'normal': 1,
  'strong': 1.5,
  'intense': 2,
};

// ============================================
// NORMALISATION DES ANIMATIONS (Legacy Support)
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
  const animationMap: Record<string, string> = {
    // Tech HUD variants
    'tech_hud': 'tech_hud',
    'techhud': 'tech_hud',
    'techHud': 'tech_hud',
    'hud': 'tech_hud',
    'brackets': 'tech_hud',
    'cyberpunk': 'tech_hud',
    'viewfinder': 'tech_hud',
    'lightning_circle': 'tech_hud',
    'lightning-circle': 'tech_hud',
    'lightningcircle': 'tech_hud',
    'cercle_eclairs': 'tech_hud',
    
    // Electric variants
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
    
    // Float variants
    'float': 'float',
    'levitation': 'float',
    'flottement': 'float',
    
    // Swing variants
    'swing': 'swing',
    'balancement': 'swing',
    'pendule': 'swing',
    
    // Flip variants
    'flip_3d': 'flip-3d',
    'flip3d': 'flip-3d',
    'retournement': 'flip-3d',
    
    // Stretch variants
    'stretch': 'stretch',
    'etirement': 'stretch',
    'elastique': 'stretch',
    
    // Morph variants
    'morph': 'morph',
    'morphing': 'morph',
    'deformation': 'morph',
    
    // None variants
    'none': 'none',
    'aucun': 'none',
    'aucune': 'none',
    'static': 'none',
    'statique': 'none',
  };
  
  return animationMap[cleaned] || 'none';
}

// ============================================
// V2 ANIMATION CONFIG GENERATOR
// ============================================

/**
 * Génère la configuration Framer Motion basée sur V2 effectConfig
 * Utilise speed & intensity multipliers pour ajuster les animations
 */
function getV2AnimationConfig(
  directEffect: string,
  speed: string,
  intensity: string
): AnimationConfig {
  const speedMult = SPEED_MULTIPLIERS[speed] || 1;
  const intensityMult = INTENSITY_MULTIPLIERS[intensity] || 1;
  
  switch (directEffect) {
    case 'float':
      return {
        animate: { y: [0, -10 * intensityMult, 0] },
        transition: { duration: 3 * speedMult, repeat: Infinity, ease: 'easeInOut' as const },
        className: '',
      };
    
    case 'pulse':
      return {
        animate: { scale: [1, 1 + (0.08 * intensityMult), 1] },
        transition: { duration: 2 * speedMult, repeat: Infinity },
        className: 'animate-pulse-fast',
      };
    
    case 'bounce':
      return {
        animate: { y: [0, -15 * intensityMult, 0] },
        transition: { duration: 1.5 * speedMult, repeat: Infinity },
        className: 'animate-bounce-soft',
      };
    
    case 'spin':
    case 'rotation':
      return {
        animate: { rotate: 360 },
        transition: { duration: 8 * speedMult, repeat: Infinity, ease: 'linear' as const },
        className: 'animate-spin-slow',
      };
    
    case 'spin-glow':
      return {
        animate: { rotate: 360 },
        transition: { duration: 8 * speedMult, repeat: Infinity, ease: 'linear' as const },
        style: { filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))' },
        className: 'animate-spin-glow',
      };
    
    case 'shake':
      return {
        animate: { x: [-2 * intensityMult, 2 * intensityMult, -2 * intensityMult] },
        transition: { duration: 0.5 * speedMult, repeat: Infinity },
        className: 'animate-shake-hard',
      };
    
    case 'swing':
      return {
        animate: { rotate: [-12 * intensityMult, 12 * intensityMult, -12 * intensityMult] },
        transition: { duration: 2 * speedMult, repeat: Infinity, ease: 'easeInOut' as const },
        style: { transformOrigin: 'top center' },
        className: '',
      };
    
    case 'flip-3d':
      return {
        animate: { rotateY: 360 },
        transition: { duration: 4 * speedMult, repeat: Infinity, ease: 'linear' as const },
        className: '',
      };
    
    case 'stretch':
      return {
        animate: { 
          scaleX: [1, 1 + (0.15 * intensityMult), 1, 1 - (0.15 * intensityMult), 1],
          scaleY: [1, 1 - (0.1 * intensityMult), 1, 1 + (0.1 * intensityMult), 1],
        },
        transition: { duration: 2 * speedMult, repeat: Infinity, ease: 'easeInOut' as const },
        className: '',
      };
    
    case 'morph':
      return {
        animate: { 
          borderRadius: ['30%', '40%', '50%', '40%', '30%'],
          scale: [1, 1 + (0.02 * intensityMult), 1, 1 - (0.02 * intensityMult), 1],
        },
        transition: { duration: 3 * speedMult, repeat: Infinity, ease: 'easeInOut' as const },
        className: '',
      };
    
    case 'electric':
      return {
        animate: {},
        transition: {},
        style: { 
          filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.6))',
        },
        className: 'animate-electric-flicker',
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
    'tech_hud': '',
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
// V2 FRAME WRAPPER COMPONENT
// ============================================

interface V2FrameProps {
  children: React.ReactNode;
  config: V2EffectConfig;
  size: number;
}

function V2Frame({ children, config, size }: V2FrameProps) {
  // Use nullish coalescing to ensure null becomes a valid default (not passed to helpers)
  const shape = config.logoFrameShape ?? V2_DEFAULTS.logoFrameShape;
  const animation = config.logoFrameAnimation ?? V2_DEFAULTS.logoFrameAnimation;
  const color = config.logoFrameColor ?? config.effectPrimaryColor ?? V2_DEFAULTS.logoFrameColor;
  const secondaryColor = config.effectSecondaryColor ?? V2_DEFAULTS.effectSecondaryColor;
  const thickness = config.logoFrameThickness ?? V2_DEFAULTS.logoFrameThickness;
  const speed = (config.animationSpeed as string) ?? V2_DEFAULTS.animationSpeed;
  const intensity = (config.animationIntensity as string) ?? V2_DEFAULTS.animationIntensity;

  // Get frame styles from helper (pass undefined instead of null for type safety)
  const frameStyles = getFrameStyles(shape ?? undefined, color ?? undefined, thickness ?? undefined);
  const frameAnimClass = getFrameAnimationClass(animation ?? undefined);

  // CSS variables for animation colors
  const cssVars = {
    '--frame-color-1': resolveColor(color ?? undefined, '#22d3ee'),
    '--frame-color-2': resolveColor(secondaryColor ?? undefined, '#a78bfa'),
  } as React.CSSProperties;

  // Speed and intensity classes
  const speedClass = speed !== 'normal' ? `speed-${speed}` : '';
  const intensityClass = `frame-intensity-${intensity}`;

  // If no frame, just return children in a basic container
  if (shape === 'none') {
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="relative"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative ${frameAnimClass} ${speedClass} ${intensityClass} max-w-full overflow-hidden`}
      style={{
        width: '100%',
        maxWidth: `${size}px`,
        aspectRatio: '1 / 1',
        flexShrink: 0,
        ...frameStyles,
        ...cssVars,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// V2 ELECTRIC EFFECT COMPONENT
// ============================================

interface V2ElectricEffectProps {
  config: V2EffectConfig;
}

function V2ElectricEffect({ config }: V2ElectricEffectProps) {
  const primaryColor = resolveColor(
    config.effectPrimaryColor ?? V2_DEFAULTS.effectPrimaryColor ?? undefined,
    'rgba(34, 211, 238, 0.5)'
  );
  const accentColor = resolveColor(
    config.effectSecondaryColor ?? V2_DEFAULTS.effectSecondaryColor ?? undefined,
    'rgba(168, 139, 250, 0.5)'
  );
  const intensity = (config.animationIntensity as string) ?? V2_DEFAULTS.animationIntensity;
  const speed = (config.animationSpeed as string) ?? V2_DEFAULTS.animationSpeed;
  
  const speedMult = SPEED_MULTIPLIERS[speed] || 1;
  const intensityMult = INTENSITY_MULTIPLIERS[intensity] || 1;

  return (
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
          filter: `drop-shadow(0 0 ${8 * intensityMult}px ${primaryColor})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3 * speedMult, repeat: Infinity, ease: 'linear' }}
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
          filter: `drop-shadow(0 0 ${6 * intensityMult}px ${accentColor})`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 5 * speedMult, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Glow pulsant */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ 
          width: '140%', 
          height: '140%',
          left: '-20%',
          top: '-20%',
          boxShadow: `0 0 ${40 * intensityMult}px ${primaryColor}, inset 0 0 ${40 * intensityMult}px ${primaryColor.replace(/[\d.]+\)$/, '0.1)')}`,
        }}
        animate={{ 
          opacity: [0.3, 0.3 + (0.3 * intensityMult), 0.3],
          scale: [1, 1 + (0.02 * intensityMult), 1],
        }}
        transition={{ duration: 2 * speedMult, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

// ============================================
// MAIN COMPONENT - V2 UNIVERSAL ENGINE
// ============================================

/**
 * AnimatedMedia V2 - Universal Animation Engine
 * 
 * @description Composant réutilisable pour afficher des logos/images avec animations V2.
 * Supporte la configuration complète via `effectConfig` ou les props legacy pour rétrocompatibilité.
 * 
 * @example V2 Usage (Preferred)
 * ```tsx
 * <AnimatedMedia 
 *   imageUrl="/logo.png" 
 *   size={200}
 *   effectConfig={{
 *     logoDirectEffect: 'float',
 *     logoIndirectEffect: 'aura-glow',
 *     logoFrameShape: 'circle',
 *     logoFrameAnimation: 'neon-sign',
 *     animationSpeed: 'fast',
 *     animationIntensity: 'intense',
 *     effectPrimaryColor: 'emerald',
 *   }}
 * />
 * ```
 * 
 * @example Legacy Usage (Backward Compatible)
 * ```tsx
 * <AnimatedMedia 
 *   imageUrl="/logo.png" 
 *   animationType="electric" 
 *   size={200}
 *   showElectricEffect={true}
 * />
 * ```
 */
export default function AnimatedMedia({
  svgCode,
  imageUrl,
  effectConfig,
  // Legacy props
  animationType,
  primaryColor: legacyPrimaryColor = 'rgba(34, 211, 238, 0.5)',
  accentColor: legacyAccentColor = 'rgba(168, 139, 250, 0.5)',
  showElectricEffect = false,
  // Common props
  size = 200,
  alt = 'Logo',
  className = '',
  fallback,
}: AnimatedMediaProps) {
  
  // ============================================
  // MERGE V2 CONFIG WITH DEFAULTS & LEGACY PROPS
  // ============================================
  
  const config: V2EffectConfig = {
    // Start with V2 defaults
    ...V2_DEFAULTS,
    // Override with effectConfig if provided
    ...(effectConfig || {}),
    // Legacy prop overrides (for backward compatibility)
    ...(animationType && !effectConfig?.logoDirectEffect && !effectConfig?.logoAnimation ? {
      logoAnimation: animationType,
    } : {}),
    ...(legacyPrimaryColor !== 'rgba(34, 211, 238, 0.5)' && !effectConfig?.effectPrimaryColor ? {
      effectPrimaryColor: legacyPrimaryColor,
    } : {}),
    ...(legacyAccentColor !== 'rgba(168, 139, 250, 0.5)' && !effectConfig?.effectSecondaryColor ? {
      effectSecondaryColor: legacyAccentColor,
    } : {}),
  };
  
  // Determine animation type (V2 priority: logoDirectEffect > logoAnimation > animationType)
  const directEffect = config.logoDirectEffect || 'none';
  const legacyAnimation = config.logoAnimation || animationType;
  const normalizedLegacy = normalizeAnimationType(legacyAnimation as string);
  
  // Use direct effect if set, otherwise fall back to legacy animation
  const effectiveAnimation = directEffect !== 'none' ? directEffect : normalizedLegacy;
  
  // Get physics (ensure non-null for type safety)
  const speed = (config.animationSpeed as string) ?? V2_DEFAULTS.animationSpeed ?? 'normal';
  const intensity = (config.animationIntensity as string) ?? V2_DEFAULTS.animationIntensity ?? 'normal';
  
  // Determine if electric effect should show
  const isElectric = effectiveAnimation === 'electric' || 
                     showElectricEffect || 
                     normalizedLegacy === 'electric';
  
  // Check if frame should be shown
  const hasFrame = config.logoFrameShape && config.logoFrameShape !== 'none';
  
  // Calculate size
  const numericSize = typeof size === 'string' ? parseInt(size, 10) || 200 : size || 200;
  
  // Check content
  const hasSvg = Boolean(svgCode && svgCode.trim());
  const hasImage = Boolean(imageUrl && imageUrl.trim());
  const hasContent = hasSvg || hasImage || Boolean(fallback);
  
  if (!hasContent) {
    return null;
  }

  // Get animation config with V2 physics
  const animConfig = getV2AnimationConfig(effectiveAnimation, speed, intensity);
  
  // Get indirect effect styles (drop-shadow pour logos transparents)
  const indirectStyles = getIndirectEffectStyles(config, intensity);
  
  // Resolve colors for effects
  const primaryColorResolved = resolveColor(
    config.effectPrimaryColor ?? V2_DEFAULTS.effectPrimaryColor ?? undefined,
    '#22d3ee'
  );

  // ============================================
  // RENDER MEDIA CONTENT
  // ============================================
  
  const renderMediaContent = (applyFilter = false) => {
    if (hasSvg) {
      return (
        <div
          className="w-full h-full object-contain [&>svg]:w-full [&>svg]:h-full"
          style={indirectStyles}
          dangerouslySetInnerHTML={{ __html: svgCode! }}
        />
      );
    } else if (hasImage) {
      return (
        <Image
          src={imageUrl!}
          alt={alt}
          width={numericSize}
          height={numericSize}
          className="w-full h-full object-contain"
          style={{ 
            ...indirectStyles,
            filter: applyFilter ? `drop-shadow(0 0 15px ${primaryColorResolved})` : indirectStyles.filter,
          }}
          unoptimized
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center" style={indirectStyles}>
          {fallback}
        </div>
      );
    }
  };

  // ============================================
  // SPECIAL CASE: TECH HUD (Wrapper Pattern)
  // ============================================
  
  if (effectiveAnimation === 'tech_hud') {
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
  // V2 RENDER WITH FRAME SUPPORT
  // ============================================
  
  const coreContent = (
    <>
      {/* Electric effect layer */}
      {isElectric && <V2ElectricEffect config={config} />}

      {/* Main content with animation */}
      <motion.div
        className={`relative z-10 w-full h-full flex items-center justify-center ${animConfig.className || ''}`}
        animate={animConfig.animate}
        transition={animConfig.transition}
        style={animConfig.style}
        whileHover={{ scale: 1.05 }}
      >
        {renderMediaContent(isElectric)}
      </motion.div>
    </>
  );
  
  // If frame is enabled, wrap in V2Frame
  if (hasFrame) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ width: numericSize, height: numericSize }}
      >
        <V2Frame config={config} size={numericSize}>
          {coreContent}
        </V2Frame>
      </div>
    );
  }

  // Standard render without frame
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: numericSize, height: numericSize }}
    >
      {coreContent}
    </div>
  );
}

// ============================================
// EXPORT HELPERS
// ============================================

export { normalizeAnimationType, V2_DEFAULTS };
export type { V2EffectConfig as EffectConfig };
