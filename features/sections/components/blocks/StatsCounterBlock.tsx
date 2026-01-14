// ============================================
// STATS COUNTER BLOCK - Factory V5
// Animated number counters for KPIs
// ============================================

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
    id: string;
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
}

interface StatsCounterStyle {
    variant?: 'grid' | 'inline' | 'cards';
    columns?: 2 | 3 | 4;
    animate?: boolean;
    duration?: number;
    valueColor?: string;
    labelColor?: string;
    valueSize?: 'md' | 'lg' | 'xl' | '2xl';
}

interface StatsCounterBlockProps {
    content: {
        stats: StatItem[];
    };
    style?: StatsCounterStyle;
}

// Animated counter hook
function useCountUp(end: number, duration: number, shouldStart: boolean) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!shouldStart) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, shouldStart]);

    return count;
}

// Single stat component
function StatCounter({ stat, style, shouldAnimate }: { stat: StatItem; style: StatsCounterStyle; shouldAnimate: boolean }) {
    const {
        valueColor = '#22d3ee',
        labelColor = '#9ca3af',
        valueSize = 'xl',
        animate = true,
        duration = 2,
    } = style;

    const displayValue = animate && shouldAnimate
        ? useCountUp(stat.value, duration, shouldAnimate)
        : stat.value;

    const sizeMap = {
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3.5rem',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
                textAlign: 'center',
                padding: style.variant === 'cards' ? '2rem' : '1rem',
                background: style.variant === 'cards' ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderRadius: style.variant === 'cards' ? '1rem' : '0',
            }}
        >
            <div style={{
                color: valueColor,
                fontSize: sizeMap[valueSize],
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '0.5rem',
            }}>
                {stat.prefix}{displayValue.toLocaleString()}{stat.suffix}
            </div>
            <div style={{
                color: labelColor,
                fontSize: '0.9375rem',
                fontWeight: 500,
            }}>
                {stat.label}
            </div>
        </motion.div>
    );
}

export default function StatsCounterBlock({ content, style = {} }: StatsCounterBlockProps) {
    const {
        variant = 'grid',
        columns = 3,
        animate = true,
    } = style;

    const { stats = [] } = content;
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const getContainerStyles = (): React.CSSProperties => {
        switch (variant) {
            case 'grid':
                return {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '2rem',
                };
            case 'inline':
                return {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '3rem',
                    flexWrap: 'wrap',
                };
            case 'cards':
                return {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '1.5rem',
                };
            default:
                return {};
        }
    };

    return (
        <div ref={ref} style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={getContainerStyles()}>
                {stats.map((stat) => (
                    <StatCounter
                        key={stat.id}
                        stat={stat}
                        style={style}
                        shouldAnimate={animate && isInView}
                    />
                ))}
            </div>
        </div>
    );
}
