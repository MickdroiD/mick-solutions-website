// ============================================
// SCROLL REVEAL - Factory V5
// Global scroll-triggered animations
// ============================================

'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

export type RevealAnimation =
    | 'fade-up'
    | 'fade-down'
    | 'fade-left'
    | 'fade-right'
    | 'zoom-in'
    | 'zoom-out'
    | 'flip'
    | 'rotate'
    | 'bounce'
    | 'slide-up'
    | 'blur-in'
    | 'none';

interface ScrollRevealProps {
    children: ReactNode;
    animation?: RevealAnimation;
    delay?: number;
    duration?: number;
    once?: boolean;
    threshold?: number;
    className?: string;
    style?: React.CSSProperties;
}

// Animation variants for each type
const getVariants = (animation: RevealAnimation): Variants => {
    const baseTransition = {
        type: 'spring' as const,
        damping: 20,
        stiffness: 100,
    };

    switch (animation) {
        case 'fade-up':
            return {
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: baseTransition },
            };
        case 'fade-down':
            return {
                hidden: { opacity: 0, y: -50 },
                visible: { opacity: 1, y: 0, transition: baseTransition },
            };
        case 'fade-left':
            return {
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: baseTransition },
            };
        case 'fade-right':
            return {
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: baseTransition },
            };
        case 'zoom-in':
            return {
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: baseTransition },
            };
        case 'zoom-out':
            return {
                hidden: { opacity: 0, scale: 1.2 },
                visible: { opacity: 1, scale: 1, transition: baseTransition },
            };
        case 'flip':
            return {
                hidden: { opacity: 0, rotateX: 90 },
                visible: { opacity: 1, rotateX: 0, transition: { type: 'spring' as const, damping: 15, stiffness: 100 } },
            };
        case 'rotate':
            return {
                hidden: { opacity: 0, rotate: -15, scale: 0.9 },
                visible: { opacity: 1, rotate: 0, scale: 1, transition: baseTransition },
            };
        case 'bounce':
            return {
                hidden: { opacity: 0, y: 100, scale: 0.9 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: 'spring' as const, damping: 10, stiffness: 200 }
                },
            };
        case 'slide-up':
            return {
                hidden: { opacity: 0, y: 100, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 25, stiffness: 100 } },
            };
        case 'blur-in':
            return {
                hidden: { opacity: 0, filter: 'blur(20px)' },
                visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8 } },
            };
        case 'none':
        default:
            return {
                hidden: {},
                visible: {},
            };
    }
};

export default function ScrollReveal({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 0.6,
    once = true,
    threshold = 0.2,
    className,
    style,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, amount: threshold });

    const variants = getVariants(animation);

    if (animation === 'none') {
        return <div className={className} style={style}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ duration, delay }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

// Staggered children reveal
interface StaggerRevealProps {
    children: ReactNode[];
    animation?: RevealAnimation;
    staggerDelay?: number;
    containerDelay?: number;
    once?: boolean;
    className?: string;
    containerClassName?: string;
}

export function StaggerReveal({
    children,
    animation = 'fade-up',
    staggerDelay = 0.1,
    containerDelay = 0,
    once = true,
    className,
    containerClassName,
}: StaggerRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, amount: 0.2 });

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: containerDelay,
            },
        },
    };

    const itemVariants = getVariants(animation);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className={containerClassName}
        >
            {children.map((child, index) => (
                <motion.div key={index} variants={itemVariants} className={className}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}

// Text reveal with letter animation
interface TextRevealProps {
    text: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    className?: string;
    style?: React.CSSProperties;
    letterDelay?: number;
    once?: boolean;
}

export function TextReveal({
    text,
    as: Component = 'span',
    className,
    style,
    letterDelay = 0.03,
    once = true,
}: TextRevealProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once, amount: 0.5 });

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: letterDelay,
            },
        },
    };

    const letterVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12 } },
    };

    return (
        <motion.span
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className={className}
            style={{ ...style, display: 'inline-block' }}
            aria-label={text}
        >
            {text.split('').map((char, index) => (
                <motion.span
                    key={index}
                    variants={letterVariants}
                    style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.span>
    );
}

// Parallax scroll effect
interface ParallaxRevealProps {
    children: ReactNode;
    speed?: number; // -1 to 1, negative = slower, positive = faster
    className?: string;
}

export function ParallaxReveal({ children, speed = 0.5, className }: ParallaxRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <motion.div
            ref={ref}
            initial={{ y: 0 }}
            whileInView={{ y: speed * 50 }}
            viewport={{ once: false }}
            transition={{ type: 'tween', ease: 'linear' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
