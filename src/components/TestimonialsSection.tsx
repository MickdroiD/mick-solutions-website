'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { Review } from '@/lib/baserow';

// ============================================
// PROPS INTERFACE
// ============================================

type CardStyle = 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism';
type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift';

import type { SectionEffectsProps } from '@/lib/types/section-props';
import { getFontFamilyStyle } from '@/lib/helpers/effects-renderer';

interface TestimonialsSectionProps extends SectionEffectsProps {
  testimonials: Review[];
  variant?: 'Minimal' | 'Carousel' | 'Cards' | 'Video' | 'AI';
  cardStyle?: CardStyle;
  hoverEffect?: HoverEffect;
  title?: string;
  subtitle?: string;
}

// Helper pour obtenir les classes de style de carte
function getCardStyleClasses(style: CardStyle = 'Shadow'): string {
  switch (style) {
    case 'Flat': return 'bg-white/5';
    case 'Border': return 'bg-white/5 border-2 border-primary-200';
    case 'Glassmorphism': return 'bg-white/10 backdrop-blur-md border border-white/20';
    case 'Shadow':
    default: return 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:shadow-lg hover:shadow-primary-500/5';
  }
}

// ============================================
// STAR RATING
// ============================================

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

// ============================================
// TESTIMONIAL CARD
// ============================================

function TestimonialCard({ testimonial, index, cardStyleClasses, hoverStyleClasses }: { testimonial: Review; index: number; cardStyleClasses?: string; hoverStyleClasses?: string }) {
  const rating = parseInt(testimonial.Note) || 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group relative p-6 rounded-2xl transition-all duration-500 ${cardStyleClasses || 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10'} ${hoverStyleClasses || 'hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-500/30'}`}
    >
      {/* Quote icon */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary-500/20" />

      {/* Content */}
      <div className="relative z-10">
        {/* Rating */}
        <div className="mb-4">
          <StarRating rating={rating} />
        </div>

        {/* Message */}
        <p className="text-slate-300 mb-6 leading-relaxed">
          &ldquo;{testimonial.Message}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0">
            {testimonial.Photo && testimonial.Photo.length > 0 ? (
              <Image
                src={testimonial.Photo[0].url}
                alt={testimonial.NomClient}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {testimonial.NomClient.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="font-semibold text-white">{testimonial.NomClient}</p>
            <p className="text-sm text-slate-400">{testimonial.PosteEntreprise}</p>
          </div>
        </div>
      </div>

      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

// ============================================
// CAROUSEL VIEW
// ============================================

function CarouselView({ testimonials }: { testimonials: Review[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];
  const rating = parseInt(current.Note) || 5;

  return (
    <div className="relative max-w-3xl mx-auto">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 sm:p-12"
      >
        {/* Quote */}
        <Quote className="w-12 h-12 mx-auto mb-6 text-primary-500/40" />

        {/* Message */}
        <p className="text-xl sm:text-2xl text-white mb-8 leading-relaxed">
          &ldquo;{current.Message}&rdquo;
        </p>

        {/* Rating */}
        <div className="flex justify-center mb-6">
          <StarRating rating={rating} />
        </div>

        {/* Author */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0">
            {current.Photo && current.Photo.length > 0 ? (
              <Image
                src={current.Photo[0].url}
                alt={current.NomClient}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                {current.NomClient.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">{current.NomClient}</p>
            <p className="text-sm text-slate-400">{current.PosteEntreprise}</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary-500 w-6'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TestimonialsSection({
  testimonials,
  variant = 'Cards',
  cardStyle = 'Shadow',
  hoverEffect = 'Glow',
  title = 'Ce que disent nos clients',
  subtitle = 'Les témoignages rassurent vos futurs clients.',
  effects,
  textSettings,
}: TestimonialsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // Hover effect classes
  const getHoverEffectClasses = () => {
    switch (hoverEffect) {
      case 'None': return '';
      case 'Scale': return 'hover:scale-[1.02]';
      case 'Lift': return 'hover:-translate-y-2 hover:shadow-xl';
      case 'Glow':
      default: return 'hover:shadow-primary-500/20 hover:border-primary-500/30';
    }
  };
  
  // Obtenir les classes de style de carte
  const cardClasses = getCardStyleClasses(cardStyle);
  const hoverClasses = getHoverEffectClasses();

  // Ne pas rendre si pas de témoignages
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const renderContent = () => {
    switch (variant) {
      case 'Carousel':
        return <CarouselView testimonials={testimonials} />;
      case 'Minimal':
      case 'Cards':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={testimonial.id} 
                testimonial={testimonial} 
                index={index} 
                cardStyleClasses={cardClasses}
                hoverStyleClasses={hoverClasses}
              />
            ))}
          </div>
        );
    }
  };

  // ========== EFFECTS ==========
  const bgUrl = effects?.backgroundUrl;
  const bgOpacity = effects?.backgroundOpacity !== undefined ? effects.backgroundOpacity / 100 : 1;
  const showBlobs = effects?.showBlobs !== false;

  return (
    <section id="temoignages" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {bgUrl ? (
          <Image
            src={bgUrl}
            alt=""
            fill
            className="object-cover"
            style={{ opacity: bgOpacity }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950/30 to-background" />
        )}
        {showBlobs && (
          <>
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[120px]" />
          </>
        )}
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6">
            <Star className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-accent-300">Témoignages clients</span>
          </div>
          <h2 
            className={`${textSettings?.titleFontSize || 'text-3xl sm:text-4xl lg:text-5xl'} ${textSettings?.titleFontWeight || 'font-bold'} ${textSettings?.titleColor || 'text-white'} mb-4`}
            style={getFontFamilyStyle(textSettings?.titleFontFamily)}
          >
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{title.split(' ').slice(-1)}</span>
          </h2>
          <p 
            className={`${textSettings?.subtitleFontSize || 'text-lg'} ${textSettings?.subtitleColor || 'text-slate-400'} max-w-2xl mx-auto`}
            style={getFontFamilyStyle(textSettings?.subtitleFontFamily)}
          >
            {subtitle}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </section>
  );
}

