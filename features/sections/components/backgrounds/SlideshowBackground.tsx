// ============================================
// SLIDESHOW BACKGROUND - Factory V5
// Fond animé avec multiple images
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Slide {
    imageUrl: string;
    duration?: number; // ms
}

export interface SlideshowBackgroundProps {
    slides: Slide[];
    transition?: 'fade' | 'slide' | 'zoom' | 'kenBurns';
    transitionDuration?: number; // ms
    overlay?: {
        color: string;
        opacity: number;
    };
    blur?: number;
}

const TRANSITIONS = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slide: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 },
    },
    zoom: {
        initial: { scale: 1.1, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
    },
    kenBurns: {
        initial: { scale: 1, opacity: 0 },
        animate: { scale: 1.1, opacity: 1 },
        exit: { scale: 1.15, opacity: 0 },
    },
};

export default function SlideshowBackground({
    slides,
    transition = 'fade',
    transitionDuration = 1000,
    overlay,
    blur = 0,
}: SlideshowBackgroundProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;

        const currentSlide = slides[currentIndex];
        const duration = currentSlide?.duration || 5000;

        const timer = setTimeout(nextSlide, duration);
        return () => clearTimeout(timer);
    }, [currentIndex, slides, nextSlide]);

    if (slides.length === 0) return null;

    const currentSlide = slides[currentIndex];
    const transitionVariants = TRANSITIONS[transition];

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={transitionVariants.initial}
                    animate={transitionVariants.animate}
                    exit={transitionVariants.exit}
                    transition={{
                        duration: transitionDuration / 1000,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${currentSlide.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: blur > 0 ? `blur(${blur}px)` : undefined,
                        transform: blur > 0 ? 'scale(1.1)' : undefined, // Éviter bords flous
                    }}
                />
            </AnimatePresence>

            {/* Overlay */}
            {overlay && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: overlay.color,
                        opacity: overlay.opacity,
                    }}
                />
            )}

            {/* Indicators */}
            {slides.length > 1 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '0.5rem',
                        zIndex: 10,
                    }}
                >
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: idx === currentIndex ? '2rem' : '0.5rem',
                                height: '0.5rem',
                                borderRadius: '9999px',
                                background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
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
