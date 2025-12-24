// ============================================
// NAVBAR MODULE - White Label Factory 2025
// ============================================
// Switch intelligent qui sélectionne la variante de Navbar.

import type { NavbarModuleProps, VariantStyle, NavItem } from '../types';
import { NavbarMinimal } from './NavbarMinimal';
import { NavbarCorporate } from './NavbarCorporate';
import { NavbarElectric } from './NavbarElectric';
import { NavbarBold } from './NavbarBold';
import { NavbarCentered } from './NavbarCentered';

// Items de navigation par défaut (peuvent être overridés)
export const defaultNavItems: NavItem[] = [
  { name: 'Avantages', href: '#avantages', id: 'avantages' },
  { name: 'Services', href: '#services', id: 'services' },
  { name: 'Portfolio', href: '#portfolio', id: 'portfolio' },
  { name: 'Confiance', href: '#confiance', id: 'confiance' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

// Registry des variantes disponibles
const NavbarVariants: Record<string, React.ComponentType<NavbarModuleProps>> = {
  Minimal: NavbarMinimal,
  Corporate: NavbarCorporate,
  Electric: NavbarElectric,
  Bold: NavbarBold,
  Centered: NavbarCentered,
};

interface NavbarModuleSwitchProps {
  config: NavbarModuleProps['config'];
  navItems?: NavItem[];
}

/**
 * NavbarModule - Point d'entrée pour la Navbar.
 * 
 * @description Sélectionne automatiquement la variante basée sur:
 * 1. config.navbarVariant (priorité)
 * 2. config.themeGlobal (fallback 1)
 * 3. 'Electric' (fallback 2)
 */
export function NavbarModule({ config, navItems = defaultNavItems }: NavbarModuleSwitchProps) {
  // Déterminer la variante à utiliser
  const variantKey: VariantStyle = 
    config.navbarVariant || 
    config.themeGlobal || 
    'Electric';
  
  // Trouver le composant correspondant
  const VariantComponent = NavbarVariants[variantKey] || NavbarVariants.Electric;
  
  return <VariantComponent config={config} variant={variantKey} navItems={navItems} />;
}

// Exports nommés pour import direct si nécessaire
export { NavbarMinimal, NavbarCorporate, NavbarElectric, NavbarBold, NavbarCentered };

