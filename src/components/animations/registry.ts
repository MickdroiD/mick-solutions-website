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
// - text: For text animations (titles, subtitles)
// - entrance: For section entrance animations
// - hover: For hover state animations

import type { Variants } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export type AnimationCategory = 'logo' | 'text' | 'entrance' | 'hover';

export interface AnimationConfig {
  /** Display label in admin */
  label: string;
  /** Category for filtering */
  category: AnimationCategory;
  /** Description shown in admin tooltip */
  description?: string;
  /** Framer Motion variants */
  variants: Variants;
  /** CSS classes to apply (for non-Framer animations) */
  className?: string;
  /** Preview emoji/icon */
  icon?: string;
}

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
    description: 'Micro-vibration subtile',
    icon: '〰️',
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
 * Get all animations by category
 */
export function getAnimationsByCategory(category: AnimationCategory): Array<{ key: string; config: AnimationConfig }> {
  return Object.entries(ANIMATION_REGISTRY)
    .filter(([, config]) => config.category === category)
    .map(([key, config]) => ({ key, config }));
}

/**
 * Get animation options for select dropdown
 */
export function getAnimationOptions(category?: AnimationCategory): Array<{ value: string; label: string; icon?: string }> {
  const animations = category
    ? getAnimationsByCategory(category)
    : Object.entries(ANIMATION_REGISTRY).map(([key, config]) => ({ key, config }));

  return animations.map(({ key, config }) => ({
    value: key,
    label: config.label,
    icon: config.icon,
  }));
}

/**
 * Get logo animation options (most common use case)
 */
export function getLogoAnimationOptions(): Array<{ value: string; label: string; icon?: string }> {
  return getAnimationOptions('logo');
}

/**
 * Get text animation options
 */
export function getTextAnimationOptions(): Array<{ value: string; label: string; icon?: string }> {
  return getAnimationOptions('text');
}

// ============================================
// EXPORTS FOR EASY IMPORT
// ============================================

export const LOGO_ANIMATIONS = getLogoAnimationOptions();
export const TEXT_ANIMATIONS = getTextAnimationOptions();
export const ENTRANCE_ANIMATIONS = getAnimationOptions('entrance');
export const HOVER_ANIMATIONS = getAnimationOptions('hover');

