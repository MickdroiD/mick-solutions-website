// ============================================
// TESTIMONIAL BLOCK - Factory V5 (Fused with V4)
// Beautiful testimonial cards with variants & carousel
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TestimonialItem } from '../../types-universal';

interface TestimonialContent {
    // Legacy Single
    quote?: string;
    author?: string;
    role?: string;
    company?: string;
    avatarUrl?: string;
    rating?: 1 | 2 | 3 | 4 | 5;

    // New List
    items?: TestimonialItem[];
    title?: string;
    subtitle?: string;
}

interface TestimonialStyle {
    variant?: 'card' | 'minimal' | 'quote' | 'bubble';
    mode?: 'single' | 'grid' | 'carousel';
    columns?: 1 | 2 | 3;
    avatarSize?: 'sm' | 'md' | 'lg';
    avatarShape?: 'circle' | 'rounded' | 'square';
    showQuoteIcon?: boolean;
    showRating?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    accentColor?: string;
    glassEffect?: boolean;
}

interface TestimonialBlockProps {
    content: TestimonialContent;
    style?: TestimonialStyle;
}

const AVATAR_SIZE_MAP = {
    sm: 40,
    md: 56,
    lg: 72,
};

const AVATAR_RADIUS_MAP = {
    circle: '50%',
    rounded: '12px',
    square: '0px',
};

export default function TestimonialBlock({ content, style = {} }: TestimonialBlockProps) {
    const {
        variant = 'card',
        mode = 'single',
        columns = 3,
        avatarSize = 'md',
        avatarShape = 'circle',
        showQuoteIcon = true,
        showRating = true,
        backgroundColor = 'rgba(255, 255, 255, 0.05)',
        borderColor = 'rgba(255, 255, 255, 0.1)',
        textColor = '#ffffff',
        accentColor = '#8b5cf6',
        glassEffect = true,
    } = style;

    // Normalize Data
    let items: TestimonialItem[] = [];
    if (content.items && content.items.length > 0) {
        items = content.items;
    } else if (content.author) {
        // Fallback to single item if legacy data exists
        items = [{
            id: 'legacy',
            quote: content.quote || '',
            author: content.author || '',
            role: content.role,
            company: content.company,
            avatarUrl: content.avatarUrl,
            rating: content.rating,
        }];
    }

    const avatarPx = AVATAR_SIZE_MAP[avatarSize] || 56;
    const avatarBorderRadius = AVATAR_RADIUS_MAP[avatarShape] || '50%';

    // --- SUB-COMPONENTS ---

    const RatingStars = ({ rating }: { rating?: number }) => {
        if (!showRating || !rating) return null;
        return (
            <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        fill={star <= rating ? accentColor : 'transparent'}
                        stroke={star <= rating ? accentColor : 'rgba(255,255,255,0.3)'}
                        strokeWidth={1.5}
                    />
                ))}
            </div>
        );
    };

    const TestimonialCard = ({ item }: { item: TestimonialItem }) => {
        const cardStyle: React.CSSProperties = {
            background: backgroundColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '2rem',
            backdropFilter: glassEffect ? 'blur(10px)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        };

        if (variant === 'minimal') {
            return (
                <div style={{ textAlign: 'center', padding: '1rem', height: '100%' }}>
                    <RatingStars rating={item.rating} />
                    <p style={{ color: textColor, fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                        &ldquo;{item.quote}&rdquo;
                    </p>
                    {item.avatarUrl && (
                        <img
                            src={item.avatarUrl}
                            alt={item.author}
                            style={{ width: avatarPx, height: avatarPx, borderRadius: avatarBorderRadius, objectFit: 'cover', margin: '0 auto 1rem', display: 'block' }}
                        />
                    )}
                    <h4 style={{ color: textColor, fontWeight: 600, margin: 0 }}>{item.author}</h4>
                    {(item.role || item.company) && (
                        <p style={{ color: `${textColor}99`, fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                            {item.role}{item.role && item.company && ' · '}{item.company}
                        </p>
                    )}
                </div>
            );
        }

        if (variant === 'bubble') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <div style={{
                        background: backgroundColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '16px 16px 16px 4px',
                        padding: '1.5rem',
                        position: 'relative',
                        flex: 1,
                    }}>
                        <RatingStars rating={item.rating} />
                        <p style={{ color: textColor, fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{item.quote}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                        {item.avatarUrl && (
                            <img
                                src={item.avatarUrl}
                                alt={item.author}
                                style={{ width: avatarPx, height: avatarPx, borderRadius: avatarBorderRadius, objectFit: 'cover' }}
                            />
                        )}
                        <div>
                            <h4 style={{ color: textColor, fontWeight: 600, margin: 0, fontSize: '0.925rem' }}>{item.author}</h4>
                            {(item.role || item.company) && (
                                <p style={{ color: `${textColor}88`, fontSize: '0.75rem', margin: 0 }}>
                                    {item.role}{item.role && item.company && ', '}{item.company}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Default 'card' variant
        return (
            <div style={cardStyle}>
                {showQuoteIcon && (
                    <Quote size={32} style={{ color: accentColor, opacity: 0.5, marginBottom: '1rem' }} />
                )}
                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                    <RatingStars rating={item.rating} />
                    <p style={{ color: textColor, fontSize: '1.05rem', lineHeight: 1.6 }}>&ldquo;{item.quote}&rdquo;</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: `1px solid ${borderColor}` }}>
                    {item.avatarUrl && (
                        <img
                            src={item.avatarUrl}
                            alt={item.author}
                            style={{ width: avatarPx, height: avatarPx, borderRadius: avatarBorderRadius, objectFit: 'cover', border: `2px solid ${accentColor}` }}
                        />
                    )}
                    <div>
                        <h4 style={{ color: textColor, fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{item.author}</h4>
                        {(item.role || item.company) && (
                            <p style={{ color: `${textColor}99`, fontSize: '0.8rem', margin: '0.125rem 0 0' }}>
                                {item.role}{item.role && item.company && ' · '}{item.company}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- LAYOUT MODES ---

    // 1. CAROUSEL
    if (mode === 'carousel' && items.length > 0) {
        // Simple Internal Carousel Logic
        const [currentIndex, setCurrentIndex] = useState(0);

        const next = () => setCurrentIndex((prev) => (prev + 1) % items.length);
        const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

        return (
            <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', padding: '0 3rem' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TestimonialCard item={items[currentIndex]} />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: textColor,
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={next}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: textColor,
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Dots */}
                {items.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                style={{
                                    width: idx === currentIndex ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: idx === currentIndex ? accentColor : 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // 2. GRID
    if (mode === 'grid' && items.length > 0) {
        const gridCols = columns === 1 ? '1fr' : columns === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))';

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: '1.5rem',
                width: '100%',
            }}>
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <TestimonialCard item={item} />
                    </motion.div>
                ))}
            </div>
        );
    }

    // 3. SINGLE (DEFAULT)
    if (items.length > 0) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <TestimonialCard item={items[0]} />
            </div>
        );
    }

    return null;
}
