import { NextResponse } from 'next/server';
import { getGlobalSettingsComplete } from '@/lib/baserow';

export const dynamic = 'force-dynamic';

/**
 * API Route: /api/manifest
 * Génère un manifest.json dynamique depuis les settings Baserow
 * Pour le support PWA White Label
 */
export async function GET() {
  try {
    const settings = await getGlobalSettingsComplete();

    // Construction du manifest dynamique
    const manifest = {
      name: settings.nomSite,
      short_name: settings.nomSite.split(' ')[0], // Premier mot uniquement
      description: settings.metaDescription || settings.slogan,
      start_url: '/',
      display: 'standalone',
      background_color: settings.couleurBackground || '#0a0a0a',
      theme_color: settings.couleurPrimaire || '#06b6d4',
      orientation: 'portrait-primary',
      // Icons dynamiques si favicon configuré
      icons: settings.faviconUrl ? [
        {
          src: settings.faviconUrl,
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ] : [
        // Fallback: génération d'icônes via API si pas de favicon
        {
          src: '/api/favicon?size=48',
          sizes: '48x48',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/api/favicon?size=96',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/api/favicon?size=192',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/api/favicon?size=512',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      categories: ['business', 'productivity'],
      lang: settings.langue || 'fr',
    };

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600', // Cache 1h
      },
    });
  } catch (error) {
    console.error('[API/Manifest] Error:', error);
    
    // Manifest minimal en cas d'erreur
    return NextResponse.json(
      {
        name: 'White Label Site',
        short_name: 'Site',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#06b6d4',
      },
      { status: 200 }
    );
  }
}

