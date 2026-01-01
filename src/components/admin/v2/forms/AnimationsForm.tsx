'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, MousePointer, ChevronDown,
  Play, Pause, Eye, Loader2, Type
} from 'lucide-react';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface AnimationsFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

// ============================================
// OPTIONS
// ============================================

const ANIMATION_STYLE_OPTIONS = [
  { value: 'mick-electric', label: 'Mick Electric ⚡', description: 'Style signature' },
  { value: 'elegant-fade', label: 'Élégant Fade', description: 'Transitions douces' },
  { value: 'dynamic-slide', label: 'Dynamic Slide', description: 'Glissements modernes' },
  { value: 'minimal', label: 'Minimal', description: 'Animations subtiles' },
  { value: 'none', label: 'Aucune', description: 'Pas d\'animations' },
];

const ANIMATION_SPEED_OPTIONS = [
  { value: 'Slow', label: 'Lent', duration: '600ms' },
  { value: 'Normal', label: 'Normal', duration: '300ms' },
  { value: 'Fast', label: 'Rapide', duration: '150ms' },
  { value: 'Instant', label: 'Instantané', duration: '0ms' },
];

const SCROLL_EFFECT_OPTIONS = [
  { value: 'None', label: 'Aucun', emoji: '⏹️' },
  { value: 'Fade', label: 'Fondu', emoji: '✨' },
  { value: 'Slide', label: 'Glissement', emoji: '➡️' },
  { value: 'Zoom', label: 'Zoom', emoji: '🔍' },
  { value: 'Parallax', label: 'Parallax', emoji: '🎬' },
];

const HOVER_EFFECT_OPTIONS = [
  { value: 'None', label: 'Aucun', emoji: '⏹️' },
  { value: 'Scale', label: 'Agrandir', emoji: '📐' },
  { value: 'Glow', label: 'Lueur', emoji: '✨' },
  { value: 'Lift', label: 'Élever', emoji: '⬆️' },
  { value: 'Shake', label: 'Secouer', emoji: '🔔' },
];

const LOADING_STYLE_OPTIONS = [
  { value: 'None', label: 'Aucun', icon: Pause },
  { value: 'Skeleton', label: 'Skeleton', icon: Eye },
  { value: 'Spinner', label: 'Spinner', icon: Loader2 },
  { value: 'Progress', label: 'Barre', icon: Play },
];

const TEXT_ANIMATION_OPTIONS = [
  { value: 'Gradient', label: 'Gradient animé', emoji: '🌈' },
  { value: 'Typing', label: 'Machine à écrire', emoji: '⌨️' },
  { value: 'Fade', label: 'Fondu', emoji: '✨' },
  { value: 'None', label: 'Aucune', emoji: '⏹️' },
];

// ============================================
// COLLAPSIBLE SECTION
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}

function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  color = 'from-pink-500/20 to-rose-500/20'
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-pink-400`}>
            {icon}
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-6 pt-2 space-y-4 border-t border-white/5">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// ANIMATIONS FORM COMPONENT
// ============================================

function AnimationsFormComponent({ config, onUpdate }: AnimationsFormProps) {
  // ========== HANDLERS ==========
  const updateAnimations = useCallback((key: string, value: unknown) => {
    onUpdate({
      animations: {
        ...config.animations,
        [key]: value,
      },
    });
  }, [config.animations, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== GLOBAL TOGGLE ========== */}
      <CollapsibleSection 
        title="Animations globales" 
        icon={<Sparkles className="w-5 h-5" />}
        color="from-pink-500/20 to-rose-500/20"
      >
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
          <div>
            <h4 className="text-white font-medium">Activer les animations</h4>
            <p className="text-slate-500 text-sm">Désactiver pour améliorer les performances ou l&apos;accessibilité</p>
          </div>
          <button
            type="button"
            onClick={() => updateAnimations('enableAnimations', !config.animations.enableAnimations)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.animations.enableAnimations 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              config.animations.enableAnimations ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {config.animations.enableAnimations && (
          <>
            {/* Animation Style */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-white font-medium text-sm">Style d&apos;animation global</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ANIMATION_STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateAnimations('animationStyle', opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      config.animations.animationStyle === opt.value
                        ? 'border-pink-500 bg-pink-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className={`font-medium text-sm block ${
                      config.animations.animationStyle === opt.value ? 'text-pink-400' : 'text-white'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="text-slate-500 text-xs">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Speed */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-white font-medium text-sm">Vitesse des animations</label>
              <div className="grid grid-cols-4 gap-2">
                {ANIMATION_SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateAnimations('animationSpeed', opt.value)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                      config.animations.animationSpeed === opt.value
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="block font-medium">{opt.label}</span>
                    <span className="text-xs opacity-60">{opt.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* ========== SCROLL EFFECTS ========== */}
      {config.animations.enableAnimations && (
        <CollapsibleSection 
          title="Effets au scroll" 
          icon={<Zap className="w-5 h-5" />}
          color="from-violet-500/20 to-purple-500/20"
        >
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Animation au défilement</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {SCROLL_EFFECT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateAnimations('scrollEffect', opt.value)}
                  className={`px-3 py-3 rounded-xl border-2 text-sm transition-all ${
                    config.animations.scrollEffect === opt.value
                      ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="block text-lg mb-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* ========== HOVER EFFECTS ========== */}
      {config.animations.enableAnimations && (
        <CollapsibleSection 
          title="Effets au survol" 
          icon={<MousePointer className="w-5 h-5" />}
          color="from-emerald-500/20 to-teal-500/20"
        >
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Effet hover sur les éléments interactifs</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {HOVER_EFFECT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateAnimations('hoverEffect', opt.value)}
                  className={`px-3 py-3 rounded-xl border-2 text-sm transition-all ${
                    config.animations.hoverEffect === opt.value
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="block text-lg mb-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* ========== LOADING & TEXT ========== */}
      {config.animations.enableAnimations && (
        <CollapsibleSection 
          title="Chargement & Texte" 
          icon={<Type className="w-5 h-5" />}
          defaultOpen={false}
          color="from-amber-500/20 to-orange-500/20"
        >
          {/* Loading Style */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Style de chargement</label>
            <div className="grid grid-cols-4 gap-2">
              {LOADING_STYLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateAnimations('loadingStyle', opt.value)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm transition-all flex flex-col items-center gap-2 ${
                      config.animations.loadingStyle === opt.value
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Animation */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <label className="text-white font-medium text-sm">Animation du texte (Hero)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TEXT_ANIMATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateAnimations('textAnimation', opt.value)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    config.animations.textAnimation === opt.value
                      ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="block text-lg mb-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const AnimationsForm = memo(AnimationsFormComponent);
