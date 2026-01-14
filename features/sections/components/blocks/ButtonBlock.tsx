// ============================================
// BUTTON BLOCK - Factory V5
// ============================================

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import type { ButtonBlock as ButtonBlockType } from '../../types-universal';

const BUTTON_STYLES = {
    solid: {
        background: '#22d3ee',
        color: '#000',
    },
    gradient: {
        background: 'linear-gradient(to right, #22d3ee, #a855f7)',
        color: '#fff',
    },
    outline: {
        background: 'transparent',
        color: '#22d3ee',
        border: '2px solid #22d3ee',
    },
    ghost: {
        background: 'transparent',
        color: '#22d3ee',
        border: '1px dashed transparent', // invisible border for sizing
    },
    gloss: {
        background: 'linear-gradient(to bottom, rgba(34,211,238,0.8) 0%, rgba(34,211,238,0.4) 50%, rgba(34,211,238,0.2) 51%, rgba(34,211,238,0.6) 100%)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(4px)',
    },
    neon: {
        background: 'transparent',
        color: '#22d3ee',
        border: '2px solid #22d3ee',
        boxShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee, inset 0 0 5px #22d3ee',
        textShadow: '0 0 5px #22d3ee',
    },
    glass: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
} as const;

const SIZE_MAP = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
    xl: { padding: '1.25rem 2.5rem', fontSize: '1.25rem' },
} as const;

const SHAPE_MAP = {
    rounded: '0.5rem',
    pill: '9999px',
    square: '0',
} as const;

export default function ButtonBlock({ content, style, link = { type: 'url', target: '#' } }: ButtonBlockType) {
    const variant = style?.variant || 'gradient';
    const size = style?.size || 'lg';
    const shape = style?.shape || 'rounded';

    const buttonStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.3s ease',
        ...BUTTON_STYLES[variant],
        ...SIZE_MAP[size],
        borderRadius: SHAPE_MAP[shape],
        ...(style?.color && variant === 'solid' && { background: style.color }),
    };

    const Icon = content.icon ? (LucideIcons as any)[content.icon] : null;

    const buttonContent = (
        <motion.button
            style={buttonStyle}
            whileHover={
                style?.hoverEffect === 'scale' ? { scale: 1.05 } :
                    style?.hoverEffect === 'glow' ? { boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)' } :
                        style?.hoverEffect === 'lift' ? { y: -3, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' } :
                            style?.hoverEffect === 'shadow' ? { boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } :
                                {}
            }
            whileTap={{ scale: 0.98 }}
        >
            {Icon && <Icon size={20} />}
            {content.text}
        </motion.button>
    );

    // Guard: if no link target, just return button
    if (!link?.target) {
        return buttonContent;
    }

    // Wrap avec link
    if (link.type === 'url') {
        return (
            <Link
                href={link.target}
                target={link.openInNewTab ? '_blank' : undefined}
                rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                style={{ textDecoration: 'none' }}
            >
                {buttonContent}
            </Link>
        );
    } else if (link.type === 'page') {
        return (
            <Link href={link.target} style={{ textDecoration: 'none' }}>
                {buttonContent}
            </Link>
        );
    } else if (link.type === 'email') {
        return (
            <a href={`mailto:${link.target}`} style={{ textDecoration: 'none' }}>
                {buttonContent}
            </a>
        );
    } else if (link.type === 'phone') {
        return (
            <a href={`tel:${link.target}`} style={{ textDecoration: 'none' }}>
                {buttonContent}
            </a>
        );
    }

    return buttonContent;
}
