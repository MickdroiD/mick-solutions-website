'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Shield, 
  MapPin, 
  Eye, 
  Banknote,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import type { TrustPoint } from '@/lib/baserow';

// ============================================
// ICON MAPPING
// ============================================
const iconMap: Record<string, LucideIcon> = {
  'map-pin': MapPin,
  mappin: MapPin,
  shield: Shield,
  shieldcheck: Shield,
  eye: Eye,
  banknote: Banknote,
};

function getIcon(iconName: string): LucideIcon {
  if (!iconName) return HelpCircle;
  const normalizedName = iconName.toLowerCase().replace(/[_\s]/g, '-').trim();
  return iconMap[normalizedName] || HelpCircle;
}

// ============================================
// VARIANT TYPES
// ============================================
type VariantType = 'Electric' | 'Minimal' | 'Corporate' | 'Bold';
type CardStyle = 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism';
type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift';

// ============================================
// PROPS INTERFACE
// ============================================
import type { SectionEffectsProps } from '@/lib/types/section-props';
import { getFontFamilyStyle } from '@/lib/helpers/effects-renderer';
import Image from 'next/image';

interface TrustSectionProps extends SectionEffectsProps {
  trustPoints: TrustPoint[];
  variant?: VariantType;
  cardStyle?: CardStyle;
  hoverEffect?: HoverEffect;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaQuestion?: string;
}

// ============================================
// COMPONENT
// ============================================
export default function TrustSection({ 
  trustPoints,
  variant = 'Electric',
  cardStyle = 'Shadow',
  hoverEffect = 'Glow',
  title,
  subtitle,
  ctaText,
  ctaUrl,
  ctaQuestion,
  effects,
  textSettings,
}: TrustSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Card style classes
  const getCardStyleClasses = () => {
    switch (cardStyle) {
      case 'Flat': return 'bg-white/[0.02]';
      case 'Border': return 'bg-white/[0.02] border-2 border-primary-200';
      case 'Glassmorphism': return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'Shadow':
      default: return 'bg-white/[0.02] border border-white/5 shadow-lg';
    }
  };
  
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
  
  // Variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'Minimal': return 'bg-transparent';
      case 'Corporate': return 'bg-primary-50/5';
      case 'Bold': return 'bg-gradient-to-r from-primary-500/5 to-accent-500/5';
      case 'Electric':
      default: return '';
    }
  };

  // ========== EFFECTS ==========
  const bgUrl = effects?.backgroundUrl;
  const bgOpacity = effects?.backgroundOpacity !== undefined ? effects.backgroundOpacity / 100 : 1;
  const showBlobs = effects?.showBlobs !== false;

  return (
    <section id="confiance" className="relative py-24 sm:py-32 overflow-hidden">
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
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[150px]" />
        )}
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Swiss flag stylized */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 mb-6">
            <div className="relative w-8 h-8">
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-white -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-white -translate-x-1/2" />
            </div>
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

        {/* Trust points */}
        <div className="grid md:grid-cols-2 gap-8">
          {trustPoints.map((point, index) => {
            const IconComponent = getIcon(point.Icone);
            
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className={`flex gap-6 p-6 rounded-2xl transition-all duration-300 ${getCardStyleClasses()} ${getHoverEffectClasses()} ${getVariantClasses()}`}>
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-primary-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {point.Titre}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-medium text-primary-300">
                        {point.Badge}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {point.Description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary-500/5 to-accent-500/5 border border-primary-500/10">
            {ctaText && (
              <>
                <p className="text-slate-300">
                  {ctaQuestion || 'Prêt à nous faire confiance ?'}
                </p>
                <a
                  href={ctaUrl || '#contact'}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white
                           bg-gradient-to-r from-primary-500 to-accent-500
                           hover:from-primary-400 hover:to-accent-400
                           transition-all duration-300"
                >
                  {ctaText}
                </a>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
