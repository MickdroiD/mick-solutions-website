// ============================================
// DIVIDER BLOCK - Factory V5
// ============================================

'use client';

import type { DividerBlock as DividerBlockType } from '../../types-universal';

export default function DividerBlock({ style }: DividerBlockType) {
    const dividerStyle: React.CSSProperties = {
        width: style?.width || '100%',
        height: style?.thickness || '1px',
        backgroundColor: style?.color || '#333',
        border: 'none',
        borderStyle: style?.style || 'solid',
        margin: '0 auto',
    };

    return <hr style={dividerStyle} />;
}
