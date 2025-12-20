import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Mick Solutions - Automatisation sur-mesure pour PME Suisses';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1e1e2e 50%, #0a0a0a 100%)',
          position: 'relative',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30%, 30%)',
          }}
        />

        {/* Logo container with glow */}
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
              background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
              padding: '3px',
              boxShadow: '0 0 60px rgba(34,211,238,0.4), 0 0 100px rgba(168,85,247,0.3)',
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
                  background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                MS
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
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
            Mick{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Solutions
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
            Automatisation sur-mesure pour PME Suisses
          </p>

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            {['DevOps', 'n8n', 'Automation', '🇨🇭 Genève'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  background: 'rgba(34,211,238,0.1)',
                  border: '1px solid rgba(34,211,238,0.3)',
                  color: '#22d3ee',
                  fontSize: '18px',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Domain */}
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
            www.mick-solutions.ch
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

