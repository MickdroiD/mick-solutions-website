'use client';

/**
 * ============================================
 * INFINITE ZOOM SECTION - Factory V2
 * ============================================
 * 
 * Effet de zoom infini interactif où le visiteur
 * navigue dans des images imbriquées via scroll/pinch.
 * 
 * @author Mick Solutions
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

// ============================================
// TYPES
// ============================================

export interface ZoomLayer {
    id: string;
    imageUrl: string;
    title?: string;
    description?: string;
    // Position du point focal vers la prochaine image (en %)
    focalPointX?: number;
    focalPointY?: number;
}

export interface InfiniteZoomProps {
    layers: ZoomLayer[];
    // Configuration
    transitionDuration?: number; // ms
    zoomIntensity?: number; // multiplier
    enableSound?: boolean;
    // Style
    variant?: 'fullscreen' | 'contained' | 'hero';
    showIndicators?: boolean;
    showProgress?: boolean;
    // Labels
    title?: string;
    subtitle?: string;
    instructionText?: string;
}

// ============================================
// DEMO LAYERS (utilisées si aucune image fournie)
// ============================================

const DEMO_LAYERS: ZoomLayer[] = [
    {
        id: 'demo-1',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
        title: 'Horizon',
        focalPointX: 50,
        focalPointY: 50,
    },
    {
        id: 'demo-2',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
        title: 'Forêt',
        focalPointX: 50,
        focalPointY: 45,
    },
    {
        id: 'demo-3',
        imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c036bc2c95?w=1920&q=80',
        title: 'Détail',
        focalPointX: 50,
        focalPointY: 50,
    },
    {
        id: 'demo-4',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
        title: 'Portrait',
        focalPointX: 50,
        focalPointY: 40,
    },
    {
        id: 'demo-5',
        imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
        title: 'Abstrait',
        focalPointX: 50,
        focalPointY: 50,
    },
];

// ============================================
// COMPONENT
// ============================================

export default function InfiniteZoomSection({
    layers = [],
    transitionDuration = 800,
    zoomIntensity = 2.5,
    enableSound = false,
    variant = 'fullscreen',
    showIndicators = true,
    showProgress = true,
    title,
    subtitle,
    instructionText = 'Scrollez pour explorer',
}: InfiniteZoomProps) {
    // Utiliser les démo si pas de layers
    const activeLayers = layers.length > 0 ? layers : DEMO_LAYERS;

    // État
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [zoomProgress, setZoomProgress] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);
    const accumulatedDelta = useRef(0);
    const touchStartDistance = useRef(0);

    // Audio (optionnel)
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialisation
    useEffect(() => {
        setIsInitialized(true);
        if (enableSound) {
            audioRef.current = new Audio('/sounds/whoosh.mp3');
            audioRef.current.volume = 0.3;
        }
    }, [enableSound]);

    // Transition vers une image
    const transitionTo = useCallback((newIndex: number) => {
        if (isTransitioning) return;
        if (newIndex < 0 || newIndex >= activeLayers.length) return;

        setIsTransitioning(true);

        // Jouer le son si activé
        if (enableSound && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }

        // Animation de progression
        const startProgress = newIndex > currentIndex ? 0 : 100;
        const endProgress = newIndex > currentIndex ? 100 : 0;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / transitionDuration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

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
    }, [currentIndex, isTransitioning, activeLayers.length, transitionDuration, enableSound]);

    // Gestion du scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const now = Date.now();
            if (now - lastScrollTime.current < 50) return; // Throttle
            lastScrollTime.current = now;

            // Accumuler le delta pour un scroll plus fluide
            accumulatedDelta.current += e.deltaY;

            const threshold = 100;

            if (accumulatedDelta.current > threshold && !isTransitioning) {
                // Zoom avant (scroll down)
                transitionTo(currentIndex + 1);
            } else if (accumulatedDelta.current < -threshold && !isTransitioning) {
                // Zoom arrière (scroll up)
                transitionTo(currentIndex - 1);
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [currentIndex, isTransitioning, transitionTo]);

    // Gestion du pinch (mobile)
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
                        // Pinch out = zoom avant
                        transitionTo(currentIndex + 1);
                    } else {
                        // Pinch in = zoom arrière
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

    // Navigation clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                transitionTo(currentIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                transitionTo(currentIndex - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, transitionTo]);

    // Classes selon variant
    const containerClasses = {
        fullscreen: 'fixed inset-0 z-50',
        contained: 'relative w-full h-[80vh] rounded-2xl overflow-hidden',
        hero: 'relative w-full min-h-screen',
    };

    const currentLayer = activeLayers[currentIndex];
    const nextLayer = activeLayers[currentIndex + 1];

    return (
        <section
            ref={containerRef}
            className={`${containerClasses[variant]} bg-black cursor-zoom-in select-none`}
            id="infinite-zoom"
            style={{ touchAction: 'none' }}
        >
            {/* Background layer (image actuelle zoomée) */}
            <div
                className="absolute inset-0 transition-transform overflow-hidden"
                style={{
                    transform: `scale(${1 + (zoomProgress / 100) * (zoomIntensity - 1)})`,
                    transformOrigin: `${currentLayer?.focalPointX || 50}% ${currentLayer?.focalPointY || 50}%`,
                    transitionDuration: isTransitioning ? '0ms' : `${transitionDuration}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {currentLayer && (
                    <Image
                        src={currentLayer.imageUrl}
                        alt={currentLayer.title || `Layer ${currentIndex + 1}`}
                        fill
                        className="object-cover"
                        style={{
                            opacity: 1 - (zoomProgress / 100) * 0.3,
                        }}
                        unoptimized
                        priority={currentIndex === 0}
                    />
                )}
            </div>

            {/* Next layer preview (apparaît au centre pendant le zoom) */}
            {nextLayer && zoomProgress > 0 && (
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                        opacity: zoomProgress / 100,
                    }}
                >
                    <div
                        className="relative overflow-hidden rounded-lg shadow-2xl"
                        style={{
                            width: `${20 + (zoomProgress / 100) * 80}%`,
                            height: `${20 + (zoomProgress / 100) * 80}%`,
                            transform: `scale(${0.5 + (zoomProgress / 100) * 0.5})`,
                        }}
                    >
                        <Image
                            src={nextLayer.imageUrl}
                            alt={nextLayer.title || `Layer ${currentIndex + 2}`}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

            {/* Title & Subtitle */}
            {(title || subtitle) && currentIndex === 0 && !isTransitioning && (
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
                    {title && (
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg animate-fade-in">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="text-lg md:text-xl text-white/80 drop-shadow-md animate-fade-in-delay">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Layer title */}
            {currentLayer?.title && currentIndex > 0 && !isTransitioning && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
                    <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg animate-fade-in">
                        {currentLayer.title}
                    </h2>
                    {currentLayer.description && (
                        <p className="text-white/70 mt-2 max-w-md animate-fade-in-delay">
                            {currentLayer.description}
                        </p>
                    )}
                </div>
            )}

            {/* Instructions */}
            {instructionText && currentIndex === 0 && !isTransitioning && isInitialized && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-10">
                    <div className="flex flex-col items-center gap-3 animate-bounce-slow">
                        <p className="text-white/70 text-sm tracking-wide uppercase">
                            {instructionText}
                        </p>
                        <svg
                            className="w-6 h-6 text-white/50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </div>
            )}

            {/* Progress indicators */}
            {showIndicators && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                    {activeLayers.map((layer, index) => (
                        <button
                            key={layer.id}
                            onClick={() => !isTransitioning && transitionTo(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-white scale-125'
                                : index < currentIndex
                                    ? 'bg-white/60 hover:bg-white/80'
                                    : 'bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label={`Aller à l'image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Progress bar */}
            {showProgress && (
                <div className="absolute bottom-6 left-6 right-6 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-white/60 text-sm font-mono">
                            {String(currentIndex + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-300"
                                style={{
                                    width: `${((currentIndex + 1) / activeLayers.length) * 100}%`,
                                }}
                            />
                        </div>
                        <span className="text-white/60 text-sm font-mono">
                            {String(activeLayers.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            )}

            {/* Close button (fullscreen mode) */}
            {variant === 'fullscreen' && (
                <button
                    onClick={() => window.history.back()}
                    className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                    aria-label="Fermer"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Styles */}
            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
        </section>
    );
}
