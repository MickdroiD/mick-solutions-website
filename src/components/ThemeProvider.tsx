// ============================================
// THEME PROVIDER - White Label Factory 2025
// ============================================
// Moteur de thème dynamique qui injecte les CSS variables
// selon la configuration Baserow. Zéro flash, SSR-ready.

import type { GlobalSettingsComplete, FontFamily, BorderRadius, PatternBackground, AnimationSpeed, ScrollEffect, HoverEffect } from '@/lib/types/global-settings';

interface ThemeProviderProps {
  settings: GlobalSettingsComplete;
}

// ============================================
// GÉNÉRATEUR DE NUANCES DE COULEURS
// ============================================

/**
 * Convertit une couleur hex en HSL pour une meilleure manipulation.
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convertit HSL en couleur hex.
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Génère une palette complète de nuances à partir d'une couleur de base.
 * Approche HSL pour des nuances plus naturelles.
 */
function generateColorPalette(hex: string): Record<string, string> {
  const { h, s } = hexToHSL(hex);
  
  // Lightness values pour chaque nuance (Tailwind-like)
  const lightnessMap: Record<string, number> = {
    50: 97,
    100: 94,
    200: 86,
    300: 76,
    400: 64,
    500: 52, // Base ~ la couleur originale
    600: 44,
    700: 36,
    800: 28,
    900: 20,
    950: 12,
  };

  const palette: Record<string, string> = {};
  
  for (const [shade, targetL] of Object.entries(lightnessMap)) {
    // Ajuster la saturation : plus claire = moins saturée, plus foncée = légèrement moins saturée
    const adjustedS = shade === '50' || shade === '100' 
      ? Math.max(s * 0.3, 10) 
      : shade === '900' || shade === '950'
        ? Math.max(s * 0.7, 20)
        : s;
    
    palette[shade] = hslToHex(h, adjustedS, targetL);
  }
  
  return palette;
}

// ============================================
// MAPPING DES FONTS GOOGLE
// ============================================

const FONT_FAMILIES: Record<FontFamily, { family: string; weights: string }> = {
  'Inter': { family: 'Inter', weights: '300;400;500;600;700;800' },
  'Poppins': { family: 'Poppins', weights: '300;400;500;600;700;800' },
  'Space-Grotesk': { family: 'Space+Grotesk', weights: '300;400;500;600;700' },
  'Outfit': { family: 'Outfit', weights: '300;400;500;600;700;800' },
  'Montserrat': { family: 'Montserrat', weights: '300;400;500;600;700;800' },
  'DM-Sans': { family: 'DM+Sans', weights: '400;500;600;700' },
  'Custom': { family: '', weights: '' },
};

/**
 * Génère l'URL Google Fonts pour les fonts sélectionnées.
 */
function generateGoogleFontsUrl(
  fontPrimary: FontFamily | null, 
  fontHeading: FontFamily | null,
  customUrl: string | null
): string | null {
  if (customUrl) return customUrl;
  
  const fonts: string[] = [];
  
  // Font primaire (body)
  if (fontPrimary && fontPrimary !== 'Custom' && FONT_FAMILIES[fontPrimary]) {
    const font = FONT_FAMILIES[fontPrimary];
    fonts.push(`family=${font.family}:wght@${font.weights}`);
  }
  
  // Font heading (si différente)
  if (fontHeading && fontHeading !== fontPrimary && fontHeading !== 'Custom' && FONT_FAMILIES[fontHeading]) {
    const font = FONT_FAMILIES[fontHeading];
    fonts.push(`family=${font.family}:wght@${font.weights}`);
  }
  
  if (fonts.length === 0) return null;
  
  return `https://fonts.googleapis.com/css2?${fonts.join('&')}&display=swap`;
}

/**
 * Convertit le nom de font Baserow en font-family CSS.
 */
function getFontFamilyCSS(font: FontFamily | null, fallback: string): string {
  if (!font || font === 'Custom') return fallback;
  
  const mapping: Record<FontFamily, string> = {
    'Inter': "'Inter', system-ui, sans-serif",
    'Poppins': "'Poppins', system-ui, sans-serif",
    'Space-Grotesk': "'Space Grotesk', system-ui, sans-serif",
    'Outfit': "'Outfit', system-ui, sans-serif",
    'Montserrat': "'Montserrat', system-ui, sans-serif",
    'DM-Sans': "'DM Sans', system-ui, sans-serif",
    'Custom': fallback,
  };
  
  return mapping[font];
}

// ============================================
// MAPPING DES BORDER RADIUS
// ============================================

const BORDER_RADIUS_MAP: Record<BorderRadius, string> = {
  'None': '0px',
  'Small': '4px',
  'Medium': '8px',
  'Large': '16px',
  'Full': '9999px',
};

// ============================================
// MAPPING DES ANIMATIONS
// ============================================

const ANIMATION_SPEED_MAP: Record<AnimationSpeed, string> = {
  'Slow': '0.6s',
  'Normal': '0.3s',
  'Fast': '0.15s',
  'Instant': '0s',
};

const SCROLL_EFFECT_MAP: Record<ScrollEffect, { transform: string; opacity: string }> = {
  'None': { transform: 'none', opacity: '1' },
  'Fade': { transform: 'none', opacity: '0' },
  'Slide': { transform: 'translateY(30px)', opacity: '0' },
  'Zoom': { transform: 'scale(0.95)', opacity: '0' },
  'Parallax': { transform: 'translateY(20px)', opacity: '0' },
};

const HOVER_EFFECT_MAP: Record<HoverEffect, string> = {
  'None': 'none',
  'Scale': 'scale(1.02)',
  'Lift': 'translateY(-4px)',
  'Glow': 'none', // Glow uses box-shadow
  'Shake': 'none', // Shake uses animation
};

// ============================================
// GÉNÉRATION DES PATTERNS DE FOND
// ============================================

function getPatternCSS(pattern: PatternBackground | null, primaryColor: string): string | null {
  if (!pattern || pattern === 'None') return null;
  
  const encodedColor = encodeURIComponent(primaryColor);
  
  const patterns: Record<PatternBackground, string | null> = {
    'None': null,
    'Grid': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1v38h38V1H1z' fill='${encodedColor}' fill-opacity='0.03'/%3E%3C/svg%3E")`,
    'Dots': `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='${encodedColor}' fill-opacity='0.08'/%3E%3C/svg%3E")`,
    'Circuit': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v20M30 40v20M0 30h20M40 30h20M15 15l10 10M35 35l10 10M35 15l-10 10M15 35l10 10' stroke='${encodedColor}' stroke-opacity='0.05' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3' fill='${encodedColor}' fill-opacity='0.08'/%3E%3C/svg%3E")`,
    'Gradient': null, // Géré différemment
    'Custom': null,
  };
  
  return patterns[pattern];
}

// ============================================
// COMPOSANT THEME PROVIDER (SSR)
// ============================================

/**
 * ThemeProvider - Injecte toutes les variables CSS dynamiquement.
 * 
 * @description Ce composant est Server-Side et génère un <style> tag
 * avec toutes les CSS variables calculées à partir de Baserow.
 * Cela évite tout "flash" de contenu non stylé (FOUC).
 * 
 * @example
 * // Dans layout.tsx
 * <ThemeProvider settings={settings} />
 */
export function ThemeProvider({ settings }: ThemeProviderProps) {
  // Générer les palettes de couleurs
  const primaryPalette = generateColorPalette(settings.couleurPrimaire);
  const accentPalette = generateColorPalette(settings.couleurAccent);
  
  // Fonts
  const fontPrimaryCSS = getFontFamilyCSS(settings.fontPrimary, "'Inter', system-ui, sans-serif");
  const fontHeadingCSS = getFontFamilyCSS(settings.fontHeading || settings.fontPrimary, fontPrimaryCSS);
  const fontUrl = generateGoogleFontsUrl(settings.fontPrimary, settings.fontHeading, settings.fontCustomUrl);
  
  // Border radius
  const borderRadiusValue = settings.borderRadius ? BORDER_RADIUS_MAP[settings.borderRadius] : '8px';
  
  // Pattern background
  const patternCSS = getPatternCSS(settings.patternBackground, settings.couleurPrimaire);
  
  // Animations
  const animDuration = settings.animationSpeed ? ANIMATION_SPEED_MAP[settings.animationSpeed] : '0.3s';
  const scrollFx = settings.scrollEffect ? SCROLL_EFFECT_MAP[settings.scrollEffect] : SCROLL_EFFECT_MAP['Fade'];
  const hoverFx = settings.hoverEffect ? HOVER_EFFECT_MAP[settings.hoverEffect] : 'none';
  const animationsEnabled = settings.enableAnimations !== false;
  
  // Générer le CSS complet
  const cssVariables = `
    /* ===========================================
       THEME ENGINE - Variables générées dynamiquement
       Site: ${settings.nomSite}
       =========================================== */
    
    :root {
      /* -------- COULEURS DE FOND -------- */
      --background: ${settings.couleurBackground};
      --foreground: ${settings.couleurText};
      
      /* -------- COULEUR PRIMAIRE -------- */
      --primary: ${settings.couleurPrimaire};
      --primary-50: ${primaryPalette['50']};
      --primary-100: ${primaryPalette['100']};
      --primary-200: ${primaryPalette['200']};
      --primary-300: ${primaryPalette['300']};
      --primary-400: ${primaryPalette['400']};
      --primary-500: ${primaryPalette['500']};
      --primary-600: ${primaryPalette['600']};
      --primary-700: ${primaryPalette['700']};
      --primary-800: ${primaryPalette['800']};
      --primary-900: ${primaryPalette['900']};
      --primary-950: ${primaryPalette['950']};
      
      /* -------- COULEUR ACCENT -------- */
      --accent: ${settings.couleurAccent};
      --accent-50: ${accentPalette['50']};
      --accent-100: ${accentPalette['100']};
      --accent-200: ${accentPalette['200']};
      --accent-300: ${accentPalette['300']};
      --accent-400: ${accentPalette['400']};
      --accent-500: ${accentPalette['500']};
      --accent-600: ${accentPalette['600']};
      --accent-700: ${accentPalette['700']};
      --accent-800: ${accentPalette['800']};
      --accent-900: ${accentPalette['900']};
      --accent-950: ${accentPalette['950']};
      
      /* -------- TYPOGRAPHIE -------- */
      --font-body: ${fontPrimaryCSS};
      --font-heading: ${fontHeadingCSS};
      
      /* -------- ESPACEMENTS & ARRONDIS -------- */
      --radius: ${borderRadiusValue};
      --radius-sm: calc(var(--radius) * 0.5);
      --radius-md: var(--radius);
      --radius-lg: calc(var(--radius) * 1.5);
      --radius-xl: calc(var(--radius) * 2);
      --radius-full: 9999px;
      
      /* -------- HEADER -------- */
      --header-height: 64px;
      
      /* -------- PATTERN DE FOND -------- */
      ${patternCSS ? `--pattern-bg: ${patternCSS};` : ''}
      
      /* -------- ANIMATIONS -------- */
      --anim-duration: ${animationsEnabled ? animDuration : '0s'};
      --anim-enabled: ${animationsEnabled ? '1' : '0'};
      --scroll-transform-initial: ${animationsEnabled ? scrollFx.transform : 'none'};
      --scroll-opacity-initial: ${animationsEnabled ? scrollFx.opacity : '1'};
      --hover-transform: ${animationsEnabled ? hoverFx : 'none'};
      --hover-glow: ${animationsEnabled && settings.hoverEffect === 'Glow' ? '0 0 20px var(--primary-400)' : 'none'};
    }
    
    @media (min-width: 768px) {
      :root {
        --header-height: 80px;
      }
    }
    
    /* Application des fonts */
    body {
      font-family: var(--font-body);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
    }
  `;

  return (
    <>
      {/* Charger les Google Fonts si nécessaire */}
      {fontUrl && (
        <link
          rel="stylesheet"
          href={fontUrl}
          data-theme-fonts="true"
        />
      )}
      
      {/* Injecter les CSS variables */}
      <style
        dangerouslySetInnerHTML={{ __html: cssVariables }}
        data-theme-engine="white-label-factory"
      />
    </>
  );
}

// ============================================
// EXPORTS UTILITAIRES
// ============================================

export { generateColorPalette, hexToHSL, hslToHex };
export type { ThemeProviderProps };

