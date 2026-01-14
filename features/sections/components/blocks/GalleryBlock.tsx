// ============================================
// GALLERY BLOCK - Factory V5
// Supports Grid, Masonry (Mosaic), and Slider
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface GalleryImage {
    url?: string;
    src?: string;  // Alias for url
    alt?: string;
    title?: string;
    caption?: string;
    link?: string;
}

export interface GalleryBlockProps {
    content: {
        images: GalleryImage[];
    };
    style?: {
        mode?: 'grid' | 'masonry' | 'slider';
        columns?: 2 | 3 | 4 | 5;
        gap?: 'sm' | 'md' | 'lg';
        aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
        borderRadius?: string;
        hoverEffect?: 'zoom' | 'lift' | 'glow' | 'none';
        showArrows?: boolean;
        showDots?: boolean;
        autoplay?: boolean;
    };
}

const GAP_MAP = { sm: '0.5rem', md: '1rem', lg: '1.5rem' };

export default function GalleryBlock({ content, style }: GalleryBlockProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [slideIndex, setSlideIndex] = useState(0);

    // Normalize images
    const rawImages = content.images || [];
    const images = rawImages.map(img => ({
        ...img,
        url: img.url || img.src || '',
    }));

    const mode = style?.mode || 'grid';
    const columns = style?.columns || 3;
    const gap = GAP_MAP[style?.gap || 'md'];
    const aspectRatio = style?.aspectRatio || 'square';
    const borderRadius = style?.borderRadius || '0.5rem';
    const hoverEffect = style?.hoverEffect || 'zoom';
    const autoplay = style?.autoplay ?? true;

    // --- LIGHTBOX CONTROLS ---
    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () => setLightboxIndex((prev) => prev !== null ? (prev + 1) % images.length : null);
    const prevImage = () => setLightboxIndex((prev) => prev !== null ? (prev - 1 + images.length) % images.length : null);

    // --- SLIDER CONTROLS ---
    const nextSlide = () => setSlideIndex((prev) => (prev + 1) % images.length);
    const prevSlide = () => setSlideIndex((prev) => (prev - 1 + images.length) % images.length);

    // Autoplay for Slider
    useEffect(() => {
        if (mode === 'slider' && autoplay && images.length > 1) {
            const timer = setInterval(nextSlide, 5000);
            return () => clearInterval(timer);
        }
    }, [mode, autoplay, images.length]);

    // Keyboard navigation for Lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex]);

    if (images.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: 'rgba(255,255,255,0.02)', borderRadius }}>Aucune image</div>;
    }

    // --- RENDER IMAGE COMPONENT ---
    const renderImageParams = (image: any, idx: number, isMasonry = false) => {
        const ar = aspectRatio === 'square' ? '1/1' : aspectRatio === 'landscape' ? '3/2' : aspectRatio === 'portrait' ? '2/3' : 'auto';

        // CSS-based Hover Styles
        // We use a group class strategy or simple inline style with JS mouse events?
        // JS mouse events are easier for inline styles without external CSS.
        // Or we inject a unique ID and a style tag.
        // Let's use simple generic class names if possible, but we don't have global CSS.
        // Better: Use a simple wrapper with group-hover logic or standard CSS transition on the img.

        const content = (
            <div
                key={idx}
                className="gallery-item-group"
                onClick={(e) => {
                    if (!image.link) {
                        e.preventDefault();
                        openLightbox(idx);
                    }
                }}
                style={{
                    position: 'relative',
                    aspectRatio: isMasonry ? undefined : ar,
                    borderRadius,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#1a1a1f',
                    marginBottom: isMasonry ? gap : 0,
                    breakInside: 'avoid',
                }}
            >
                <img
                    src={image.url}
                    alt={image.alt || image.title || `Image ${idx + 1}`}
                    style={{
                        width: '100%',
                        height: isMasonry ? 'auto' : '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease-out',
                    }}
                    onMouseEnter={(e) => {
                        if (hoverEffect === 'zoom') e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        if (hoverEffect === 'zoom') e.currentTarget.style.transform = 'scale(1)';
                    }}
                />

                {/* Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                    {image.link ? <ExternalLink size={24} color="#fff" /> : <ZoomIn size={24} color="#fff" />}
                    {image.title && <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>{image.title}</span>}
                </div>
            </div>
        );

        if (image.link) {
            return <Link key={idx} href={image.link} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link>;
        }
        return content;
    };

    // --- MAIN RENDER ---
    return (
        <>
            {/* 1. SLIDER MODE */}
            {mode === 'slider' && (
                <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ aspectRatio: aspectRatio === 'square' ? '1/1' : aspectRatio === 'landscape' ? '16/9' : '3/4', borderRadius, overflow: 'hidden', position: 'relative' }}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={slideIndex}
                                src={images[slideIndex].url}
                                alt={images[slideIndex].alt}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onClick={() => openLightbox(slideIndex)}
                            />
                        </AnimatePresence>

                        {/* Slider Overlay Info */}
                        {(images[slideIndex].title || images[slideIndex].caption) && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' }}>
                                {images[slideIndex].title && <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{images[slideIndex].title}</h3>}
                                {images[slideIndex].caption && <p style={{ margin: 0, opacity: 0.8 }}>{images[slideIndex].caption}</p>}
                            </div>
                        )}
                    </div>

                    {/* Slider Nav */}
                    {images.length > 1 && (
                        <>
                            <button onClick={prevSlide} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', width: '40px', height: '40px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={24} /></button>
                            <button onClick={nextSlide} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', width: '40px', height: '40px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={24} /></button>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSlideIndex(idx)}
                                        style={{ width: idx === slideIndex ? '24px' : '8px', height: '8px', borderRadius: '4px', background: idx === slideIndex ? '#22d3ee' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* 2. GRID / MASONRY MODE */}
            {mode !== 'slider' && (
                <div style={
                    mode === 'masonry'
                        ? { columnCount: columns, columnGap: gap }
                        : { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }
                }>
                    {images.map((img, idx) => renderImageParams(img, idx, mode === 'masonry'))}
                </div>
            )}

            {/* SHARED LIGHTBOX */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1000,
                            background: 'rgba(0,0,0,0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem',
                        }}
                    >
                        <button onClick={closeLightbox} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
                            <X size={24} />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={24} /></button>
                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={24} /></button>

                        <motion.img
                            key={lightboxIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={images[lightboxIndex].url}
                            alt={images[lightboxIndex].alt}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: '0.5rem',
                            }}
                        />
                        <div style={{ position: 'absolute', bottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                            {lightboxIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
