'use client';

import { useState, memo, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AccordionSectionProps {
  id: string;
  title: string;
  emoji: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  badge?: ReactNode;
}

// ============================================
// COMPOSANT ACCORDION (MÉMORISÉ)
// ============================================

/**
 * AccordionSection - Composant accordion réutilisable pour l'admin panel
 * 
 * ⚠️ IMPORTANT: Ce composant est défini EN DEHORS des composants parents
 * pour éviter les re-créations à chaque render, ce qui causait des pertes
 * de focus dans les inputs enfants.
 */
function AccordionSectionComponent({
  id,
  title,
  emoji,
  children,
  defaultExpanded = true,
  badge,
}: AccordionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <span className="text-white font-medium">{title}</span>
          {badge}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`content-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4 bg-slate-900/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export mémorisé pour éviter re-renders inutiles
export const AccordionSection = memo(AccordionSectionComponent);
export default AccordionSection;

