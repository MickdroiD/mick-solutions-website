'use client';

import { memo, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronDown, Palette, 
  Box, Eye, RotateCw
} from 'lucide-react';
import { 
  DIRECT_EFFECTS, 
  INDIRECT_EFFECTS,
  NEON_COLOR_PRESETS,
  INTENSITY_PRESETS,
  type NeonColorPreset,
  type IntensityLevel,
} from '@/components/animations/registry';
import {
  FRAME_SHAPE_OPTIONS,
  FRAME_ANIMATION_OPTIONS,
  FRAME_COLOR_MODE_OPTIONS,
} from '@/components/animations/EnhancedLogoFrame';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface EffectsFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

interface EffectSettings {
  directEffect?: string;
  indirectEffect?: string;
  effectIntensity?: IntensityLevel;
  effectPrimaryColor?: string;
  effectSecondaryColor?: string;
  frameShape?: string;
  frameAnimation?: string;
  frameColorMode?: string;
  showGlowPoints?: boolean;
}

// ============================================
// OPTIONS
// ============================================

const INTENSITY_OPTIONS = Object.entries(INTENSITY_PRESETS).map(([key]) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  icon: key === 'subtle' ? '🌙' : key === 'normal' ? '☀️' : key === 'strong' ? '🔥' : '💥',
}));

const COLOR_OPTIONS = Object.entries(NEON_COLOR_PRESETS).map(([key, value]) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  color: value.primary,
}));

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
  color = 'from-violet-500/20 to-purple-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-violet-400`}>
            {icon}
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-2 space-y-4 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// COLOR PICKER
// ============================================

function ColorPicker({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (color: string) => void;
  label: string;
}) {
  const [showCustom, setShowCustom] = useState(false);
  
  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">{label}</label>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`w-10 h-10 rounded-lg border-2 transition-all ${
              value === color.value 
                ? 'border-white scale-110 ring-2 ring-white/30' 
                : 'border-transparent hover:border-white/30'
            }`}
            style={{ background: color.color }}
            title={color.label}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
            showCustom ? 'border-white' : 'border-white/30'
          } bg-slate-700`}
          title="Couleur personnalisée"
        >
          <Palette className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {showCustom && (
        <div className="flex gap-2 pt-2">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#22d3ee'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#22d3ee"
            className="flex-1 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// EFFECT PREVIEW
// ============================================

function EffectPreview({ 
  directEffect, 
  indirectEffect,
  primaryColor,
}: { 
  directEffect?: string;
  indirectEffect?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const resolvedPrimary = useMemo(() => {
    if (primaryColor && primaryColor in NEON_COLOR_PRESETS) {
      return NEON_COLOR_PRESETS[primaryColor as NeonColorPreset].primary;
    }
    return primaryColor || NEON_COLOR_PRESETS.cyan.primary;
  }, [primaryColor]);

  return (
    <div className="relative flex items-center justify-center p-8 bg-slate-900/80 rounded-xl border border-white/10 min-h-[150px]">
      <div className="relative">
        {/* Placeholder logo for preview */}
        <motion.div
          className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl"
          animate={
            directEffect === 'float' ? { y: [-8, 8, -8] } :
            directEffect === 'swing' ? { rotate: [-12, 12, -12] } :
            directEffect === 'pulse' ? { scale: [1, 1.1, 1] } :
            directEffect === 'bounce' ? { y: [0, -10, 0] } :
            directEffect === 'spin' ? { rotate: 360 } :
            {}
          }
          transition={
            directEffect === 'float' ? { duration: 4, repeat: Infinity } :
            directEffect === 'swing' ? { duration: 2, repeat: Infinity } :
            directEffect === 'pulse' ? { duration: 2, repeat: Infinity } :
            directEffect === 'bounce' ? { duration: 1.5, repeat: Infinity } :
            directEffect === 'spin' ? { duration: 3, repeat: Infinity, ease: 'linear' } :
            {}
          }
          style={{
            boxShadow: indirectEffect === 'neon-outline' 
              ? `0 0 20px ${resolvedPrimary}, inset 0 0 10px ${resolvedPrimary}` 
              : undefined,
          }}
        >
          MS
        </motion.div>
        
        {/* Indirect effect indicators */}
        {indirectEffect === 'particle-orbit' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: resolvedPrimary,
                  left: '50%',
                  top: '50%',
                  boxShadow: `0 0 8px ${resolvedPrimary}`,
                  transform: `rotate(${angle}deg) translateX(50px)`,
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}
        
        {indirectEffect === 'ripple' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: resolvedPrimary }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.5, 2], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-slate-500">
        <span>Direct: {directEffect || 'none'}</span>
        <span>Indirect: {indirectEffect || 'none'}</span>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function EffectsFormComponent({ config, onUpdate }: EffectsFormProps) {
  // Extract current effect settings from config
  const effectSettings = useMemo<EffectSettings>(() => ({
    directEffect: (config.animations as Record<string, unknown>)?.directEffect as string || 'none',
    indirectEffect: (config.animations as Record<string, unknown>)?.indirectEffect as string || 'none',
    effectIntensity: (config.animations as Record<string, unknown>)?.effectIntensity as IntensityLevel || 'normal',
    effectPrimaryColor: (config.animations as Record<string, unknown>)?.effectPrimaryColor as string || 'cyan',
    effectSecondaryColor: (config.animations as Record<string, unknown>)?.effectSecondaryColor as string || 'purple',
    frameShape: (config.branding as Record<string, unknown>)?.frameShape as string || 'rounded-square',
    frameAnimation: (config.branding as Record<string, unknown>)?.frameAnimation as string || 'color-flow',
    frameColorMode: (config.branding as Record<string, unknown>)?.frameColorMode as string || 'moving-gradient',
    showGlowPoints: (config.branding as Record<string, unknown>)?.showGlowPoints as boolean ?? true,
  }), [config.animations, config.branding]);

  // Update handlers
  const updateAnimationSetting = useCallback((key: string, value: unknown) => {
    onUpdate({
      animations: {
        ...config.animations,
        [key]: value,
      },
    });
  }, [config.animations, onUpdate]);

  const updateBrandingSetting = useCallback((key: string, value: unknown) => {
    onUpdate({
      branding: {
        ...config.branding,
        [key]: value,
      },
    });
  }, [config.branding, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== PREVIEW ========== */}
      <CollapsibleSection
        title="Aperçu en temps réel"
        icon={<Eye className="w-5 h-5" />}
        color="from-cyan-500/20 to-blue-500/20"
      >
        <EffectPreview
          directEffect={effectSettings.directEffect}
          indirectEffect={effectSettings.indirectEffect}
          primaryColor={effectSettings.effectPrimaryColor}
          secondaryColor={effectSettings.effectSecondaryColor}
        />
      </CollapsibleSection>

      {/* ========== DIRECT EFFECTS ========== */}
      <CollapsibleSection
        title="Effets Directs"
        icon={<RotateCw className="w-5 h-5" />}
        color="from-emerald-500/20 to-teal-500/20"
      >
        <p className="text-slate-400 text-sm mb-4">
          Transformations appliquées directement à l&apos;élément (rotation, rebond, etc.)
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => updateAnimationSetting('directEffect', 'none')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              effectSettings.directEffect === 'none'
                ? 'border-emerald-500 bg-emerald-500/20'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <span className="block text-2xl mb-1">⏹️</span>
            <span className="text-sm text-white font-medium">Aucun</span>
          </button>
          
          {DIRECT_EFFECTS.map((effect) => (
            <button
              key={effect.value}
              type="button"
              onClick={() => updateAnimationSetting('directEffect', effect.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                effectSettings.directEffect === effect.value
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <span className="block text-2xl mb-1">{effect.icon}</span>
              <span className="text-sm text-white font-medium">{effect.label}</span>
              {effect.description && (
                <span className="block text-xs text-slate-500 mt-1">{effect.description}</span>
              )}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* ========== INDIRECT EFFECTS ========== */}
      <CollapsibleSection
        title="Effets Indirects"
        icon={<Sparkles className="w-5 h-5" />}
        color="from-violet-500/20 to-purple-500/20"
      >
        <p className="text-slate-400 text-sm mb-4">
          Animations externes autour de l&apos;élément (auras, particules, néons)
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateAnimationSetting('indirectEffect', 'none')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              effectSettings.indirectEffect === 'none'
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <span className="block text-2xl mb-1">⏹️</span>
            <span className="text-sm text-white font-medium">Aucun</span>
          </button>
          
          {INDIRECT_EFFECTS.map((effect) => (
            <button
              key={effect.value}
              type="button"
              onClick={() => updateAnimationSetting('indirectEffect', effect.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                effectSettings.indirectEffect === effect.value
                  ? 'border-violet-500 bg-violet-500/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <span className="block text-2xl mb-1">{effect.icon}</span>
              <span className="text-sm text-white font-medium">{effect.label}</span>
              {effect.description && (
                <span className="block text-xs text-slate-500 mt-1">{effect.description}</span>
              )}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* ========== INTENSITY & COLORS ========== */}
      <CollapsibleSection
        title="Intensité & Couleurs"
        icon={<Palette className="w-5 h-5" />}
        color="from-pink-500/20 to-rose-500/20"
        defaultOpen={false}
      >
        {/* Intensity */}
        <div className="space-y-2 mb-6">
          <label className="text-white font-medium text-sm">Intensité des effets</label>
          <div className="grid grid-cols-4 gap-2">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateAnimationSetting('effectIntensity', opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  effectSettings.effectIntensity === opt.value
                    ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block text-lg mb-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color */}
        <div className="mb-6">
          <ColorPicker
            value={effectSettings.effectPrimaryColor || 'cyan'}
            onChange={(color) => updateAnimationSetting('effectPrimaryColor', color)}
            label="Couleur primaire (néon)"
          />
        </div>

        {/* Secondary Color */}
        <ColorPicker
          value={effectSettings.effectSecondaryColor || 'purple'}
          onChange={(color) => updateAnimationSetting('effectSecondaryColor', color)}
          label="Couleur secondaire"
        />
      </CollapsibleSection>

      {/* ========== LOGO FRAMES ========== */}
      <CollapsibleSection
        title="Cadres du Logo"
        icon={<Box className="w-5 h-5" />}
        color="from-amber-500/20 to-orange-500/20"
        defaultOpen={false}
      >
        {/* Frame Shape */}
        <div className="space-y-2 mb-6">
          <label className="text-white font-medium text-sm">Forme du cadre</label>
          <div className="grid grid-cols-4 gap-2">
            {FRAME_SHAPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateBrandingSetting('frameShape', opt.value)}
                className={`px-3 py-3 rounded-xl border-2 text-sm transition-all ${
                  effectSettings.frameShape === opt.value
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block text-lg mb-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Animation */}
        <div className="space-y-2 mb-6">
          <label className="text-white font-medium text-sm">Animation du cadre</label>
          <div className="grid grid-cols-3 gap-2">
            {FRAME_ANIMATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateBrandingSetting('frameAnimation', opt.value)}
                className={`px-3 py-3 rounded-xl border-2 text-sm transition-all ${
                  effectSettings.frameAnimation === opt.value
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block text-lg mb-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Color Mode */}
        <div className="space-y-2 mb-6">
          <label className="text-white font-medium text-sm">Mode couleur du cadre</label>
          <div className="grid grid-cols-4 gap-2">
            {FRAME_COLOR_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateBrandingSetting('frameColorMode', opt.value)}
                className={`px-3 py-3 rounded-xl border-2 text-sm transition-all ${
                  effectSettings.frameColorMode === opt.value
                    ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block text-lg mb-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Show Glow Points */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
          <div>
            <h4 className="text-white font-medium">Points lumineux</h4>
            <p className="text-slate-500 text-sm">Afficher les points de lumière sur les coins du cadre</p>
          </div>
          <button
            type="button"
            onClick={() => updateBrandingSetting('showGlowPoints', !effectSettings.showGlowPoints)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              effectSettings.showGlowPoints 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              effectSettings.showGlowPoints ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const EffectsForm = memo(EffectsFormComponent);

