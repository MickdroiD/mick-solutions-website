// ============================================
// LOGO CLOUD BLOCK - Factory V5
// Affichage de logos partenaires/clients
// ============================================

'use client';

import { motion } from 'framer-motion';

interface Logo {
    url: string;
    alt?: string;
    link?: string;
}

export interface LogoCloudBlockProps {
    content: {
        logos: Logo[];
        title?: string;
    };
    style?: {
        columns?: 3 | 4 | 5 | 6;
        grayscale?: boolean; // Logos en N&B, couleur au hover
        gap?: 'sm' | 'md' | 'lg';
        logoHeight?: string;
        animate?: 'none' | 'fadeIn' | 'marquee';
    };
}

const GAP_MAP = { sm: '1rem', md: '2rem', lg: '3rem' };

export default function LogoCloudBlock({ content, style }: LogoCloudBlockProps) {
    const logos = content.logos || [];
    const columns = style?.columns || 5;
    const grayscale = style?.grayscale ?? true;
    const gap = GAP_MAP[style?.gap || 'md'];
    const logoHeight = style?.logoHeight || '3rem';
    const animate = style?.animate || 'fadeIn';

    if (logos.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                Aucun logo configuré
            </div>
        );
    }

    const LogoItem = ({ logo, index }: { logo: Logo; index: number }) => {
        const img = (
            <motion.img
                src={logo.url}
                alt={logo.alt || `Logo ${index + 1}`}
                initial={animate === 'fadeIn' ? { opacity: 0, y: 20 } : {}}
                animate={animate === 'fadeIn' ? { opacity: 1, y: 0 } : {}}
                transition={animate === 'fadeIn' ? { delay: index * 0.1 } : {}}
                whileHover={{ scale: 1.1 }}
                style={{
                    height: logoHeight,
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: grayscale ? 'grayscale(100%) brightness(0.7)' : 'none',
                    opacity: grayscale ? 0.6 : 1,
                    transition: 'filter 0.3s, opacity 0.3s, transform 0.3s',
                }}
                onMouseEnter={(e) => {
                    if (grayscale) {
                        e.currentTarget.style.filter = 'grayscale(0%) brightness(1)';
                        e.currentTarget.style.opacity = '1';
                    }
                }}
                onMouseLeave={(e) => {
                    if (grayscale) {
                        e.currentTarget.style.filter = 'grayscale(100%) brightness(0.7)';
                        e.currentTarget.style.opacity = '0.6';
                    }
                }}
            />
        );

        if (logo.link) {
            return (
                <a
                    href={logo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {img}
                </a>
            );
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {img}
            </div>
        );
    };

    // Marquee animation (défilement infini)
    if (animate === 'marquee') {
        const doubledLogos = [...logos, ...logos]; // Doubler pour effet infini

        return (
            <div>
                {content.title && (
                    <h3 style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {content.title}
                    </h3>
                )}
                <div style={{ overflow: 'hidden' }}>
                    <motion.div
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{
                            duration: logos.length * 3,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            display: 'flex',
                            gap,
                            width: 'max-content',
                        }}
                    >
                        {doubledLogos.map((logo, idx) => (
                            <LogoItem key={idx} logo={logo} index={idx} />
                        ))}
                    </motion.div>
                </div>
            </div>
        );
    }

    // Grid layout
    return (
        <div>
            {content.title && (
                <h3 style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {content.title}
                </h3>
            )}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap,
                    alignItems: 'center',
                }}
            >
                {logos.map((logo, idx) => (
                    <LogoItem key={idx} logo={logo} index={idx} />
                ))}
            </div>
        </div>
    );
}
