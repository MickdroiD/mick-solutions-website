
import { FactoryPageRenderer } from '@/components/FactoryPageRenderer';
import { getGlobalConfig, getSections, getPageBySlug as getPage } from '@/lib/factory-client';
import { type Section } from '@/lib/schemas/factory';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const globalConfig = await getGlobalConfig();
  const page = await getPage('home');
  const sections: Section[] = await getSections('home');

  if (!globalConfig || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Configuration manquante. Veuillez vérifier Baserow.</p>
      </div>
    );
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
