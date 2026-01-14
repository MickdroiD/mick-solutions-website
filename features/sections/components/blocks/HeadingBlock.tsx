// ============================================
// HEADING BLOCK - Factory V5
// With Light Effects: Glow, Neon, Shadow, Outline, 3D
// ============================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { HeadingBlock as HeadingBlockType } from '../../types-universal';

// Text effect to CSS mapping
function getTextEffectStyle(effect?: string, color?: string): React.CSSProperties {
    const effectColor = color || '#22d3ee';

    switch (effect) {
        case 'glow':
            return {
                textShadow: `0 0 10px ${effectColor}, 0 0 20px ${effectColor}, 0 0 40px ${effectColor}`,
            };
        case 'neon':
            return {
                textShadow: `0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${effectColor}, 0 0 20px ${effectColor}, 0 0 35px ${effectColor}, 0 0 40px ${effectColor}`,
            };
        case 'shadow':
            return {
                textShadow: '2px 2px 4px rgba(0,0,0,0.5), 4px 4px 8px rgba(0,0,0,0.3)',
            };
        case 'outline':
            return {
                WebkitTextStroke: `1px ${effectColor}`,
                textShadow: `0 0 2px ${effectColor}`,
            } as React.CSSProperties;
        case '3d':
            return {
                textShadow: `1px 1px 0 ${effectColor}, 2px 2px 0 ${effectColor}, 3px 3px 0 ${effectColor}, 4px 4px 0 ${effectColor}, 5px 5px 5px rgba(0,0,0,0.4)`,
            };
        default:
            return {};
    }
}

export default function HeadingBlock({ content, style }: HeadingBlockType) {
    const tag = `h${content.level}`;

    // Get text effect styles - use glowColor for light effects, fallback to color
    const effectStyles = getTextEffectStyle(style?.textEffect, style?.glowColor || style?.color);

    const headingStyle: React.CSSProperties = {
        fontSize: style?.fontSize || '2rem',
        fontWeight: style?.fontWeight || '700',
        fontFamily: style?.fontFamily || 'inherit',
        color: style?.gradient ? 'transparent' : (style?.color || '#ffffff'),
        textAlign: (style?.textAlign || style?.align || 'center') as any,
        margin: 0,
        // Apply gradient if enabled
        ...(style?.gradient && {
            backgroundImage: `linear-gradient(to right, ${style.gradientFrom || '#22d3ee'}, ${style.gradientTo || '#a855f7'})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        }),
        // Apply text effects (glow, neon, shadow, outline, 3d)
        ...effectStyles,
    };

    const headingElement = React.createElement(
        tag,
        { style: headingStyle },
        content.text
    );

    return (
        <motion.div
            style={{ textAlign: (style?.textAlign || style?.align || 'center') as any }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            {headingElement}
        </motion.div>
    );
}
