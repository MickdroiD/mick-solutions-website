// ============================================
// IMAGE BLOCK - Factory V5
// ============================================

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { ImageBlock as ImageBlockType } from '../../types-universal';

const ASPECT_RATIO_MAP = {
    '1:1': '100%',
    '4:3': '75%',
    '16:9': '56.25%',
    '21:9': '42.86%',
    'auto': 'auto',
} as const;

const FILTER_MAP = {
    'none': 'none',
    'grayscale': 'grayscale(100%)',
    'sepia': 'sepia(80%)',
    'contrast': 'contrast(150%)',
    'blur': 'blur(4px)',
} as const;

export default function ImageBlock({ content, style, link }: ImageBlockType) {
    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: style?.width || '100%',
        maxWidth: style?.maxWidth || '100%',
        paddingBottom: style?.aspectRatio && style.aspectRatio !== 'auto'
            ? ASPECT_RATIO_MAP[style.aspectRatio]
            : undefined,
        overflow: 'hidden',
        borderRadius: style?.borderRadius || '0.5rem',
    };

    const imageStyle: React.CSSProperties = {
        filter: style?.filter ? FILTER_MAP[style.filter] : 'none',
    };

    const imageElement = (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={containerStyle}
        >
            {style?.aspectRatio && style.aspectRatio !== 'auto' ? (
                <Image
                    src={content.url}
                    alt={content.alt || ''}
                    fill
                    style={{
                        objectFit: style?.objectFit || 'cover',
                        ...imageStyle,
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            ) : (
                <Image
                    src={content.url}
                    alt={content.alt || ''}
                    width={1200}
                    height={800}
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: style?.objectFit || 'cover',
                        ...imageStyle,
                    }}
                />
            )}
        </motion.div>
    );

    // Wrap avec link si configuré
    if (link) {
        if (link.type === 'url') {
            return (
                <Link
                    href={link.target}
                    target={link.openInNewTab ? '_blank' : undefined}
                    rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                >
                    {imageElement}
                </Link>
            );
        } else if (link.type === 'page') {
            return <Link href={link.target}>{imageElement}</Link>;
        }
    }

    return imageElement;
}
