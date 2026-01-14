// ============================================
// PURE HELPERS - Factory V5 (Zero Legacy)
// ============================================
// Fonctions pures pour manipulation de couleurs et effets
// Aucune dépendance externe, 100% type-safe

// ============================================
// COLOR MAPPING
// ============================================

export const COLOR_MAP: Record<string, string> = {
    'cyan': '#22d3ee',
    'purple': '#a78bfa',
    'pink': '#f472b6',
    'emerald': '#34d399',
    'amber': '#fbbf24',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'orange': '#f97316',
    'yellow': '#eab308',
    'white': '#ffffff',
    'black': '#000000',
    'violet': '#8b5cf6',
    'rose': '#fb7185',
    'teal': '#14b8a6',
    'lime': '#84cc16',
    'indigo': '#6366f1',
    'fuchsia': '#d946ef',
};

/**
 * Résout une couleur (nom ou code) vers un code hex
 */
export function resolveColor(color: string | undefined, fallback: string): string {
    if (!color) return fallback;
    if (color.startsWith('#') || color.startsWith('rgb')) return color;
    return COLOR_MAP[color.toLowerCase()] || fallback;
}

/**
 * Convertit hex vers RGB triplet (ex: "255, 255, 255")
 */
export function hexToRgb(hex: string | undefined | null): string | null {
    if (!hex) return null;
    if (hex.startsWith('var(') || hex.startsWith('rgb')) return null;

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : null;
}

// ============================================
// MULTIPLIERS
// ============================================

export const SPEED_MULTIPLIERS: Record<string, number> = {
    'slow': 2,
    'normal': 1,
    'fast': 0.5,
};

export const INTENSITY_MULTIPLIERS: Record<string, number> = {
    'subtle': 0.5,
    'normal': 1,
    'strong': 1.5,
    'intense': 2,
};

// ====================================================
// INDIRECT EFFECTS (drop-shadow pour logos transparents)
// ============================================

export interface IndirectEffectStyles {
    filter?: string;
    WebkitFilter?: string;
}

export function getIndirectEffectStyles(
    effect: string | undefined,
    primaryColor: string = '#22d3ee',
    secondaryColor: string = '#a78bfa',
    intensity: string = 'normal'
): IndirectEffectStyles {
    if (!effect || effect === 'none') return {};

    const intensityMult = INTENSITY_MULTIPLIERS[intensity] || 1;
    const smallBlur = Math.round(5 * intensityMult);
    const mediumBlur = Math.round(10 * intensityMult);
    const largeBlur = Math.round(20 * intensityMult);
    const xlBlur = Math.round(30 * intensityMult);

    switch (effect) {
        case 'neon-outline':
            return {
                filter: `drop-shadow(0 0 ${smallBlur}px ${primaryColor}) drop-shadow(0 0 ${mediumBlur}px ${secondaryColor})`,
            };

        case 'aura-glow':
            return {
                filter: `drop-shadow(0 0 ${largeBlur}px ${primaryColor}) drop-shadow(0 0 ${xlBlur}px ${secondaryColor})`,
            };

        case 'neon-glow':
            return {
                filter: `drop-shadow(0 0 ${mediumBlur}px ${primaryColor}) drop-shadow(0 0 ${largeBlur}px ${secondaryColor}) drop-shadow(0 0 ${xlBlur}px ${primaryColor})`,
            };

        case 'particle-orbit':
        case 'scan-line':
        case 'ripple':
        case 'glitch':
        case 'orbit':
            return {
                filter: `drop-shadow(0 0 ${smallBlur}px ${primaryColor})`,
            };

        default:
            return {};
    }
}

// ============================================
// FRAME STYLES
// ============================================

export interface FrameStyles {
    borderRadius: string;
    border?: string;
    boxShadow?: string;
    overflow?: string;
}

export function getFrameStyles(
    shape: string | undefined,
    color: string | undefined,
    thickness: number = 2
): FrameStyles {
    const frameColor = resolveColor(color, '#22d3ee');

    const shapeStyles: Record<string, { borderRadius: string }> = {
        'none': { borderRadius: '0' },
        'square': { borderRadius: '0' },
        'rounded-square': { borderRadius: '1rem' },
        'rounded': { borderRadius: '1.5rem' },
        'circle': { borderRadius: '50%' },
        'pill': { borderRadius: '9999px' },
    };

    const baseStyle = shapeStyles[shape || 'none'] || shapeStyles['none'];

    if (!shape || shape === 'none') {
        return { borderRadius: '0' };
    }

    return {
        borderRadius: baseStyle.borderRadius,
        border: `${thickness}px solid ${frameColor}`,
        overflow: 'hidden',
    };
}

// ============================================
// FRAME ANIMATION CLASS MAPPER
// ============================================

export function getFrameAnimationClass(animation: string | undefined): string {
    switch (animation) {
        case 'none': return '';
        case 'color-flow': return 'frame-animation-flow';
        case 'glow-pulse': return 'frame-animation-pulse';
        case 'spin-border': return 'frame-animation-spin';
        case 'neon-sign': return 'frame-animation-neon-sign';
        default: return '';
    }
}
