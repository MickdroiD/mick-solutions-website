// ============================================
// USE THEME HOOK - White Label Factory 2025
// ============================================
// Hook pour accéder aux couleurs du thème dans les composants clients.

'use client';

import { useEffect, useState } from 'react';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  foreground: string;
}

interface ThemeValues {
  colors: ThemeColors;
  radius: string;
  fontBody: string;
  fontHeading: string;
}

/**
 * useTheme - Accède aux valeurs CSS du thème actuel.
 * 
 * @description Lit les CSS variables injectées par ThemeProvider
 * et les expose sous forme d'objet JavaScript. Utile pour les
 * composants qui ont besoin des couleurs en JS (canvas, SVG, etc.)
 * 
 * @example
 * const { colors } = useTheme();
 * <div style={{ backgroundColor: colors.primary }}>...</div>
 */
export function useTheme(): ThemeValues {
  const [theme, setTheme] = useState<ThemeValues>({
    colors: {
      primary: '#06b6d4',
      primaryLight: '#22d3ee',
      primaryDark: '#0891b2',
      accent: '#a855f7',
      accentLight: '#c084fc',
      accentDark: '#9333ea',
      background: '#0a0a0a',
      foreground: '#ededed',
    },
    radius: '8px',
    fontBody: "'Inter', system-ui, sans-serif",
    fontHeading: "'Inter', system-ui, sans-serif",
  });

  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    const getVar = (name: string, fallback: string): string => {
      const value = computedStyle.getPropertyValue(name).trim();
      return value || fallback;
    };

    setTheme({
      colors: {
        primary: getVar('--primary', '#06b6d4'),
        primaryLight: getVar('--primary-400', '#22d3ee'),
        primaryDark: getVar('--primary-600', '#0891b2'),
        accent: getVar('--accent', '#a855f7'),
        accentLight: getVar('--accent-400', '#c084fc'),
        accentDark: getVar('--accent-600', '#9333ea'),
        background: getVar('--background', '#0a0a0a'),
        foreground: getVar('--foreground', '#ededed'),
      },
      radius: getVar('--radius', '8px'),
      fontBody: getVar('--font-body', "'Inter', system-ui, sans-serif"),
      fontHeading: getVar('--font-heading', "'Inter', system-ui, sans-serif"),
    });
  }, []);

  return theme;
}

/**
 * useThemeColor - Récupère une couleur spécifique du thème.
 * 
 * @param colorVar - Nom de la variable CSS (ex: '--primary-500')
 * @param fallback - Valeur par défaut
 * 
 * @example
 * const primaryColor = useThemeColor('--primary', '#06b6d4');
 */
export function useThemeColor(colorVar: string, fallback: string = '#06b6d4'): string {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(colorVar).trim();
    if (value) setColor(value);
  }, [colorVar]);

  return color;
}

/**
 * useIsDarkMode - Détecte si le thème est sombre basé sur le background.
 * 
 * @returns true si le background est sombre
 */
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const bg = getComputedStyle(root).getPropertyValue('--background').trim();
    
    if (bg) {
      // Convertir hex en luminosité
      const hex = bg.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      setIsDark(luminance < 0.5);
    }
  }, []);

  return isDark;
}

export default useTheme;

