// ============================================
// COUNTDOWN BLOCK - Factory V5
// Animated countdown timer
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownStyle {
    variant?: 'boxes' | 'inline' | 'minimal';
    accentColor?: string;
    showLabels?: boolean;
    labels?: {
        days?: string;
        hours?: string;
        minutes?: string;
        seconds?: string;
    };
}

interface CountdownBlockProps {
    content: {
        targetDate: string;
        title?: string;
        expiredMessage?: string;
    };
    style?: CountdownStyle;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownBlock({ content, style = {} }: CountdownBlockProps) {
    const {
        variant = 'boxes',
        accentColor = '#22d3ee',
        showLabels = true,
        labels = { days: 'Jours', hours: 'Heures', minutes: 'Minutes', seconds: 'Secondes' },
    } = style;

    const { targetDate, title, expiredMessage = "L'événement a commencé !" } = content;

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setIsExpired(true);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (isExpired) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: accentColor, fontSize: '1.5rem', fontWeight: 600 }}>{expiredMessage}</p>
            </div>
        );
    }

    const timeUnits = [
        { value: timeLeft.days, label: labels.days },
        { value: timeLeft.hours, label: labels.hours },
        { value: timeLeft.minutes, label: labels.minutes },
        { value: timeLeft.seconds, label: labels.seconds },
    ];

    if (variant === 'inline') {
        return (
            <div style={{ textAlign: 'center' }}>
                {title && <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' }}>{title}</h3>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '2rem', fontWeight: 700, color: accentColor }}>
                    {timeUnits.map((unit, idx) => (
                        <span key={idx}>
                            {String(unit.value).padStart(2, '0')}
                            {idx < timeUnits.length - 1 && <span style={{ color: '#6b7280' }}>:</span>}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div style={{ textAlign: 'center' }}>
                {title && <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' }}>{title}</h3>}
                <p style={{ color: '#d1d5db', fontSize: '1.125rem' }}>
                    <span style={{ color: accentColor, fontWeight: 700 }}>{timeLeft.days}</span> jours{' '}
                    <span style={{ color: accentColor, fontWeight: 700 }}>{timeLeft.hours}</span>h{' '}
                    <span style={{ color: accentColor, fontWeight: 700 }}>{timeLeft.minutes}</span>m{' '}
                    <span style={{ color: accentColor, fontWeight: 700 }}>{timeLeft.seconds}</span>s
                </p>
            </div>
        );
    }

    // Default: boxes variant
    return (
        <div style={{ textAlign: 'center' }}>
            {title && <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>{title}</h3>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {timeUnits.map((unit, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            background: `${accentColor}15`,
                            border: `1px solid ${accentColor}30`,
                            borderRadius: '1rem',
                            padding: '1.5rem 2rem',
                            minWidth: '100px',
                        }}
                    >
                        <motion.div
                            key={unit.value}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            style={{
                                color: accentColor,
                                fontSize: '3rem',
                                fontWeight: 700,
                                lineHeight: 1,
                            }}
                        >
                            {String(unit.value).padStart(2, '0')}
                        </motion.div>
                        {showLabels && (
                            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {unit.label}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
