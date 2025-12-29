'use client';

import { useState, memo, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AccordionWithToggleProps {
  id: string;
  title: string;
  emoji: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  isActive?: boolean;
  onToggle?: () => void;
  badge?: ReactNode;
}

// ============================================
// COMPOSANT ACCORDION AVEC TOGGLE (MÉMORISÉ)
// ============================================

/**
 * AccordionWithToggle - Composant accordion avec switch on/off
 * 
 * ⚠️ IMPORTANT: Ce composant est défini EN DEHORS des composants parents
 * pour éviter les re-créations à chaque render, ce qui causait des pertes
 * de focus dans les inputs enfants.
 */
function AccordionWithToggleComponent({
  id,
  title,
  emoji,
  children,
  defaultExpanded = true,
  isActive,
  onToggle,
  badge,
}: AccordionWithToggleProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-slate-800/50">
        <button
          type="button"
          onClick={toggleExpand}
          className="flex items-center gap-3 hover:opacity-80 transition-all"
        >
          <span className="text-xl">{emoji}</span>
          <span className="text-white font-medium">{title}</span>
          {badge}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {onToggle !== undefined && (
          <div className="flex items-center gap-3">
            {isActive ? (
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" /> Activé
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-xs flex items-center gap-1">
                <EyeOff className="w-3 h-3" /> Off
              </span>
            )}
            <button
              type="button"
              onClick={onToggle}
              className={`w-12 h-6 rounded-full transition-all ${isActive ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        )}
      </div>

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

// Export mémorisé
export const AccordionWithToggle = memo(AccordionWithToggleComponent);
export default AccordionWithToggle;

