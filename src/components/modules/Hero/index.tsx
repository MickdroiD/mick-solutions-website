// ============================================
// HERO MODULE - Switch de variantes
// ============================================

import type { ModuleProps, VariantStyle } from '../types';
import { HeroMinimal } from './HeroMinimal';
import { HeroCorporate } from './HeroCorporate';
import { HeroElectric } from './HeroElectric';
import { HeroBold } from './HeroBold';

interface HeroModuleProps extends ModuleProps {
  variant: VariantStyle;
}

export function HeroModule({ variant, config }: HeroModuleProps) {
  // Logique de fallback si la variante demandée n'existe pas
  switch (variant) {
    case 'Minimal':
      return <HeroMinimal config={config} />;
    case 'Corporate':
      return <HeroCorporate config={config} />;
    case 'Electric':
      return <HeroElectric config={config} />;
    case 'Bold':
      return <HeroBold config={config} />;
    // TODO: Ajouter 'AI' quand implémenté
    default:
      // Fallback intelligent: utilise le thème global ou Electric par défaut
      console.warn(`[HeroModule] Variante inconnue: ${variant}, fallback vers Electric`);
      return <HeroElectric config={config} />;
  }
}

// Réexporter les variantes pour usage direct si nécessaire
export { HeroMinimal } from './HeroMinimal';
export { HeroCorporate } from './HeroCorporate';
export { HeroElectric } from './HeroElectric';
export { HeroBold } from './HeroBold';

