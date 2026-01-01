'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, ChevronDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface TextSettings {
  // Title
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  titleAlign?: string;
  titleTransform?: string;
  
  // Subtitle
  subtitleFontFamily?: string;
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  subtitleColor?: string;
  
  // Body text
  bodyFontFamily?: string;
  bodyFontSize?: string;
  bodyLineHeight?: string;
  bodyColor?: string;
}

interface SectionTextProps {
  text: TextSettings;
  onChange: (updates: Partial<TextSettings>) => void;
  showTitleOptions?: boolean;
  showSubtitleOptions?: boolean;
  showBodyOptions?: boolean;
}

// ============================================
// OPTIONS
// ============================================

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Space-Grotesk', label: 'Space Grotesk' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'DM-Sans', label: 'DM Sans' },
  { value: 'Playfair-Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
];

const FONT_SIZES_TITLE = [
  { value: 'text-2xl', label: 'S' },
  { value: 'text-3xl', label: 'M' },
  { value: 'text-4xl', label: 'L' },
  { value: 'text-5xl', label: 'XL' },
  { value: 'text-6xl', label: 'XXL' },
];

const FONT_SIZES_SUBTITLE = [
  { value: 'text-lg', label: 'S' },
  { value: 'text-xl', label: 'M' },
  { value: 'text-2xl', label: 'L' },
  { value: 'text-3xl', label: 'XL' },
];

const FONT_SIZES_BODY = [
  { value: 'text-sm', label: 'S' },
  { value: 'text-base', label: 'M' },
  { value: 'text-lg', label: 'L' },
  { value: 'text-xl', label: 'XL' },
];

const FONT_WEIGHTS = [
  { value: 'font-normal', label: 'Normal' },
  { value: 'font-medium', label: 'Medium' },
  { value: 'font-semibold', label: 'Semi-bold' },
  { value: 'font-bold', label: 'Bold' },
  { value: 'font-extrabold', label: 'Extra-bold' },
];

const TEXT_ALIGNS = [
  { value: 'text-left', label: 'Gauche', icon: AlignLeft },
  { value: 'text-center', label: 'Centre', icon: AlignCenter },
  { value: 'text-right', label: 'Droite', icon: AlignRight },
];

const TEXT_TRANSFORMS = [
  { value: 'normal-case', label: 'Normal' },
  { value: 'uppercase', label: 'MAJUSCULES' },
  { value: 'lowercase', label: 'minuscules' },
  { value: 'capitalize', label: 'Capitaliser' },
];

const TEXT_COLORS = [
  { value: 'text-white', label: 'Blanc', color: '#ffffff' },
  { value: 'text-slate-100', label: 'Gris clair', color: '#f1f5f9' },
  { value: 'text-slate-300', label: 'Gris moyen', color: '#cbd5e1' },
  { value: 'text-slate-500', label: 'Gris', color: '#64748b' },
  { value: 'text-cyan-400', label: 'Cyan', color: '#22d3ee' },
  { value: 'text-violet-400', label: 'Violet', color: '#a78bfa' },
  { value: 'text-pink-400', label: 'Rose', color: '#f472b6' },
  { value: 'text-emerald-400', label: 'Émeraude', color: '#34d399' },
];

const LINE_HEIGHTS = [
  { value: 'leading-tight', label: 'Serré' },
  { value: 'leading-snug', label: 'Compact' },
  { value: 'leading-normal', label: 'Normal' },
  { value: 'leading-relaxed', label: 'Aéré' },
  { value: 'leading-loose', label: 'Très aéré' },
];

// ============================================
// COMPONENT
// ============================================

export function SectionText({ 
  text, 
  onChange, 
  showTitleOptions = true,
  showSubtitleOptions = true,
  showBodyOptions = true 
}: SectionTextProps) {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center text-orange-400">
            <Type className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-lg">Typographie & Styles</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-6 space-y-6 border-t border-white/5">
          {/* Title Styles */}
          {showTitleOptions && (
            <div className="space-y-4 pb-6 border-b border-white/5">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">📝</span>
                Titre Principal
              </h4>

              <div>
                <label className="text-white text-sm mb-2 block">Police</label>
                <select
                  value={text.titleFontFamily || 'Inter'}
                  onChange={(e) => onChange({ titleFontFamily: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Taille</label>
                <div className="grid grid-cols-5 gap-2">
                  {FONT_SIZES_TITLE.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => onChange({ titleFontSize: size.value })}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        text.titleFontSize === size.value
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Poids</label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_WEIGHTS.map((weight) => (
                    <button
                      key={weight.value}
                      type="button"
                      onClick={() => onChange({ titleFontWeight: weight.value })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                        text.titleFontWeight === weight.value
                          ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {weight.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Alignement</label>
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_ALIGNS.map((align) => {
                    const Icon = align.icon;
                    return (
                      <button
                        key={align.value}
                        type="button"
                        onClick={() => onChange({ titleAlign: align.value })}
                        className={`px-3 py-2 rounded-lg border-2 text-xs transition-all flex items-center justify-center gap-2 ${
                          text.titleAlign === align.value
                            ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {align.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Transformation</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEXT_TRANSFORMS.map((transform) => (
                    <button
                      key={transform.value}
                      type="button"
                      onClick={() => onChange({ titleTransform: transform.value })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                        text.titleTransform === transform.value
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {transform.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Couleur</label>
                <div className="grid grid-cols-4 gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => onChange({ titleColor: color.value })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs transition-all flex items-center gap-2 ${
                        text.titleColor === color.value
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-xs">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtitle Styles */}
          {showSubtitleOptions && (
            <div className="space-y-4 pb-6 border-b border-white/5">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">📄</span>
                Sous-titre
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Police</label>
                  <select
                    value={text.subtitleFontFamily || 'Inter'}
                    onChange={(e) => onChange({ subtitleFontFamily: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Taille</label>
                  <div className="grid grid-cols-4 gap-1">
                    {FONT_SIZES_SUBTITLE.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => onChange({ subtitleFontSize: size.value })}
                        className={`px-2 py-1.5 rounded-lg border-2 text-xs transition-all ${
                          text.subtitleFontSize === size.value
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Body Text Styles */}
          {showBodyOptions && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">📃</span>
                Texte Corps
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Police</label>
                  <select
                    value={text.bodyFontFamily || 'Inter'}
                    onChange={(e) => onChange({ bodyFontFamily: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Taille</label>
                  <div className="grid grid-cols-4 gap-1">
                    {FONT_SIZES_BODY.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => onChange({ bodyFontSize: size.value })}
                        className={`px-2 py-1.5 rounded-lg border-2 text-xs transition-all ${
                          text.bodyFontSize === size.value
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Hauteur de ligne</label>
                <div className="grid grid-cols-5 gap-2">
                  {LINE_HEIGHTS.map((height) => (
                    <button
                      key={height.value}
                      type="button"
                      onClick={() => onChange({ bodyLineHeight: height.value })}
                      className={`px-2 py-1.5 rounded-lg border-2 text-xs transition-all ${
                        text.bodyLineHeight === height.value
                          ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {height.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

