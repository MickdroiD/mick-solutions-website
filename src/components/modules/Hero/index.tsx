// ============================================
// HERO MODULE - Multi-Variant Support
// ============================================
// 🎯 FACTORY V2: Routing intelligent selon la variante
// HeroElectric = variante principale avec toutes les features
// Autres variantes gardées pour compatibilité

import type { ModuleProps, VariantStyle } from '../types';
import { Hero } from './Hero';
import { HeroMinimal } from './HeroMinimal';
import { HeroCorporate } from './HeroCorporate';
import { HeroBold } from './HeroBold';
import { HeroElectric } from './HeroElectric';

interface HeroModuleProps extends ModuleProps {
  variant: VariantStyle;
}

export function HeroModule({ variant, config }: HeroModuleProps) {
  // 🎯 Routing selon la variante configurée
  // HeroElectric est la variante par défaut (plus complète)
  
  switch (variant) {
    case 'Minimal':
      return <HeroMinimal config={config} />;
    
    case 'Corporate':
      return <HeroCorporate config={config} />;
    
    case 'Bold':
      return <HeroBold config={config} />;
    
    case 'Electric':
    default:
      // HeroElectric est la variante par défaut
      // Elle supporte: TechHUDWrapper, Grid Blocks, effects, textSettings
      return <HeroElectric config={config} />;
  }
}

// Réexporter les variantes pour usage direct si besoin
export { HeroMinimal, HeroCorporate, HeroBold, HeroElectric, Hero };
