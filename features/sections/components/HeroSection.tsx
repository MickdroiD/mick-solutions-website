// ============================================
// HERO SECTION - Factory V5 (CSS Modules)
// ============================================

'use client';

import { motion } from 'framer-motion';
import { getAnimationVariants } from '../../animations/registry';
import type { HeroSectionProps } from '../types';

import HeroElectric from './variants/HeroElectric';

export default function HeroSection(props: HeroSectionProps) {
    const { content, design, effects, textSettings } = props;

    // VARIANT SWITCHER
    if (design.variant === 'electric') {
        return <HeroElectric {...props} />;
    }

    // DEFAULT RENDERER
    const logoAnimation = effects?.logoDirectEffect || 'none';
    const logoVariants = getAnimationVariants(logoAnimation);

    const heightStyles = {
        short: { minHeight: '400px' },
        medium: { minHeight: '600px' },
        tall: { minHeight: '800px' },
        fullscreen: { minHeight: '100vh' },
    };

    const layoutStyles = {
        'text-left': { textAlign: 'left' as const, alignItems: 'flex-start' },
        'text-right': { textAlign: 'right' as const, alignItems: 'flex-end' },
        'centered': { textAlign: 'center' as const, alignItems: 'center' },
        'split': { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' },
    };

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '5rem 1.5rem',
        backgroundColor: design.backgroundColor || '#0a0a0f',
        ...heightStyles[design.height || 'medium'],
    };

    const contentContainerStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        ...layoutStyles[design.layout || 'centered'],
    };

    const titleStyle: React.CSSProperties = {
        fontSize: textSettings?.titleFontSize || '3.5rem',
        fontWeight: (textSettings?.titleFontWeight as any) || 'bold',
        marginBottom: '1.5rem',
        lineHeight: textSettings?.lineHeight || '1.2',
    };

    const subtitleStyle: React.CSSProperties = {
        fontSize: textSettings?.subtitleFontSize || '1.25rem',
        marginBottom: '2rem',
        color: '#d1d5db',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '1rem 2rem',
        backgroundColor: '#22d3ee',
        color: 'white',
        borderRadius: '0.5rem',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        textDecoration: 'none',
        display: 'inline-block',
    };

    const secondaryButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        border: '2px solid #22d3ee',
        color: '#22d3ee',
    };

    return (
        <section style={containerStyle}>
            {content.backgroundImageUrl && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <img
                        src={content.backgroundImageUrl}
                        alt="Background"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {design.overlayOpacity && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'black',
                            opacity: design.overlayOpacity / 100,
                        }} />
                    )}
                </div>
            )}

            <div style={contentContainerStyle}>
                <motion.h1
                    variants={getAnimationVariants('text-fade')}
                    initial="initial"
                    animate="animate"
                    style={titleStyle}
                >
                    {content.titre}
                </motion.h1>

                {content.sousTitre && (
                    <motion.p
                        variants={getAnimationVariants('text-fade')}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                        style={subtitleStyle}
                    >
                        {content.sousTitre}
                    </motion.p>
                )}

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {content.ctaPrincipal && (
                        <motion.a
                            href={content.ctaPrincipal.url}
                            variants={getAnimationVariants('entrance-scale')}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.4 }}
                            style={buttonStyle}
                        >
                            {content.ctaPrincipal.texte}
                        </motion.a>
                    )}

                    {content.ctaSecondaire && (
                        <motion.a
                            href={content.ctaSecondaire.url}
                            variants={getAnimationVariants('entrance-scale')}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.5 }}
                            style={secondaryButtonStyle}
                        >
                            {content.ctaSecondaire.texte}
                        </motion.a>
                    )}
                </div>
            </div>

            {design.showScrollIndicator && (
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div style={{
                        width: '1.5rem',
                        height: '2.5rem',
                        border: '2px solid #22d3ee',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '0.5rem',
                    }}>
                        <div style={{
                            width: '0.25rem',
                            height: '0.75rem',
                            backgroundColor: '#22d3ee',
                            borderRadius: '9999px',
                        }} />
                    </div>
                </motion.div>
            )}
        </section>
    );
}
