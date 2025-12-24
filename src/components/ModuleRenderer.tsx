// ============================================
// MODULE RENDERER - White Label Factory 2025
// ============================================
// Le cerveau qui décide quoi afficher selon la config Baserow.

import React from 'react';
import { GlobalSettingsComplete } from '@/lib/types/global-settings';
import { HeroModule } from './modules/Hero';
import type { ModuleType, VariantStyle } from './modules/types';

// Props du renderer
interface ModuleRendererProps {
  module: ModuleType;
  variant?: VariantStyle | null;
  config: GlobalSettingsComplete;
}

/**
 * ModuleRenderer - Composant principal du système White Label.
 * 
 * @description Lit la config Baserow et assemble dynamiquement le site
 * en choisissant la bonne variante de chaque module.
 * 
 * @example
 * <ModuleRenderer module="hero" variant={config.heroVariant} config={config} />
 */
export function ModuleRenderer({ module, variant, config }: ModuleRendererProps) {
  // Sécurité : si pas de variante définie, utilise le thème global ou 'Electric' par défaut
  const safeVariant: VariantStyle = variant || config.themeGlobal || 'Electric';

  switch (module) {
    case 'hero':
      return <HeroModule variant={safeVariant} config={config} />;
    
    case 'navbar':
      // TODO: Implémenter NavbarModule
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'footer':
      // TODO: Implémenter FooterModule
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'services':
      // TODO: Implémenter ServicesModule avec data
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'advantages':
      // TODO: Implémenter AdvantagesModule avec data
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'portfolio':
      // TODO: Implémenter PortfolioModule avec data
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'testimonials':
      // TODO: Implémenter TestimonialsModule avec data
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'trust':
      // TODO: Implémenter TrustModule avec data
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'faq':
      // TODO: Implémenter FAQModule avec data
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'contact':
      // TODO: Implémenter ContactModule
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    case 'gallery':
      // TODO: Implémenter GalleryModule avec data
      console.warn(`[ModuleRenderer] Module ${module} pas encore implémenté`);
      return null;
    
    default:
      console.warn(`[ModuleRenderer] Module inconnu: ${module}`);
      return null;
  }
}

/**
 * ModuleRendererDebug - Version avec debug visuel pour le développement.
 * Affiche un placeholder coloré pour les modules non implémentés.
 */
export function ModuleRendererDebug({ module, variant, config }: ModuleRendererProps) {
  const safeVariant: VariantStyle = variant || config.themeGlobal || 'Electric';

  // Modules implémentés
  const implementedModules: ModuleType[] = ['hero'];
  
  if (implementedModules.includes(module)) {
    return <ModuleRenderer module={module} variant={safeVariant} config={config} />;
  }

  // Placeholder visuel pour les modules non implémentés
  return (
    <div className="bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg p-8 m-4">
      <div className="text-center">
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
          Module à implémenter
        </div>
        <div className="text-xl font-bold text-zinc-300 capitalize">
          {module}
        </div>
        <div className="text-sm text-zinc-500 mt-1">
          Variante: <span className="text-primary-400">{safeVariant}</span>
        </div>
      </div>
    </div>
  );
}

export default ModuleRenderer;
