'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, Palette, AlertTriangle
} from 'lucide-react';
import { LocalTextarea } from '@/components/admin/ui/LocalInput';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import type { CustomSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface CustomFormProps {
  section: CustomSection & { _rowId?: number };
  onUpdate: (updates: Partial<CustomSection>) => void;
}

// ============================================
// OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Custom', label: 'Custom', emoji: '🎨', description: 'Style personnalisé' },
  { value: 'Minimal', label: 'Minimal', emoji: '🎯', description: 'Style épuré' },
  { value: 'Electric', label: 'Électrique', emoji: '⚡', description: 'Style dynamique' },
  { value: 'Corporate', label: 'Corporate', emoji: '🏢', description: 'Style professionnel' },
];

// ============================================
// CUSTOM FORM COMPONENT
// ============================================

function CustomFormComponent({ section, onUpdate }: CustomFormProps) {
  // ========== HANDLERS ==========
  const updateContent = useCallback((key: string, value: unknown) => {
    onUpdate({
      content: {
        ...section.content,
        [key]: value,
      },
    });
  }, [section.content, onUpdate]);

  const updateDesign = useCallback((key: string, value: unknown) => {
    onUpdate({
      design: {
        ...section.design,
        [key]: value,
      },
    });
  }, [section.design, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-600/20 to-zinc-600/20 rounded-2xl p-6 border border-white/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-zinc-500 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Section personnalisée</h2>
            <p className="text-slate-400 text-sm">HTML personnalisé</p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-amber-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Le code HTML est injecté directement. Assurez-vous qu&apos;il est sécurisé et bien formé.
          </p>
        </div>

        {/* Section Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl mt-4">
          <div>
            <h4 className="text-white font-medium">Section active</h4>
            <p className="text-slate-500 text-sm">Affiche cette section sur votre site</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ isActive: !section.isActive })}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              section.isActive 
                ? 'bg-gradient-to-r from-slate-500 to-zinc-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              section.isActive ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </motion.div>

      {/* ========== HTML CONTENT ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-orange-400" />
          Code HTML
        </h3>

        <LocalTextarea
          label=""
          value={section.content.html}
          onChange={(v) => updateContent('html', v)}
          placeholder={`<div class="my-custom-section">
  <h2>Mon titre</h2>
  <p>Mon contenu personnalisé...</p>
</div>`}
          rows={15}
          monospace
          hint="Code HTML brut qui sera injecté dans la section"
        />
      </motion.div>

      {/* ========== DESIGN ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-cyan-400" />
          Style
        </h3>

        {/* Variant */}
        <div className="space-y-2 mb-4">
          <label className="text-white font-medium text-sm">Variante de base</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VARIANT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('variant', opt.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  section.design.variant === opt.value
                    ? 'border-cyan-500 bg-cyan-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-lg block mb-1">{opt.emoji}</span>
                <span className={`font-medium text-sm block ${
                  section.design.variant === opt.value ? 'text-cyan-400' : 'text-white'
                }`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom CSS */}
        <LocalTextarea
          label="CSS personnalisé (optionnel)"
          value={section.design.customCss || ''}
          onChange={(v) => updateDesign('customCss', v || null)}
          placeholder={`.my-custom-section {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%);
}

.my-custom-section h2 {
  color: white;
  font-size: 2rem;
}`}
          rows={8}
          monospace
          hint="Styles CSS spécifiques à cette section"
        />
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-slate-800/30 border border-white/5 rounded-xl"
      >
        <p className="text-slate-400 text-sm">
          💡 Utilisez cette section pour intégrer du contenu HTML personnalisé comme des widgets externes, 
          des iframes ou des mises en page complexes non couvertes par les autres sections.
        </p>
      </motion.div>

      {/* Effects & Animations */}
      <SectionEffects
        effects={(section.effects || {}) as EffectSettings}
        onChange={(updates) => onUpdate({ effects: { ...(section.effects || {}), ...updates } })}
        showLogoOptions={false}
        showBackgroundOptions={true}
      />

      {/* Text Styling */}
      <SectionText
        text={(section.textSettings || {}) as TextSettings}
        onChange={(updates) => onUpdate({ textSettings: { ...(section.textSettings || {}), ...updates } })}
        showTitleOptions={true}
        showSubtitleOptions={true}
        showBodyOptions={true}
      />
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const CustomForm = memo(CustomFormComponent);
