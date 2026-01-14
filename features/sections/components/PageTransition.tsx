// ============================================
// PAGE TRANSITIONS - Factory V5
// Smooth transitions between pages
// ============================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export type TransitionType =
    | 'fade'
    | 'slide-up'
    | 'slide-down'
    | 'slide-left'
    | 'slide-right'
    | 'zoom'
    | 'blur'
    | 'curtain'
    | 'none';

interface PageTransitionProps {
    children: ReactNode;
    transition?: TransitionType;
    duration?: number;
}

// Transition variants for each type
const getTransitionVariants = (transition: TransitionType) => {
    switch (transition) {
        case 'fade':
            return {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
            };
        case 'slide-up':
            return {
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -50 },
            };
        case 'slide-down':
            return {
                initial: { opacity: 0, y: -50 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 50 },
            };
        case 'slide-left':
            return {
                initial: { opacity: 0, x: 100 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -100 },
            };
        case 'slide-right':
            return {
                initial: { opacity: 0, x: -100 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: 100 },
            };
        case 'zoom':
            return {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 1.1 },
            };
        case 'blur':
            return {
                initial: { opacity: 0, filter: 'blur(20px)' },
                animate: { opacity: 1, filter: 'blur(0px)' },
                exit: { opacity: 0, filter: 'blur(20px)' },
            };
        case 'curtain':
            return {
                initial: { opacity: 0, clipPath: 'circle(0% at 50% 50%)' },
                animate: { opacity: 1, clipPath: 'circle(150% at 50% 50%)' },
                exit: { opacity: 0, clipPath: 'circle(0% at 50% 50%)' },
            };
        case 'none':
        default:
            return {
                initial: {},
                animate: {},
                exit: {},
            };
    }
};

export default function PageTransition({
    children,
    transition = 'fade',
    duration = 0.4,
}: PageTransitionProps) {
    const pathname = usePathname();
    const variants = getTransitionVariants(transition);

    if (transition === 'none') {
        return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration, ease: 'easeInOut' }}
                style={{ width: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Overlay transition (like a curtain effect)
interface OverlayTransitionProps {
    children: ReactNode;
    color?: string;
    duration?: number;
}

export function OverlayTransition({
    children,
    color = '#0a0a0f',
    duration = 0.6,
}: OverlayTransitionProps) {
    const pathname = usePathname();

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration / 2 }}
                    style={{ width: '100%' }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            {/* Overlay */}
            <AnimatePresence>
                <motion.div
                    key={`overlay-${pathname}`}
                    initial={{ scaleY: 1 }}
                    animate={{ scaleY: 0 }}
                    exit={{ scaleY: 1 }}
                    transition={{
                        duration,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: color,
                        transformOrigin: 'top',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                />
            </AnimatePresence>
        </>
    );
}

// Progress bar transition
interface ProgressTransitionProps {
    children: ReactNode;
    color?: string;
}

export function ProgressTransition({
    children,
    color = '#22d3ee',
}: ProgressTransitionProps) {
    const pathname = usePathname();

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%' }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
            <AnimatePresence>
                <motion.div
                    key={`progress-${pathname}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: color,
                        transformOrigin: 'left',
                        zIndex: 9999,
                    }}
                />
            </AnimatePresence>
        </>
    );
}
