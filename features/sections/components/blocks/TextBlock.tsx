// ============================================
// TEXT BLOCK - Factory V5
// ============================================

'use client';

import { motion } from 'framer-motion';
import type { TextBlock as TextBlockType } from '../../types-universal';

export default function TextBlock({ content, style }: TextBlockType) {
    const textStyle: React.CSSProperties = {
        fontSize: style?.fontSize || '1.125rem',
        lineHeight: style?.lineHeight || '1.75',
        color: style?.color || '#d1d5db',
        textAlign: (style?.textAlign || style?.align || 'left') as any,
        margin: 0,
    };

    return (
        <motion.div
            style={{ textAlign: (style?.textAlign || style?.align || 'left') as any }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            {content.html ? (
                <div
                    style={textStyle}
                    dangerouslySetInnerHTML={{ __html: content.html }}
                />
            ) : (
                <p style={textStyle}>
                    {content.text}
                </p>
            )}
        </motion.div>
    );
}
