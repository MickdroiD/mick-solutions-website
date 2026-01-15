// ============================================
// INFINITE ZOOM BLOCK - Factory V5
// Version bloc atomique du InfiniteZoomSection
// ============================================

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface ZoomLayer {
    id: string;
    imageUrl: string;
    title?: string;
    focalPointX?: number;
    focalPointY?: number;
}

export interface InfiniteZoomBlockProps {
    content: {
        layers: ZoomLayer[];
    };
    style?: {
        variant?: 'fullscreen' | 'contained' | 'hero';
        transitionDuration?: number;
        zoomIntensity?: number;
        showIndicators?: boolean;
        height?: string;
    };
}

const HEIGHT_MAP: Record<string, string> = {
    fullscreen: '100vh',
    contained: '500px',
    hero: '80vh',
};

export default function InfiniteZoomBlock({ content, style }: InfiniteZoomBlockProps) {
    const layers = content.layers || [];
    const variant = style?.variant || 'contained';
    const transitionDuration = style?.transitionDuration || 800;
    const zoomIntensity = style?.zoomIntensity || 2.5;
    const showIndicators = style?.showIndicators !== false;
    const height = style?.height || HEIGHT_MAP[variant] || '500px';

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [zoomProgress, setZoomProgress] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);
    const accumulatedDelta = useRef(0);
    const touchStartDistance = useRef(0);

    const transitionTo = useCallback(
        (newIndex: number) => {
            if (isTransitioning) return;
            if (newIndex < 0 || newIndex >= layers.length) return;

            setIsTransitioning(true);

            const startProgress = newIndex > currentIndex ? 0 : 100;
            const endProgress = newIndex > currentIndex ? 100 : 0;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / transitionDuration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                setZoomProgress(startProgress + (endProgress - startProgress) * eased);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setCurrentIndex(newIndex);
                    setZoomProgress(0);
                    setIsTransitioning(false);
                    accumulatedDelta.current = 0;
                }
            };

            requestAnimationFrame(animate);
        },
        [currentIndex, isTransitioning, layers.length, transitionDuration]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const now = Date.now();
            if (now - lastScrollTime.current < 50) return;
            lastScrollTime.current = now;

            accumulatedDelta.current += e.deltaY;
            const threshold = 100;

            if (accumulatedDelta.current > threshold && !isTransitioning) {
                transitionTo(currentIndex + 1);
            } else if (accumulatedDelta.current < -threshold && !isTransitioning) {
                transitionTo(currentIndex - 1);
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [currentIndex, isTransitioning, transitionTo]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                touchStartDistance.current = Math.sqrt(dx * dx + dy * dy);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && touchStartDistance.current > 0) {
                e.preventDefault();

                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const diff = distance - touchStartDistance.current;

                if (Math.abs(diff) > 50 && !isTransitioning) {
                    if (diff > 0) {
                        transitionTo(currentIndex + 1);
                    } else {
                        transitionTo(currentIndex - 1);
                    }
                    touchStartDistance.current = distance;
                }
            }
        };

        const handleTouchEnd = () => {
            touchStartDistance.current = 0;
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [currentIndex, isTransitioning, transitionTo]);

    if (layers.length === 0) {
        return (
            <div style={{
                color: '#22d3ee',
                padding: '2rem',
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(34,211,238,0.1)',
                borderRadius: '0.5rem',
                border: '2px dashed rgba(34,211,238,0.3)',
            }}>
                🔍 Infinite Zoom - Ajoutez des images
            </div>
        );
    }

    const currentLayer = layers[currentIndex];
    const nextLayer = layers[currentIndex + 1];

    // DEBUG LOG
    console.log("Rendering InfiniteZoomBlock", { layers, height, variant });

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                position: 'relative',
                height: height || '500px', // Fallback
                overflow: 'hidden',
                backgroundColor: '#000',
                borderRadius: variant === 'contained' ? '0.5rem' : '0',
            }}
        >
            {currentLayer && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        transition: 'transform 800ms ease-out',
                        transform: `scale(${1 + (zoomProgress / 100) * (zoomIntensity - 1)})`,
                        transformOrigin: `${currentLayer.focalPointX || 50}% ${currentLayer.focalPointY || 50}%`,
                    }}
                >
                    <Image
                        src={currentLayer.imageUrl}
                        alt={currentLayer.title || `Layer ${currentIndex + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority={currentIndex === 0}
                    />
                </div>
            )}

            {nextLayer && zoomProgress > 50 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: (zoomProgress - 50) / 50,
                    }}
                >
                    <Image
                        src={nextLayer.imageUrl}
                        alt={nextLayer.title || `Layer ${currentIndex + 2}`}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            )}

            {showIndicators && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '1.5rem',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        zIndex: 10,
                    }}
                >
                    {layers.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => !isTransitioning && transitionTo(idx)}
                            style={{
                                width: '0.75rem',
                                height: '0.75rem',
                                borderRadius: '9999px',
                                border: 'none',
                                backgroundColor: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                transform: idx === currentIndex ? 'scale(1.25)' : 'scale(1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            aria-label={`Go to layer ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            <div
                style={{
                    position: 'absolute',
                    top: '1rem',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                }}
            >
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                    Scrollez ou pincez pour explorer
                </p>
            </div>
        </motion.div>
    );
}
