// ============================================
// BENTO GRID BLOCK - Factory V5
// Apple-style asymmetric grid layout
// ============================================

'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface BentoGridItem {
    id: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    icon?: string;
    span?: 'sm' | 'md' | 'lg' | 'xl';
    bgColor?: string;
    url?: string;
}

interface BentoGridStyle {
    gap?: 'sm' | 'md' | 'lg';
    rounded?: 'sm' | 'md' | 'lg' | 'xl';
    showHoverEffect?: boolean;
}

interface BentoGridBlockProps {
    content: {
        items: BentoGridItem[];
    };
    style?: BentoGridStyle;
}

export default function BentoGridBlock({ content, style = {} }: BentoGridBlockProps) {
    const {
        gap = 'md',
        rounded = 'lg',
        showHoverEffect = true,
    } = style;

    const { items = [] } = content;

    const getGap = () => {
        switch (gap) {
            case 'sm': return '0.5rem';
            case 'md': return '1rem';
            case 'lg': return '1.5rem';
            default: return '1rem';
        }
    };

    const getRounded = () => {
        switch (rounded) {
            case 'sm': return '0.5rem';
            case 'md': return '1rem';
            case 'lg': return '1.5rem';
            case 'xl': return '2rem';
            default: return '1.5rem';
        }
    };

    const getSpanStyles = (span?: string): React.CSSProperties => {
        switch (span) {
            case 'xl': return { gridColumn: 'span 2', gridRow: 'span 2' };
            case 'lg': return { gridColumn: 'span 2', gridRow: 'span 1' };
            case 'md': return { gridColumn: 'span 1', gridRow: 'span 2' };
            case 'sm':
            default: return { gridColumn: 'span 1', gridRow: 'span 1' };
        }
    };

    const getIcon = (iconName?: string) => {
        if (!iconName) return null;
        const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Star;
        return <IconComponent size={32} />;
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: 'minmax(180px, auto)',
            gap: getGap(),
            maxWidth: '1200px',
            margin: '0 auto',
        }}>
            {items.map((item, idx) => {
                const Wrapper = item.url ? 'a' : 'div';
                const wrapperProps = item.url ? { href: item.url, target: '_blank', rel: 'noopener' } : {};

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={showHoverEffect ? { scale: 1.02, y: -5 } : undefined}
                        style={{
                            ...getSpanStyles(item.span),
                            borderRadius: getRounded(),
                            overflow: 'hidden',
                            position: 'relative',
                            background: item.bgColor || 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: item.url ? 'pointer' : 'default',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {item.imageUrl && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${item.imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.6,
                            }} />
                        )}

                        <div style={{
                            position: 'relative',
                            zIndex: 1,
                            padding: '1.5rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: item.imageUrl ? 'flex-end' : 'center',
                        }}>
                            {item.icon && (
                                <div style={{
                                    color: '#22d3ee',
                                    marginBottom: '1rem',
                                }}>
                                    {getIcon(item.icon)}
                                </div>
                            )}

                            {item.title && (
                                <h3 style={{
                                    color: '#fff',
                                    fontSize: item.span === 'xl' ? '1.75rem' : '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '0.5rem',
                                }}>
                                    {item.title}
                                </h3>
                            )}

                            {item.description && (
                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '0.9375rem',
                                    lineHeight: 1.5,
                                }}>
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
