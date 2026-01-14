// ============================================
// ANIMATED TEXT - Factory V5
// Texte avec effets spéciaux
// ============================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
    text: string;
    type: 'typing' | 'splitReveal' | 'gradientFlow' | 'countUp' | 'scramble';
    style?: React.CSSProperties;
    className?: string;
    // Typing options
    typingSpeed?: number;
    showCursor?: boolean;
    // Gradient options
    gradientColors?: string[];
    // CountUp options
    startValue?: number;
    endValue?: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

export default function AnimatedText({
    text,
    type,
    style,
    className,
    typingSpeed = 50,
    showCursor = true,
    gradientColors = ['#22d3ee', '#a855f7', '#22d3ee'],
    startValue = 0,
    endValue,
    duration = 2000,
    suffix = '',
    prefix = '',
}: AnimatedTextProps) {
    const [displayText, setDisplayText] = useState('');
    const [count, setCount] = useState(startValue);

    // Typing Effect
    useEffect(() => {
        if (type !== 'typing') return;

        let index = 0;
        setDisplayText('');

        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
            }
        }, typingSpeed);

        return () => clearInterval(timer);
    }, [text, type, typingSpeed]);

    // CountUp Effect
    useEffect(() => {
        if (type !== 'countUp' || endValue === undefined) return;

        const startTime = Date.now();
        const endTime = startTime + duration;

        const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);

            setCount(currentValue);

            if (now < endTime) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }, [type, startValue, endValue, duration]);

    // Typing
    if (type === 'typing') {
        return (
            <span className={className} style={style}>
                {displayText}
                {showCursor && (
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                        style={{ display: 'inline-block', marginLeft: '2px' }}
                    >
                        |
                    </motion.span>
                )}
            </span>
        );
    }

    // Split Reveal (letter by letter reveal)
    if (type === 'splitReveal') {
        const letters = text.split('');
        return (
            <span className={className} style={{ ...style, display: 'inline-flex', flexWrap: 'wrap' }}>
                {letters.map((letter, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.4 }}
                        style={{ display: 'inline-block', whiteSpace: letter === ' ' ? 'pre' : 'normal' }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </span>
        );
    }

    // Gradient Flow
    if (type === 'gradientFlow') {
        return (
            <motion.span
                className={className}
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                    ...style,
                    background: `linear-gradient(90deg, ${gradientColors.join(', ')})`,
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                {text}
            </motion.span>
        );
    }

    // CountUp
    if (type === 'countUp') {
        return (
            <span className={className} style={style}>
                {prefix}{count.toLocaleString()}{suffix}
            </span>
        );
    }

    // Scramble Effect
    if (type === 'scramble') {
        return <ScrambleText text={text} className={className} style={style} />;
    }

    return <span style={style}>{text}</span>;
}

// Composant séparé pour l'effet scramble
function ScrambleText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
    const [displayText, setDisplayText] = useState(text);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(
                text
                    .split('')
                    .map((char, index) => {
                        if (char === ' ') return ' ';
                        if (index < iteration) return text[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text]);

    return <span className={className} style={style}>{displayText}</span>;
}
