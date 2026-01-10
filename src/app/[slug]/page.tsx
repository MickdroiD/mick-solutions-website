import { notFound } from 'next/navigation';
import { SectionRenderer } from '@/components/ModuleRenderer';
import { NavbarModule, FooterModule } from '@/components/modules';
import AIAssistant from '@/components/AIAssistant';
import { FactoryPageRenderer } from '@/components/FactoryPageRenderer'; // 🆕 Shared Renderer
import {
    isFactoryV2Configured,
    getFactoryData,
    type FactoryData
} from '@/lib/factory-client';
import { createLegacyConfigFromFactory } from '@/lib/adapters/legacy-adapter';

// Components fallback
// Note: Ideally we refactor these into "Section Renderer" so we don't import them all here.
// But for now we reuse the FactoryPage approach.
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import GallerySection from '@/components/GallerySection';
import FAQSection from '@/components/FAQSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BlogSection from '@/components/BlogSection';
import InfiniteZoomSection from '@/components/InfiniteZoomSection';

// Data fetchers legacy
import {
    getServices,
    getProjects,
    getAllLegalDocs,
    getAdvantages,
    getTrustPoints,
    getGalleryItems,
    getFAQ,
    getReviews,
} from '@/lib/baserow';
import { extractSectionEffects } from '@/lib/types/section-props';

export const dynamic = 'force-dynamic';

// ============================================
// PAGE PROPS
// ============================================
interface PageProps {
    params: {
        slug: string;
    };
}

// ============================================
// GENERATE METADATA
// ============================================
export async function generateMetadata({ params }: PageProps) {
    const slug = params.slug || 'home';
    // TODO: Fetch only metadata for this page
    // For now, getFactoryData fetches config + sections
    try {
        const data = await getFactoryData(slug);
        // Find page specific SEO if available (Factory V2 global config has SEO, but maybe override?)
        // Currently Factory V2 Global Config SEO is for the whole site.
        // Phase 2 allows per-page SEO (To be implemented in fetching logic).
        // For now we use Global Config SEO.
        return {
            title: data.global.seo.metaTitre,
            description: data.global.seo.metaDescription,
        };
    } catch (e) {
        return {
            title: 'Page Not Found',
        };
    }
}

// ============================================
// MAIN COMPONENT
// ============================================
export default async function Page({ params }: PageProps) {
    const slug = params.slug;

    if (!isFactoryV2Configured()) {
        return notFound();
    }

    // 1. Fetch Data
    let factoryData: FactoryData;
    try {
        factoryData = await getFactoryData(slug);
    } catch (error) {
        console.error(`[Page/${slug}] Error fetching data:`, error);
        return notFound();
    }

    if (!factoryData) {
        return notFound();
    }

    const { global, sections } = factoryData;

    // 2. Fetch Legacy Data (Backup for sections that need it)
    // This should eventually be replaced by full Factory V2 data usage
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

    const legacyConfig = createLegacyConfigFromFactory(global, sections);
    const legalDocsFormatted = (legalDocs ?? []).map(doc => ({
        id: doc.id,
        titre: doc.Titre,
        slug: doc.Slug,
        isActive: doc.IsActive,
    }));

    const sectionProps = {
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
        <main className="relative min-h-screen bg-background">
            {/* Debug Banner */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-indigo-500/90 text-white text-xs py-1 px-4 flex items-center justify-between backdrop-blur-sm">
                    <span className="font-mono">
                        📄 <strong>PAGE: {slug}</strong> | Sections: <strong>{sections.length}</strong>
                    </span>
                </div>
            )}

            <NavbarModule config={legacyConfig} />

            {sections.length > 0 ? (
                sections.map((section, index) => (
                    <FactoryPageRenderer
                        key={`section-${section.type}-${index}`}
                        section={section}
                        globalConfig={global}
                        legacyProps={sectionProps}
                    />
                ))
            ) : (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <p className="text-slate-500">Cette page est vide.</p>
                </div>
            )}

            <FooterModule config={legacyConfig} legalDocs={legalDocsFormatted} />

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
