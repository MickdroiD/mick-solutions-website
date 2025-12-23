import { MetadataRoute } from 'next';
import { getGlobalSettingsComplete } from '@/lib/baserow';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getGlobalSettingsComplete();
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${settings.siteUrl}/sitemap.xml`,
  };
}
