// ============================================
// SECTION PROPS - Types partagés pour toutes les sections
// ============================================
// Ces types permettent d'avoir une interface cohérente
// pour les effets et styles de texte sur toutes les sections.

import type { EffectSettings, TextSettings } from '@/lib/schemas/factory';

// ============================================
// BASE SECTION PROPS
// ============================================

/**
 * Props de base pour toutes les sections
 * Inclut les effets visuels et les réglages de texte
 */
export interface SectionEffectsProps {
  /** Effets visuels configurés (background, animations, etc.) */
  effects?: Partial<EffectSettings>;
  /** Réglages de typographie (couleurs, tailles, polices) */
  textSettings?: TextSettings;
}

/**
 * Props communes pour les titres de section
 */
export interface SectionTitleProps {
  /** Titre principal de la section */
  title?: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Mot mis en valeur (dégradé) */
  highlight?: string;
}

/**
 * Props combinées pour sections
 */
export interface SectionCommonProps extends SectionEffectsProps, SectionTitleProps {}

// ============================================
// DESIGN OPTIONS (partagées entre sections)
// ============================================

export type CardStyle = 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism';
export type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake';
export type SectionVariant = 'Electric' | 'Minimal' | 'Corporate' | 'Bold' | 'AI' | 'Custom';

// ============================================
// HELPER: Extract effects from Section
// ============================================

import type { Section } from '@/lib/schemas/factory';

/**
 * Extrait effects et textSettings d'une section Factory V2
 * @param section - La section V2
 * @returns Un objet avec effects et textSettings
 */
export function extractSectionEffects(section: Section): SectionEffectsProps {
  // Les sections V2 ont effects et textSettings directement sur l'objet
  const sectionAny = section as Record<string, unknown>;
  
  return {
    effects: (sectionAny.effects as Partial<EffectSettings> | undefined) || undefined,
    textSettings: (sectionAny.textSettings as TextSettings | undefined) || undefined,
  };
}

