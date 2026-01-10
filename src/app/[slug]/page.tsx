import { notFound } from 'next/navigation';
import { FactoryPageRenderer } from '@/components/FactoryPageRenderer';
import { getPageBySlug, getGlobalConfig, getSections } from '@/lib/factory-client';

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
    const page = await getPageBySlug(slug);
    const globalConfig = await getGlobalConfig();

    if (!page || !globalConfig) {
        return {
            title: 'Page Not Found',
        };
    }

    const pageSeo = page.seo;
    const globalSeo = globalConfig.seo;

    return {
        title: pageSeo?.metaTitre || globalSeo?.metaTitre || 'Default Title',
        description: pageSeo?.metaDescription || globalSeo?.metaDescription || 'Default Description',
    };
}

// ============================================
// MAIN COMPONENT
// ============================================
export default async function Page({ params }: PageProps) {
    const slug = params.slug;

    const [page, globalConfig, sections] = await Promise.all([
        getPageBySlug(slug),
        getGlobalConfig(),
        getSections(slug),
    ]);

    if (!page || !globalConfig) {
        return notFound();
    }

    return (
        <FactoryPageRenderer
            globalConfig={globalConfig}
            page={page}
            sections={sections}
            legacyProps={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                config: globalConfig as any,
                services: null,
                projects: null,
                advantages: [],
                trustPoints: [],
                galleryItems: [],
                faqItems: null,
                reviews: null,
                blogPosts: null
            }}
        />
    );
}
