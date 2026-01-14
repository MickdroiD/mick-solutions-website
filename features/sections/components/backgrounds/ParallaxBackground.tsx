// ============================================
// PARALLAX BACKGROUND - Factory V5
// Fond avec effet de profondeur au scroll
// ============================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ParallaxBackgroundProps {
    imageUrl: string;
    speed?: number; // 0.1 = lent, 0.5 = moyen, 1 = rapide
    overlay?: {
        color: string;
        opacity: number;
    };
    blur?: number;
    scale?: number; // Scale pour éviter les bords visibles
}

export default function ParallaxBackground({
    imageUrl,
    speed = 0.3,
    overlay,
    blur = 0,
    scale = 1.2,
}: ParallaxBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [elementTop, setElementTop] = useState(0);
    const [clientHeight, setClientHeight] = useState(0);

    const { scrollY } = useScroll();

    useEffect(() => {
        const updatePosition = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setElementTop(rect.top + window.scrollY);
                setClientHeight(window.innerHeight);
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, []);

    // Calcul du déplacement parallaxe
    const y = useTransform(
        scrollY,
        [elementTop - clientHeight, elementTop + clientHeight],
        [`${-100 * speed}px`, `${100 * speed}px`]
    );

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    right: '-5%',
                    bottom: '-10%',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: blur > 0 ? `blur(${blur}px)` : undefined,
                    transform: `scale(${scale})`,
                    y,
                }}
            />

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
        </div>
    );
}
