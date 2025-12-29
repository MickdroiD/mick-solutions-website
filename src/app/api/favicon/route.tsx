import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getGlobalSettingsComplete } from '@/lib/baserow';

export const runtime = 'edge';

/**
 * API Route: /api/favicon
 * Génère dynamiquement un favicon à partir des settings Baserow
 * Paramètres:
 *   - size: taille en pixels (défaut: 32)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get('size') || '32', 10);
  
  // Clamp size entre 16 et 512
  const clampedSize = Math.min(Math.max(size, 16), 512);

  try {
    const settings = await getGlobalSettingsComplete();
    
    // Couleurs depuis Baserow
    const primaryColor = settings.couleurPrimaire || '#06b6d4';
    const accentColor = settings.couleurAccent || '#a855f7';
    
    // Initiales (1-2 caractères)
    const initiales = (settings.initialesLogo || 
      settings.nomSite.split(' ').map(w => w[0]).join('').substring(0, 2)).toUpperCase();
    
    // Taille de police adaptée
    const fontSize = Math.round(clampedSize * 0.45);
    const borderRadius = Math.round(clampedSize * 0.2);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            borderRadius: `${borderRadius}px`,
          }}
        >
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {initiales}
          </span>
        </div>
      ),
      {
        width: clampedSize,
        height: clampedSize,
      }
    );
  } catch (error) {
    console.error('[API/Favicon] Error:', error);
    
    // Fallback: favicon générique
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
            borderRadius: `${Math.round(clampedSize * 0.2)}px`,
          }}
        >
          <span
            style={{
              fontSize: `${Math.round(clampedSize * 0.45)}px`,
              fontWeight: 700,
              color: 'white',
            }}
          >
            ?
          </span>
        </div>
      ),
      {
        width: clampedSize,
        height: clampedSize,
      }
    );
  }
}

