'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Square, RectangleHorizontal, RectangleVertical, Maximize2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type LayoutType = 'quarter' | 'half-h' | 'half-v' | 'full';

interface LayoutSizeSelectorProps {
  value: LayoutType;
  onChange: (value: LayoutType) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

interface LayoutOption {
  id: LayoutType;
  label: string;
  icon: React.ElementType;
  gridClass: string;
  description: string;
  width: number;
  height: number;
}

// ============================================
// CONFIGURATION
// ============================================

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'quarter',
    label: '1/4',
    icon: Square,
    gridClass: 'col-span-1 row-span-1',
    description: 'Petit bloc (25%)',
    width: 1,
    height: 1,
  },
  {
    id: 'half-h',
    label: '1/2 H',
    icon: RectangleHorizontal,
    gridClass: 'col-span-2 row-span-1',
    description: 'Demi horizontal (50%)',
    width: 2,
    height: 1,
  },
  {
    id: 'half-v',
    label: '1/2 V',
    icon: RectangleVertical,
    gridClass: 'col-span-1 row-span-2',
    description: 'Demi vertical (50%)',
    width: 1,
    height: 2,
  },
  {
    id: 'full',
    label: 'Full',
    icon: Maximize2,
    gridClass: 'col-span-2 row-span-2',
    description: 'Bloc complet (100%)',
    width: 2,
    height: 2,
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function LayoutSizeSelector({
  value,
  onChange,
  disabled = false,
  showLabel = true,
}: LayoutSizeSelectorProps) {
  const [isHovered, setIsHovered] = useState<LayoutType | null>(null);

  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <Grid3X3 className="w-4 h-4" />
          Taille du bloc
        </label>
      )}

      {/* Grille de sélection visuelle */}
      <div className="flex gap-2">
        {LAYOUT_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          const isHoveredOption = isHovered === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => !disabled && onChange(option.id)}
              onMouseEnter={() => setIsHovered(option.id)}
              onMouseLeave={() => setIsHovered(null)}
              disabled={disabled}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/20 text-white'
                  : isHoveredOption
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 bg-white/5 text-slate-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Aperçu visuel */}
              <div className="w-10 h-10 grid grid-cols-2 grid-rows-2 gap-0.5 mb-1">
                {Array.from({ length: 4 }).map((_, idx) => {
                  // Calculer quelles cellules sont "actives" selon le layout
                  const isActive = (() => {
                    switch (option.id) {
                      case 'quarter':
                        return idx === 0;
                      case 'half-h':
                        return idx === 0 || idx === 1;
                      case 'half-v':
                        return idx === 0 || idx === 2;
                      case 'full':
                        return true;
                    }
                  })();

                  return (
                    <div
                      key={idx}
                      className={`rounded-sm transition-all ${
                        isActive
                          ? isSelected
                            ? 'bg-cyan-500'
                            : 'bg-slate-500'
                          : 'bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Label */}
              <span className="text-xs font-medium">{option.label}</span>

              {/* Badge de sélection */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Description du layout sélectionné */}
      {showLabel && (
        <p className="text-xs text-slate-500">
          {LAYOUT_OPTIONS.find((o) => o.id === value)?.description || 'Sélectionnez une taille'}
        </p>
      )}
    </div>
  );
}

// ============================================
// EXPORT DES UTILITAIRES
// ============================================

export function getLayoutGridClass(layoutType: LayoutType): string {
  return LAYOUT_OPTIONS.find((o) => o.id === layoutType)?.gridClass || 'col-span-1 row-span-1';
}

export function getLayoutDimensions(layoutType: LayoutType): { width: number; height: number } {
  const option = LAYOUT_OPTIONS.find((o) => o.id === layoutType);
  return { width: option?.width || 1, height: option?.height || 1 };
}

export { LAYOUT_OPTIONS };

