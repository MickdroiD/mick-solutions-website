import { MetadataRoute } from 'next';
import { getGlobalSettingsComplete, getAllLegalDocs } from '@/lib/baserow';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Récupérer les settings pour l'URL dynamique
  const settings = await getGlobalSettingsComplete();
  const legalDocs = await getAllLegalDocs();
  const baseUrl = settings.siteUrl;
  
  // Pages principales
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/#services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Pages légales dynamiques
  const legalPages: MetadataRoute.Sitemap = (legalDocs ?? []).map((doc) => ({
    url: `${baseUrl}/legal/${doc.Slug}`,
    lastModified: doc.DateMiseAJour ? new Date(doc.DateMiseAJour) : new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [...mainPages, ...legalPages];
}
