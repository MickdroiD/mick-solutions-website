'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, Layout, Palette, Zap, MousePointer, Eye } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface EffectSettings {
  // ========== LAYOUT ==========
  heroLayout?: 'text-left' | 'text-right' | 'centered' | 'split';
  columnGap?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';

  // ========== DESIGN (Legacy) ==========
  variant?: 'Minimal' | 'Corporate' | 'Electric' | 'Bold' | 'AI' | 'Custom';
  height?: 'Short' | 'Medium' | 'Tall' | 'FullScreen';
  logoSize?: number;

  // ========== BOUTONS ==========
  buttonShape?: 'rounded' | 'pill' | 'square';
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
  buttonStyle?: 'solid' | 'gradient' | 'outline' | 'ghost';
  showButtonIcon?: boolean;
  buttonHoverScale?: number;

  // ========== LOGO/IMAGE EFFECTS ==========
  // Animation types: none, spin, rotation, pulse, bounce, electric, lightning-circle, tech_hud, spin-glow, vibration, float, swing, flip-3d, stretch, morph, rotate
  logoAnimation?: 'none' | 'spin' | 'rotation' | 'pulse' | 'bounce' | 'electric' | 'lightning-circle' | 'tech_hud' | 'spin-glow' | 'vibration' | 'float' | 'swing' | 'flip-3d' | 'stretch' | 'morph' | 'rotate' | string;
  logoDirectEffect?: string;
  logoIndirectEffect?: string;
  logoFrameShape?: string;
  logoFrameAnimation?: string;
  logoFrameColor?: string;
  logoFrameThickness?: number;
  effectSecondaryColor?: string;

  // ========== ANIMATIONS ==========
  animationSpeed?: 'slow' | 'normal' | 'fast';
  animationIntensity?: 'subtle' | 'normal' | 'strong' | 'intense';
  effectPrimaryColor?: string;

  // ========== BACKGROUND ==========
  backgroundOpacity?: number;
  backgroundBlur?: number;
  backgroundUrl?: string | null;

  // ========== OVERLAY ==========
  overlayColor?: 'black' | 'white' | 'primary' | 'accent' | 'slate';
  overlayOpacity?: number;

  // ========== BLOBS (Background effects) ==========
  showBlobs?: boolean;
  blobSize?: 'sm' | 'md' | 'lg' | 'xl';
  blob1Color?: string;
  blob2Color?: string;

  // ========== ADVANCED ==========
  showScrollIndicator?: boolean;
  scrollIndicatorStyle?: 'mouse' | 'arrow' | 'chevron' | 'dot';
  statsLayout?: 'horizontal' | 'vertical' | 'grid-2' | 'grid-3';
}

interface SectionEffectsProps {
  effects: EffectSettings;
  onChange: (updates: Partial<EffectSettings>) => void;
  showLogoOptions?: boolean;
  showBackgroundOptions?: boolean;
  showLayoutOptions?: boolean;
  showButtonOptions?: boolean;
  showAdvancedOptions?: boolean;
}

// ============================================
// OPTIONS DATA
// ============================================

const HERO_LAYOUTS = [
  { value: 'text-left', label: 'Texte à gauche', emoji: '◀️' },
  { value: 'text-right', label: 'Texte à droite', emoji: '▶️' },
  { value: 'centered', label: 'Centré', emoji: '⏺️' },
  { value: 'split', label: 'Split 50/50', emoji: '↔️' },
];

const COLUMN_GAPS = [
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
  { value: 'xl', label: 'Très grand' },
];

const MAX_WIDTHS = [
  { value: 'md', label: 'Compact' },
  { value: 'lg', label: 'Normal' },
  { value: 'xl', label: 'Large' },
  { value: '2xl', label: 'Très large' },
  { value: 'full', label: 'Pleine largeur' },
];

const PADDING_Y = [
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
  { value: 'xl', label: 'Très grand' },
];

const BUTTON_SHAPES = [
  { value: 'rounded', label: 'Arrondi', emoji: '▢' },
  { value: 'pill', label: 'Pilule', emoji: '💊' },
  { value: 'square', label: 'Carré', emoji: '⬜' },
];

const BUTTON_SIZES = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const BUTTON_STYLES = [
  { value: 'solid', label: 'Solide', emoji: '🟦' },
  { value: 'gradient', label: 'Dégradé', emoji: '🌈' },
  { value: 'outline', label: 'Contour', emoji: '⭕' },
  { value: 'ghost', label: 'Transparent', emoji: '👻' },
];

const DIRECT_EFFECTS = [
  { value: 'none', label: 'Aucun', emoji: '⭕' },
  { value: 'float', label: 'Flottement', emoji: '🎈' },
  { value: 'swing', label: 'Balancement', emoji: '↔️' },
  { value: 'pulse', label: 'Pulsation', emoji: '💓' },
  { value: 'bounce', label: 'Rebond', emoji: '🏀' },
  { value: 'spin', label: 'Rotation', emoji: '🌀' },
];

const LOGO_ANIMATIONS = [
  {
    id: 'none',
    label: 'Aucune',
    emoji: '⭕',
    description: 'Logo statique',
    icon: 'ImageIcon',
    cssClass: ''
  },
  {
    id: 'spin',
    label: 'Spin',
    emoji: '🔄',
    description: 'Rotation rapide',
    icon: 'RotateCw',
    cssClass: 'animate-spin'
  },
  {
    id: 'rotation',
    label: 'Rotation',
    emoji: '🔄',
    description: 'Rotation lente continue',
    icon: 'RotateCw',
    cssClass: 'animate-spin-slow'
  },
  {
    id: 'pulse',
    label: 'Pulsation',
    emoji: '💓',
    description: 'Effet de pulsation',
    icon: 'Heart',
    cssClass: 'animate-pulse'
  },
  {
    id: 'bounce',
    label: 'Rebond',
    emoji: '📳',
    description: 'Effet de rebond',
    icon: 'Zap',
    cssClass: 'animate-bounce'
  },
  {
    id: 'electric',
    label: 'Electric ⚡',
    emoji: '⚡',
    description: 'Effet flicker électrique',
    icon: 'Zap',
    cssClass: 'animate-electric'
  },
  {
    id: 'lightning-circle',
    label: 'Storm ⚡🎯',
    emoji: '🌩️',
    description: 'Tempête électrique chaotique',
    icon: 'Sparkles',
    cssClass: '',
    highlight: true
  },
  {
    id: 'tech_hud',
    label: 'Tech HUD 🎯',
    emoji: '🔧',
    description: 'Interface cyberpunk avec griffes',
    icon: 'Sparkles',
    cssClass: '',
    highlight: true
  },
  {
    id: 'spin-glow',
    label: 'Spin + Glow ✨',
    emoji: '💫',
    description: 'Rotation avec halo lumineux',
    icon: 'RotateCw',
    cssClass: ''
  },
  {
    id: 'vibration',
    label: 'Vibration 📳',
    emoji: '📳',
    description: 'Secousse intense',
    icon: 'Zap',
    cssClass: ''
  },
];

const INDIRECT_EFFECTS = [
  { value: 'none', label: 'Aucun', emoji: '⭕' },
  { value: 'neon-outline', label: 'Contour néon', emoji: '💫' },
  { value: 'particle-orbit', label: 'Particules', emoji: '🌌' },
  { value: 'ripple', label: 'Ondes', emoji: '〰️' },
  { value: 'aura-glow', label: 'Halo', emoji: '✨' },
  { value: 'scan-line', label: 'Scan line', emoji: '📡' },
];

const FRAME_SHAPES = [
  { value: 'none', label: 'Aucun', emoji: '⭕' },
  { value: 'square', label: 'Carré', emoji: '⬜' },
  { value: 'rounded-square', label: 'Arrondi', emoji: '▢' },
  { value: 'rounded', label: 'Très arrondi', emoji: '🔲' },
  { value: 'circle', label: 'Cercle', emoji: '🔵' },
  { value: 'pill', label: 'Pilule', emoji: '💊' },
];

const FRAME_ANIMATIONS = [
  { value: 'none', label: 'Aucune', emoji: '⏸️' },
  { value: 'color-flow', label: 'Flux couleur', emoji: '🌊' },
  { value: 'glow-pulse', label: 'Pulsation', emoji: '💓' },
  { value: 'spin-border', label: 'Bordure tournante', emoji: '🔄' },
  { value: 'neon-sign', label: 'Enseigne néon', emoji: '💡' },
];

const FRAME_COLORS = [
  { value: 'cyan', label: 'Cyan', color: '#22d3ee' },
  { value: 'purple', label: 'Violet', color: '#a78bfa' },
  { value: 'pink', label: 'Rose', color: '#f472b6' },
  { value: 'emerald', label: 'Émeraude', color: '#34d399' },
  { value: 'amber', label: 'Ambre', color: '#fbbf24' },
  { value: 'red', label: 'Rouge', color: '#ef4444' },
  { value: 'blue', label: 'Bleu', color: '#3b82f6' },
  { value: 'white', label: 'Blanc', color: '#ffffff' },
];

const ANIMATION_SPEEDS = [
  { value: 'slow', label: 'Lent', emoji: '🐢' },
  { value: 'normal', label: 'Normal', emoji: '🚶' },
  { value: 'fast', label: 'Rapide', emoji: '🚀' },
];

const ANIMATION_INTENSITIES = [
  { value: 'subtle', label: 'Subtil', emoji: '🌙' },
  { value: 'normal', label: 'Normal', emoji: '☀️' },
  { value: 'strong', label: 'Fort', emoji: '🔥' },
  { value: 'intense', label: 'Intense', emoji: '💥' },
];

const COLOR_PRESETS = [
  { value: 'cyan', label: 'Cyan', color: '#22d3ee' },
  { value: 'purple', label: 'Violet', color: '#a78bfa' },
  { value: 'pink', label: 'Rose', color: '#f472b6' },
  { value: 'emerald', label: 'Émeraude', color: '#34d399' },
  { value: 'amber', label: 'Ambre', color: '#fbbf24' },
  { value: 'red', label: 'Rouge', color: '#ef4444' },
];

const OVERLAY_COLORS = [
  { value: 'black', label: 'Noir', color: '#000000' },
  { value: 'white', label: 'Blanc', color: '#ffffff' },
  { value: 'primary', label: 'Primaire', color: 'var(--primary-900)' },
  { value: 'accent', label: 'Accent', color: 'var(--accent-900)' },
  { value: 'slate', label: 'Ardoise', color: '#0f172a' },
];

const BLOB_SIZES = [
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
  { value: 'xl', label: 'Très grand' },
];

const SCROLL_INDICATORS = [
  { value: 'mouse', label: 'Souris', emoji: '🖱️' },
  { value: 'arrow', label: 'Flèche', emoji: '⬇️' },
  { value: 'chevron', label: 'Chevron', emoji: '∨' },
  { value: 'dot', label: 'Point', emoji: '●' },
];

const STATS_LAYOUTS = [
  { value: 'horizontal', label: 'Horizontal', emoji: '↔️' },
  { value: 'vertical', label: 'Vertical', emoji: '↕️' },
  { value: 'grid-2', label: 'Grille 2', emoji: '⊞' },
  { value: 'grid-3', label: 'Grille 3', emoji: '⊞' },
];

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&h=1080&fit=crop',
];

// ============================================
// COLLAPSIBLE SUB-SECTION
// ============================================

function SubSection({
  title,
  icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 pt-2 space-y-4 border-t border-white/5 bg-slate-900/30">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SectionEffects({
  effects,
  onChange,
  showLogoOptions = true,
  showBackgroundOptions = true,
  showLayoutOptions = true,
  showButtonOptions = true,
  showAdvancedOptions = true,
}: SectionEffectsProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-lg">Effets & Animations</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-6 space-y-4 border-t border-white/5">

          {/* ========== LAYOUT ========== */}
          {showLayoutOptions && (
            <SubSection title="Layout & Disposition" icon={<Layout className="w-4 h-4" />}>
              <div>
                <label className="text-white font-medium text-sm mb-3 block">Disposition du Hero</label>
                <div className="grid grid-cols-4 gap-2">
                  {HERO_LAYOUTS.map((layout) => (
                    <button
                      key={layout.value}
                      type="button"
                      onClick={() => onChange({ heroLayout: layout.value as EffectSettings['heroLayout'] })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${effects.heroLayout === layout.value
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="block text-base mb-1">{layout.emoji}</span>
                      {layout.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Espacement colonnes</label>
                  <div className="grid grid-cols-4 gap-1">
                    {COLUMN_GAPS.map((gap) => (
                      <button
                        key={gap.value}
                        type="button"
                        onClick={() => onChange({ columnGap: gap.value as EffectSettings['columnGap'] })}
                        className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${effects.columnGap === gap.value
                            ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                      >
                        {gap.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Padding vertical</label>
                  <div className="grid grid-cols-4 gap-1">
                    {PADDING_Y.map((pad) => (
                      <button
                        key={pad.value}
                        type="button"
                        onClick={() => onChange({ paddingY: pad.value as EffectSettings['paddingY'] })}
                        className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${effects.paddingY === pad.value
                            ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                      >
                        {pad.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Largeur maximale</label>
                <div className="grid grid-cols-5 gap-2">
                  {MAX_WIDTHS.map((width) => (
                    <button
                      key={width.value}
                      type="button"
                      onClick={() => onChange({ maxWidth: width.value as EffectSettings['maxWidth'] })}
                      className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${effects.maxWidth === width.value
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      {width.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-3 block">Hauteur</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'Short', emoji: '📏', label: 'Court' },
                    { value: 'Medium', emoji: '📐', label: 'Moyen' },
                    { value: 'Tall', emoji: '📊', label: 'Grand' },
                    { value: 'FullScreen', emoji: '🖥️', label: 'Plein écran' }
                  ].map((height) => (
                    <button
                      key={height.value}
                      type="button"
                      onClick={() => onChange({ height: height.value as EffectSettings['height'] })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${effects.height === height.value
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="block text-base mb-1">{height.emoji}</span>
                      {height.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-3 block">
                  Taille du Logo: {effects.logoSize || 280}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  value={effects.logoSize || 280}
                  onChange={(e) => onChange({ logoSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </SubSection>
          )}

          {/* ========== BOUTONS ========== */}
          {showButtonOptions && (
            <SubSection title="Boutons CTA" icon={<MousePointer className="w-4 h-4" />}>
              <div>
                <label className="text-white text-sm mb-2 block">Forme des boutons</label>
                <div className="grid grid-cols-3 gap-2">
                  {BUTTON_SHAPES.map((shape) => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => onChange({ buttonShape: shape.value as EffectSettings['buttonShape'] })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${effects.buttonShape === shape.value
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="block text-base mb-1">{shape.emoji}</span>
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Taille</label>
                  <div className="grid grid-cols-4 gap-1">
                    {BUTTON_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => onChange({ buttonSize: size.value as EffectSettings['buttonSize'] })}
                        className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${effects.buttonSize === size.value
                            ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Style</label>
                  <div className="grid grid-cols-4 gap-1">
                    {BUTTON_STYLES.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => onChange({ buttonStyle: style.value as EffectSettings['buttonStyle'] })}
                        className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${effects.buttonStyle === style.value
                            ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                      >
                        {style.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Afficher icône flèche</span>
                <button
                  type="button"
                  onClick={() => onChange({ showButtonIcon: !effects.showButtonIcon })}
                  className={`w-12 h-6 rounded-full transition-colors ${effects.showButtonIcon !== false ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${effects.showButtonIcon !== false ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                </button>
              </div>
            </SubSection>
          )}

          {/* ========== LOGO/IMAGE EFFECTS ========== */}
          {showLogoOptions && (
            <SubSection title="Effets Logo/Image" icon={<Sparkles className="w-4 h-4" />}>
              {/* Animation du Logo */}
              <div>
                <label className="text-white font-medium text-sm mb-3 block">Animation du Logo</label>
                <p className="text-slate-400 text-xs mb-4">
                  Choisissez l&apos;effet d&apos;animation appliqué au logo dans le header.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
                  {LOGO_ANIMATIONS.map((anim) => {
                    const isSelected = effects.logoAnimation === anim.id;
                    return (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => onChange({ logoAnimation: anim.id as EffectSettings['logoAnimation'] })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? (anim.id === 'electric' || anim.id === 'lightning-circle')
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                              : 'bg-violet-500/20 border-violet-400 text-violet-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">{anim.emoji}</span>
                        <span className="text-xs font-medium text-center">{anim.label}</span>
                        <span className="text-[10px] opacity-70 text-center leading-tight">{anim.description}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Info effet Electric */}
                {effects.logoAnimation === 'electric' && (
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mb-4">
                    <span className="text-cyan-400">⚡</span>
                    <div>
                      <p className="text-cyan-300 font-medium text-sm">Effet Electric activé</p>
                      <p className="text-cyan-400/70 text-xs mt-1">
                        Cet effet ajoute un flickering électrique subtil au logo pour un style high-tech.
                      </p>
                    </div>
                  </div>
                )}

                {/* Info effet Lightning Storm */}
                {effects.logoAnimation === 'lightning-circle' && (
                  <div className="flex items-start gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg mb-4">
                    <span className="text-violet-400">🌩️</span>
                    <div>
                      <p className="text-violet-300 font-medium text-sm">Tempête Électrique activée</p>
                      <p className="text-violet-400/70 text-xs mt-1">
                        Votre logo est entouré d&apos;une tempête magnétique chaotique : éclairs SVG rayonnants, cercles rotatifs pulsants.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-3 block">Effet Direct</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIRECT_EFFECTS.map((effect) => (
                    <button
                      key={effect.value}
                      type="button"
                      onClick={() => onChange({ logoDirectEffect: effect.value })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${effects.logoDirectEffect === effect.value
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="block text-base mb-1">{effect.emoji}</span>
                      {effect.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-2 block">Effet Indirect (Glow sur les contours)</label>
                <p className="text-slate-500 text-xs mb-3">
                  💡 Ces effets s&apos;appliquent aux contours du logo (même si le fond est transparent). L&apos;intensité contrôle la force de l&apos;effet.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {INDIRECT_EFFECTS.map((effect) => (
                    <button
                      key={effect.value}
                      type="button"
                      onClick={() => onChange({ logoIndirectEffect: effect.value })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${effects.logoIndirectEffect === effect.value
                          ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="block text-base mb-1">{effect.emoji}</span>
                      {effect.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forme du cadre */}
              <div>
                <label className="text-white text-sm mb-2 block">Forme du Cadre (entoure le logo)</label>
                <div className="grid grid-cols-6 gap-1">
                  {FRAME_SHAPES.map((shape) => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => onChange({ logoFrameShape: shape.value })}
                      className={`px-2 py-2 rounded-lg border text-xs transition-all flex flex-col items-center ${effects.logoFrameShape === shape.value
                          ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="text-base">{shape.emoji}</span>
                      <span className="text-[10px] mt-1">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleur et épaisseur du cadre (visible si forme != none) */}
              {effects.logoFrameShape && effects.logoFrameShape !== 'none' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Couleur du Cadre</label>
                      <div className="grid grid-cols-4 gap-1">
                        {FRAME_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => onChange({ logoFrameColor: color.value })}
                            className={`px-2 py-2 rounded-lg border text-xs transition-all flex flex-col items-center gap-1 ${effects.logoFrameColor === color.value
                                ? 'border-cyan-500 bg-cyan-500/20'
                                : 'border-white/10 hover:border-white/20'
                              }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full border border-white/20"
                              style={{ backgroundColor: color.color }}
                            />
                            <span className="text-[10px] text-slate-400">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-white text-sm mb-2 block">
                        Épaisseur: {effects.logoFrameThickness || 2}px
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={effects.logoFrameThickness || 2}
                        onChange={(e) => onChange({ logoFrameThickness: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Fin</span>
                        <span>Épais</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Animation du Cadre</label>
                    <div className="grid grid-cols-5 gap-1">
                      {FRAME_ANIMATIONS.map((anim) => (
                        <button
                          key={anim.value}
                          type="button"
                          onClick={() => onChange({ logoFrameAnimation: anim.value })}
                          className={`px-2 py-2 rounded-lg border text-xs transition-all flex flex-col items-center ${effects.logoFrameAnimation === anim.value
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                          <span className="text-base">{anim.emoji}</span>
                          <span className="text-[10px] mt-1">{anim.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs mt-2">
                      💡 L&apos;animation &quot;Enseigne néon&quot; fait tourner la couleur autour du cadre comme une enseigne lumineuse.
                    </p>
                  </div>

                  {/* Couleur secondaire pour animations bicolores */}
                  {effects.logoFrameAnimation && effects.logoFrameAnimation !== 'none' && (
                    <div>
                      <label className="text-white text-sm mb-2 block">Couleur Secondaire (animation)</label>
                      <div className="grid grid-cols-4 gap-1">
                        {FRAME_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => onChange({ effectSecondaryColor: color.value })}
                            className={`px-2 py-2 rounded-lg border text-xs transition-all flex flex-col items-center gap-1 ${effects.effectSecondaryColor === color.value
                                ? 'border-violet-500 bg-violet-500/20'
                                : 'border-white/10 hover:border-white/20'
                              }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full border border-white/20"
                              style={{ backgroundColor: color.color }}
                            />
                            <span className="text-[10px] text-slate-400">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </SubSection>
          )}

          {/* ========== ANIMATIONS ========== */}
          <SubSection title="Vitesse & Intensité" icon={<Zap className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Vitesse animations</label>
                <div className="grid grid-cols-3 gap-2">
                  {ANIMATION_SPEEDS.map((speed) => (
                    <button
                      key={speed.value}
                      type="button"
                      onClick={() => onChange({ animationSpeed: speed.value as EffectSettings['animationSpeed'] })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${effects.animationSpeed === speed.value
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="block text-base mb-1">{speed.emoji}</span>
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Intensité</label>
                <div className="grid grid-cols-4 gap-1">
                  {ANIMATION_INTENSITIES.map((intensity) => (
                    <button
                      key={intensity.value}
                      type="button"
                      onClick={() => onChange({ animationIntensity: intensity.value as EffectSettings['animationIntensity'] })}
                      className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${effects.animationIntensity === intensity.value
                          ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      {intensity.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-white font-medium text-sm mb-3 block">Couleur des Effets</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onChange({ effectPrimaryColor: preset.value })}
                    className={`px-3 py-2 rounded-lg border-2 text-xs transition-all flex items-center gap-2 ${effects.effectPrimaryColor === preset.value
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </SubSection>

          {/* ========== BACKGROUND ========== */}
          {showBackgroundOptions && (
            <SubSection title="Fond & Overlay" icon={<Palette className="w-4 h-4" />}>
              <div>
                <label className="text-white font-medium text-sm mb-3 block">Fond d&apos;Écran</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const randomBg = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
                      onChange({ backgroundUrl: randomBg });
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-2 border-cyan-500/50 rounded-xl text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-violet-500/30 transition-all"
                  >
                    🎲 Image Aléatoire
                  </button>

                  {effects.backgroundUrl && (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={effects.backgroundUrl}
                        alt="Background preview"
                        className="w-full h-24 object-cover rounded-lg border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => onChange({ backgroundUrl: null })}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        ✕ Retirer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Opacité Arrière-plan: {effects.backgroundOpacity ?? 100}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effects.backgroundOpacity ?? 100}
                  onChange={(e) => onChange({ backgroundOpacity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-slate-500 text-xs mt-1">0% = invisible, 100% = visible</p>
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Flou Arrière-plan: {effects.backgroundBlur ?? 0}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={effects.backgroundBlur ?? 0}
                  onChange={(e) => onChange({ backgroundBlur: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="text-white font-medium text-sm mb-3 block">Overlay (superposition)</label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {OVERLAY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => onChange({ overlayColor: color.value as EffectSettings['overlayColor'] })}
                      className={`px-2 py-2 rounded-lg border-2 text-xs transition-all flex flex-col items-center gap-1 ${effects.overlayColor === color.value
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span
                        className="w-6 h-6 rounded border border-white/20"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-[10px]">{color.label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Opacité Overlay: {effects.overlayOpacity ?? 40}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={effects.overlayOpacity ?? 40}
                    onChange={(e) => onChange({ overlayOpacity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            </SubSection>
          )}

          {/* ========== ADVANCED ========== */}
          {showAdvancedOptions && (
            <SubSection title="Options Avancées" icon={<Eye className="w-4 h-4" />}>
              <div className="space-y-4">
                {/* Blobs */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Afficher les effets lumineux (blobs)</span>
                  <button
                    type="button"
                    onClick={() => onChange({ showBlobs: !effects.showBlobs })}
                    className={`w-12 h-6 rounded-full transition-colors ${effects.showBlobs !== false ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${effects.showBlobs !== false ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>

                {effects.showBlobs !== false && (
                  <div>
                    <label className="text-white text-sm mb-2 block">Taille des blobs</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOB_SIZES.map((size) => (
                        <button
                          key={size.value}
                          type="button"
                          onClick={() => onChange({ blobSize: size.value as EffectSettings['blobSize'] })}
                          className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${effects.blobSize === size.value
                              ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                              : 'border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scroll Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Indicateur de scroll</span>
                  <button
                    type="button"
                    onClick={() => onChange({ showScrollIndicator: !effects.showScrollIndicator })}
                    className={`w-12 h-6 rounded-full transition-colors ${effects.showScrollIndicator !== false ? 'bg-cyan-500' : 'bg-slate-600'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${effects.showScrollIndicator !== false ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>

                {effects.showScrollIndicator !== false && (
                  <div>
                    <label className="text-white text-sm mb-2 block">Style indicateur</label>
                    <div className="grid grid-cols-4 gap-2">
                      {SCROLL_INDICATORS.map((indicator) => (
                        <button
                          key={indicator.value}
                          type="button"
                          onClick={() => onChange({ scrollIndicatorStyle: indicator.value as EffectSettings['scrollIndicatorStyle'] })}
                          className={`px-2 py-2 rounded-lg border text-xs transition-all ${effects.scrollIndicatorStyle === indicator.value
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                          <span className="block text-base mb-1">{indicator.emoji}</span>
                          {indicator.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Layout */}
                <div>
                  <label className="text-white text-sm mb-2 block">Disposition des statistiques</label>
                  <div className="grid grid-cols-4 gap-2">
                    {STATS_LAYOUTS.map((layout) => (
                      <button
                        key={layout.value}
                        type="button"
                        onClick={() => onChange({ statsLayout: layout.value as EffectSettings['statsLayout'] })}
                        className={`px-2 py-2 rounded-lg border text-xs transition-all ${effects.statsLayout === layout.value
                            ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                      >
                        <span className="block text-base mb-1">{layout.emoji}</span>
                        {layout.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SubSection>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
