import { ImageResponse } from 'next/og';
import { getGlobalSettingsComplete } from '@/lib/baserow';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Alt text dynamique
export async function generateImageMetadata() {
  const settings = await getGlobalSettingsComplete();
  return [
    {
      id: 'twitter',
      alt: `${settings.nomSite} - ${settings.slogan}`,
      size,
      contentType,
    },
  ];
}

export default async function Image() {
  const settings = await getGlobalSettingsComplete();
  
  // Extraire les couleurs depuis les settings (format hex)
  const primaryColor = settings.couleurPrimaire || '#06b6d4';
  const accentColor = settings.couleurAccent || '#a855f7';
  const bgColor = settings.couleurBackground || '#0a0a0a';
  
  // Initiales pour le logo placeholder
  const initiales = settings.initialesLogo || 
    settings.nomSite.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  
  // Extraire le domaine depuis siteUrl
  const domain = settings.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${bgColor} 0%, #1e1e2e 50%, ${bgColor} 100%)`,
          position: 'relative',
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${primaryColor}1a 0%, transparent 60%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Compact layout for Twitter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '140px',
              height: '140px',
              borderRadius: '28px',
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              padding: '3px',
              boxShadow: `0 0 60px ${primaryColor}66`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                borderRadius: '25px',
                background: '#0f172a',
              }}
            >
              <span
                style={{
                  fontSize: '56px',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {initiales}
              </span>
            </div>
          </div>

          {/* Text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: 'white',
                margin: 0,
              }}
            >
              {settings.nomSite.split(' ')[0]}{' '}
              <span
                style={{
                  background: `linear-gradient(90deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {settings.nomSite.split(' ').slice(1).join(' ')}
              </span>
            </h1>

            <p
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                margin: 0,
                maxWidth: '500px',
              }}
            >
              {settings.slogan}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                }}
              />
              <span style={{ color: '#64748b', fontSize: '18px' }}>
                {domain}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
