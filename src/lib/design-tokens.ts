// ============================================
// 🎨 DESIGN TOKENS - Factory V2
// ============================================
// Centralise tous les mappings de styles pour éviter le code spaghetti
// et permettre une personnalisation 100% configurable.

// ============================================
// TYPES
// ============================================

export type HeroLayout = 'text-left' | 'text-right' | 'centered' | 'split';
export type ButtonShape = 'rounded' | 'pill' | 'square';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonStyle = 'solid' | 'gradient' | 'outline' | 'ghost';
export type SpacingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type AnimationIntensity = 'subtle' | 'normal' | 'strong' | 'intense';
export type OverlayStyle = 'none' | 'dark' | 'light' | 'gradient' | 'blur';

// ============================================
// HERO LAYOUT
// ============================================

export const HERO_LAYOUTS: Record<HeroLayout, {
  container: string;
  textAlign: string;
  justify: string;
  reverse?: boolean;
}> = {
  'text-left': {
    container: 'grid lg:grid-cols-2 items-center',
    textAlign: 'text-center lg:text-left',
    justify: 'justify-center lg:justify-start',
  },
  'text-right': {
    container: 'grid lg:grid-cols-2 items-center',
    textAlign: 'text-center lg:text-right',
    justify: 'justify-center lg:justify-end',
    reverse: true,
  },
  'centered': {
    container: 'flex flex-col items-center',
    textAlign: 'text-center',
    justify: 'justify-center',
  },
  'split': {
    container: 'grid lg:grid-cols-2 items-center',
    textAlign: 'text-center lg:text-left',
    justify: 'justify-center lg:justify-start',
  },
};

// ============================================
// BUTTON SHAPES
// ============================================

export const BUTTON_SHAPES: Record<ButtonShape, string> = {
  'rounded': 'rounded-xl',
  'pill': 'rounded-full',
  'square': 'rounded-none',
};

// ============================================
// BUTTON SIZES
// ============================================

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  'sm': 'px-4 py-2 text-sm',
  'md': 'px-6 py-3 text-base',
  'lg': 'px-8 py-4 text-base',
  'xl': 'px-10 py-5 text-lg',
};

// ============================================
// BUTTON STYLES
// ============================================

export const BUTTON_STYLES: Record<ButtonStyle, {
  primary: string;
  secondary: string;
}> = {
  'solid': {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg',
    secondary: 'bg-white/10 hover:bg-white/20 text-foreground border border-white/10',
  },
  'gradient': {
    primary: 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40',
    secondary: 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10',
  },
  'outline': {
    primary: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10',
    secondary: 'border border-white/20 text-foreground hover:bg-white/5',
  },
  'ghost': {
    primary: 'text-primary-400 hover:bg-primary-500/10',
    secondary: 'text-foreground hover:bg-white/5',
  },
};

// ============================================
// SPACING (Gap, Padding, Margin)
// ============================================

export const SPACING_GAP: Record<SpacingSize, string> = {
  'none': 'gap-0',
  'sm': 'gap-4 lg:gap-6',
  'md': 'gap-8 lg:gap-12',
  'lg': 'gap-12 lg:gap-16',
  'xl': 'gap-16 lg:gap-20',
  '2xl': 'gap-20 lg:gap-24',
};

export const SPACING_PADDING_Y: Record<SpacingSize, string> = {
  'none': 'py-0',
  'sm': 'py-6 lg:py-8',
  'md': 'py-10 lg:py-16',
  'lg': 'py-16 lg:py-24',
  'xl': 'py-20 lg:py-32',
  '2xl': 'py-24 lg:py-40',
};

export const SPACING_PADDING_X: Record<SpacingSize, string> = {
  'none': 'px-0',
  'sm': 'px-4',
  'md': 'px-6',
  'lg': 'px-8',
  'xl': 'px-12',
  '2xl': 'px-16',
};

// ============================================
// MAX WIDTH
// ============================================

export const MAX_WIDTHS: Record<MaxWidth, string> = {
  'sm': 'max-w-3xl',
  'md': 'max-w-5xl',
  'lg': 'max-w-6xl',
  'xl': 'max-w-7xl',
  '2xl': 'max-w-[1400px]',
  'full': 'max-w-full',
};

// ============================================
// ANIMATION SPEEDS
// ============================================

export const ANIMATION_DURATIONS: Record<AnimationSpeed, {
  spin: number;
  pulse: number;
  bounce: number;
  fade: number;
}> = {
  'slow': { spin: 60, pulse: 4, bounce: 3, fade: 1.2 },
  'normal': { spin: 30, pulse: 2.5, bounce: 2, fade: 0.8 },
  'fast': { spin: 15, pulse: 1.5, bounce: 1.2, fade: 0.5 },
};

// ============================================
// ANIMATION INTENSITIES
// ============================================

export const ANIMATION_INTENSITIES: Record<AnimationIntensity, {
  scale: number;
  translate: number;
  rotate: number;
}> = {
  'subtle': { scale: 1.02, translate: 5, rotate: 2 },
  'normal': { scale: 1.05, translate: 10, rotate: 5 },
  'strong': { scale: 1.08, translate: 15, rotate: 10 },
  'intense': { scale: 1.12, translate: 20, rotate: 15 },
};

// ============================================
// OVERLAY STYLES
// ============================================

export const OVERLAY_STYLES: Record<OverlayStyle, string> = {
  'none': '',
  'dark': 'bg-black',
  'light': 'bg-white',
  'gradient': 'bg-gradient-to-b from-black/60 via-black/30 to-black/60',
  'blur': 'backdrop-blur-md bg-black/20',
};

// ============================================
// PRESET COLORS (pour overlays)
// ============================================

export const OVERLAY_COLORS = [
  { value: 'black', label: 'Noir', color: '#000000' },
  { value: 'white', label: 'Blanc', color: '#ffffff' },
  { value: 'primary', label: 'Primaire', color: 'var(--primary-900)' },
  { value: 'accent', label: 'Accent', color: 'var(--accent-900)' },
  { value: 'slate', label: 'Ardoise', color: '#0f172a' },
  { value: 'zinc', label: 'Zinc', color: '#18181b' },
];

// ============================================
// BLOB SIZES (Background effects)
// ============================================

export const BLOB_SIZES: Record<SpacingSize, { size: string; blur: string }> = {
  'none': { size: '0px', blur: '0px' },
  'sm': { size: '300px', blur: '80px' },
  'md': { size: '500px', blur: '120px' },
  'lg': { size: '700px', blur: '150px' },
  'xl': { size: '900px', blur: '180px' },
  '2xl': { size: '1100px', blur: '200px' },
};

// ============================================
// SCROLL INDICATOR STYLES
// ============================================

export const SCROLL_INDICATORS = {
  'none': null,
  'mouse': {
    type: 'mouse' as const,
    classes: 'w-6 h-10 rounded-full border-2',
  },
  'arrow': {
    type: 'arrow' as const,
    classes: 'w-8 h-8',
  },
  'chevron': {
    type: 'chevron' as const,
    classes: 'w-6 h-6',
  },
  'dot': {
    type: 'dot' as const,
    classes: 'w-3 h-3 rounded-full',
  },
};

// ============================================
// STAT LAYOUTS
// ============================================

export const STAT_LAYOUTS = {
  'horizontal': 'flex flex-wrap items-center gap-6 lg:gap-8',
  'vertical': 'flex flex-col gap-4',
  'grid-2': 'grid grid-cols-2 gap-4',
  'grid-3': 'grid grid-cols-3 gap-4',
  'grid-4': 'grid grid-cols-4 gap-4',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Génère les classes CSS pour un bouton
 */
export function getButtonClasses(
  shape: ButtonShape = 'pill',
  size: ButtonSize = 'lg',
  style: ButtonStyle = 'gradient',
  isPrimary: boolean = true
): string {
  const shapeClass = BUTTON_SHAPES[shape];
  const sizeClass = BUTTON_SIZES[size];
  const styleClass = isPrimary 
    ? BUTTON_STYLES[style].primary 
    : BUTTON_STYLES[style].secondary;
  
  return `inline-flex items-center justify-center gap-2 font-semibold transition-all ${shapeClass} ${sizeClass} ${styleClass}`;
}

/**
 * Génère les classes CSS pour le layout Hero
 */
export function getHeroLayoutClasses(layout: HeroLayout = 'text-left'): {
  container: string;
  textAlign: string;
  justify: string;
  reverse: boolean;
} {
  const config = HERO_LAYOUTS[layout];
  return {
    ...config,
    reverse: config.reverse || false,
  };
}

/**
 * Génère le style pour l'overlay
 */
export function getOverlayStyle(
  color: string = 'black',
  opacity: number = 40
): string {
  if (opacity === 0) return '';
  
  const colorMap: Record<string, string> = {
    'black': `rgba(0,0,0,${opacity / 100})`,
    'white': `rgba(255,255,255,${opacity / 100})`,
    'primary': `rgba(var(--primary-900-rgb),${opacity / 100})`,
    'accent': `rgba(var(--accent-900-rgb),${opacity / 100})`,
    'slate': `rgba(15,23,42,${opacity / 100})`,
    'zinc': `rgba(24,24,27,${opacity / 100})`,
  };
  
  return colorMap[color] || colorMap['black'];
}

/**
 * Génère les props d'animation Framer Motion
 */
export function getAnimationProps(
  type: 'pulse' | 'bounce' | 'spin' | 'float',
  speed: AnimationSpeed = 'normal',
  intensity: AnimationIntensity = 'normal'
) {
  const durations = ANIMATION_DURATIONS[speed];
  const intensities = ANIMATION_INTENSITIES[intensity];
  
  switch (type) {
    case 'pulse':
      return {
        animate: { scale: [1, intensities.scale, 1] },
        transition: { duration: durations.pulse, repeat: Infinity },
      };
    case 'bounce':
      return {
        animate: { y: [0, -intensities.translate, 0] },
        transition: { duration: durations.bounce, repeat: Infinity },
      };
    case 'spin':
      return {
        animate: { rotate: 360 },
        transition: { duration: durations.spin, repeat: Infinity, ease: 'linear' },
      };
    case 'float':
      return {
        animate: { y: [0, -intensities.translate / 2, 0] },
        transition: { duration: durations.pulse * 1.5, repeat: Infinity, ease: 'easeInOut' },
      };
    default:
      return { animate: {}, transition: {} };
  }
}

