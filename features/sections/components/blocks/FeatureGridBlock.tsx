// ============================================
// FEATURE GRID BLOCK - Factory V5
// Grid of features with icons
// ============================================

'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface FeatureItem {
    id: string;
    icon: string;
    title: string;
    description: string;
}

interface FeatureGridStyle {
    variant?: 'cards' | 'minimal' | 'icons-left';
    columns?: 2 | 3 | 4;
    iconColor?: string;
    iconSize?: 'sm' | 'md' | 'lg';
}

interface FeatureGridBlockProps {
    content: {
        title?: string;
        subtitle?: string;
        features: FeatureItem[];
    };
    style?: FeatureGridStyle;
}

export default function FeatureGridBlock({ content, style = {} }: FeatureGridBlockProps) {
    const {
        variant = 'cards',
        columns = 3,
        iconColor = '#22d3ee',
        iconSize = 'md',
    } = style;

    const { title, subtitle, features = [] } = content;

    const getIconSize = () => {
        switch (iconSize) {
            case 'sm': return 24;
            case 'md': return 32;
            case 'lg': return 48;
            default: return 32;
        }
    };

    const getIcon = (iconName: string) => {
        const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Star;
        return <IconComponent size={getIconSize()} style={{ color: iconColor }} />;
    };

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            {(title || subtitle) && (
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    {title && (
                        <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '2rem',
            }}>
                {features.map((feature, idx) => (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            display: 'flex',
                            flexDirection: variant === 'icons-left' ? 'row' : 'column',
                            alignItems: variant === 'icons-left' ? 'flex-start' : 'center',
                            gap: variant === 'icons-left' ? '1rem' : '1rem',
                            textAlign: variant === 'icons-left' ? 'left' : 'center',
                            padding: variant === 'cards' ? '2rem' : '1rem',
                            background: variant === 'cards' ? 'rgba(255,255,255,0.03)' : 'transparent',
                            borderRadius: variant === 'cards' ? '1rem' : '0',
                            border: variant === 'cards' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            transition: 'all 0.3s',
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: variant === 'cards' ? '64px' : 'auto',
                            height: variant === 'cards' ? '64px' : 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: variant === 'cards' ? `${iconColor}15` : 'transparent',
                            borderRadius: '0.75rem',
                            flexShrink: 0,
                        }}>
                            {getIcon(feature.icon)}
                        </div>

                        {/* Content */}
                        <div>
                            <h4 style={{
                                color: '#fff',
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                            }}>
                                {feature.title}
                            </h4>
                            <p style={{
                                color: '#9ca3af',
                                fontSize: '0.9375rem',
                                lineHeight: 1.6,
                                margin: 0,
                            }}>
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
