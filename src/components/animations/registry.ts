// ============================================
// ANIMATION REGISTRY - White Label Factory V2
// ============================================
// Central registry for all animations used across the site.
// 
// HOW TO ADD A NEW ANIMATION:
// 1. Add a key to ANIMATION_REGISTRY with label, category, and variants
// 2. The animation will automatically appear in admin dropdowns
// 3. Use getAnimationVariants(key) in your component to get Framer Motion variants
//
// CATEGORIES:
// - logo: For logo animations (header, footer, hero)
// - logo-direct: Direct transformations applied to the element itself
// - logo-indirect: External effects around the element (auras, particles, etc.)
// - text: For text animations (titles, subtitles)
// - entrance: For section entrance animations
// - hover: For hover state animations
// - frame: For animated logo frames

import type { Variants } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export type AnimationCategory = 'logo' | 'logo-direct' | 'logo-indirect' | 'text' | 'entrance' | 'hover' | 'frame';

export type EffectType = 'direct' | 'indirect';

export interface AnimationConfig {
  /** Display label in admin */
  label: string;
  /** Category for filtering */
  category: AnimationCategory;
  /** Effect type: direct (transforms element) or indirect (external effects) */
  effectType?: EffectType;
  /** Description shown in admin tooltip */
  description?: string;
  /** Framer Motion variants */
  variants: Variants;
  /** CSS classes to apply (for non-Framer animations) */
  className?: string;
  /** Preview emoji/icon */
  icon?: string;
  /** Supports color customization */
  supportsColor?: boolean;
  /** Supports intensity adjustment */
  supportsIntensity?: boolean;
  /** Default primary color */
  defaultPrimaryColor?: string;
  /** Default secondary color */
  defaultSecondaryColor?: string;
}

// ============================================
// INTENSITY PRESETS
// ============================================

export const INTENSITY_PRESETS = {
  subtle: { scale: 0.5, duration: 1.5 },
  normal: { scale: 1, duration: 1 },
  strong: { scale: 1.5, duration: 0.7 },
  extreme: { scale: 2, duration: 0.5 },
} as const;

export type IntensityLevel = keyof typeof INTENSITY_PRESETS;

// ============================================
// COLOR PRESETS FOR NEON EFFECTS
// ============================================

export const NEON_COLOR_PRESETS = {
  cyan: { primary: 'rgba(34, 211, 238, 0.8)', secondary: 'rgba(6, 182, 212, 0.5)' },
  purple: { primary: 'rgba(168, 85, 247, 0.8)', secondary: 'rgba(139, 92, 246, 0.5)' },
  pink: { primary: 'rgba(236, 72, 153, 0.8)', secondary: 'rgba(219, 39, 119, 0.5)' },
  green: { primary: 'rgba(34, 197, 94, 0.8)', secondary: 'rgba(22, 163, 74, 0.5)' },
  orange: { primary: 'rgba(249, 115, 22, 0.8)', secondary: 'rgba(234, 88, 12, 0.5)' },
  gold: { primary: 'rgba(250, 204, 21, 0.8)', secondary: 'rgba(234, 179, 8, 0.5)' },
  red: { primary: 'rgba(239, 68, 68, 0.8)', secondary: 'rgba(220, 38, 38, 0.5)' },
  blue: { primary: 'rgba(59, 130, 246, 0.8)', secondary: 'rgba(37, 99, 235, 0.5)' },
  white: { primary: 'rgba(255, 255, 255, 0.9)', secondary: 'rgba(229, 231, 235, 0.6)' },
} as const;

export type NeonColorPreset = keyof typeof NEON_COLOR_PRESETS;

// ============================================
// ANIMATION REGISTRY
// ============================================

export const ANIMATION_REGISTRY: Record<string, AnimationConfig> = {
  // === NONE ===
  none: {
    label: 'Aucune',
    category: 'logo',
    description: 'Pas d\'animation',
    icon: '⏹️',
    variants: {
      initial: {},
      animate: {},
    },
  },

  // === LOGO ANIMATIONS ===
  spin: {
    label: 'Rotation',
    category: 'logo',
    description: 'Rotation continue 360°',
    icon: '🔄',
    variants: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
    className: 'animate-spin-slow',
  },

  pulse: {
    label: 'Pulsation',
    category: 'logo',
    description: 'Effet de battement',
    icon: '💓',
    variants: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
    className: 'animate-pulse',
  },

  bounce: {
    label: 'Rebond',
    category: 'logo',
    description: 'Effet de rebond vertical',
    icon: '⬆️',
    variants: {
      initial: { y: 0 },
      animate: {
        y: [-5, 0, -5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
    className: 'animate-bounce',
  },

  electric: {
    label: 'Électrique',
    category: 'logo',
    description: 'Effet électrique avec glow',
    icon: '⚡',
    variants: {
      initial: { 
        filter: 'drop-shadow(0 0 0px rgba(6, 182, 212, 0))',
      },
      animate: {
        filter: [
          'drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))',
          'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))',
          'drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))',
        ],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
    className: 'animate-electric',
  },

  'spin-glow': {
    label: 'Rotation + Glow',
    category: 'logo',
    description: 'Rotation avec halo lumineux',
    icon: '✨',
    variants: {
      initial: { rotate: 0, filter: 'drop-shadow(0 0 0px rgba(168, 85, 247, 0))' },
      animate: {
        rotate: 360,
        filter: [
          'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))',
          'drop-shadow(0 0 16px rgba(168, 85, 247, 0.3))',
          'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))',
        ],
        transition: {
          rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          filter: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        },
      },
    },
  },

  shake: {
    label: 'Tremblement',
    category: 'logo',
    description: 'Légère vibration',
    icon: '📳',
    variants: {
      initial: { x: 0 },
      animate: {
        x: [-1, 1, -1, 1, 0],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2,
        },
      },
    },
  },

  'tech-hud': {
    label: 'Tech HUD',
    category: 'logo',
    description: 'Style interface futuriste',
    icon: '🎯',
    variants: {
      initial: { opacity: 0.8, scale: 1 },
      animate: {
        opacity: [0.8, 1, 0.8],
        scale: [1, 1.02, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  },

  vibration: {
    label: 'Vibration',
    category: 'logo',
    effectType: 'direct',
    description: 'Micro-vibration subtile',
    icon: '〰️',
    supportsIntensity: true,
    variants: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 0.5, -0.5, 0.5, 0],
        y: [0, -0.5, 0.5, -0.5, 0],
        transition: {
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 1,
        },
      },
    },
  },

  // ============================================
  // NEW DIRECT EFFECTS (5 nouveaux)
  // ============================================

  float: {
    label: 'Lévitation',
    category: 'logo-direct',
    effectType: 'direct',
    description: 'Flotte doucement de haut en bas',
    icon: '🎈',
    supportsIntensity: true,
    variants: {
      initial: { y: 0 },
      animate: {
        y: [-8, 8, -8],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  },

  swing: {
    label: 'Balancement',
    category: 'logo-direct',
    effectType: 'direct',
    description: 'Mouvement de pendule',
    icon: '🎭',
    supportsIntensity: true,
    variants: {
      initial: { rotate: 0, transformOrigin: 'top center' },
      animate: {
        rotate: [-12, 12, -12],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  },

  'flip-3d': {
    label: 'Flip 3D',
    category: 'logo-direct',
    effectType: 'direct',
    description: 'Retournement 3D continu',
    icon: '🔄',
    supportsIntensity: true,
    variants: {
      initial: { rotateY: 0 },
      animate: {
        rotateY: 360,
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
  },

  stretch: {
    label: 'Étirement',
    category: 'logo-direct',
    effectType: 'direct',
    description: 'Étirement élastique',
    icon: '↔️',
    supportsIntensity: true,
    variants: {
      initial: { scaleX: 1, scaleY: 1 },
      animate: {
        scaleX: [1, 1.15, 1, 0.85, 1],
        scaleY: [1, 0.9, 1, 1.1, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  },

  morph: {
    label: 'Morphing',
    category: 'logo-direct',
    effectType: 'direct',
    description: 'Déformation fluide organique',
    icon: '🫧',
    supportsIntensity: true,
    variants: {
      initial: { borderRadius: '30%', scale: 1 },
      animate: {
        borderRadius: ['30%', '40%', '50%', '40%', '30%'],
        scale: [1, 1.02, 1, 0.98, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  },

  // ============================================
  // NEW INDIRECT EFFECTS (5 nouveaux)
  // ============================================

  'neon-outline': {
    label: 'Contour Néon',
    category: 'logo-indirect',
    effectType: 'indirect',
    description: 'Contour lumineux néon pulsant',
    icon: '💡',
    supportsColor: true,
    supportsIntensity: true,
    defaultPrimaryColor: 'rgba(34, 211, 238, 0.8)',
    defaultSecondaryColor: 'rgba(168, 139, 250, 0.5)',
    variants: {
      initial: { 
        boxShadow: '0 0 0px rgba(34, 211, 238, 0), inset 0 0 0px rgba(34, 211, 238, 0)',
      },
      animate: {
        boxShadow: [
          '0 0 10px rgba(34, 211, 238, 0.6), inset 0 0 5px rgba(34, 211, 238, 0.2)',
          '0 0 20px rgba(34, 211, 238, 0.8), inset 0 0 10px rgba(34, 211, 238, 0.3)',
          '0 0 10px rgba(34, 211, 238, 0.6), inset 0 0 5px rgba(34, 211, 238, 0.2)',
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  },

  'particle-orbit': {
    label: 'Orbite Particules',
    category: 'logo-indirect',
    effectType: 'indirect',
    description: 'Particules en orbite autour',
    icon: '✨',
    supportsColor: true,
    supportsIntensity: true,
    defaultPrimaryColor: 'rgba(34, 211, 238, 0.9)',
    defaultSecondaryColor: 'rgba(168, 139, 250, 0.9)',
    variants: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
  },

  ripple: {
    label: 'Ondulations',
    category: 'logo-indirect',
    effectType: 'indirect',
    description: 'Vagues circulaires comme une goutte d\'eau',
    icon: '💧',
    supportsColor: true,
    supportsIntensity: true,
    defaultPrimaryColor: 'rgba(34, 211, 238, 0.6)',
    defaultSecondaryColor: 'rgba(34, 211, 238, 0.3)',
    variants: {
      initial: { scale: 1, opacity: 0.6 },
      animate: {
        scale: [1, 1.5, 2],
        opacity: [0.6, 0.3, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        },
      },
    },
  },

  'lightning-strike': {
    label: 'Éclairs',
    category: 'logo-indirect',
    effectType: 'indirect',
    description: 'Éclairs aléatoires autour de l\'élément',
    icon: '⚡',
    supportsColor: true,
    supportsIntensity: true,
    defaultPrimaryColor: 'rgba(250, 204, 21, 0.9)',
    defaultSecondaryColor: 'rgba(234, 179, 8, 0.7)',
    variants: {
      initial: { opacity: 0 },
      animate: {
        opacity: [0, 1, 1, 0, 0, 0, 1, 0],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          times: [0, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 1],
        },
      },
    },
  },

  aurora: {
    label: 'Aurore Boréale',
    category: 'logo-indirect',
    effectType: 'indirect',
    description: 'Effet aurore boréale derrière l\'élément',
    icon: '🌌',
    supportsColor: true,
    supportsIntensity: true,
    defaultPrimaryColor: 'rgba(34, 211, 238, 0.5)',
    defaultSecondaryColor: 'rgba(168, 85, 247, 0.5)',
    variants: {
      initial: { 
        background: 'linear-gradient(45deg, rgba(34, 211, 238, 0.3), rgba(168, 85, 247, 0.3))',
        filter: 'blur(20px)',
      },
      animate: {
        background: [
          'linear-gradient(45deg, rgba(34, 211, 238, 0.4), rgba(168, 85, 247, 0.3))',
          'linear-gradient(90deg, rgba(168, 85, 247, 0.4), rgba(34, 211, 238, 0.3))',
          'linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(168, 85, 247, 0.3))',
          'linear-gradient(180deg, rgba(168, 85, 247, 0.4), rgba(34, 211, 238, 0.3))',
          'linear-gradient(45deg, rgba(34, 211, 238, 0.4), rgba(168, 85, 247, 0.3))',
        ],
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
  },

  // === TEXT ANIMATIONS ===
  'text-gradient': {
    label: 'Gradient animé',
    category: 'text',
    description: 'Dégradé qui défile',
    icon: '🌈',
    variants: {
      initial: { backgroundPosition: '0% 50%' },
      animate: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
    className: 'bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto]',
  },

  'text-typing': {
    label: 'Machine à écrire',
    category: 'text',
    description: 'Effet de frappe',
    icon: '⌨️',
    variants: {
      initial: { width: 0, opacity: 0 },
      animate: {
        width: '100%',
        opacity: 1,
        transition: {
          duration: 2,
          ease: 'linear',
        },
      },
    },
    className: 'overflow-hidden whitespace-nowrap border-r-2 border-white animate-typing',
  },

  'text-fade': {
    label: 'Fondu',
    category: 'text',
    description: 'Apparition progressive',
    icon: '🌫️',
    variants: {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.8,
          ease: 'easeOut',
        },
      },
    },
  },

  'text-slide': {
    label: 'Glissement',
    category: 'text',
    description: 'Glissement latéral',
    icon: '➡️',
    variants: {
      initial: { opacity: 0, x: -50 },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.6,
          ease: 'easeOut',
        },
      },
    },
  },

  // === ENTRANCE ANIMATIONS ===
  'entrance-fade': {
    label: 'Fondu',
    category: 'entrance',
    description: 'Apparition en fondu',
    icon: '🌅',
    variants: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.6 },
      },
    },
  },

  'entrance-slide-up': {
    label: 'Slide Up',
    category: 'entrance',
    description: 'Glissement vers le haut',
    icon: '⬆️',
    variants: {
      initial: { opacity: 0, y: 40 },
      animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  },

  'entrance-zoom': {
    label: 'Zoom',
    category: 'entrance',
    description: 'Effet de zoom',
    icon: '🔍',
    variants: {
      initial: { opacity: 0, scale: 0.9 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
    },
  },

  // === HOVER ANIMATIONS ===
  'hover-lift': {
    label: 'Élévation',
    category: 'hover',
    description: 'Léger soulèvement',
    icon: '🎈',
    variants: {
      initial: { y: 0, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
      hover: {
        y: -4,
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.2 },
      },
    },
  },

  'hover-scale': {
    label: 'Agrandissement',
    category: 'hover',
    description: 'Légère mise à l\'échelle',
    icon: '📐',
    variants: {
      initial: { scale: 1 },
      hover: {
        scale: 1.02,
        transition: { duration: 0.2 },
      },
    },
  },

  'hover-glow': {
    label: 'Halo',
    category: 'hover',
    description: 'Halo lumineux',
    icon: '💡',
    variants: {
      initial: { boxShadow: '0 0 0 rgba(6, 182, 212, 0)' },
      hover: {
        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
        transition: { duration: 0.3 },
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get animation variants by key
 */
export function getAnimationVariants(key: string): Variants {
  return ANIMATION_REGISTRY[key]?.variants || ANIMATION_REGISTRY.none.variants;
}

/**
 * Get animation CSS class by key
 */
export function getAnimationClassName(key: string): string {
  return ANIMATION_REGISTRY[key]?.className || '';
}

/**
 * Get full animation config by key
 */
export function getAnimationConfig(key: string): AnimationConfig | null {
  return ANIMATION_REGISTRY[key] || null;
}

/**
 * Get all animations by category
 */
export function getAnimationsByCategory(category: AnimationCategory): Array<{ key: string; config: AnimationConfig }> {
  return Object.entries(ANIMATION_REGISTRY)
    .filter(([, config]) => config.category === category)
    .map(([key, config]) => ({ key, config }));
}

/**
 * Get all animations by effect type (direct or indirect)
 */
export function getAnimationsByEffectType(effectType: EffectType): Array<{ key: string; config: AnimationConfig }> {
  return Object.entries(ANIMATION_REGISTRY)
    .filter(([, config]) => config.effectType === effectType)
    .map(([key, config]) => ({ key, config }));
}

/**
 * Get animation options for select dropdown
 */
export function getAnimationOptions(category?: AnimationCategory): Array<{ value: string; label: string; icon?: string; description?: string }> {
  const animations = category
    ? getAnimationsByCategory(category)
    : Object.entries(ANIMATION_REGISTRY).map(([key, config]) => ({ key, config }));

  return animations.map(({ key, config }) => ({
    value: key,
    label: config.label,
    icon: config.icon,
    description: config.description,
  }));
}

/**
 * Get all DIRECT effect options (transformations applied to the element)
 */
export function getDirectEffectOptions(): Array<{ value: string; label: string; icon?: string; description?: string }> {
  const directEffects = getAnimationsByEffectType('direct');
  // Also include legacy logo animations that are direct transformations
  const legacyDirect = Object.entries(ANIMATION_REGISTRY)
    .filter(([key, config]) => config.category === 'logo' && !config.effectType && key !== 'none')
    .map(([key, config]) => ({ key, config }));
  
  return [...legacyDirect, ...directEffects].map(({ key, config }) => ({
    value: key,
    label: config.label,
    icon: config.icon,
    description: config.description,
  }));
}

/**
 * Get all INDIRECT effect options (external animations around element)
 */
export function getIndirectEffectOptions(): Array<{ value: string; label: string; icon?: string; description?: string; supportsColor?: boolean }> {
  const indirectEffects = getAnimationsByEffectType('indirect');
  
  return indirectEffects.map(({ key, config }) => ({
    value: key,
    label: config.label,
    icon: config.icon,
    description: config.description,
    supportsColor: config.supportsColor,
  }));
}

/**
 * Get logo animation options (most common use case - includes all logo-related)
 */
export function getLogoAnimationOptions(): Array<{ value: string; label: string; icon?: string }> {
  const logoAnims = Object.entries(ANIMATION_REGISTRY)
    .filter(([, config]) => 
      config.category === 'logo' || 
      config.category === 'logo-direct' || 
      config.category === 'logo-indirect'
    )
    .map(([key, config]) => ({ key, config }));

  return logoAnims.map(({ key, config }) => ({
    value: key,
    label: config.label,
    icon: config.icon,
  }));
}

/**
 * Get text animation options
 */
export function getTextAnimationOptions(): Array<{ value: string; label: string; icon?: string }> {
  return getAnimationOptions('text');
}

/**
 * Get intensity multiplier values
 */
export function getIntensityMultiplier(intensity: IntensityLevel): { scale: number; duration: number } {
  return INTENSITY_PRESETS[intensity];
}

/**
 * Get neon colors from preset name
 */
export function getNeonColors(preset: NeonColorPreset): { primary: string; secondary: string } {
  return NEON_COLOR_PRESETS[preset];
}

// ============================================
// EXPORTS FOR EASY IMPORT
// ============================================

export const LOGO_ANIMATIONS = getLogoAnimationOptions();
export const TEXT_ANIMATIONS = getTextAnimationOptions();
export const ENTRANCE_ANIMATIONS = getAnimationOptions('entrance');
export const HOVER_ANIMATIONS = getAnimationOptions('hover');
export const DIRECT_EFFECTS = getDirectEffectOptions();
export const INDIRECT_EFFECTS = getIndirectEffectOptions();

