'use client';

import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic
} from 'lucide-react';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface TextStyleFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

interface TextStyleSettings {
  // Title styles
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  titleAlign?: string;
  titleTransform?: string;
  titleLetterSpacing?: string;
  
  // Subtitle styles
  subtitleFontFamily?: string;
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  subtitleColor?: string;
  
  // Body text styles
  bodyFontFamily?: string;
  bodyFontSize?: string;
  bodyLineHeight?: string;
  bodyColor?: string;
  
  // Caption/small text
  captionFontSize?: string;
  captionColor?: string;
}

// ============================================
// OPTIONS
// ============================================

const FONT_FAMILY_OPTIONS = [
  { value: 'Inter', label: 'Inter', style: 'font-sans' },
  { value: 'Poppins', label: 'Poppins', style: 'font-sans' },
  { value: 'Space-Grotesk', label: 'Space Grotesk', style: 'font-sans' },
  { value: 'Outfit', label: 'Outfit', style: 'font-sans' },
  { value: 'Montserrat', label: 'Montserrat', style: 'font-sans' },
  { value: 'DM-Sans', label: 'DM Sans', style: 'font-sans' },
  { value: 'Playfair-Display', label: 'Playfair Display', style: 'font-serif' },
  { value: 'Merriweather', label: 'Merriweather', style: 'font-serif' },
  { value: 'Roboto-Mono', label: 'Roboto Mono', style: 'font-mono' },
  { value: 'JetBrains-Mono', label: 'JetBrains Mono', style: 'font-mono' },
];

const FONT_SIZE_OPTIONS = {
  title: [
    { value: 'text-2xl', label: 'S', px: '24px' },
    { value: 'text-3xl', label: 'M', px: '30px' },
    { value: 'text-4xl', label: 'L', px: '36px' },
    { value: 'text-5xl', label: 'XL', px: '48px' },
    { value: 'text-6xl', label: 'XXL', px: '60px' },
  ],
  subtitle: [
    { value: 'text-lg', label: 'S', px: '18px' },
    { value: 'text-xl', label: 'M', px: '20px' },
    { value: 'text-2xl', label: 'L', px: '24px' },
    { value: 'text-3xl', label: 'XL', px: '30px' },
  ],
  body: [
    { value: 'text-sm', label: 'S', px: '14px' },
    { value: 'text-base', label: 'M', px: '16px' },
    { value: 'text-lg', label: 'L', px: '18px' },
    { value: 'text-xl', label: 'XL', px: '20px' },
  ],
};

const FONT_WEIGHT_OPTIONS = [
  { value: 'font-normal', label: 'Normal', weight: '400' },
  { value: 'font-medium', label: 'Medium', weight: '500' },
  { value: 'font-semibold', label: 'Semi-bold', weight: '600' },
  { value: 'font-bold', label: 'Bold', weight: '700' },
  { value: 'font-extrabold', label: 'Extra-bold', weight: '800' },
  { value: 'font-black', label: 'Black', weight: '900' },
];

const TEXT_ALIGN_OPTIONS = [
  { value: 'text-left', label: 'Gauche', icon: AlignLeft },
  { value: 'text-center', label: 'Centre', icon: AlignCenter },
  { value: 'text-right', label: 'Droite', icon: AlignRight },
];

const TEXT_TRANSFORM_OPTIONS = [
  { value: 'normal-case', label: 'Normal', example: 'Exemple' },
  { value: 'uppercase', label: 'MAJUSCULES', example: 'EXEMPLE' },
  { value: 'lowercase', label: 'minuscules', example: 'exemple' },
  { value: 'capitalize', label: 'Capitaliser', example: 'Exemple' },
];

const LETTER_SPACING_OPTIONS = [
  { value: 'tracking-tighter', label: 'Serré', spacing: '-0.05em' },
  { value: 'tracking-tight', label: 'Compact', spacing: '-0.025em' },
  { value: 'tracking-normal', label: 'Normal', spacing: '0' },
  { value: 'tracking-wide', label: 'Large', spacing: '0.025em' },
  { value: 'tracking-wider', label: 'Très large', spacing: '0.05em' },
  { value: 'tracking-widest', label: 'Maximum', spacing: '0.1em' },
];

const LINE_HEIGHT_OPTIONS = [
  { value: 'leading-tight', label: 'Serré', height: '1.25' },
  { value: 'leading-snug', label: 'Compact', height: '1.375' },
  { value: 'leading-normal', label: 'Normal', height: '1.5' },
  { value: 'leading-relaxed', label: 'Aéré', height: '1.625' },
  { value: 'leading-loose', label: 'Très aéré', height: '2' },
];

const COLOR_PRESETS = [
  { value: 'text-white', label: 'Blanc', color: '#ffffff' },
  { value: 'text-slate-100', label: 'Gris clair', color: '#f1f5f9' },
  { value: 'text-slate-300', label: 'Gris moyen', color: '#cbd5e1' },
  { value: 'text-slate-400', label: 'Gris', color: '#94a3b8' },
  { value: 'text-slate-500', label: 'Gris foncé', color: '#64748b' },
  { value: 'text-cyan-400', label: 'Cyan', color: '#22d3ee' },
  { value: 'text-violet-400', label: 'Violet', color: '#a78bfa' },
  { value: 'text-pink-400', label: 'Rose', color: '#f472b6' },
  { value: 'text-emerald-400', label: 'Émeraude', color: '#34d399' },
  { value: 'text-amber-400', label: 'Ambre', color: '#fbbf24' },
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
  color = 'from-cyan-500/20 to-blue-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-cyan-400`}>
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
// FONT SELECTOR
// ============================================

function FontSelector({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (font: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {FONT_FAMILY_OPTIONS.map((font) => (
          <button
            key={font.value}
            type="button"
            onClick={() => onChange(font.value)}
            className={`px-3 py-2 rounded-lg border-2 text-left transition-all ${
              value === font.value
                ? 'border-cyan-500 bg-cyan-500/20'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <span className={`text-sm font-medium ${value === font.value ? 'text-cyan-400' : 'text-white'}`}>
              {font.label}
            </span>
            <span className={`block text-xs ${font.style} text-slate-500`}>
              {font.style.replace('font-', '')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SIZE SELECTOR
// ============================================

function SizeSelector({ 
  value, 
  onChange, 
  options,
  label 
}: { 
  value: string; 
  onChange: (size: string) => void;
  options: typeof FONT_SIZE_OPTIONS.title;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">{label}</label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-lg border-2 text-center transition-all ${
              value === opt.value
                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                : 'border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <span className="font-bold">{opt.label}</span>
            <span className="block text-xs opacity-60">{opt.px}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// COLOR SELECTOR
// ============================================

function ColorSelector({ 
  value, 
  onChange, 
  label,
  showCustom = true 
}: { 
  value: string; 
  onChange: (color: string) => void;
  label: string;
  showCustom?: boolean;
}) {
  const [customColor, setCustomColor] = useState('#ffffff');
  
  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">{label}</label>
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`w-8 h-8 rounded-lg border-2 transition-all ${
              value === color.value
                ? 'border-white scale-110 ring-2 ring-white/30'
                : 'border-transparent hover:border-white/30'
            }`}
            style={{ backgroundColor: color.color }}
            title={color.label}
          />
        ))}
        {showCustom && (
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                onChange(e.target.value);
              }}
              className="w-8 h-8 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// TEXT PREVIEW
// ============================================

function TextPreview({ 
  titleFont,
  titleSize,
  titleWeight,
  titleColor,
  titleAlign,
  subtitleSize,
  subtitleColor,
  bodySize,
  bodyColor,
}: { 
  titleFont?: string;
  titleSize?: string;
  titleWeight?: string;
  titleColor?: string;
  titleAlign?: string;
  subtitleSize?: string;
  subtitleColor?: string;
  bodySize?: string;
  bodyColor?: string;
}) {
  return (
    <div className="p-6 bg-slate-900/80 rounded-xl border border-white/10 space-y-4">
      <div className={titleAlign || 'text-center'}>
        <h2 
          className={`${titleSize || 'text-4xl'} ${titleWeight || 'font-bold'} ${titleColor || 'text-white'} mb-2`}
          style={{ fontFamily: titleFont || 'inherit' }}
        >
          Titre d&apos;exemple
        </h2>
        <p className={`${subtitleSize || 'text-xl'} ${subtitleColor || 'text-slate-400'}`}>
          Sous-titre descriptif du contenu
        </p>
      </div>
      <p className={`${bodySize || 'text-base'} ${bodyColor || 'text-slate-300'}`}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
        incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function TextStyleFormComponent({ config, onUpdate }: TextStyleFormProps) {
  // Extract text settings from config (stored in branding or a new textStyles object)
  const textStyles: TextStyleSettings = {
    titleFontFamily: (config.branding as Record<string, unknown>)?.titleFontFamily as string || 'Inter',
    titleFontSize: (config.branding as Record<string, unknown>)?.titleFontSize as string || 'text-4xl',
    titleFontWeight: (config.branding as Record<string, unknown>)?.titleFontWeight as string || 'font-bold',
    titleColor: (config.branding as Record<string, unknown>)?.titleColor as string || 'text-white',
    titleAlign: (config.branding as Record<string, unknown>)?.titleAlign as string || 'text-center',
    titleTransform: (config.branding as Record<string, unknown>)?.titleTransform as string || 'normal-case',
    titleLetterSpacing: (config.branding as Record<string, unknown>)?.titleLetterSpacing as string || 'tracking-normal',
    subtitleFontSize: (config.branding as Record<string, unknown>)?.subtitleFontSize as string || 'text-xl',
    subtitleColor: (config.branding as Record<string, unknown>)?.subtitleColor as string || 'text-slate-400',
    bodyFontSize: (config.branding as Record<string, unknown>)?.bodyFontSize as string || 'text-base',
    bodyLineHeight: (config.branding as Record<string, unknown>)?.bodyLineHeight as string || 'leading-normal',
    bodyColor: (config.branding as Record<string, unknown>)?.bodyColor as string || 'text-slate-300',
  };

  // Update handler
  const updateTextStyle = useCallback((key: string, value: string) => {
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
        icon={<Type className="w-5 h-5" />}
        color="from-cyan-500/20 to-blue-500/20"
      >
        <TextPreview
          titleFont={textStyles.titleFontFamily}
          titleSize={textStyles.titleFontSize}
          titleWeight={textStyles.titleFontWeight}
          titleColor={textStyles.titleColor}
          titleAlign={textStyles.titleAlign}
          subtitleSize={textStyles.subtitleFontSize}
          subtitleColor={textStyles.subtitleColor}
          bodySize={textStyles.bodyFontSize}
          bodyColor={textStyles.bodyColor}
        />
      </CollapsibleSection>

      {/* ========== TITLES ========== */}
      <CollapsibleSection
        title="Titres principaux"
        icon={<Bold className="w-5 h-5" />}
        color="from-violet-500/20 to-purple-500/20"
      >
        <FontSelector
          value={textStyles.titleFontFamily || 'Inter'}
          onChange={(font) => updateTextStyle('titleFontFamily', font)}
          label="Police des titres"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <SizeSelector
            value={textStyles.titleFontSize || 'text-4xl'}
            onChange={(size) => updateTextStyle('titleFontSize', size)}
            options={FONT_SIZE_OPTIONS.title}
            label="Taille"
          />
          
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Graisse</label>
            <div className="flex flex-wrap gap-2">
              {FONT_WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateTextStyle('titleFontWeight', opt.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                    textStyles.titleFontWeight === opt.value
                      ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ColorSelector
          value={textStyles.titleColor || 'text-white'}
          onChange={(color) => updateTextStyle('titleColor', color)}
          label="Couleur"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Alignement</label>
            <div className="flex gap-2">
              {TEXT_ALIGN_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateTextStyle('titleAlign', opt.value)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      textStyles.titleAlign === opt.value
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Casse</label>
            <select
              value={textStyles.titleTransform || 'normal-case'}
              onChange={(e) => updateTextStyle('titleTransform', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              {TEXT_TRANSFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Espacement des lettres</label>
          <div className="flex flex-wrap gap-2">
            {LETTER_SPACING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateTextStyle('titleLetterSpacing', opt.value)}
                className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                  textStyles.titleLetterSpacing === opt.value
                    ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ========== SUBTITLES ========== */}
      <CollapsibleSection
        title="Sous-titres"
        icon={<Italic className="w-5 h-5" />}
        color="from-emerald-500/20 to-teal-500/20"
        defaultOpen={false}
      >
        <SizeSelector
          value={textStyles.subtitleFontSize || 'text-xl'}
          onChange={(size) => updateTextStyle('subtitleFontSize', size)}
          options={FONT_SIZE_OPTIONS.subtitle}
          label="Taille"
        />
        
        <ColorSelector
          value={textStyles.subtitleColor || 'text-slate-400'}
          onChange={(color) => updateTextStyle('subtitleColor', color)}
          label="Couleur"
        />
      </CollapsibleSection>

      {/* ========== BODY TEXT ========== */}
      <CollapsibleSection
        title="Texte principal"
        icon={<Type className="w-5 h-5" />}
        color="from-amber-500/20 to-orange-500/20"
        defaultOpen={false}
      >
        <SizeSelector
          value={textStyles.bodyFontSize || 'text-base'}
          onChange={(size) => updateTextStyle('bodyFontSize', size)}
          options={FONT_SIZE_OPTIONS.body}
          label="Taille"
        />

        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Interligne</label>
          <div className="flex flex-wrap gap-2">
            {LINE_HEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateTextStyle('bodyLineHeight', opt.value)}
                className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                  textStyles.bodyLineHeight === opt.value
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label} ({opt.height})
              </button>
            ))}
          </div>
        </div>
        
        <ColorSelector
          value={textStyles.bodyColor || 'text-slate-300'}
          onChange={(color) => updateTextStyle('bodyColor', color)}
          label="Couleur"
        />
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const TextStyleForm = memo(TextStyleFormComponent);

