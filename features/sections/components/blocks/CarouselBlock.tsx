// ============================================
// CAROUSEL BLOCK - Factory V5
// Carousel d'images avec navigation
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselImage {
    url: string;
    alt?: string;
    caption?: string;
}

export interface CarouselBlockProps {
    content: {
        images: CarouselImage[];
        autoplay?: boolean;
        autoplayInterval?: number; // ms
    };
    style?: {
        aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
        showArrows?: boolean;
        showDots?: boolean;
        borderRadius?: string;
        transition?: 'slide' | 'fade';
    };
}

const ASPECT_RATIOS = {
    '16:9': '56.25%',
    '4:3': '75%',
    '1:1': '100%',
    '21:9': '42.86%',
};

export default function CarouselBlock({ content, style }: CarouselBlockProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const images = content.images || [];
    const autoplay = content.autoplay ?? true;
    const interval = content.autoplayInterval || 4000;
    const aspectRatio = style?.aspectRatio || '16:9';
    const showArrows = style?.showArrows ?? true;
    const showDots = style?.showDots ?? true;
    const borderRadius = style?.borderRadius || '0.75rem';
    const transition = style?.transition || 'slide';

    const goTo = useCallback((index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    }, [currentIndex]);

    const next = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (!autoplay || images.length <= 1) return;
        const timer = setInterval(next, interval);
        return () => clearInterval(timer);
    }, [autoplay, interval, next, images.length]);

    if (images.length === 0) {
        return (
            <div style={{
                width: '100%',
                minHeight: '200px',
                background: 'rgba(168,85,247,0.1)',
                borderRadius,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7',
                border: '2px dashed rgba(168,85,247,0.3)',
            }}>
                🎠 Carousel - Ajoutez des images
            </div>
        );
    }

    const variants = transition === 'fade'
        ? {
            enter: { opacity: 0 },
            center: { opacity: 1 },
            exit: { opacity: 0 },
        }
        : {
            enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
        };

    const currentImage = images[currentIndex];

    return (
        <div style={{ position: 'relative' }}>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: ASPECT_RATIOS[aspectRatio],
                    borderRadius,
                    overflow: 'hidden',
                    background: '#0a0a0f',
                }}
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.img
                        key={currentIndex}
                        src={currentImage.url}
                        alt={currentImage.alt || `Image ${currentIndex + 1}`}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </AnimatePresence>

                {/* Caption */}
                {currentImage.caption && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '1rem',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            color: '#fff',
                            fontSize: '0.875rem',
                        }}
                    >
                        {currentImage.caption}
                    </div>
                )}

                {/* Arrows */}
                {showArrows && images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            style={{
                                position: 'absolute',
                                left: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={next}
                            style={{
                                position: 'absolute',
                                right: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Dots */}
            {showDots && images.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goTo(idx)}
                            style={{
                                width: idx === currentIndex ? '1.5rem' : '0.5rem',
                                height: '0.5rem',
                                borderRadius: '9999px',
                                background: idx === currentIndex ? '#22d3ee' : 'rgba(255,255,255,0.3)',
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
