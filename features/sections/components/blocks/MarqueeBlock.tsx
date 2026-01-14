// ============================================
// MARQUEE BLOCK - Factory V5
// Infinite scrolling text/images
// ============================================

'use client';

import { motion } from 'framer-motion';

interface MarqueeItem {
    text?: string;
    imageUrl?: string;
}

interface MarqueeStyle {
    speed?: 'slow' | 'normal' | 'fast';
    direction?: 'left' | 'right';
    pauseOnHover?: boolean;
    gap?: string;
    textColor?: string;
    fontSize?: string;
}

interface MarqueeBlockProps {
    content: {
        items: MarqueeItem[];
    };
    style?: MarqueeStyle;
}

export default function MarqueeBlock({ content, style = {} }: MarqueeBlockProps) {
    const {
        speed = 'normal',
        direction = 'left',
        pauseOnHover = true,
        gap = '3rem',
        textColor = '#ffffff',
        fontSize = '2rem',
    } = style;

    const { items = [] } = content;

    const getDuration = () => {
        switch (speed) {
            case 'slow': return 40;
            case 'normal': return 25;
            case 'fast': return 15;
            default: return 25;
        }
    };

    // Duplicate items for seamless loop
    const duplicatedItems = [...items, ...items, ...items];

    return (
        <div
            style={{
                width: '100%',
                overflow: 'hidden',
                padding: '1rem 0',
            }}
        >
            <motion.div
                animate={{
                    x: direction === 'left' ? [0, '-33.33%'] : ['-33.33%', 0],
                }}
                transition={{
                    x: {
                        duration: getDuration(),
                        repeat: Infinity,
                        ease: 'linear',
                    },
                }}
                style={{
                    display: 'flex',
                    gap,
                    width: 'fit-content',
                }}
                whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
            >
                {duplicatedItems.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt=""
                                style={{
                                    height: fontSize,
                                    objectFit: 'contain',
                                    filter: 'grayscale(100%)',
                                    opacity: 0.7,
                                    transition: 'all 0.3s',
                                }}
                            />
                        ) : item.text ? (
                            <span
                                style={{
                                    color: textColor,
                                    fontSize,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {item.text}
                            </span>
                        ) : null}

                        {/* Separator */}
                        <span style={{
                            color: '#22d3ee',
                            fontSize,
                            marginLeft: gap,
                            opacity: 0.5,
                        }}>
                            •
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
