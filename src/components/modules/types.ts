// ============================================
// MODULE TYPES - White Label Factory 2025
// ============================================
// Types partagés pour l'architecture modulaire.

import { GlobalSettingsComplete } from '@/lib/types/global-settings';

// Chaque module reçoit la config complète pour piocher ce dont il a besoin
export interface ModuleProps {
  config: GlobalSettingsComplete;
}

// Les styles de variantes possibles (doivent correspondre aux options Baserow)
export type VariantStyle = 
  | 'Minimal' 
  | 'Corporate' 
  | 'Electric' 
  | 'Bold' 
  | 'Centered'  // Pour Navbar
  | 'Mega'      // Pour Footer
  | 'AI' 
  | 'Custom'
  | string; // Pour permettre les valeurs custom si besoin

// Types de modules supportés par le renderer
export type ModuleType = 
  | 'hero' 
  | 'navbar' 
  | 'footer' 
  | 'services' 
  | 'advantages'
  | 'portfolio'
  | 'testimonials'
  | 'trust'
  | 'faq'
  | 'contact'
  | 'gallery';

// Props étendues pour les modules avec variantes
export interface ModuleWithVariantProps extends ModuleProps {
  variant: VariantStyle;
}

// Type utilitaire pour les composants de module
export type ModuleComponent<P extends ModuleProps = ModuleProps> = React.ComponentType<P>;

// ============================================
// TYPES SPÉCIFIQUES NAVBAR
// ============================================

export interface NavItem {
  name: string;
  href: string;
  id: string;
}

export interface NavbarModuleProps extends ModuleProps {
  variant: VariantStyle;
  navItems?: NavItem[];
}

// ============================================
// TYPES SPÉCIFIQUES FOOTER
// ============================================

export interface LegalDoc {
  id: number;
  titre: string;
  slug: string;
  isActive: boolean;
}

export interface FooterModuleProps extends ModuleProps {
  variant: VariantStyle;
  legalDocs?: LegalDoc[];
}
