// ============================================
// MODULE RENDERER - White Label Factory 2025
// ============================================
// Le cerveau qui décide quoi afficher selon la config.
// Supporte à la fois:
// - Factory V2 (Section-based avec JSON content/design)
// - Legacy (GlobalSettingsComplete flat structure)

import React from 'react';
import { GlobalSettingsComplete } from '@/lib/types/global-settings';
import { HeroModule } from './modules/Hero';
import AIAssistant from './AIAssistant';
import type { ModuleType, VariantStyle } from './modules/types';
import type {
  GlobalConfig,
  Section,
  HeroSection,
  ServicesSection,
  AdvantagesSection,
  GallerySection,
  PortfolioSection,
  TestimonialsSection,
  TrustSection,
  FAQSection,
  ContactSection,
  BlogSection,
  AIAssistantSection,
} from '@/lib/schemas/factory';
import { adaptHeroSectionToLegacy } from '@/lib/adapters/legacy-adapter';

// ============================================
// LEGACY PROPS (backward compatibility)
// ============================================

interface LegacyModuleRendererProps {
  module: ModuleType;
  variant?: VariantStyle | null;
  config: GlobalSettingsComplete;
}

// ============================================
// FACTORY V2 PROPS (new architecture)
// ============================================

interface FactoryModuleRendererProps {
  section: Section;
  globalConfig: GlobalConfig;
}

// ============================================
// LEGACY MODULE RENDERER
// ============================================

/**
 * ModuleRenderer (Legacy Mode)
 * Utilisé pour la rétrocompatibilité avec l'ancienne architecture.
 */
export function ModuleRenderer({ module, variant, config }: LegacyModuleRendererProps) {
  const safeVariant: VariantStyle = variant || 'Electric';

  switch (module) {
    case 'hero':
      return <HeroModule variant={safeVariant} config={config} />;

    case 'navbar':
    case 'footer':
    case 'services':
    case 'advantages':
    case 'portfolio':
    case 'testimonials':
    case 'trust':
    case 'faq':
    case 'contact':
    case 'gallery':
      // Ces modules sont rendus directement dans page.tsx avec leurs composants spécifiques
      console.warn(`[ModuleRenderer] Module ${module} doit être rendu directement`);
      return null;

    default:
      console.warn(`[ModuleRenderer] Module inconnu: ${module}`);
      return null;
  }
}

// ============================================
// FACTORY V2 MODULE RENDERER
// ============================================

/**
 * SectionRenderer (Factory V2 Mode)
 * Nouveau renderer basé sur les sections avec JSON content/design.
 * 
 * @description Adapte les données Section V2 vers le format attendu
 * par les composants UI existants.
 */
export function SectionRenderer({ section, globalConfig }: FactoryModuleRendererProps) {
  // Ne pas rendre les sections inactives
  if (!section.isActive) {
    return null;
  }

  switch (section.type) {
    // ========== HERO ==========
    case 'hero': {
      const heroSection = section as HeroSection;
      const legacyConfig = adaptHeroSectionToLegacy(heroSection, globalConfig);
      const variant = heroSection.design.variant || 'Electric';

      return <HeroModule variant={variant as VariantStyle} config={legacyConfig} />;
    }

    // ========== SERVICES ==========
    case 'services': {
      const servicesSection = section as ServicesSection;
      // Le composant ServicesSection attend des props spécifiques
      // On retourne un placeholder pour l'instant - sera connecté plus tard
      console.log('[SectionRenderer] Services section:', servicesSection.content);
      return (
        <SectionPlaceholder
          type="services"
          title={servicesSection.content.titre}
          variant={servicesSection.design.variant}
        />
      );
    }

    // ========== ADVANTAGES ==========
    case 'advantages': {
      const advantagesSection = section as AdvantagesSection;
      console.log('[SectionRenderer] Advantages section:', advantagesSection.content);
      return (
        <SectionPlaceholder
          type="advantages"
          title={advantagesSection.content.titre}
          variant={advantagesSection.design.variant}
        />
      );
    }

    // ========== GALLERY ==========
    case 'gallery': {
      const gallerySection = section as GallerySection;
      console.log('[SectionRenderer] Gallery section:', gallerySection.content);
      return (
        <SectionPlaceholder
          type="gallery"
          title={gallerySection.content.titre}
          variant={gallerySection.design.variant}
        />
      );
    }

    // ========== PORTFOLIO ==========
    case 'portfolio': {
      const portfolioSection = section as PortfolioSection;
      console.log('[SectionRenderer] Portfolio section:', portfolioSection.content);
      return (
        <SectionPlaceholder
          type="portfolio"
          title={portfolioSection.content.titre}
          variant={portfolioSection.design.variant}
        />
      );
    }

    // ========== TESTIMONIALS ==========
    case 'testimonials': {
      const testimonialsSection = section as TestimonialsSection;
      console.log('[SectionRenderer] Testimonials section:', testimonialsSection.content);
      return (
        <SectionPlaceholder
          type="testimonials"
          title={testimonialsSection.content.titre}
          variant={testimonialsSection.design.variant}
        />
      );
    }

    // ========== TRUST ==========
    case 'trust': {
      const trustSection = section as TrustSection;
      console.log('[SectionRenderer] Trust section:', trustSection.content);
      return (
        <SectionPlaceholder
          type="trust"
          title={trustSection.content.titre}
          variant={trustSection.design.variant}
        />
      );
    }

    // ========== FAQ ==========
    case 'faq': {
      const faqSection = section as FAQSection;
      console.log('[SectionRenderer] FAQ section:', faqSection.content);
      return (
        <SectionPlaceholder
          type="faq"
          title={faqSection.content.titre}
          variant={faqSection.design.variant}
        />
      );
    }

    // ========== CONTACT ==========
    case 'contact': {
      const contactSection = section as ContactSection;
      console.log('[SectionRenderer] Contact section:', contactSection.content);
      return (
        <SectionPlaceholder
          type="contact"
          title={contactSection.content.titre}
          variant={contactSection.design.variant}
        />
      );
    }

    // ========== BLOG ==========
    case 'blog': {
      const blogSection = section as BlogSection;
      console.log('[SectionRenderer] Blog section:', blogSection.content);
      return (
        <SectionPlaceholder
          type="blog"
          title={blogSection.content.titre}
          variant={blogSection.design.variant}
        />
      );
    }

    // ========== AI ASSISTANT ==========
    case 'ai-assistant': {
      const aiSection = section as AIAssistantSection;

      // Map section content/design to AIAssistant props
      return (
        <AIAssistant
          siteName={globalConfig.identity.nomSite}
          industry={globalConfig.ai.aiIndustry || undefined}
          welcomeMessage={aiSection.content.welcomeMessage}
          placeholder={aiSection.content.placeholder}
          avatarUrl={aiSection.content.avatarUrl || undefined}
          primaryColor={globalConfig.branding.couleurPrimaire}
          accentColor={globalConfig.branding.couleurAccent}
          position={aiSection.design.position === 'bottom-left' ? 'bottom-left' : 'bottom-right'}
          provider={globalConfig.ai.aiProvider as 'openai' | 'anthropic' | undefined}
          systemPrompt={globalConfig.ai.aiSystemPrompt || undefined}
        />
      );
    }

    // ========== CUSTOM ==========
    case 'custom': {
      console.log('[SectionRenderer] Custom section');
      return (
        <SectionPlaceholder
          type="custom"
          title="Section Personnalisée"
          variant="Custom"
        />
      );
    }

    default:
      console.warn(`[SectionRenderer] Type de section inconnu: ${(section as Section).type}`);
      return null;
  }
}

// ============================================
// SECTION PLACEHOLDER (Dev Mode)
// ============================================

interface SectionPlaceholderProps {
  type: string;
  title?: string;
  variant?: string;
}

function SectionPlaceholder({ type, title, variant }: SectionPlaceholderProps) {
  // Ne montrer que en mode développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg p-8 m-4">
      <div className="text-center">
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
          Section V2 - À connecter
        </div>
        <div className="text-xl font-bold text-zinc-300 capitalize">
          {title || type}
        </div>
        <div className="text-sm text-zinc-500 mt-1">
          Type: <span className="text-primary-400">{type}</span>
          {variant && (
            <> | Variante: <span className="text-accent-400">{variant}</span></>
          )}
        </div>
        <div className="mt-4 text-xs text-zinc-600">
          💡 Les données sont chargées. Connecter le composant UI.
        </div>
      </div>
    </div>
  );
}

// ============================================
// DEBUG RENDERER
// ============================================

/**
 * ModuleRendererDebug - Version avec debug visuel pour le développement.
 * Affiche un placeholder coloré pour les modules non implémentés.
 */
export function ModuleRendererDebug({ module, variant, config }: LegacyModuleRendererProps) {
  const safeVariant: VariantStyle = variant || config.themeGlobal || 'Electric';
  const implementedModules: ModuleType[] = ['hero'];

  if (implementedModules.includes(module)) {
    return <ModuleRenderer module={module} variant={safeVariant} config={config} />;
  }

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

// ============================================
// EXPORTS
// ============================================

export default ModuleRenderer;
