// ============================================
// ICON BLOCK - Factory V5
// Icônes Lucide avec style personnalisable
// ============================================

'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export interface IconBlockProps {
    content: {
        name: string; // Nom de l'icône Lucide (ex: "Rocket", "Star")
        label?: string;
    };
    style?: {
        size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        color?: string;
        backgroundColor?: string;
        shape?: 'none' | 'circle' | 'square' | 'rounded';
        animation?: 'none' | 'pulse' | 'bounce' | 'spin';
    };
}

const SIZE_MAP: Record<string, number> = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
    '2xl': 96,
};

const CONTAINER_SIZE_MAP: Record<string, string> = {
    sm: '3rem',
    md: '4rem',
    lg: '5rem',
    xl: '6rem',
    '2xl': '8rem',
};

const SHAPE_STYLES: Record<string, React.CSSProperties> = {
    none: {},
    circle: {
        borderRadius: '50%',
        padding: '0.75rem',
    },
    square: {
        borderRadius: '0',
        padding: '0.75rem',
    },
    rounded: {
        borderRadius: '0.5rem',
        padding: '0.75rem',
    },
};

const ANIMATION_VARIANTS = {
    none: {},
    pulse: {
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 2 },
    },
    bounce: {
        y: [0, -8, 0],
        transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
    },
    spin: {
        rotate: 360,
        transition: { repeat: Infinity, duration: 3, ease: 'linear' },
    },
};

export default function IconBlock({ content, style }: IconBlockProps) {
    const iconName = content.name || 'Star';
    const size = style?.size || 'lg';
    const color = style?.color || '#22d3ee';
    const backgroundColor = style?.backgroundColor;
    const shape = style?.shape || 'none';
    const animation = style?.animation || 'none';

    // Récupération dynamique de l'icône Lucide
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Star;

    const containerStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: shape !== 'none' ? CONTAINER_SIZE_MAP[size] : 'auto',
        height: shape !== 'none' ? CONTAINER_SIZE_MAP[size] : 'auto',
        backgroundColor: shape !== 'none' ? backgroundColor || 'rgba(34, 211, 238, 0.1)' : 'transparent',
        ...SHAPE_STYLES[shape],
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                ...(ANIMATION_VARIANTS[animation] as any),
            }}
            style={containerStyle}
            aria-label={content.label || iconName}
        >
            <IconComponent
                size={SIZE_MAP[size]}
                color={color}
                strokeWidth={1.5}
            />
        </motion.div>
    );
}

// Export de la liste des icônes disponibles pour l'éditeur
export const AVAILABLE_ICONS = [
    'Star', 'Heart', 'Rocket', 'Zap', 'Award', 'Target', 'Sparkles',
    'Coffee', 'Globe', 'Mail', 'Phone', 'MapPin', 'Calendar', 'Clock',
    'User', 'Users', 'Settings', 'Search', 'Home', 'Menu', 'X',
    'Check', 'ChevronRight', 'ArrowRight', 'ExternalLink', 'Link',
    'Image', 'Video', 'FileText', 'Folder', 'Download', 'Upload',
    'Eye', 'EyeOff', 'Lock', 'Unlock', 'Shield', 'Key',
    'Code', 'Terminal', 'Database', 'Server', 'Cpu', 'Wifi',
    'Sun', 'Moon', 'Cloud', 'Lightbulb', 'Flame', 'Droplet',
    'Music', 'Headphones', 'Camera', 'Film', 'Mic', 'Volume2',
    'ShoppingCart', 'CreditCard', 'DollarSign', 'Package', 'Gift',
    'ThumbsUp', 'MessageCircle', 'Send', 'Bell', 'Bookmark',
] as const;
