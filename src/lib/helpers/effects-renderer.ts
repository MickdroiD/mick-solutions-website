// ============================================
// EFFECTS RENDERER - Convertit effects/textSettings en classes CSS
// ============================================

import type { EffectSettings, TextSettings } from '../schemas/factory';

// ============================================
// COLOR MAPPING - Convertit les noms en codes hex
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

export function resolveColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback;
  // Si c'est déjà un code hex ou rgb, le retourner tel quel
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  // Sinon, mapper le nom vers le code hex
  return COLOR_MAP[color.toLowerCase()] || fallback;
}

/**
 * Convertit un code couleur hexadécimal en triplet RGB (ex: "255, 255, 255")
 * Retourne null si le format n'est pas valide.
 */
export function hexToRgb(hex: string | undefined | null): string | null {
  if (!hex) return null;
  // Si c'est déjà une variable CSS ou rgb, on ne peut pas convertir statiquement
  if (hex.startsWith('var(') || hex.startsWith('rgb')) return null;

  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

// ============================================
// ANIMATION SPEED MULTIPLIERS
// ============================================

const SPEED_MULTIPLIERS: Record<string, number> = {
  'slow': 2,
  'normal': 1,
  'fast': 0.5,
};

// ============================================
// INTENSITY MULTIPLIERS
// ============================================

const INTENSITY_MULTIPLIERS: Record<string, number> = {
  'subtle': 0.5,
  'normal': 1,
  'strong': 1.5,
  'intense': 2,
};

// ============================================
// DIRECT EFFECTS (Framer Motion animations)
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

  const speedMult = SPEED_MULTIPLIERS[speed] || 1;
  const intensityMult = INTENSITY_MULTIPLIERS[intensity] || 1;

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

// Legacy function for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDirectEffectClasses(effects: EffectSettings): string {
  // Not used anymore - animations are handled via Framer Motion
  return '';
}

// ============================================
// INDIRECT EFFECTS (filter: drop-shadow pour logos transparents)
// Ces effets s'appliquent aux CONTOURS du logo, pas au container
// ============================================

export interface IndirectEffectStyles {
  filter?: string;
  WebkitFilter?: string;
}

export function getIndirectEffectStyles(
  effects: Partial<EffectSettings> | Record<string, unknown>,
  intensity: string = 'normal'
): IndirectEffectStyles {
  // Cast to access properties safely
  const effectsObj = effects as Record<string, unknown>;
  const effect = effectsObj?.logoIndirectEffect as string | undefined;
  const primaryColor = resolveColor(effectsObj?.effectPrimaryColor as string | undefined, '#22d3ee');
  const secondaryColor = resolveColor(effectsObj?.effectSecondaryColor as string | undefined, '#a78bfa');
  const intensityMult = INTENSITY_MULTIPLIERS[intensity] || 1;

  if (!effect || effect === 'none') return {};

  // Base blur amounts scaled by intensity
  const smallBlur = Math.round(5 * intensityMult);
  const mediumBlur = Math.round(10 * intensityMult);
  const largeBlur = Math.round(20 * intensityMult);
  const xlBlur = Math.round(30 * intensityMult);

  switch (effect) {
    case 'neon-outline':
      // Double drop-shadow pour effet néon
      return {
        filter: `drop-shadow(0 0 ${smallBlur}px ${primaryColor}) drop-shadow(0 0 ${mediumBlur}px ${secondaryColor})`,
      };

    case 'aura-glow':
      // Glow diffus autour du logo
      return {
        filter: `drop-shadow(0 0 ${largeBlur}px ${primaryColor}) drop-shadow(0 0 ${xlBlur}px ${secondaryColor})`,
      };

    case 'neon-glow':
      // Triple layer glow intense
      return {
        filter: `drop-shadow(0 0 ${mediumBlur}px ${primaryColor}) drop-shadow(0 0 ${largeBlur}px ${secondaryColor}) drop-shadow(0 0 ${xlBlur}px ${primaryColor})`,
      };

    case 'particle-orbit':
    case 'scan-line':
    case 'ripple':
    case 'glitch':
    case 'orbit':
      // Ces effets sont CSS/SVG based, pas drop-shadow
      return {
        filter: `drop-shadow(0 0 ${smallBlur}px ${primaryColor})`,
      };

    default:
      return {};
  }
}

// ============================================
// FRAME STYLES (Cadre autour du logo)
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
  const frameColor = resolveColor(color, '#22d3ee');

  // Base shape styles
  const shapeStyles: Record<string, { borderRadius: string; aspectRatio?: string }> = {
    'none': { borderRadius: '0' },
    'square': { borderRadius: '0' },
    'rounded-square': { borderRadius: '1rem' },
    'rounded': { borderRadius: '1.5rem' },
    'circle': { borderRadius: '50%' },  // Vrai cercle!
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
// FRAME ANIMATION CSS CLASS
// ============================================

export function getFrameAnimationClass(animation: string | undefined): string {
  switch (animation) {
    case 'none':
      return '';
    case 'color-flow':
      return 'frame-animation-flow';
    case 'glow-pulse':
      return 'frame-animation-pulse';
    case 'spin-border':
      return 'frame-animation-spin';
    case 'neon-sign':
      return 'frame-animation-neon-sign';
    default:
      return '';
  }
}

// ============================================
// TEXT STYLES
// ============================================

export function getTitleClasses(textSettings?: TextSettings): string {
  if (!textSettings) return '';

  const classes: string[] = [];

  if (textSettings.titleFontSize) classes.push(textSettings.titleFontSize);
  if (textSettings.titleFontWeight) classes.push(textSettings.titleFontWeight);
  if (textSettings.titleColor) classes.push(textSettings.titleColor);
  if (textSettings.titleAlign) classes.push(textSettings.titleAlign);
  if (textSettings.titleTransform) classes.push(textSettings.titleTransform);

  return classes.join(' ');
}

export function getSubtitleClasses(textSettings?: TextSettings): string {
  if (!textSettings) return '';

  const classes: string[] = [];

  if (textSettings.subtitleFontSize) classes.push(textSettings.subtitleFontSize);
  if (textSettings.subtitleColor) classes.push(textSettings.subtitleColor || 'text-slate-400');

  return classes.join(' ');
}

export function getBodyClasses(textSettings?: TextSettings): string {
  if (!textSettings) return '';

  const classes: string[] = [];

  if (textSettings.bodyFontSize) classes.push(textSettings.bodyFontSize);
  if (textSettings.bodyLineHeight) classes.push(textSettings.bodyLineHeight);
  if (textSettings.bodyColor) classes.push(textSettings.bodyColor);

  return classes.join(' ');
}

// ============================================
// BACKGROUND EFFECTS
// ============================================

export function getBackgroundStyles(effects?: EffectSettings): React.CSSProperties {
  if (!effects) return {};

  const styles: React.CSSProperties = {};

  if (effects.backgroundOpacity !== undefined) {
    styles.opacity = effects.backgroundOpacity / 100;
  }

  if (effects.backgroundBlur) {
    styles.backdropFilter = `blur(${effects.backgroundBlur}px)`;
  }

  return styles;
}

// ============================================
// FONT FAMILY MAPPER
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

// ============================================
// ANIMATION HELPER (Legacy)
// ============================================

export function getAnimationVariant(animation?: string): { animate: Record<string, unknown>; transition: Record<string, unknown> } {
  const variants: Record<string, { animate: Record<string, unknown>; transition: Record<string, unknown> }> = {
    'float': {
      animate: { y: [0, -10, 0] },
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    },
    'pulse': {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 2, repeat: Infinity }
    },
    'bounce': {
      animate: { y: [0, -15, 0] },
      transition: { duration: 2, repeat: Infinity }
    },
    'spin': {
      animate: { rotate: 360 },
      transition: { duration: 20, repeat: Infinity, ease: 'linear' }
    },
  };

  return variants[animation || ''] || { animate: {}, transition: {} };
}
