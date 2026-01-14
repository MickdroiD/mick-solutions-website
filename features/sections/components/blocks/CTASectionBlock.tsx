// ============================================
// CTA SECTION BLOCK - Factory V5
// Premium call-to-action with gradient background
// ============================================

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTASectionStyle {
    variant?: 'centered' | 'split' | 'banner';
    gradientFrom?: string;
    gradientTo?: string;
    textColor?: string;
}

interface CTASectionBlockProps {
    content: {
        headline: string;
        subheadline?: string;
        primaryButtonText?: string;
        primaryButtonUrl?: string;
        secondaryButtonText?: string;
        secondaryButtonUrl?: string;
    };
    style?: CTASectionStyle;
}

export default function CTASectionBlock({ content, style = {} }: CTASectionBlockProps) {
    const {
        variant = 'centered',
        gradientFrom = '#a855f7',
        gradientTo = '#ec4899',
        textColor = '#ffffff',
    } = style;

    const { headline, subheadline, primaryButtonText, primaryButtonUrl, secondaryButtonText, secondaryButtonUrl } = content;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
                width: '100%',
                padding: variant === 'banner' ? '2rem 3rem' : '4rem 2rem',
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                borderRadius: variant === 'banner' ? '0' : '1.5rem',
                display: 'flex',
                flexDirection: variant === 'split' ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: variant === 'split' ? 'space-between' : 'center',
                gap: '2rem',
                textAlign: variant === 'split' ? 'left' : 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(60px)',
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: variant === 'split' ? '60%' : '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: variant === 'split' ? 'flex-start' : 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                    }}
                >
                    <Sparkles size={20} style={{ color: 'rgba(255,255,255,0.8)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Offre spéciale
                    </span>
                </motion.div>

                <h2 style={{
                    color: textColor,
                    fontSize: variant === 'banner' ? '1.75rem' : '2.5rem',
                    fontWeight: 700,
                    marginBottom: subheadline ? '1rem' : '1.5rem',
                    lineHeight: 1.2,
                }}>
                    {headline}
                </h2>

                {subheadline && (
                    <p style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '1.125rem',
                        marginBottom: '1.5rem',
                        maxWidth: '600px',
                    }}>
                        {subheadline}
                    </p>
                )}
            </div>

            {/* Buttons */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: variant === 'split' ? 'flex-end' : 'center',
                position: 'relative',
                zIndex: 1,
            }}>
                {primaryButtonText && (
                    <a
                        href={primaryButtonUrl || '#'}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 2rem',
                            background: '#ffffff',
                            color: gradientFrom,
                            fontWeight: 600,
                            borderRadius: '0.75rem',
                            textDecoration: 'none',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        }}
                    >
                        {primaryButtonText}
                        <ArrowRight size={18} />
                    </a>
                )}

                {secondaryButtonText && (
                    <a
                        href={secondaryButtonUrl || '#'}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 2rem',
                            background: 'transparent',
                            color: '#ffffff',
                            fontWeight: 600,
                            borderRadius: '0.75rem',
                            textDecoration: 'none',
                            border: '2px solid rgba(255,255,255,0.3)',
                        }}
                    >
                        {secondaryButtonText}
                    </a>
                )}
            </div>
        </motion.div>
    );
}
