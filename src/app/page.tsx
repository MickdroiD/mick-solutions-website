// ============================================
// PAGE PRINCIPALE - White Label Factory 2025
// ============================================
// Architecture modulaire avec Registry Pattern.

import { ModuleRenderer } from '@/components/ModuleRenderer';
import { NavbarModule, FooterModule } from '@/components/modules';
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import { 
  getServices, 
  getProjects, 
  getGlobalSettingsComplete, 
  getAllLegalDocs,
  getAdvantages,
  getTrustPoints,
} from '@/lib/baserow';

// Force le rendu dynamique pour avoir les données fraîches
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch en parallèle pour optimiser les performances
  const [services, projects, config, legalDocs, advantages, trustPoints] = await Promise.all([
    getServices(),
    getProjects(),
    getGlobalSettingsComplete(),
    getAllLegalDocs(),
    getAdvantages(),
    getTrustPoints(),
  ]);

  // Gestion d'erreur si config null
  if (!config) {
    return (
      <main className="min-h-screen bg-red-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Erreur de configuration</h1>
          <p className="text-red-200">Impossible de charger les paramètres depuis Baserow.</p>
        </div>
      </main>
    );
  }

  // Transformer les legalDocs pour le format attendu par FooterModule
  const legalDocsFormatted = (legalDocs ?? []).map(doc => ({
    id: doc.id,
    titre: doc.Titre,
    slug: doc.Slug,
    isActive: doc.IsActive,
  }));

  return (
    <main className="relative min-h-screen bg-background">
      {/* Debug Banner - Visible uniquement en dev */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-400/90 text-black text-xs py-1 px-4 flex items-center justify-between backdrop-blur-sm">
          <span className="font-mono">
            🎨 Site: <strong>{config.nomSite}</strong> | Theme: <strong>{config.themeGlobal}</strong> | 
            Navbar: <strong>{config.navbarVariant || 'Electric'}</strong> | 
            Hero: <strong>{config.heroVariant || 'Electric'}</strong> |
            Footer: <strong>{config.footerVariant || 'Electric'}</strong>
          </span>
          <span className="text-yellow-700">
            [DEV MODE]
          </span>
        </div>
      )}

      {/* ===== NAVBAR - Module avec variantes ===== */}
      {config.showNavbar && (
        <NavbarModule config={config} />
      )}

      {/* ===== HERO - Module Renderer ===== */}
      {config.showHero && (
        <ModuleRenderer 
          module="hero" 
          variant={config.heroVariant} 
          config={config} 
        />
      )}

      {/* ===== ADVANTAGES ===== */}
      {config.showAdvantages && (
        <AdvantagesSection advantages={advantages} />
      )}

      {/* ===== SERVICES ===== */}
      {config.showServices && (
        <ServicesSection services={services ?? []} />
      )}

      {/* ===== PORTFOLIO ===== */}
      {config.showPortfolio && (
        <PortfolioSection projects={projects ?? []} />
      )}

      {/* ===== TRUST ===== */}
      {config.showTrust && (
        <TrustSection trustPoints={trustPoints} />
      )}

      {/* ===== CONTACT ===== */}
      {config.showContact && (
        <ContactForm />
      )}

      {/* ===== FOOTER - Module avec variantes ===== */}
      <FooterModule config={config} legalDocs={legalDocsFormatted} />

      {/* Placeholder pour les modules futurs */}
      {/* 
      {config.showGallery && (
        <ModuleRenderer module="gallery" variant={config.galleryVariant} config={config} data={galleryItems} />
      )}
      
      {config.showFaq && (
        <ModuleRenderer module="faq" variant={config.faqVariant} config={config} data={faqItems} />
      )}
      
      {config.showTestimonials && (
        <ModuleRenderer module="testimonials" variant={config.testimonialsVariant} config={config} data={reviews} />
      )}
      
      {config.showAiAssistant && (
        <AIAssistant config={config} />
      )}
      */}
    </main>
  );
}
