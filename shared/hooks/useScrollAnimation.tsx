// ============================================
// USE SCROLL ANIMATION HOOK - Factory V5
// Hook pour animer les éléments au scroll
// ============================================

'use client';

import { useEffect, useRef, useState } from 'react';

export type AnimationType = 'fadeIn' | 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'zoomIn' | 'scaleUp';

interface UseScrollAnimationOptions {
    type?: AnimationType;
    threshold?: number; // 0-1, pourcentage visible avant animation
    delay?: number; // ms
    duration?: number; // ms
    once?: boolean; // Animation une seule fois
    rootMargin?: string;
}

interface AnimationResult {
    ref: React.RefObject<HTMLDivElement | null>;
    isVisible: boolean;
    style: React.CSSProperties;
}

const ANIMATION_STYLES: Record<AnimationType, { initial: React.CSSProperties; animated: React.CSSProperties }> = {
    fadeIn: {
        initial: { opacity: 0 },
        animated: { opacity: 1 },
    },
    fadeUp: {
        initial: { opacity: 0, transform: 'translateY(40px)' },
        animated: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeDown: {
        initial: { opacity: 0, transform: 'translateY(-40px)' },
        animated: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeLeft: {
        initial: { opacity: 0, transform: 'translateX(40px)' },
        animated: { opacity: 1, transform: 'translateX(0)' },
    },
    fadeRight: {
        initial: { opacity: 0, transform: 'translateX(-40px)' },
        animated: { opacity: 1, transform: 'translateX(0)' },
    },
    zoomIn: {
        initial: { opacity: 0, transform: 'scale(0.9)' },
        animated: { opacity: 1, transform: 'scale(1)' },
    },
    scaleUp: {
        initial: { opacity: 0, transform: 'scale(0.5)' },
        animated: { opacity: 1, transform: 'scale(1)' },
    },
};

export function useScrollAnimation({
    type = 'fadeUp',
    threshold = 0.1,
    delay = 0,
    duration = 600,
    once = true,
    rootMargin = '0px',
}: UseScrollAnimationOptions = {}): AnimationResult {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (once && hasAnimated.current) return;

                    setTimeout(() => {
                        setIsVisible(true);
                        hasAnimated.current = true;
                    }, delay);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, delay, once, rootMargin]);

    const animationStyles = ANIMATION_STYLES[type];
    const style: React.CSSProperties = {
        ...(isVisible ? animationStyles.animated : animationStyles.initial),
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transitionDelay: `${delay}ms`,
    };

    return { ref, isVisible, style };
}

// Composant wrapper pour scroll animation
interface ScrollAnimateProps {
    children: React.ReactNode;
    type?: AnimationType;
    delay?: number;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function ScrollAnimate({
    children,
    type = 'fadeUp',
    delay = 0,
    duration = 600,
    className,
    style: customStyle,
}: ScrollAnimateProps) {
    const { ref, style } = useScrollAnimation({ type, delay, duration });

    return (
        <div ref={ref} className={className} style={{ ...style, ...customStyle }}>
            {children}
        </div>
    );
}
