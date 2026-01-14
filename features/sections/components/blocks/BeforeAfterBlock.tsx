// ============================================
// BEFORE/AFTER BLOCK - Factory V5
// Image comparison slider
// ============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BeforeAfterStyle {
    variant?: 'slider' | 'hover' | 'side-by-side';
    sliderPosition?: number;
    aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2';
    borderRadius?: string;
}

interface BeforeAfterBlockProps {
    content: {
        beforeImage: string;
        afterImage: string;
        beforeLabel?: string;
        afterLabel?: string;
    };
    style?: BeforeAfterStyle;
}

export default function BeforeAfterBlock({ content, style = {} }: BeforeAfterBlockProps) {
    const {
        variant = 'slider',
        sliderPosition: initialPosition = 50,
        aspectRatio = '16:9',
        borderRadius = '1rem',
    } = style;

    const {
        beforeImage,
        afterImage,
        beforeLabel = 'Avant',
        afterLabel = 'Après',
    } = content;

    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const getAspectRatio = () => {
        switch (aspectRatio) {
            case '16:9': return '56.25%';
            case '4:3': return '75%';
            case '1:1': return '100%';
            case '3:2': return '66.67%';
            default: return '56.25%';
        }
    };

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
        setPosition(percentage);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && variant === 'slider') {
            handleMove(e.clientX);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (variant === 'slider') {
            handleMove(e.touches[0].clientX);
        }
    };

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    if (variant === 'side-by-side') {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                maxWidth: '1000px',
                margin: '0 auto',
            }}>
                <div style={{ position: 'relative' }}>
                    <img src={beforeImage} alt={beforeLabel} style={{
                        width: '100%',
                        borderRadius,
                        display: 'block',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '1rem',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                    }}>
                        {beforeLabel}
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <img src={afterImage} alt={afterLabel} style={{
                        width: '100%',
                        borderRadius,
                        display: 'block',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        background: 'rgba(34,211,238,0.9)',
                        color: '#000',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                    }}>
                        {afterLabel}
                    </div>
                </div>
            </div>
        );
    }

    const currentPosition = variant === 'hover' ? (isHovered ? 0 : 100) : position;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseEnter={() => variant === 'hover' && setIsHovered(true)}
            onMouseLeave={() => variant === 'hover' && setIsHovered(false)}
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                paddingBottom: getAspectRatio(),
                borderRadius,
                overflow: 'hidden',
                cursor: variant === 'slider' ? 'ew-resize' : 'pointer',
                userSelect: 'none',
            }}
        >
            {/* After Image (Background) */}
            <img
                src={afterImage}
                alt={afterLabel}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />

            {/* Before Image (Clipped) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                width: `${currentPosition}%`,
                overflow: 'hidden',
                transition: variant === 'hover' ? 'width 0.5s ease' : undefined,
            }}>
                <img
                    src={beforeImage}
                    alt={beforeLabel}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: containerRef.current ? `${(containerRef.current.offsetWidth)}px` : '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>

            {/* Slider Handle */}
            {variant === 'slider' && (
                <div
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${position}%`,
                        transform: 'translateX(-50%)',
                        width: '4px',
                        background: '#22d3ee',
                        cursor: 'ew-resize',
                        zIndex: 10,
                        boxShadow: '0 0 10px rgba(34,211,238,0.5)',
                    }}
                >
                    {/* Handle Button */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#22d3ee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(34,211,238,0.4)',
                    }}>
                        <span style={{ color: '#000', fontSize: '1.25rem' }}>⟷</span>
                    </div>
                </div>
            )}

            {/* Labels */}
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
            }}>
                {beforeLabel}
            </div>
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                background: 'rgba(34,211,238,0.9)',
                color: '#000',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
            }}>
                {afterLabel}
            </div>
        </motion.div>
    );
}
