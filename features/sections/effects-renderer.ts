// ============================================
// EFFECTS RENDERER - Factory V5 (Ported)
// ============================================

// Import from design-tokens if available, or rely on local fallbacks
// import { SPEED_MULTIPLIERS, INTENSITY_MULTIPLIERS } from './design-tokens';

// We will use local definitions for maximum portability

// Note: We'll create a small util file or just include utils here. 
// Actually let's include the utils directly here or ensure we export them from design-tokens if they were there.
// Checking design-tokens.ts... it didn't have resolveColor. modify design-tokens.ts? 
// No, resolveColor was in effects-renderer.ts in V4. I will keep it here.

// ============================================
// TYPES (Locally defined for portability)
// ============================================

export interface TextSettings {
    titleFontSize?: string;
    titleFontWeight?: string;
    titleFontFamily?: string;
    titleColor?: string;
    titleAlign?: string;
    titleTransform?: string;
    subtitleFontSize?: string;
    subtitleFontFamily?: string;
    subtitleColor?: string;
    bodyFontSize?: string;
    bodyLineHeight?: string;
    bodyColor?: string;
}

export interface EffectSettings {
    logoDirectEffect?: string;
    logoIndirectEffect?: string;
    logoFrameShape?: string;
    logoFrameAnimation?: string;
    logoFrameColor?: string;
    logoFrameThickness?: number;
    effectPrimaryColor?: string;
    effectSecondaryColor?: string;
    backgroundOpacity?: number;
    backgroundBlur?: number;
    height?: string;
    logoSize?: number;
    // ... any other props needed
    [key: string]: any;
}

// ============================================
// COLOR RESOLUTION
// ============================================

export const CLIENT_COLOR_MAP: Record<string, string> = {
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

export function resolveColorValue(color: string | undefined, fallback: string): string {
    if (!color) return fallback;
    if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('var')) return color;
    return CLIENT_COLOR_MAP[color.toLowerCase()] || fallback;
}

// Re-export for compatibility if needed, but using distinct name to avoid confusion
export { resolveColorValue as resolveColor };

// ============================================
// DIRECT EFFECTS (Framer Motion)
// ============================================

export interface DirectAnimationConfig {
    animate: Record<string, number | number[]>;
    transition: Record<string, unknown>;
}

export function getDirectAnimationConfig(
    effect: string | undefined,
    speed: string = 'normal',
    intensity: string = 'normal'
): DirectAnimationConfig | null {
    if (!effect || effect === 'none') return null;

    const speedMult = (SPEED_MULTIPLIERS_LOCAL as any)?.[speed] || (speed === 'fast' ? 0.5 : speed === 'slow' ? 2 : 1);
    const intensityMult = (INTENSITY_MULTIPLIERS_LOCAL as any)?.[intensity] || (intensity === 'strong' ? 1.5 : intensity === 'subtle' ? 0.5 : 1);

    switch (effect) {
        case 'float':
            return {
                animate: { y: [0, -10 * intensityMult, 0] },
                transition: { duration: 3 * speedMult, repeat: Infinity, ease: 'easeInOut' }
            };
        case 'pulse':
            return {
                animate: { scale: [1, 1 + (0.05 * intensityMult), 1] },
                transition: { duration: 2 * speedMult, repeat: Infinity }
            };
        case 'bounce':
            return {
                animate: { y: [0, -15 * intensityMult, 0] },
                transition: { duration: 2 * speedMult, repeat: Infinity }
            };
        case 'spin':
            return {
                animate: { rotate: 360 },
                transition: { duration: 20 * speedMult, repeat: Infinity, ease: 'linear' }
            };
        case 'swing':
            return {
                animate: { rotate: [-5 * intensityMult, 5 * intensityMult, -5 * intensityMult] },
                transition: { duration: 2 * speedMult, repeat: Infinity, ease: 'easeInOut' }
            };
        default:
            return null;
    }
}

// ============================================
// INDIRECT EFFECTS (Drop Shadow)
// ============================================

export interface IndirectEffectStyles {
    filter?: string;
    WebkitFilter?: string;
}

export function getIndirectEffectStyles(
    effects: Partial<EffectSettings> | Record<string, unknown>,
    intensity: string = 'normal'
): IndirectEffectStyles {
    const effectsObj = effects as Record<string, unknown>;
    const effect = effectsObj?.logoIndirectEffect as string | undefined;
    const primaryColor = resolveColorValue(effectsObj?.effectPrimaryColor as string | undefined, '#22d3ee');
    const secondaryColor = resolveColorValue(effectsObj?.effectSecondaryColor as string | undefined, '#a78bfa');

    // Hardcoded multipliers if import fails
    const intensityMult = intensity === 'strong' ? 1.5 : intensity === 'subtle' ? 0.5 : 1;

    if (!effect || effect === 'none') return {};

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
    background?: string;
}

export function getFrameStyles(
    shape: string | undefined,
    color: string | undefined,
    thickness: number = 2
): FrameStyles {
    const frameColor = resolveColorValue(color, '#22d3ee');

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
// FRAME ANIMATION CLASS
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

// ============================================
// TEXT STYLES
// ============================================

export function getFontFamilyStyle(fontFamily?: string): React.CSSProperties {
    if (!fontFamily) return {};
    const fontMap: Record<string, string> = {
        'Inter': 'Inter, sans-serif',
        'Poppins': 'Poppins, sans-serif',
        'Space-Grotesk': '"Space Grotesk", sans-serif',
        'Outfit': 'Outfit, sans-serif',
        'Montserrat': 'Montserrat, sans-serif',
        'DM-Sans': '"DM Sans", sans-serif',
        'Playfair-Display': '"Playfair Display", serif',
        'Merriweather': 'Merriweather, serif',
        'Roboto-Mono': '"Roboto Mono", monospace',
        'JetBrains-Mono': '"JetBrains Mono", monospace',
    };
    return fontMap[fontFamily] ? { fontFamily: fontMap[fontFamily] } : {};
}

// Helper constants (re-declared to avoid import issues if file is missing)
const SPEED_MULTIPLIERS_LOCAL = { 'slow': 2, 'normal': 1, 'fast': 0.5 };
const INTENSITY_MULTIPLIERS_LOCAL = { 'subtle': 0.5, 'normal': 1, 'strong': 1.5, 'intense': 2 };

export function hexToRgb(hex: string | undefined): string | null {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

