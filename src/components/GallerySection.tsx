'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import type { GalleryItem, GalleryDisplayType } from '@/lib/baserow';

// ============================================
// PROPS INTERFACE
// ============================================

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  variant?: 'Grid' | 'Slider' | 'Masonry' | 'AI';
  columns?: '2' | '3' | '4' | 'Auto' | string | null;
  animation?: 'None' | 'Fade' | 'Slide' | 'Zoom' | 'Flip' | string | null;
  title?: string;
  subtitle?: string;
}

// ============================================
// LIGHTBOX MODAL
// ============================================

function LightboxModal({
  image,
  title,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  image: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 z-50 flex items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Prev */}
            {hasPrev && (
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Image */}
            <div className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex items-center justify-center">
              <Image
                src={image}
                alt={title}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>

            {/* Navigation Next */}
            {hasNext && (
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Title */}
            {title && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                <p className="text-white text-sm font-medium">{title}</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// SLIDER VIEW
// ============================================

function SliderView({ items, onImageClick }: { items: GalleryItem[]; onImageClick: (index: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Autoplay
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const goToPrev = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="relative aspect-[16/9] md:aspect-[21/9] bg-slate-900/50"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => onImageClick(currentIndex)}
          >
            <Image
              src={items[currentIndex].Image[0].url}
              alt={items[currentIndex].Titre || `Image ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={currentIndex === 0}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Title */}
            {items[currentIndex].Titre && (
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-xl md:text-2xl font-semibold text-white">
                  {items[currentIndex].Titre}
                </h3>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// ANIMATION VARIANTS HELPER
// ============================================

type GalleryAnimationType = 'None' | 'Fade' | 'Slide' | 'Zoom' | 'Flip' | string | null;

function getAnimationVariants(animation: GalleryAnimationType, index: number) {
  const normalizedAnim = (animation || 'Fade').toLowerCase();
  const delay = index * 0.05;
  
  switch (normalizedAnim) {
    case 'slide':
      return {
        initial: { opacity: 0, x: -30 },
        whileInView: { opacity: 1, x: 0 },
        transition: { duration: 0.5, delay },
      };
    case 'zoom':
      return {
        initial: { opacity: 0, scale: 0.8 },
        whileInView: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay },
      };
    case 'flip':
      return {
        initial: { opacity: 0, rotateY: 90 },
        whileInView: { opacity: 1, rotateY: 0 },
        transition: { duration: 0.6, delay },
      };
    case 'none':
      return {
        initial: {},
        whileInView: {},
        transition: {},
      };
    case 'fade':
    default:
      return {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay },
      };
  }
}

// ============================================
// GRID VIEW
// ============================================

type ColumnsType = '2' | '3' | '4' | 'Auto' | string | null;

function GridView({ items, onImageClick, columns, animation }: { 
  items: GalleryItem[]; 
  onImageClick: (index: number) => void;
  columns: ColumnsType;
  animation: GalleryAnimationType;
}) {
  // Determine grid columns based on settings
  const getGridCols = () => {
    const col = columns || '4';
    switch (col) {
      case '2': return 'grid-cols-1 sm:grid-cols-2';
      case '3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 'Auto': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      default: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {items.map((item, index) => {
        const animProps = getAnimationVariants(animation, index);
        return (
          <motion.div
            key={item.id}
            initial={animProps.initial}
            whileInView={animProps.whileInView}
            transition={animProps.transition}
            viewport={{ once: true }}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-900/50"
            onClick={() => onImageClick(index)}
          >
            <Image
              src={item.Image[0].url}
              alt={item.Titre || `Image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Zoom Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Title */}
            {item.Titre && (
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium text-white truncate">
                  {item.Titre}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// MASONRY VIEW (True CSS Columns layout)
// ============================================

function MasonryView({ items, onImageClick, columns, animation }: { 
  items: GalleryItem[]; 
  onImageClick: (index: number) => void;
  columns: ColumnsType;
  animation: GalleryAnimationType;
}) {
  // Determine CSS columns based on settings
  const getColumnsCss = () => {
    const col = columns || '4';
    switch (col) {
      case '2': return 'columns-1 sm:columns-2';
      case '3': return 'columns-1 sm:columns-2 lg:columns-3';
      case '4': return 'columns-2 md:columns-3 lg:columns-4';
      case 'Auto': return 'columns-2 md:columns-3 lg:columns-4 xl:columns-5';
      default: return 'columns-2 md:columns-3 lg:columns-4';
    }
  };

  return (
    <div className={`${getColumnsCss()} gap-4 space-y-4`}>
      {items.map((item, index) => {
        const animProps = getAnimationVariants(animation, index);
        return (
          <motion.div
            key={item.id}
            initial={animProps.initial}
            whileInView={animProps.whileInView}
            transition={animProps.transition}
            viewport={{ once: true }}
            className="group relative break-inside-avoid mb-4 rounded-xl overflow-hidden cursor-pointer bg-slate-900/50 shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500"
            onClick={() => onImageClick(index)}
          >
            <Image
              src={item.Image[0].url}
              alt={item.Titre || `Image ${index + 1}`}
              width={400}
              height={300 + (index % 3) * 100} // Varying heights for masonry effect
              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              {item.Titre && (
                <h4 className="text-lg font-semibold text-white mb-1">
                  {item.Titre}
                </h4>
              )}
              <div className="flex items-center gap-2 text-primary-300">
                <ZoomIn className="w-4 h-4" />
                <span className="text-sm">Agrandir</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// ZOOM VIEW (Grid with scale effect)
// ============================================

function ZoomView({ items, onImageClick, columns, animation }: { 
  items: GalleryItem[]; 
  onImageClick: (index: number) => void;
  columns: ColumnsType;
  animation: GalleryAnimationType;
}) {
  // Determine grid columns based on settings
  const getGridCols = () => {
    const col = columns || '3';
    switch (col) {
      case '2': return 'grid-cols-1 sm:grid-cols-2';
      case '3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 'Auto': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-6`}>
      {items.map((item, index) => {
        const animProps = getAnimationVariants(animation, index);
        return (
          <motion.div
            key={item.id}
            initial={animProps.initial}
            whileInView={animProps.whileInView}
            transition={animProps.transition}
            viewport={{ once: true }}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-slate-900/50 shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 transition-shadow duration-500"
            onClick={() => onImageClick(index)}
          >
            <Image
              src={item.Image[0].url}
              alt={item.Titre || `Image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            
            {/* Permanent Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Hover Gradient Enhancement */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {item.Titre && (
                <h4 className="text-lg font-semibold text-white mb-1">
                  {item.Titre}
                </h4>
              )}
              <div className="flex items-center gap-2 text-primary-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <ZoomIn className="w-4 h-4" />
                <span className="text-sm">Agrandir</span>
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GallerySection({ 
  galleryItems, 
  variant = 'Grid',
  columns = '4',
  animation = 'Fade',
  title = 'Notre Galerie',
  subtitle = 'Découvrez nos réalisations et notre univers en images.'
}: GallerySectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Ne pas rendre si pas d'images
  if (!galleryItems || galleryItems.length === 0) {
    return null;
  }

  // Mapper les variantes aux types d'affichage
  const variantToDisplayType: Record<string, GalleryDisplayType | 'Masonry'> = {
    'Grid': 'Grille',
    'Slider': 'Slider',
    'Masonry': 'Masonry', // True Masonry layout with CSS columns
    'AI': 'Grille',
  };
  
  // Utiliser la variante passée en prop, ou le type de l'item, ou par défaut Grille
  const displayType = variantToDisplayType[variant] || galleryItems[0]?.TypeAffichage || 'Grille';

  // Handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const goToNext = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryItems.length);
  };

  // Render appropriate view based on display type
  const renderGalleryView = () => {
    switch (displayType) {
      case 'Slider':
        return <SliderView items={galleryItems} onImageClick={openLightbox} />;
      case 'Masonry':
        return <MasonryView items={galleryItems} onImageClick={openLightbox} columns={columns} animation={animation} />;
      case 'Zoom':
        return <ZoomView items={galleryItems} onImageClick={openLightbox} columns={columns} animation={animation} />;
      case 'Grille':
      default:
        return <GridView items={galleryItems} onImageClick={openLightbox} columns={columns} animation={animation} />;
    }
  };

  return (
    <section id="galerie" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950/30 to-background" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[120px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Gallery View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderGalleryView()}
        </motion.div>
      </div>

      {/* Lightbox */}
      <LightboxModal
        image={galleryItems[lightboxIndex]?.Image[0]?.url || ''}
        title={galleryItems[lightboxIndex]?.Titre || ''}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onPrev={goToPrev}
        onNext={goToNext}
        hasPrev={galleryItems.length > 1}
        hasNext={galleryItems.length > 1}
      />
    </section>
  );
}

