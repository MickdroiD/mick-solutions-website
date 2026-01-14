// ============================================
// ANIMATED GRADIENT BACKGROUND - Factory V5
// Dégradé animé fluide
// ============================================

'use client';

import { motion } from 'framer-motion';

export interface AnimatedGradientBackgroundProps {
    colors: string[]; // Au moins 2 couleurs
    speed?: number; // Durée d'animation en secondes
    angle?: number; // Angle du dégradé
    overlay?: {
        color: string;
        opacity: number;
    };
}

export default function AnimatedGradientBackground({
    colors,
    speed = 8,
    angle = 45,
    overlay,
}: AnimatedGradientBackgroundProps) {
    if (colors.length < 2) {
        return <div style={{ position: 'absolute', inset: 0, background: colors[0] || '#000' }} />;
    }

    // Créer les gradients pour l'animation
    const gradients = [
        `linear-gradient(${angle}deg, ${colors.join(', ')})`,
        `linear-gradient(${angle + 60}deg, ${[...colors].reverse().join(', ')})`,
        `linear-gradient(${angle + 120}deg, ${colors.join(', ')})`,
    ];

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
            }}
        >
            <motion.div
                animate={{
                    backgroundImage: gradients,
                }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundSize: '200% 200%',
                }}
            />

            {/* Effet de brillance */}
            <motion.div
                animate={{
                    x: ['-100%', '200%'],
                }}
                transition={{
                    duration: speed * 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    pointerEvents: 'none',
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
