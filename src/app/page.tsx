// ============================================
// PAGE PRINCIPALE - White Label Factory V2 (2025)
// ============================================
// Architecture Factory V2 uniquement.
// Si V2 non configuré → affiche une erreur de configuration.

import { SectionRenderer } from '@/components/ModuleRenderer';
import { NavbarModule, FooterModule } from '@/components/modules';
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import GallerySection from '@/components/GallerySection';
import FAQSection from '@/components/FAQSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import AIAssistant from '@/components/AIAssistant';
import { FactoryPageRenderer } from '@/components/FactoryPageRenderer';
import BlogSection, { type BlogPost } from '@/components/BlogSection';
import InfiniteZoomSection from '@/components/InfiniteZoomSection';

// Section data fetchers
import {
  getServices,
  getProjects,
  getAllLegalDocs,
  getAdvantages,
  getTrustPoints,
  getGalleryItems,
  getFAQ,
  getReviews,
  type Service,
  type Project,
  type Advantage,
  type TrustPoint,
  type GalleryItem,
  type FAQ,
  type Review,
} from '@/lib/baserow';

// Section Props Helper
import { extractSectionEffects } from '@/lib/types/section-props';

// Factory V2 imports
import {
  isFactoryV2Configured,
  getFactoryData,
  type FactoryData,
} from '@/lib/factory-client';
import { createLegacyConfigFromFactory } from '@/lib/adapters/legacy-adapter';
import type { GlobalSettingsComplete } from '@/lib/types/global-settings';
import type { Section } from '@/lib/schemas/factory';

// Force le rendu dynamique pour avoir les données fraîches
export const dynamic = 'force-dynamic';

// ============================================
// INTERFACE POUR LES PROPS DES SECTIONS
// ============================================
interface SectionProps {
  config: GlobalSettingsComplete;
  services: Service[] | null;
  projects: Project[] | null;
  advantages: Advantage[];
  trustPoints: TrustPoint[];
  galleryItems: GalleryItem[];
  faqItems: FAQ[] | null;
  reviews: Review[] | null;
  blogPosts: BlogPost[] | null;
}

// ============================================
// ERROR COMPONENT
// ============================================
function ConfigurationError() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Configuration Requise
        </h1>

        <p className="text-slate-400 mb-8 text-lg">
          Factory V2 n&apos;est pas configuré. Veuillez définir les variables d&apos;environnement nécessaires.
        </p>

        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 text-left mb-8">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-sm">1</span>
            Variables d&apos;environnement requises
          </h2>
          <pre className="bg-black/30 rounded-lg p-4 text-sm overflow-x-auto">
            <code className="text-emerald-400">
              {`BASEROW_API_TOKEN=your_token
BASEROW_FACTORY_GLOBAL_ID=xxx
BASEROW_FACTORY_SECTIONS_ID=xxx
ADMIN_PASSWORD=123456`}
            </code>
          </pre>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 text-left mb-8">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-sm">2</span>
            Créer un nouveau client
          </h2>
          <pre className="bg-black/30 rounded-lg p-4 text-sm overflow-x-auto">
            <code className="text-yellow-400">npx tsx scripts/create-client.ts &quot;Nom du Client&quot;</code>
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://docs.mick-solutions.ch/factory"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 transition-colors"
          >
            Documentation
          </a>
          <a
            href="/admin"
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            Admin Panel
          </a>
        </div>
      </div>
    </main>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default async function Home() {
  // ========================================
  // CHECK: Factory V2 must be configured
  // ========================================
  if (!isFactoryV2Configured()) {
    console.error('🚫 [Page] Factory V2 not configured. Missing env vars.');
    return <ConfigurationError />;
  }

  console.log('🏭 [Page] Using Factory V2 architecture');

  try {
    // Fetch V2 data
    const factoryData = await getFactoryData('home');

    // Also fetch section data from Baserow tables
    const [services, projects, legalDocs, advantages, trustPoints, galleryItems, faqItems, reviews] =
      await Promise.all([
        getServices(),
        getProjects(),
        getAllLegalDocs(),
        getAdvantages(),
        getTrustPoints(),
        getGalleryItems(),
        getFAQ(),
        getReviews(),
      ]);

    // Create legacy config for components that need it
    const legacyConfig = createLegacyConfigFromFactory(
      factoryData.global,
      factoryData.sections
    );

    // Legal docs formatting
    const legalDocsFormatted = (legalDocs ?? []).map(doc => ({
      id: doc.id,
      titre: doc.Titre,
      slug: doc.Slug,
      isActive: doc.IsActive,
    }));

    // Props for section rendering
    const sectionProps: SectionProps = {
      config: legacyConfig,
      services,
      projects,
      advantages,
      trustPoints,
      galleryItems,
      faqItems,
      reviews,
      blogPosts: null,
    };

    return (
      <FactoryPage
        factoryData={factoryData}
        legacyConfig={legacyConfig}
        sectionProps={sectionProps}
        legalDocs={legalDocsFormatted}
      />
    );
  } catch (error) {
    console.error('Factory V2 error:', error);
    return (
      <main className="min-h-screen bg-red-950 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <p className="text-red-200 mb-4">
            Impossible de charger les données Factory V2.
          </p>
          <pre className="text-xs text-left bg-black/20 p-4 rounded-lg overflow-auto">
            {String(error)}
          </pre>
        </div>
      </main>
    );
  }
}

// ============================================
// FACTORY PAGE COMPONENT
// ============================================
interface FactoryPageProps {
  factoryData: FactoryData;
  legacyConfig: GlobalSettingsComplete;
  sectionProps: SectionProps;
  legalDocs: { id: number; titre: string; slug: string; isActive: boolean }[];
}

function FactoryPage({ factoryData, legacyConfig, sectionProps, legalDocs }: FactoryPageProps) {
  const { global, sections } = factoryData;

  // Check if at least one section is active
  const hasAnySectionEnabled = sections.length > 0;

  return (
    <main className="relative min-h-screen bg-background">
      {/* Debug Banner - Factory V2 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-emerald-500/90 text-black text-xs py-1 px-4 flex items-center justify-between backdrop-blur-sm">
          <span className="font-mono">
            🏭 <strong>FACTORY V2</strong> | Site: <strong>{global.identity.nomSite}</strong> |
            Theme: <strong>{global.branding.themeGlobal}</strong> |
            Sections: <strong>{sections.length}</strong> active
          </span>
          <span className="text-emerald-800">
            [V2 MODE]
          </span>
        </div>
      )}

      {/* ===== NAVBAR ===== */}
      <NavbarModule config={legacyConfig} />

      {/* ===== SECTIONS FROM FACTORY V2 ===== */}
      {hasAnySectionEnabled ? (
        sections.map((section, index) => (
          <FactoryPageRenderer
            key={`section-${section.type}-${index}`}
            section={section}
            globalConfig={global}
            legacyProps={sectionProps}
          />
        ))
      ) : (
        <EmptyStateSection />
      )}

      {/* ===== FOOTER ===== */}
      <FooterModule config={legacyConfig} legalDocs={legalDocs} />

      {/* ===== AI ASSISTANT ===== */}
      {global.ai.aiMode !== 'Disabled' && (
        <AIAssistant
          siteName={global.identity.nomSite}
          industry={global.ai.aiIndustry || undefined}
          primaryColor={global.branding.couleurPrimaire}
          accentColor={global.branding.couleurAccent}
          provider={global.ai.aiProvider as 'openai' | 'anthropic' | undefined}
          systemPrompt={global.ai.aiSystemPrompt || undefined}
        />
      )}
    </main>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
function EmptyStateSection() {
  // En production, on ne montre rien si aucune section n'est active
  // (L'utilisateur ne veut pas voir de "Héros par défaut")
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <section className="min-h-[40vh] flex items-center justify-center px-4 py-12 border-2 border-dashed border-slate-800 m-8 rounded-3xl bg-slate-900/50">
      <div className="text-center max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Aucune section active
        </h2>
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left inline-block">
          <p className="text-amber-300 text-xs font-medium mb-1">🔧 Mode Développeur</p>
          <p className="text-amber-200/70 text-[10px]">
            Ajoutez des sections via /admin/v2
          </p>
        </div>
      </div>
    </section>
  );
}
