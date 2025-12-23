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
// PROPS INTERFACE
// ============================================
interface TrustSectionProps {
  trustPoints: TrustPoint[];
}

// ============================================
// COMPONENT
// ============================================
export default function TrustSection({ trustPoints }: TrustSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="confiance" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950/30 to-background" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[150px]" />

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

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Pourquoi nous faire <span className="text-gradient">confiance</span> ?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Nous sommes une entreprise suisse, pour des clients suisses.
            <br className="hidden sm:block" />
            Pragmatisme, sécurité et résultats concrets.
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
                <div className="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary-500/20 transition-all duration-300">
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
            <p className="text-slate-300">
              Prêt à automatiser en toute sérénité ?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white
                       bg-gradient-to-r from-primary-500 to-accent-500
                       hover:from-primary-400 hover:to-accent-400
                       transition-all duration-300"
            >
              Discutons de votre projet
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
