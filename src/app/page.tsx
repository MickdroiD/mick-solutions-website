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
          <SectionRendererWithFallback
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
// SECTION RENDERER WITH LEGACY FALLBACK
// ============================================
interface SectionRendererWithFallbackProps {
  section: Section;
  globalConfig: FactoryData['global'];
  legacyProps: SectionProps;
}

function SectionRendererWithFallback({
  section,
  globalConfig,
  legacyProps
}: SectionRendererWithFallbackProps) {
  // For Hero, use the new SectionRenderer
  if (section.type === 'hero') {
    return <SectionRenderer section={section} globalConfig={globalConfig} />;
  }

  // ⚡ FACTORY V2: Toutes les sections utilisent section.content
  switch (section.type) {
    case 'advantages': {
      const advSection = section as import('@/lib/schemas/factory').AdvantagesSection;
      const { effects, textSettings } = extractSectionEffects(section);
      // Factory V2 utilise "avantages" ou "items"
      const rawContent = advSection.content as Record<string, unknown>;
      const v2Items = (rawContent.avantages || rawContent.items || []) as Array<{
        id?: string;
        titre: string;
        description: string;
        icone?: string;
        badge?: string;
      }>;
      // Adapter les items V2 au format Advantage
      const adaptedAdvantages = v2Items.map((item, idx) => ({
        id: idx + 1,
        Titre: item.titre,
        Description: item.description,
        Icone: item.icone || 'star',
        Badge: item.badge || '',
        Ordre: String(idx + 1),
      }));
      // Récupérer les options de design
      const variant = advSection.design?.variant as 'Grid' | 'List' | 'Cards' | 'Compact' | undefined;
      const cardStyle = advSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
      const hoverEffect = advSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake' | undefined;
      return (
        <AdvantagesSection
          advantages={adaptedAdvantages.length > 0 ? adaptedAdvantages : legacyProps.advantages}
          variant={variant}
          cardStyle={cardStyle}
          hoverEffect={hoverEffect}
          title={advSection.content.titre}
          subtitle={advSection.content.sousTitre || undefined}
          effects={effects}
          textSettings={textSettings}
        />
      );
    }

    case 'services': {
      const servSection = section as import('@/lib/schemas/factory').ServicesSection;
      const { effects, textSettings } = extractSectionEffects(section);
      // Factory V2 utilise "services" ou "items" selon le schéma
      const rawContent = servSection.content as Record<string, unknown>;
      const v2Items = (rawContent.services || rawContent.items || []) as Array<{
        id?: string;
        titre: string;
        description: string;
        icone?: string;
        tagline?: string;
        pointsCles?: string[];
        tarif?: string;
      }>;
      // Adapter les items V2 au format Service
      const adaptedServices = v2Items.map((item, idx) => ({
        id: idx + 1,
        Titre: item.titre,
        Description: item.description,
        Icone: item.icone || 'settings',
        Ordre: String(idx + 1),
        Tagline: item.tagline || null,
        tags: [],
        points_cle: item.pointsCles?.join('\n') || null,
        type: null,
        tarif: item.tarif || null,
      }));
      // Récupérer les options de design
      const variant = servSection.design?.variant as 'Grid' | 'Accordion' | 'Cards' | 'Showcase' | undefined;
      const cardStyle = servSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
      const hoverEffect = servSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake' | undefined;
      // Extraire le titre et sous-titre depuis Baserow
      const titre = servSection.content.titre || 'Nos Services';
      const titreParts = titre.split(' ');
      const sectionTitle = titreParts.slice(0, -1).join(' ') || 'Nos';
      const sectionTitleHighlight = titreParts.slice(-1)[0] || 'Services';

      return (
        <ServicesSection
          services={adaptedServices.length > 0 ? adaptedServices : []}
          variant={variant}
          cardStyle={cardStyle}
          hoverEffect={hoverEffect}
          labels={{
            sectionTitle,
            sectionTitleHighlight,
            sectionSubtitle: servSection.content.sousTitre || '',
          }}
          effects={effects}
          textSettings={textSettings}
        />
      );
    }

    case 'portfolio': {
      const portSection = section as import('@/lib/schemas/factory').PortfolioSection;
      const { effects, textSettings } = extractSectionEffects(section);
      // Factory V2 utilise "projets" 
      const rawContent = portSection.content as Record<string, unknown>;
      const v2Items = (rawContent.projets || []) as Array<{
        id?: string;
        titre?: string;
        nom?: string;
        description?: string;
        descriptionCourte?: string;
        imageUrl?: string;
        slug?: string;
        tags?: string[];
        lien?: string;
        lienSite?: string;
      }>;
      // Adapter les items V2 au format Project
      const adaptedProjects = v2Items.map((item, idx) => ({
        id: idx + 1,
        Nom: item.nom || item.titre || `Projet ${idx + 1}`,
        Slug: item.slug || `projet-${idx + 1}`,
        Tags: (item.tags || []).map((tag, tagIdx) => ({ id: tagIdx + 1, value: tag, color: 'blue' })),
        DescriptionCourte: item.descriptionCourte || item.description || '',
        ImageCouverture: item.imageUrl ? [{ url: item.imageUrl, name: item.nom || item.titre || 'Projet' }] : [],
        LienSite: item.lienSite || item.lien || '',
        Statut: { id: 1, value: 'Publié', color: 'green' },
        Ordre: String(idx + 1),
      }));
      // Récupérer les options de design
      const variant = portSection.design?.variant as 'Electric' | 'Minimal' | 'Corporate' | 'Bold' | undefined;
      const cardStyle = portSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
      const hoverEffect = portSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined;
      const layout = portSection.design?.layout as 'Grid' | 'Masonry' | 'Carousel' | undefined;
      return (
        <PortfolioSection
          projects={adaptedProjects}
          variant={variant}
          cardStyle={cardStyle}
          hoverEffect={hoverEffect}
          layout={layout}
          title={portSection.content.titre}
          subtitle={portSection.content.sousTitre || undefined}
          effects={effects}
          textSettings={textSettings}
        />
      );
    }

    case 'trust': {
      const trustSection = section as import('@/lib/schemas/factory').TrustSection;
      const { effects, textSettings } = extractSectionEffects(section);
      // Factory V2 utilise "trustPoints" ou "items"
      const rawContent = trustSection.content as Record<string, unknown>;
      const v2Items = (rawContent.trustPoints || rawContent.items || []) as Array<{
        id?: string;
        titre: string;
        description: string;
        icone?: string;
        badge?: string;
      }>;
      // Adapter les items V2 au format TrustPoint
      const adaptedTrust = v2Items.map((item, idx) => ({
        id: idx + 1,
        Titre: item.titre,
        Description: item.description,
        Icone: item.icone || 'shield',
        Badge: item.badge || '',
        Ordre: String(idx + 1),
      }));
      // Récupérer les options de design
      const variant = trustSection.design?.variant as 'Electric' | 'Minimal' | 'Corporate' | 'Bold' | undefined;
      const cardStyle = trustSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
      const hoverEffect = trustSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined;
      return (
        <TrustSection
          trustPoints={adaptedTrust.length > 0 ? adaptedTrust : legacyProps.trustPoints}
          variant={variant}
          cardStyle={cardStyle}
          hoverEffect={hoverEffect}
          title={trustSection.content.titre}
          subtitle={trustSection.content.sousTitre || undefined}
          effects={effects}
          textSettings={textSettings}
        />
      );
    }

    case 'gallery': {
      // ⚡ FACTORY V2: Utiliser strictement section.content.items
      const gallerySection = section as import('@/lib/schemas/factory').GallerySection;
      const { effects, textSettings } = extractSectionEffects(section);
      const v2Items = gallerySection.content.items || [];

      // Si pas d'items V2, afficher un message vide (pas de fallback V1)
      if (v2Items.length === 0) {
        return (
          <section id="galerie" className="py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-slate-500">Aucune image dans la galerie</p>
            </div>
          </section>
        );
      }

      // Adapter les items V2 au format attendu par GallerySection
      const adaptedItems = v2Items.map(item => ({
        id: parseInt(item.id) || Math.random(),
        Image: [{ url: item.imageUrl, name: item.titre || 'Image' }],
        Titre: item.titre || '',
        TypeAffichage: item.type as 'Slider' | 'Grille' | 'Zoom',
        Ordre: null,
      }));

      return (
        <GallerySection
          galleryItems={adaptedItems}
          variant={gallerySection.design.variant as 'Grid' | 'Slider' | 'Masonry' | 'AI' | undefined}
          columns={gallerySection.design.columns as '2' | '3' | '4' | 'Auto' | undefined}
          animation={gallerySection.design.animation as 'None' | 'Fade' | 'Slide' | 'Zoom' | 'Flip' | undefined}
          imageStyle={gallerySection.design.imageStyle as 'Square' | 'Rounded' | 'Circle' | 'Custom' | undefined}
          imageFilter={gallerySection.design.imageFilter as 'None' | 'Grayscale' | 'Sepia' | 'Contrast' | 'Blur' | undefined}
          aspectRatio={gallerySection.design.aspectRatio as '1:1' | '4:3' | '16:9' | '3:4' | 'auto' | undefined}
          title={gallerySection.content.titre || 'Notre Galerie'}
          subtitle={gallerySection.content.sousTitre || 'Découvrez nos réalisations.'}
          effects={effects}
          textSettings={textSettings}
        />
      );
    }

    case 'testimonials': {
      const testSection = section as import('@/lib/schemas/factory').TestimonialsSection;
      const { effects, textSettings } = extractSectionEffects(section);
      // Factory V2 utilise "temoignages" ou "items"
      const rawContent = testSection.content as Record<string, unknown>;
      const v2Items = (rawContent.temoignages || rawContent.items || []) as Array<{
        id?: string;
        nom?: string;
        auteur?: string;
        poste?: string;
        message: string;
        note?: number;
        photoUrl?: string;
      }>;
      // Adapter les items V2 au format Review
      const adaptedReviews = v2Items.map((item, idx) => ({
        id: idx + 1,
        NomClient: item.nom || item.auteur || `Client ${idx + 1}`,
        PosteEntreprise: item.poste || '',
        Photo: item.photoUrl ? [{ url: item.photoUrl, name: item.nom || item.auteur || 'Client' }] : [],
        Message: item.message,
        Note: String(item.note || 5),
        Afficher: true,
      }));
      // Récupérer les options de design
      const cardStyle = testSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
      const hoverEffect = testSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined;
      return adaptedReviews.length > 0 ? (
        <TestimonialsSection
          testimonials={adaptedReviews}
          variant={testSection.design.variant as 'Minimal' | 'Carousel' | 'Cards' | 'Video' | 'AI' | undefined}
          cardStyle={cardStyle}
          hoverEffect={hoverEffect}
          title={testSection.content.titre}
          subtitle={testSection.content.sousTitre || undefined}
          effects={effects}
          textSettings={textSettings}
        />
      ) : null;
    }

    case 'faq': {
      const faqSection = section as import('@/lib/schemas/factory').FAQSection;
      const { effects, textSettings } = extractSectionEffects(section);
      // Factory V2 utilise "questions" ou "items"
      const rawContent = faqSection.content as Record<string, unknown>;
      const v2Items = (rawContent.questions || rawContent.items || []) as Array<{
        id?: string;
        question: string;
        reponse: string;
      }>;
      // Adapter les items V2 au format FAQ
      const adaptedFaq = v2Items.map((item, idx) => ({
        id: idx + 1,
        Question: item.question,
        Reponse: item.reponse,
        Ordre: String(idx + 1),
      }));
      return adaptedFaq.length > 0 ? (
        <FAQSection
          faqItems={adaptedFaq}
          variant={faqSection.design.variant as 'Minimal' | 'Accordion' | 'Tabs' | 'Search' | 'AI' | undefined}
          cardStyle={faqSection.design.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined}
          hoverEffect={faqSection.design.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined}
          title={faqSection.content.titre}
          subtitle={faqSection.content.sousTitre || undefined}
          effects={effects}
          textSettings={textSettings}
        />
      ) : null;
    }

    case 'blog': {
      const blogSection = section as import('@/lib/schemas/factory').BlogSection;
      const { effects, textSettings } = extractSectionEffects(section);
      return (
        <BlogSection
          posts={legacyProps.blogPosts}
          isDevMode={process.env.NODE_ENV === 'development'}
          title={blogSection.content.titre}
          subtitle={blogSection.content.sousTitre || undefined}
          variant={blogSection.design?.variant as 'Electric' | 'Minimal' | 'Corporate' | 'Bold' | undefined}
          cardStyle={blogSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Outlined' | 'Glass' | undefined}
          hoverEffect={blogSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined}
          effects={effects}
          textSettings={textSettings}
        />
      );
    }

    case 'contact': {
      const contactSection = section as import('@/lib/schemas/factory').ContactSection;
      const { effects, textSettings } = extractSectionEffects(section);
      return (
        <ContactForm
          title={contactSection.content.titre}
          subtitle={contactSection.content.sousTitre || undefined}
          submitText={contactSection.content.submitText || undefined}
          successMessage={contactSection.content.successMessage || undefined}
          effects={effects}
          textSettings={textSettings}
        />
      );
    }

    case 'infinite-zoom': {
      const zoomSection = section as import('@/lib/schemas/factory').InfiniteZoomSection;
      return (
        <InfiniteZoomSection
          layers={zoomSection.content.layers.map(layer => ({
            id: layer.id,
            imageUrl: layer.imageUrl,
            title: layer.title || undefined,
            description: layer.description || undefined,
            focalPointX: layer.focalPointX,
            focalPointY: layer.focalPointY,
          }))}
          // 🔧 FIX: Utiliser explicitement le titre (parfois nommé 'titre' parfois 'title' dans les données)
          title={zoomSection.content.titre || 'Explorez'}
          subtitle={zoomSection.content.sousTitre || undefined}
          instructionText={zoomSection.content.instructionText}
          variant={zoomSection.design.variant}
          transitionDuration={zoomSection.design.transitionDuration}
          zoomIntensity={zoomSection.design.zoomIntensity}
          enableSound={zoomSection.design.enableSound}
          showIndicators={zoomSection.design.showIndicators}
          showProgress={zoomSection.design.showProgress}
        />
      );
    }

    default:
      // For unrecognized types, use the generic SectionRenderer
      return <SectionRenderer section={section} globalConfig={globalConfig} />;
  }
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
