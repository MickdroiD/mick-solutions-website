// ============================================
// PARALLAX BACKGROUND - Factory V5
// Scroll-based parallax effect for sections
// ============================================

'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxBackgroundProps {
    imageUrl: string;
    speed?: number; // 0.1 to 1, default 0.5
    blur?: number;
    overlay?: {
        color: string;
        opacity: number;
    };
    children?: React.ReactNode;
}

export default function ParallaxBackground({
    imageUrl,
    speed = 0.5,
    blur = 0,
    overlay,
    children,
}: ParallaxBackgroundProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [elementTop, setElementTop] = useState(0);
    const [elementHeight, setElementHeight] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);

    const { scrollY } = useScroll();

    useEffect(() => {
        const updateMeasurements = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                setElementTop(rect.top + window.scrollY);
                setElementHeight(rect.height);
            }
            setWindowHeight(window.innerHeight);
        };

        updateMeasurements();
        window.addEventListener('resize', updateMeasurements);
        return () => window.removeEventListener('resize', updateMeasurements);
    }, []);

    // Calculate parallax offset based on scroll position
    const yRange = useTransform(
        scrollY,
        [elementTop - windowHeight, elementTop + elementHeight],
        [-elementHeight * speed * 0.5, elementHeight * speed * 0.5]
    );

    return (
        <div
            ref={ref}
            style={{
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
            }}
        >
            {/* Parallax Background Image */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: 0,
                    right: 0,
                    bottom: '-20%',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: blur > 0 ? `blur(${blur}px)` : undefined,
                    y: yRange,
                    willChange: 'transform',
                }}
            />

            {/* Overlay */}
            {overlay && overlay.opacity > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: overlay.color,
                        opacity: overlay.opacity,
                    }}
                />
            )}

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                {children}
            </div>
        </div>
    );
}

// Utility component for simpler usage
export function ParallaxSection({
    imageUrl,
    speed = 0.5,
    blur,
    overlayColor = 'rgba(0,0,0,0.4)',
    overlayOpacity = 0.4,
    minHeight = '60vh',
    children,
}: {
    imageUrl: string;
    speed?: number;
    blur?: number;
    overlayColor?: string;
    overlayOpacity?: number;
    minHeight?: string;
    children?: React.ReactNode;
}) {
    return (
        <ParallaxBackground
            imageUrl={imageUrl}
            speed={speed}
            blur={blur}
            overlay={{ color: overlayColor, opacity: overlayOpacity }}
        >
            <div style={{ minHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </div>
        </ParallaxBackground>
    );
}
