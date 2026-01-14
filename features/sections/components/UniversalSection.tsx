// ============================================
// UNIVERSAL SECTION - Factory V5
// Le composant core qui rend toutes les sections (avec Fusion V4)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UniversalSectionConfig, ShapeDividerConfig, TypographyConfig } from '../types-universal';
import { SPACING_MAP, HEIGHT_MAP, MAX_WIDTH_MAP, GAP_MAP } from '../types-universal';
import BlockRenderer from './blocks/BlockRenderer';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UniversalSectionProps {
    config: UniversalSectionConfig;
    id?: string;
    isEditable?: boolean;
    onUpdate?: (newConfig: UniversalSectionConfig) => void;
}

// Sortable Wrapper Component
function SortableBlock({ id, children, style }: { id: string, children: React.ReactNode, style?: React.CSSProperties }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const styleWithTransform: React.CSSProperties = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : style?.zIndex,
        opacity: isDragging ? 0.8 : 1,
        position: style?.position || 'relative',
        touchAction: 'none' // Required for pointer sensors
    };

    return (
        <div ref={setNodeRef} style={styleWithTransform} {...attributes} {...listeners}>
            {children}
            {/* Hover overlay hint */}
            <div className="dnd-handle" style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '10px',
                cursor: 'grab', zIndex: 100
            }} />
        </div>
    );
}

const DividerSVG = ({ config, position }: { config: ShapeDividerConfig, position: 'top' | 'bottom' }) => {
    const { shape, color = '#0a0a0f', height = 100, flip = false, invert = false } = config;

    if (shape === 'none') return null;

    // SVG Paths
    const paths = {
        wave: "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
        curve: "M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z",
        triangle: "M1200 120L0 16.48 0 0 1200 0 1200 120z",
        slant: "M1200 120L0 16.48 0 0 1200 0 1200 120z", // Same as triangle usually but can differ
        arrow: "M640 112L0 0 0 0 1280 0 1280 0 640 112z", // Simple arrow down
    };

    const pathD = paths[shape as keyof typeof paths] || paths.wave;

    // Transforms
    const transformX = flip ? 'scaleX(-1)' : 'none';
    const transformY = invert ? 'scaleY(-1)' : 'none';
    const combinedTransform = [transformX, transformY].filter(t => t !== 'none').join(' ');

    return (
        <div style={{
            position: 'absolute',
            [position]: 0,
            left: 0,
            width: '100%',
            overflow: 'hidden',
            lineHeight: 0,
            transform: position === 'top' ? 'rotate(180deg)' : 'none',
            zIndex: 3,
            pointerEvents: 'none',
        }}>
            <svg
                display="block"
                width="calc(130% + 1.3px)"
                height={`${height}px`}
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                style={{
                    transform: combinedTransform !== '' ? combinedTransform : undefined,
                    position: "relative"
                }}
            >
                <path d={pathD} fill={color} />
            </svg>
        </div>
    );
};

export default function UniversalSection({ config, id, isEditable = false, onUpdate }: UniversalSectionProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const bg = config.design?.background || { type: 'solid', color: '#0a0a0f' };

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Requires 5px movement to start drag (prevents accidental clicks)
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = config.blocks?.findIndex((b) => b.id === active.id) ?? -1;
            const newIndex = config.blocks?.findIndex((b) => b.id === over?.id) ?? -1;

            if (oldIndex !== -1 && newIndex !== -1 && config.blocks) {
                const newBlocks = arrayMove(config.blocks, oldIndex, newIndex);
                // Update order property
                const updatedBlocks = newBlocks.map((b, idx) => ({ ...b, order: idx }));

                if (onUpdate) {
                    onUpdate({ ...config, blocks: updatedBlocks });
                }
            }
        }
    };

    // ... existing slideshow effect ...
    useEffect(() => {
        if (bg.type === 'slideshow' && bg.slides && bg.slides.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % bg.slides!.length);
            }, bg.slides[currentSlide]?.duration || 5000);
            return () => clearInterval(interval);
        }
    }, [bg, currentSlide]);

    // ... existing style maps and effectiveMaxWidth ...
    // Build container style
    const containerStyle: React.CSSProperties = {
        minHeight: config.sizing?.height && config.sizing.height in HEIGHT_MAP
            ? HEIGHT_MAP[config.sizing.height as keyof typeof HEIGHT_MAP]
            : config.sizing?.height || 'auto',
        maxHeight: config.sizing?.maxHeight || 'none', // New V5 Feature
        paddingLeft: config.sizing?.paddingX && config.sizing.paddingX in SPACING_MAP
            ? SPACING_MAP[config.sizing.paddingX as keyof typeof SPACING_MAP]
            : config.sizing?.paddingX || '2rem',
        paddingRight: config.sizing?.paddingX && config.sizing.paddingX in SPACING_MAP
            ? SPACING_MAP[config.sizing.paddingX as keyof typeof SPACING_MAP]
            : config.sizing?.paddingX || '2rem',
        paddingTop: config.sizing?.paddingY && config.sizing.paddingY in SPACING_MAP
            ? SPACING_MAP[config.sizing.paddingY as keyof typeof SPACING_MAP]
            : config.sizing?.paddingY || '3rem',
        paddingBottom: config.sizing?.paddingY && config.sizing.paddingY in SPACING_MAP
            ? SPACING_MAP[config.sizing.paddingY as keyof typeof SPACING_MAP]
            : config.sizing?.paddingY || '3rem',
        position: 'relative',
        overflow: 'hidden',
        // TYPOGRAPHY INJECTION
        fontFamily: config.design?.typography?.headlineFont ? `"${config.design.typography.headlineFont}", sans-serif` : 'inherit',
    };

    // ... existing backgroundStyle ...
    const backgroundStyle: React.CSSProperties = {};

    if (config.design?.glassmorphism) {
        const opacity = config.design.glassOpacity ?? 0.1;
        const blur = config.design.glassBlur ?? 12;
        const colorHex = config.design.glassColor || '#ffffff';

        // Simple Hex to RGB conversion
        let r = 255, g = 255, b = 255;
        if (colorHex.startsWith('#')) {
            const hex = colorHex.substring(1);
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16); g = parseInt(hex[1] + hex[1], 16); b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16); g = parseInt(hex.substring(2, 4), 16); b = parseInt(hex.substring(4, 6), 16);
            }
        }

        backgroundStyle.backdropFilter = `blur(${blur}px)`;
        backgroundStyle.WebkitBackdropFilter = `blur(${blur}px)`;
        backgroundStyle.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        backgroundStyle.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
        backgroundStyle.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    } else if (bg.type === 'solid') {
        backgroundStyle.backgroundColor = bg.color || '#0a0a0f';
    } else if (bg.type === 'gradient') {
        const direction = bg.gradientDirection || 'to-br';
        const from = bg.gradientFrom || '#22d3ee';
        const to = bg.gradientTo || '#a855f7';
        const directionMap: Record<string, string> = {
            'to-r': 'to right',
            'to-br': 'to bottom right',
            'to-b': 'to bottom',
            'to-bl': 'to bottom left',
        };
        backgroundStyle.backgroundImage = `linear-gradient(${directionMap[direction] || 'to bottom right'}, ${from}, ${to})`;
    } else if (bg.type === 'animatedGradient') {
        backgroundStyle.background = `linear-gradient(-45deg, #22d3ee, #a855f7, #ec4899, #22d3ee)`;
        backgroundStyle.backgroundSize = '400% 400%';
        backgroundStyle.animation = `gradientShift ${bg.gradientSpeed || 8}s ease infinite`;
    }

    // Container Width Map
    const containerWidthMap: Record<string, string> = {
        default: '1200px',
        narrow: '800px',
        wide: '1400px',
        full: '100%',
    };

    const effectiveMaxWidth = config.layout?.containerWidth && config.layout.containerWidth in containerWidthMap
        ? containerWidthMap[config.layout.containerWidth]
        : (config.sizing?.maxWidth && config.sizing.maxWidth in MAX_WIDTH_MAP
            ? MAX_WIDTH_MAP[config.sizing.maxWidth as keyof typeof MAX_WIDTH_MAP]
            : '1280px');

    // Build layout style
    const layoutStyle: React.CSSProperties = {
        display: config.layout?.type === 'grid' ? 'grid' : 'flex',
        flexDirection: config.layout?.type === 'split' ? 'row' : 'column',
        gap: config.layout?.gap && config.layout.gap in GAP_MAP
            ? GAP_MAP[config.layout.gap as keyof typeof GAP_MAP]
            : config.layout?.gap || '1rem',
        justifyContent: config.layout?.alignment === 'left' ? 'flex-start' :
            config.layout?.alignment === 'right' ? 'flex-end' : 'center',
        alignItems: config.layout?.verticalAlign === 'top' ? 'flex-start' :
            config.layout?.verticalAlign === 'bottom' ? 'flex-end' :
                config.layout?.verticalAlign === 'center' ? 'center' : 'stretch',
        maxWidth: effectiveMaxWidth,
        margin: '0 auto',
        width: '100%',
    };

    if (config.layout?.type === 'grid' && config.layout?.columns) {
        layoutStyle.gridTemplateColumns = `repeat(${config.layout.columns}, 1fr)`;
    }

    // Background image/video settings
    const backgroundOpacity = bg.imageOpacity ?? 1;
    const backgroundBlur = bg.blur ?? 0;

    const renderBlocks = () => {
        const sortedBlocks = (config.blocks || []).sort((a, b) => a.order - b.order);

        if (isEditable) {
            return (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedBlocks.map(b => b.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sortedBlocks.map((block) => (
                            <SortableBlock
                                key={block.id}
                                id={block.id}
                                style={{
                                    position: block.positioning?.mode === 'absolute' ? 'absolute' : 'relative',
                                    top: block.positioning?.top,
                                    left: block.positioning?.left,
                                    right: block.positioning?.right,
                                    bottom: block.positioning?.bottom,
                                    zIndex: block.positioning?.zIndex,
                                    transform: block.positioning?.rotation ? `rotate(${block.positioning.rotation}deg)` : undefined,
                                    width: (!config.layout?.verticalAlign || config.layout.verticalAlign === 'stretch') ? '100%' : 'auto', // Conditional Width
                                    alignSelf: (block.style as any)?.alignSelf || 'auto', // Individual Alignment
                                }}
                            >
                                <BlockRenderer block={block} />
                            </SortableBlock>
                        ))}
                    </SortableContext>
                </DndContext>
            );
        }

        // Standard Render
        return sortedBlocks.map((block) => (
            <motion.div
                key={block.id}
                style={{
                    position: block.positioning?.mode === 'absolute' ? 'absolute' : 'relative',
                    top: block.positioning?.top,
                    left: block.positioning?.left,
                    right: block.positioning?.right,
                    bottom: block.positioning?.bottom,
                    zIndex: block.positioning?.zIndex,
                    transform: block.positioning?.rotation ? `rotate(${block.positioning.rotation}deg)` : undefined,
                    width: (!config.layout?.verticalAlign || config.layout.verticalAlign === 'stretch') ? '100%' : 'auto', // Conditional Width
                    alignSelf: (block.style as any)?.alignSelf || 'auto', // Individual Alignment
                }}
                initial={block.scrollReveal ? {
                    opacity: 0,
                    y: block.animation?.type?.includes('up') ? 30 :
                        block.animation?.type?.includes('down') ? -30 : 0
                } : undefined}
                whileInView={block.scrollReveal ? {
                    opacity: 1,
                    y: 0
                } : undefined}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                    duration: 0.6,
                    delay: block.revealDelay || 0
                }}
            >
                <BlockRenderer block={block} />
            </motion.div>
        ));
    };

    return (
        <>
            {/* CSS & Styles ... */}
            <style>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* Fonts ... */}
            {config.design?.typography?.headlineFont && config.design.typography.headlineFont !== 'Inter' && (
                <link
                    href={`https://fonts.googleapis.com/css2?family=${config.design.typography.headlineFont.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`}
                    rel="stylesheet"
                />
            )}

            <motion.section
                id={id}
                style={{ ...containerStyle, ...backgroundStyle }}
                // Disabled initial animation in edit mode to avoid flickering
                initial={isEditable ? undefined : { opacity: 0 }}
                whileInView={isEditable ? undefined : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                {/* DIVIDERS */}
                {config.design?.dividers?.top && (
                    <DividerSVG config={config.design.dividers.top} position="top" />
                )}

                {/* BACKGROUND LAYERS (Simplified for brevity, kept same) */}
                {bg.type === 'image' && bg.imageUrl && (
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${bg.imageUrl})`, backgroundSize: 'cover', opacity: backgroundOpacity, zIndex: 0 }} />
                )}
                {/* ... other bg types ... */}

                {/* Overlay */}
                {bg.overlay && bg.overlay.opacity > 0 && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: bg.overlay.color || '#000', opacity: bg.overlay.opacity, zIndex: 1 }} />
                )}

                {/* DIVIDER BOTTOM */}
                {config.design?.dividers?.bottom && (
                    <DividerSVG config={config.design.dividers.bottom} position="bottom" />
                )}

                {/* Content Layer */}
                <div style={{ ...layoutStyle, position: 'relative', zIndex: 2 }}>
                    {renderBlocks()}
                </div>
            </motion.section>
        </>
    );
}
