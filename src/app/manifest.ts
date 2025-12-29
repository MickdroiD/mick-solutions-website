// ============================================
// MANIFEST.TS - PWA Dynamique (White Label)
// ============================================
// Génère un manifest.webmanifest dynamique basé sur 
// la configuration Baserow du client.

import { MetadataRoute } from 'next';
import { getGlobalSettingsComplete } from '@/lib/baserow';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Récupérer la config globale depuis Baserow
  const config = await getGlobalSettingsComplete();

  // Nom court (max 12 caractères pour PWA)
  const shortName = config.nomSite.length > 12 
    ? config.nomSite.substring(0, 12) 
    : config.nomSite;

  // Icône : Favicon en priorité, sinon Logo
  const iconUrl = config.faviconUrl || config.logoUrl || '/icon.png';

  // Construire le tableau d'icônes
  const icons: MetadataRoute.Manifest['icons'] = [];
  
  if (iconUrl) {
    // Déterminer le type MIME basé sur l'extension
    const extension = iconUrl.split('.').pop()?.toLowerCase() || 'png';
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'webp': 'image/webp',
    };
    const mimeType = mimeTypes[extension] || 'image/png';

    icons.push({
      src: iconUrl,
      sizes: 'any',
      type: mimeType,
    });

    // Ajouter des tailles standards si c'est une image PNG/WebP
    if (['png', 'webp'].includes(extension)) {
      icons.push(
        { src: iconUrl, sizes: '192x192', type: mimeType },
        { src: iconUrl, sizes: '512x512', type: mimeType }
      );
    }
  }

  return {
    name: config.nomSite,
    short_name: shortName,
    description: config.slogan || config.metaDescription || 'Site professionnel',
    start_url: '/',
    display: 'standalone',
    background_color: config.couleurBackground || '#0f172a',
    theme_color: config.couleurPrimaire || '#06b6d4',
    icons: icons.length > 0 ? icons : undefined,
    // Optionnels mais recommandés pour PWA
    orientation: 'portrait-primary',
    scope: '/',
    lang: config.langue || 'fr',
  };
}

