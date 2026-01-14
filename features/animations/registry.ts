// ============================================
// ANIMATION REGISTRY - Factory V5 (Complete)
// ============================================
// Central registry for all animations
// Cherry-picked from V4 with zero legacy dependencies

import type { Variants } from 'framer-motion';

export type AnimationCategory = 'logo' | 'logo-direct' | 'logo-indirect' | 'text' | 'entrance' | 'hover';
export type EffectType = 'direct' | 'indirect';

export interface AnimationConfig {
    label: string;
    category: AnimationCategory;
    effectType?: EffectType;
    description?: string;
    variants: Variants;
    className?: string;
    icon?: string;
    supportsColor?: boolean;
    supportsIntensity?: boolean;
    defaultPrimaryColor?: string;
    defaultSecondaryColor?: string;
}

// ============================================
// ANIMATION REGISTRY
// ============================================

export const ANIMATION_REGISTRY: Record<string, AnimationConfig> = {
    // === NONE ===
    none: {
        label: 'Aucune',
        category: 'logo',
        icon: '⏹️',
        variants: { initial: {}, animate: {} },
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
                transition: { duration: 3, repeat: Infinity, ease: 'linear' },
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
                transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
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
                transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            },
        },
        className: 'animate-bounce',
    },

    electric: {
        label: 'Électrique',
        category: 'logo',
        description: 'Effet électrique avec glow',
        icon: '⚡',
        supportsColor: true,
        supportsIntensity: true,
        variants: {
            initial: { filter: 'drop-shadow(0 0 0px rgba(6, 182, 212, 0))' },
            animate: {
                filter: [
                    'drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))',
                    'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))',
                    'drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))',
                ],
                transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            },
        },
        className: 'animate-electric',
    },

    'spin-glow': {
        label: 'Rotation + Glow',
        category: 'logo',
        description: 'Rotation avec halo lumineux',
        icon: '✨',
        supportsColor: true,
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
                transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
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
                transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
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
                transition: { duration: 0.3, repeat: Infinity, repeatDelay: 1 },
            },
        },
    },

    // === DIRECT EFFECTS ===
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
                transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
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
                transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
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
                transition: { duration: 4, repeat: Infinity, ease: 'linear' },
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
                transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
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
                transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            },
        },
    },

    // === INDIRECT EFFECTS ===
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
                transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            },
        },
    },

    'aura-glow': {
        label: 'Aura Lumineuse',
        category: 'logo-indirect',
        effectType: 'indirect',
        description: 'Halo diffus multicolore',
        icon: '🌟',
        supportsColor: true,
        supportsIntensity: true,
        defaultPrimaryColor: 'rgba(34, 211, 238, 0.5)',
        defaultSecondaryColor: 'rgba(236, 72, 153, 0.3)',
        variants: {
            initial: {
                boxShadow: '0 0 0px rgba(34, 211, 238, 0)',
            },
            animate: {
                boxShadow: [
                    '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
                    '0 0 40px rgba(34, 211, 238, 0.6), 0 0 60px rgba(236, 72, 153, 0.4)',
                    '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
                ],
                transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            },
        },
    },

    'neon-glow': {
        label: 'Néon Intense',
        category: 'logo-indirect',
        effectType: 'indirect',
        description: 'Triple couche glow intense',
        icon: '🔥',
        supportsColor: true,
        supportsIntensity: true,
        defaultPrimaryColor: 'rgba(34, 211, 238, 0.9)',
        defaultSecondaryColor: 'rgba(168, 139, 250, 0.6)',
        variants: {
            initial: {
                boxShadow: '0 0 0px rgba(34, 211, 238, 0)',
            },
            animate: {
                boxShadow: [
                    '0 0 10px rgba(34, 211, 238, 0.7), 0 0 20px rgba(168, 139, 250, 0.5), 0 0 30px rgba(34, 211, 238, 0.3)',
                    '0 0 20px rgba(34, 211, 238, 0.9), 0 0 40px rgba(168, 139, 250, 0.7), 0 0 60px rgba(34, 211, 238, 0.5)',
                    '0 0 10px rgba(34, 211, 238, 0.7), 0 0 20px rgba(168, 139, 250, 0.5), 0 0 30px rgba(34, 211, 238, 0.3)',
                ],
                transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            },
        },
    },

    'particle-orbit': {
        label: 'Particules Orbitales',
        category: 'logo-indirect',
        effectType: 'indirect',
        description: 'Particules en orbite',
        icon: '🌌',
        supportsColor: true,
        variants: {
            initial: {
                boxShadow: '0 0 5px rgba(34, 211, 238, 0.5)',
            },
            animate: {
                boxShadow: [
                    '0 0 5px rgba(34, 211, 238, 0.5), 10px 0 3px rgba(168, 139, 250, 0.6)',
                    '0 0 5px rgba(34, 211, 238, 0.5), 0 10px 3px rgba(168, 139, 250, 0.6)',
                    '0 0 5px rgba(34, 211, 238, 0.5), -10px 0 3px rgba(168, 139, 250, 0.6)',
                    '0 0 5px rgba(34, 211, 238, 0.5), 0 -10px 3px rgba(168, 139, 250, 0.6)',
                    '0 0 5px rgba(34, 211, 238, 0.5), 10px 0 3px rgba(168, 139, 250, 0.6)',
                ],
                transition: { duration: 4, repeat: Infinity, ease: 'linear' },
            },
        },
    },

    ripple: {
        label: 'Ondulation',
        category: 'logo-indirect',
        effectType: 'indirect',
        description: 'Effet d\'ondulation concentrique',
        icon: '〰️',
        supportsColor: true,
        supportsIntensity: true,
        defaultPrimaryColor: 'rgba(34, 211, 238, 0.7)',
        variants: {
            initial: {
                boxShadow: '0 0 0 0px rgba(34, 211, 238, 0.7)',
            },
            animate: {
                boxShadow: [
                    '0 0 0 0px rgba(34, 211, 238, 0.7), 0 0 0 10px rgba(34, 211, 238, 0.4), 0 0 0 20px rgba(34, 211, 238, 0.1)',
                    '0 0 0 10px rgba(34, 211, 238, 0.4), 0 0 0 20px rgba(34, 211, 238, 0.1), 0 0 0 30px rgba(34, 211, 238, 0)',
                ],
                transition: { duration: 2, repeat: Infinity, ease: 'easeOut' },
            },
        },
    },

    // === TEXT ANIMATIONS ===
    'text-fade': {
        label: 'Fondu',
        category: 'text',
        icon: '🌫️',
        variants: {
            initial: { opacity: 0, y: 20 },
            animate: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: 'easeOut' },
            },
        },
    },

    'text-slide': {
        label: 'Glissement',
        category: 'text',
        icon: '➡️',
        variants: {
            initial: { opacity: 0, x: -30 },
            animate: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.6, ease: 'easeOut' },
            },
        },
    },

    'text-bounce': {
        label: 'Rebond',
        category: 'text',
        icon: '⬆️',
        variants: {
            initial: { opacity: 0, y: -20 },
            animate: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
            },
        },
    },

    // === ENTRANCE ANIMATIONS ===
    'entrance-fade': {
        label: 'Fondu',
        category: 'entrance',
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
        label: 'Glissement Bas → Haut',
        category: 'entrance',
        icon: '⬆️',
        variants: {
            initial: { opacity: 0, y: 40 },
            animate: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: 'easeOut' },
            },
        },
    },

    'entrance-scale': {
        label: 'Zoom',
        category: 'entrance',
        icon: '🔍',
        variants: {
            initial: { opacity: 0, scale: 0.8 },
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
        icon: '⬆️',
        variants: {
            initial: { y: 0 },
            animate: {
                y: -5,
                transition: { duration: 0.2 },
            },
        },
    },

    'hover-glow': {
        label: 'Lueur',
        category: 'hover',
        icon: '✨',
        variants: {
            initial: { boxShadow: '0 0 0px rgba(34, 211, 238, 0)' },
            animate: {
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
                transition: { duration: 0.3 },
            },
        },
    },
};

// ============================================
// HELPERS
// ============================================

export function getAnimationVariants(key: string): Variants {
    return ANIMATION_REGISTRY[key]?.variants || ANIMATION_REGISTRY.none.variants;
}

export function getAnimationClassName(key: string): string {
    return ANIMATION_REGISTRY[key]?.className || '';
}

export function getAnimationOptions(category?: AnimationCategory) {
    const animations = category
        ? Object.entries(ANIMATION_REGISTRY).filter(([, config]) => config.category === category)
        : Object.entries(ANIMATION_REGISTRY);

    return animations.map(([key, config]) => ({
        value: key,
        label: config.label,
        icon: config.icon,
    }));
}

export function getAnimationsByCategory(category: AnimationCategory) {
    return Object.entries(ANIMATION_REGISTRY)
        .filter(([, config]) => config.category === category)
        .reduce((acc, [key, config]) => ({ ...acc, [key]: config }), {});
}
