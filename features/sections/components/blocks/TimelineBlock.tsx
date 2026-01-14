// ============================================
// TIMELINE BLOCK - Factory V5
// Vertical/horizontal timeline with V4 Fusion
// ============================================

'use client';

import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Star, Zap } from 'lucide-react';

interface TimelineItem {
    id: string;
    date: string;
    title: string;
    description?: string;
    icon?: string;
}

interface TimelineStyle {
    variant?: 'vertical' | 'horizontal' | 'alternating';
    lineColor?: string;
    dotColor?: string;
    connectorStyle?: 'solid' | 'dashed' | 'dotted';
    markerStyle?: 'dot' | 'icon' | 'number';
    cardEffect?: 'none' | 'shadow' | 'glass';
}

interface TimelineBlockProps {
    content: {
        title?: string;
        items: TimelineItem[];
    };
    style?: TimelineStyle;
}

export default function TimelineBlock({ content, style = {} }: TimelineBlockProps) {
    const {
        variant = 'vertical',
        lineColor = 'rgba(34,211,238,0.3)',
        dotColor = '#22d3ee',
        connectorStyle = 'solid',
        markerStyle = 'dot',
        cardEffect = 'none',
    } = style;

    const { title, items = [] } = content;

    const getIcon = (iconName: string | undefined) => {
        if (!iconName) return null;
        switch (iconName.toLowerCase()) {
            case 'star': return <Star size={14} />;
            case 'zap': return <Zap size={14} />;
            case 'check': return <CheckCircle size={14} />;
            case 'clock': return <Clock size={14} />;
            case 'calendar': return <Calendar size={14} />;
            default: return <div style={{ fontSize: '10px' }}>{iconName[0]}</div>;
        }
    };

    const getCardStyles = (): React.CSSProperties => {
        if (cardEffect === 'glass') {
            return {
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
            };
        }
        if (cardEffect === 'shadow') {
            return {
                background: '#111',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            };
        }
        return { padding: '0.5rem' };
    };

    // HORIZONTAL VARIANT
    if (variant === 'horizontal') {
        return (
            <div style={{ width: '100%' }}>
                {title && (
                    <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>
                        {title}
                    </h3>
                )}
                <div style={{ display: 'flex', overflowX: 'auto', gap: cardEffect === 'none' ? '2rem' : '1rem', padding: '1rem 0', scrollbarWidth: 'none' }}>
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            style={{
                                minWidth: '280px',
                                textAlign: 'center',
                                position: 'relative',
                            }}
                        >
                            {/* Horizontal Connector Line */}
                            {idx < items.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '50%',
                                    right: '-50%',
                                    height: '2px',

                                    borderTop: connectorStyle === 'dashed' ? `2px dashed ${lineColor}` : connectorStyle === 'dotted' ? `2px dotted ${lineColor}` : undefined,
                                    background: connectorStyle === 'solid' ? lineColor : 'transparent',
                                    zIndex: 0,
                                }} />
                            )}

                            <div style={{
                                width: markerStyle === 'dot' ? '16px' : '24px',
                                height: markerStyle === 'dot' ? '16px' : '24px',
                                borderRadius: '50%',
                                background: markerStyle === 'dot' ? dotColor : '#000',
                                border: `2px solid ${dotColor}`,
                                margin: '0 auto 1.5rem',
                                boxShadow: `0 0 20px ${dotColor}`,
                                position: 'relative',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: dotColor,
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {markerStyle === 'number' && (idx + 1)}
                                {markerStyle === 'icon' && getIcon(item.icon || 'star')}
                            </div>

                            <div style={getCardStyles()}>
                                <div style={{ color: dotColor, fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    {item.date}
                                </div>
                                <div style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    {item.title}
                                </div>
                                {item.description && (
                                    <div style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                        {item.description}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // VERTICAL / ALTERNATING VARIANT
    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
            {title && (
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '3rem', textAlign: 'center' }}>
                    {title}
                </h3>
            )}
            <div style={{ position: 'relative', paddingLeft: variant === 'alternating' ? '0' : '2rem', paddingTop: '1rem' }}>
                {/* Vertical Line */}
                <div style={{
                    position: 'absolute',
                    left: variant === 'alternating' ? '50%' : '11px', /* center of 24px marker logic */
                    transform: 'translateX(-50%)',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: connectorStyle === 'solid' ? lineColor : 'transparent',
                    borderLeft: connectorStyle !== 'solid' ? `2px ${connectorStyle} ${lineColor}` : undefined,
                }} />

                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: variant === 'alternating' ? (idx % 2 === 0 ? -30 : 30) : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            position: 'relative',
                            marginBottom: '2rem',
                            display: 'flex',
                            flexDirection: variant === 'alternating' ? (idx % 2 === 0 ? 'row' : 'row-reverse') : 'row',
                            alignItems: 'flex-start',
                            justifyContent: variant === 'alternating' ? 'space-between' : 'flex-start',
                            paddingLeft: variant === 'alternating' ? '0' : '2rem',
                        }}
                    >
                        {/* Spacer for alternating to push to sides */}
                        {variant === 'alternating' && <div style={{ width: '50%' }} />}

                        {/* Marker */}
                        <div style={{
                            position: 'absolute',
                            left: variant === 'alternating' ? '50%' : '0',
                            transform: 'translateX(-50%)',
                            width: markerStyle === 'dot' ? '16px' : '32px',
                            height: markerStyle === 'dot' ? '16px' : '32px',
                            borderRadius: '50%',
                            background: markerStyle === 'dot' ? dotColor : '#0a0a0f',
                            border: `2px solid ${dotColor}`,
                            boxShadow: `0 0 10px ${dotColor}50`,
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: dotColor,
                            fontWeight: 'bold',
                            fontSize: '12px',
                            marginTop: '0.25rem'
                        }}>
                            {markerStyle === 'number' && (idx + 1)}
                            {markerStyle === 'icon' && getIcon(item.icon || 'star')}
                        </div>

                        {/* Content Card */}
                        <div style={{
                            width: variant === 'alternating' ? '45%' : '100%',
                            ...getCardStyles(),
                            textAlign: variant === 'alternating' ? (idx % 2 === 0 ? 'right' : 'left') : 'left',
                        }}>
                            <div style={{ color: dotColor, fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                {item.date}
                            </div>
                            <div style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                {item.title}
                            </div>
                            {item.description && (
                                <div style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                    {item.description}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
