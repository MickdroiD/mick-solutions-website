// ============================================
// FOOTER MODULE - White Label Factory 2025
// ============================================
// Switch intelligent qui sélectionne la variante de Footer.

import type { FooterModuleProps, VariantStyle, LegalDoc } from '../types';
import { FooterMinimal } from './FooterMinimal';
import { FooterCorporate } from './FooterCorporate';
import { FooterElectric } from './FooterElectric';
import { FooterBold } from './FooterBold';
import { FooterMega } from './FooterMega';

// Registry des variantes disponibles
const FooterVariants: Record<string, React.ComponentType<FooterModuleProps>> = {
  Minimal: FooterMinimal,
  Corporate: FooterCorporate,
  Electric: FooterElectric,
  Bold: FooterBold,
  Mega: FooterMega,
};

interface FooterModuleSwitchProps {
  config: FooterModuleProps['config'];
  legalDocs?: LegalDoc[];
}

/**
 * FooterModule - Point d'entrée pour le Footer.
 * 
 * @description Sélectionne automatiquement la variante basée sur:
 * 1. config.footerVariant (priorité)
 * 2. config.themeGlobal (fallback 1)
 * 3. 'Electric' (fallback 2)
 */
export function FooterModule({ config, legalDocs = [] }: FooterModuleSwitchProps) {
  // Déterminer la variante à utiliser
  /* 🔧 FIX: Suppr fallback themeGlobal */
  const variantKey: VariantStyle =
    config.footerVariant ||
    'Electric';

  // Trouver le composant correspondant
  const VariantComponent = FooterVariants[variantKey] || FooterVariants.Electric;

  return <VariantComponent config={config} variant={variantKey} legalDocs={legalDocs} />;
}

// Exports nommés pour import direct si nécessaire
export { FooterMinimal, FooterCorporate, FooterElectric, FooterBold, FooterMega };

