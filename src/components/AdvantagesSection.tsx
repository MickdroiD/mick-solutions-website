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
// PROPS INTERFACE
// ============================================
interface AdvantagesSectionProps {
  advantages: Advantage[];
}

// ============================================
// COMPONENT
// ============================================
export default function AdvantagesSection({ advantages }: AdvantagesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Pourquoi <span className="text-gradient">automatiser</span> ?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Parce que votre temps vaut plus que des tâches répétitives.
            <br className="hidden sm:block" />
            Voici ce que nos clients gagnent concrètement.
          </p>
        </motion.div>

        {/* Advantages grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
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
                <div className="relative h-full p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary-500/30 transition-all duration-500">
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-primary-400" />
                    </div>

                    {/* Highlight badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
                      <span className="text-xs font-medium text-primary-300">{advantage.Badge}</span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {advantage.Titre}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {advantage.Description}
                    </p>
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
