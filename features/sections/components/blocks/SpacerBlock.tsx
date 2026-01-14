// ============================================
// SPACER BLOCK - Factory V5
// ============================================

'use client';

import type { SpacerBlock as SpacerBlockType } from '../../types-universal';

const HEIGHT_MAP = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
    '2xl': '6rem',
} as const;

export default function SpacerBlock({ content }: SpacerBlockType) {
    const height = typeof content.height === 'string' && content.height in HEIGHT_MAP
        ? HEIGHT_MAP[content.height as keyof typeof HEIGHT_MAP]
        : content.height;

    return <div style={{ height }} aria-hidden="true" />;
}
