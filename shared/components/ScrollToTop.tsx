// ============================================
// SCROLL TO TOP BUTTON - Factory V5
// Bouton flottant retour en haut
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
    threshold?: number; // Scroll en px avant d'afficher
    primaryColor?: string;
}

export default function ScrollToTop({
    threshold = 300,
    primaryColor = '#22d3ee',
}: ScrollToTopProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            setIsVisible(scrollTop > threshold);
            setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        background: '#1a1a1f',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}
                    aria-label="Retour en haut"
                >
                    {/* Progress Ring */}
                    <svg
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            transform: 'rotate(-90deg)',
                        }}
                    >
                        <circle
                            cx="50%"
                            cy="50%"
                            r="22"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="22"
                            fill="none"
                            stroke={primaryColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 22}`}
                            strokeDashoffset={`${2 * Math.PI * 22 * (1 - scrollProgress / 100)}`}
                            style={{ transition: 'stroke-dashoffset 0.1s' }}
                        />
                    </svg>
                    <ArrowUp size={20} color={primaryColor} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
