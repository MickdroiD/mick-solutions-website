// ============================================
// PRICING BLOCK - Factory V5
// Premium pricing cards with Toggle Support (V4 Fusion)
// ============================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star } from 'lucide-react';

interface PricingPlan {
    id: string;
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    highlighted?: boolean;
    ctaText?: string;
    ctaUrl?: string;
    // V4 Options
    priceYearly?: string;
    periodYearly?: string;
}

interface PricingStyle {
    variant?: 'cards' | 'minimal' | 'comparison';
    columns?: 2 | 3 | 4;
    highlightColor?: string;
    showBadge?: boolean;
    badgeText?: string;
    // V4 Options
    enableToggle?: boolean;
    toggleColor?: string;
}

interface PricingBlockProps {
    content: {
        title?: string;
        subtitle?: string;
        plans: PricingPlan[];
    };
    style?: PricingStyle;
}

export default function PricingBlock({ content, style = {} }: PricingBlockProps) {
    const {
        variant = 'cards',
        columns = 3,
        highlightColor = '#a855f7',
        showBadge = true,
        badgeText = 'Populaire',
        enableToggle = false,
        toggleColor = '#22d3ee',
    } = style;

    const { title, subtitle, plans = [] } = content;
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
            {/* Header */}
            {(title || subtitle) && (
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    {title && (
                        <h2 style={{
                            color: '#ffffff',
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem',
                        }}>
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p style={{ color: '#9ca3af', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                            {subtitle}
                        </p>
                    )}

                    {/* V4 TOGGLE SWITCH */}
                    {enableToggle && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <span style={{ color: !isYearly ? '#fff' : '#6b7280', fontWeight: 600, transition: 'color 0.3s' }}>Mensuel</span>
                            <div
                                onClick={() => setIsYearly(!isYearly)}
                                style={{
                                    width: '60px',
                                    height: '32px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <motion.div
                                    animate={{ x: isYearly ? 28 : 0 }}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        background: toggleColor,
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                />
                            </div>
                            <span style={{ color: isYearly ? '#fff' : '#6b7280', fontWeight: 600, transition: 'color 0.3s' }}>Annuel</span>
                        </div>
                    )}
                </div>
            )}

            {/* Plans Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(columns, plans.length)}, 1fr)`,
                gap: '1.5rem',
                alignItems: 'stretch',
            }}>
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        style={{
                            position: 'relative',
                            background: plan.highlighted
                                ? `linear-gradient(145deg, ${highlightColor}15, ${highlightColor}05)`
                                : 'rgba(255,255,255,0.03)',
                            border: plan.highlighted
                                ? `2px solid ${highlightColor}`
                                : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: variant === 'minimal' ? '0.5rem' : '1rem',
                            padding: variant === 'minimal' ? '1.5rem' : '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            transform: plan.highlighted && variant === 'cards' ? 'scale(1.05)' : 'none',
                            boxShadow: plan.highlighted
                                ? `0 20px 50px ${highlightColor}20`
                                : '0 4px 20px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {/* Badge */}
                        {plan.highlighted && showBadge && (
                            <div style={{
                                position: 'absolute',
                                top: '-0.75rem',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: highlightColor,
                                color: '#fff',
                                padding: '0.25rem 1rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}>
                                <Star size={12} fill="currentColor" />
                                {badgeText}
                            </div>
                        )}

                        {/* Plan Name */}
                        <h3 style={{
                            color: plan.highlighted ? highlightColor : '#d1d5db',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            textAlign: 'center',
                        }}>
                            {plan.name}
                        </h3>

                        {/* Price */}
                        <div style={{ textAlign: 'center', marginBottom: '1rem', minHeight: '80px' }}>
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={isYearly ? 'yearly' : 'monthly'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span style={{
                                        color: '#ffffff',
                                        fontSize: '3rem',
                                        fontWeight: 700,
                                        lineHeight: 1,
                                    }}>
                                        {isYearly ? (plan.priceYearly || plan.price) : plan.price}
                                    </span>
                                    {(plan.period || plan.periodYearly) && (
                                        <span style={{ color: '#6b7280', fontSize: '1rem' }}>
                                            /{isYearly ? (plan.periodYearly || 'an') : plan.period}
                                        </span>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Description */}
                        {plan.description && (
                            <p style={{
                                color: '#9ca3af',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                            }}>
                                {plan.description}
                            </p>
                        )}

                        {/* Features */}
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 1.5rem',
                            flex: 1,
                        }}>
                            {plan.features.map((feature, i) => (
                                <li key={i} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    marginBottom: '0.75rem',
                                    color: '#d1d5db',
                                    fontSize: '0.9375rem',
                                }}>
                                    <Check size={18} style={{
                                        color: plan.highlighted ? highlightColor : '#22c55e',
                                        flexShrink: 0,
                                        marginTop: '0.125rem',
                                    }} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        {plan.ctaText && (
                            <a
                                href={plan.ctaUrl || '#'}
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    padding: '0.875rem 1.5rem',
                                    background: plan.highlighted
                                        ? highlightColor
                                        : 'transparent',
                                    border: plan.highlighted
                                        ? 'none'
                                        : '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '0.5rem',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {plan.ctaText}
                            </a>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
