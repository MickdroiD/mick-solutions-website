'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Clock, 
  TrendingDown, 
  Target, 
  Zap,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Advantage } from '@/lib/baserow';

// ============================================
// ICON MAPPING
// ============================================
const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  'trending-down': TrendingDown,
  trendingdown: TrendingDown,
  target: Target,
  zap: Zap,
};

function getIcon(iconName: string): LucideIcon {
  if (!iconName) return HelpCircle;
  const normalizedName = iconName.toLowerCase().replace(/[_\s]/g, '-').trim();
  return iconMap[normalizedName] || HelpCircle;
}

// ============================================
// VARIANT TYPES
// ============================================
type VariantType = 'Grid' | 'List' | 'Cards' | 'Compact';
type CardStyle = 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism';
type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake';

// ============================================
// PROPS INTERFACE
// ============================================
interface AdvantagesSectionProps {
  advantages: Advantage[];
  variant?: VariantType;
  cardStyle?: CardStyle;
  hoverEffect?: HoverEffect;
  title?: string;
  subtitle?: string;
}

// ============================================
// COMPONENT
// ============================================
export default function AdvantagesSection({ 
  advantages,
  variant = 'Grid',
  cardStyle = 'Shadow',
  hoverEffect = 'Scale',
  title = 'Pourquoi automatiser ?',
  subtitle = 'Parce que votre temps vaut plus que des tâches répétitives.',
}: AdvantagesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Grid classes based on variant
  const getGridClasses = () => {
    switch (variant) {
      case 'List': return 'grid-cols-1 max-w-3xl mx-auto';
      case 'Cards': return 'sm:grid-cols-2 lg:grid-cols-4';
      case 'Compact': return 'sm:grid-cols-2 lg:grid-cols-3';
      case 'Grid':
      default: return 'md:grid-cols-2';
    }
  };
  
  // Card classes based on variant
  const getCardClasses = () => {
    switch (variant) {
      case 'List': return 'flex flex-row items-start gap-6 p-6';
      case 'Cards': return 'p-6 text-center';
      case 'Compact': return 'p-4';
      default: return 'p-8';
    }
  };
  
  // Card style classes
  const getCardStyleClasses = () => {
    switch (cardStyle) {
      case 'Flat': return 'bg-white/[0.02]';
      case 'Border': return 'bg-white/[0.02] border-2 border-primary-200';
      case 'Glassmorphism': return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'Shadow':
      default: return 'bg-white/[0.02] border border-white/5 shadow-lg shadow-primary-500/5';
    }
  };
  
  // Hover effect classes
  const getHoverEffectClasses = () => {
    switch (hoverEffect) {
      case 'None': return '';
      case 'Glow': return 'hover:shadow-xl hover:shadow-primary-500/30';
      case 'Lift': return 'hover:-translate-y-2 hover:shadow-xl';
      case 'Shake': return 'hover:animate-shake';
      case 'Scale':
      default: return 'hover:scale-[1.02]';
    }
  };

  return (
    <section id="avantages" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title.includes('automatiser') ? (
              <>Pourquoi <span className="text-gradient">automatiser</span> ?</>
            ) : (
              <>{title.split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{title.split(' ').slice(-1)}</span></>
            )}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Advantages grid */}
        <div className={`grid ${getGridClasses()} gap-6 lg:gap-8`}>
          {advantages.map((advantage, index) => {
            const IconComponent = getIcon(advantage.Icone);
            
            return (
              <motion.div
                key={advantage.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`relative h-full ${getCardClasses()} rounded-2xl ${getCardStyleClasses()} ${getHoverEffectClasses()} hover:border-primary-500/30 transition-all duration-500`}>
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`relative z-10 ${variant === 'List' ? 'flex flex-row items-start gap-6' : ''}`}>
                    {/* Icon */}
                    <div className={`rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                      variant === 'Compact' ? 'w-10 h-10 mb-3' : 
                      variant === 'Cards' ? 'w-12 h-12 mb-4 mx-auto' : 
                      variant === 'List' ? 'w-14 h-14 flex-shrink-0' : 
                      'w-14 h-14 mb-6'
                    }`}>
                      <IconComponent className={`text-primary-400 ${variant === 'Compact' ? 'w-5 h-5' : 'w-7 h-7'}`} />
                    </div>

                    <div className={variant === 'List' ? 'flex-1' : ''}>
                      {/* Highlight badge */}
                      {advantage.Badge && (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4 ${variant === 'Cards' ? 'mx-auto' : ''}`}>
                          <span className="text-xs font-medium text-primary-300">{advantage.Badge}</span>
                        </div>
                      )}

                      {/* Content */}
                      <h3 className={`font-semibold text-white mb-3 ${variant === 'Compact' ? 'text-lg' : 'text-xl'}`}>
                        {advantage.Titre}
                      </h3>
                      <p className={`text-slate-400 leading-relaxed ${variant === 'Compact' ? 'text-sm' : ''}`}>
                        {advantage.Description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
