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
      id: 'og',
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
  
  // Extraire les mots-clés comme tags (max 4)
  const tags = settings.motsCles
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)
    .slice(0, 4);

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
        {/* Background decorations - couleurs dynamiques */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${primaryColor}26 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle, ${accentColor}26 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(30%, 30%)',
          }}
        />

        {/* Logo container - dynamique */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              padding: '3px',
              boxShadow: `0 0 60px ${primaryColor}66, 0 0 100px ${accentColor}4d`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                borderRadius: '21px',
                background: '#0f172a',
              }}
            >
              <span
                style={{
                  fontSize: '48px',
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
        </div>

        {/* Title - dynamique */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              textAlign: 'center',
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
              fontSize: '28px',
              color: '#94a3b8',
              margin: 0,
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            {settings.slogan}
          </p>

          {/* Tags dynamiques */}
          {tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '24px',
              }}
            >
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '100px',
                    background: `${primaryColor}1a`,
                    border: `1px solid ${primaryColor}4d`,
                    color: primaryColor,
                    fontSize: '18px',
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Domain dynamique */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
          <span style={{ color: '#64748b', fontSize: '20px' }}>
            {domain}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
