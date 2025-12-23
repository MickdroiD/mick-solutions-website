'use client';

import { useEffect } from 'react';
import type { GlobalSettingsComplete } from '@/lib/types/global-settings';

interface GlobalStylesProps {
  settings: GlobalSettingsComplete;
}

/**
 * Génère les nuances d'une couleur hexadécimale.
 * Utilise une approche simplifiée basée sur la luminosité.
 */
function generateColorShades(hex: string): Record<string, string> {
  // Convertir hex en RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Fonction pour ajuster la luminosité
  const adjustBrightness = (value: number, factor: number): number => {
    if (factor > 1) {
      // Éclaircir vers le blanc
      return Math.min(255, Math.round(value + (255 - value) * (factor - 1)));
    } else {
      // Assombrir vers le noir
      return Math.max(0, Math.round(value * factor));
    }
  };

  // Générer les nuances (50 = très clair, 900 = très foncé)
  const shades: Record<string, string> = {};
  const factors = {
    50: 1.9,
    100: 1.7,
    200: 1.5,
    300: 1.3,
    400: 1.1,
    500: 1.0,
    600: 0.85,
    700: 0.7,
    800: 0.55,
    900: 0.4,
  };

  for (const [shade, factor] of Object.entries(factors)) {
    const newR = adjustBrightness(r, factor);
    const newG = adjustBrightness(g, factor);
    const newB = adjustBrightness(b, factor);
    shades[shade] = `rgb(${newR}, ${newG}, ${newB})`;
  }

  return shades;
}

/**
 * Composant qui injecte les CSS Variables dynamiquement.
 * Doit être placé dans le layout.tsx.
 * 
 * Cela permet de personnaliser les couleurs du site
 * en fonction des données Baserow du client.
 */
export default function GlobalStyles({ settings }: GlobalStylesProps) {
  useEffect(() => {
    const root = document.documentElement;

    // Générer les palettes de couleurs
    const primaryShades = generateColorShades(settings.couleurPrimaire);
    const accentShades = generateColorShades(settings.couleurAccent);

    // Injecter les variables CSS pour la couleur primaire
    root.style.setProperty('--primary', settings.couleurPrimaire);
    for (const [shade, value] of Object.entries(primaryShades)) {
      root.style.setProperty(`--primary-${shade}`, value);
    }

    // Injecter les variables CSS pour la couleur d'accent
    root.style.setProperty('--accent', settings.couleurAccent);
    for (const [shade, value] of Object.entries(accentShades)) {
      root.style.setProperty(`--accent-${shade}`, value);
    }

    // Log pour debug
    console.log('[GlobalStyles] Couleurs injectées:', {
      primary: settings.couleurPrimaire,
      accent: settings.couleurAccent,
    });
  }, [settings.couleurPrimaire, settings.couleurAccent]);

  // Ce composant ne rend rien visuellement
  return null;
}

/**
 * Version Server Component pour le SSR.
 * Génère les styles inline pour éviter le flash de contenu.
 */
export function GlobalStylesSSR({ settings }: GlobalStylesProps) {
  const primaryShades = generateColorShades(settings.couleurPrimaire);
  const accentShades = generateColorShades(settings.couleurAccent);

  const cssVariables = `
    :root {
      --primary: ${settings.couleurPrimaire};
      ${Object.entries(primaryShades)
        .map(([shade, value]) => `--primary-${shade}: ${value};`)
        .join('\n      ')}
      
      --accent: ${settings.couleurAccent};
      ${Object.entries(accentShades)
        .map(([shade, value]) => `--accent-${shade}: ${value};`)
        .join('\n      ')}
    }
  `;

  return (
    <style
      dangerouslySetInnerHTML={{ __html: cssVariables }}
      data-dynamic-colors="true"
    />
  );
}

