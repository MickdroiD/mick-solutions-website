'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Type, MousePointer, Image as ImageIcon, 
  Zap, Play, Settings, ChevronDown, Plus, Trash2
} from 'lucide-react';
import { LocalInput, LocalTextarea, LocalSlider } from '@/components/admin/ui/LocalInput';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import type { HeroSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface HeroFormProps {
  section: HeroSection & { _rowId?: number };
  onUpdate: (updates: Partial<HeroSection>) => void;
}

// ============================================
// VARIANT OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Minimal', label: 'Minimal', emoji: '🎯' },
  { value: 'Corporate', label: 'Corporate', emoji: '🏢' },
  { value: 'Electric', label: 'Electric', emoji: '⚡' },
  { value: 'Bold', label: 'Bold', emoji: '💪' },
  { value: 'AI', label: 'AI', emoji: '🤖' },
];

const HEIGHT_OPTIONS = [
  { value: 'Short', label: 'Court', description: '70vh' },
  { value: 'Medium', label: 'Moyen', description: '85vh' },
  { value: 'Tall', label: 'Grand', description: '95vh' },
  { value: 'FullScreen', label: 'Plein écran', description: '100vh' },
];

const LOGO_ANIMATION_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'electric', label: 'Electric ⚡' },
  { value: 'spin', label: 'Rotation' },
  { value: 'bounce', label: 'Rebond' },
  { value: 'lightning-circle', label: 'Lightning Circle' },
];

const TEXT_ANIMATION_OPTIONS = [
  { value: 'None', label: 'Aucune' },
  { value: 'Gradient', label: 'Gradient animé' },
  { value: 'Typing', label: 'Machine à écrire' },
  { value: 'Fade', label: 'Fondu' },
];

// ============================================
// SECTION CARD WRAPPER
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true, badge }: CollapsibleSectionProps) {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-violet-400">
            {icon}
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
              {badge}
            </span>
          )}
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
// HERO FORM COMPONENT
// ============================================

function HeroFormComponent({ section, onUpdate }: HeroFormProps) {
  // ========== CONTENT HANDLERS ==========
  const updateContent = useCallback((key: string, value: unknown) => {
    onUpdate({
      content: {
        ...section.content,
        [key]: value,
      },
    });
  }, [section.content, onUpdate]);

  // ========== DESIGN HANDLERS ==========
  const updateDesign = useCallback((key: string, value: unknown) => {
    onUpdate({
      design: {
        ...section.design,
        [key]: value,
      },
    });
  }, [section.design, onUpdate]);

  // ========== CTA HANDLERS ==========
  const updateCtaPrincipal = useCallback((key: 'text' | 'url', value: string) => {
    onUpdate({
      content: {
        ...section.content,
        ctaPrincipal: {
          ...section.content.ctaPrincipal,
          [key]: value,
        },
      },
    });
  }, [section.content, onUpdate]);

  const updateCtaSecondaire = useCallback((key: 'text' | 'url', value: string) => {
    const current = section.content.ctaSecondaire || { text: '', url: '' };
    onUpdate({
      content: {
        ...section.content,
        ctaSecondaire: {
          ...current,
          [key]: value,
        },
      },
    });
  }, [section.content, onUpdate]);

  // ========== TRUST STATS HANDLERS ==========
  const addTrustStat = useCallback(() => {
    const current = section.content.trustStats || [];
    onUpdate({
      content: {
        ...section.content,
        trustStats: [...current, { value: '0', label: 'Nouveau' }],
      },
    });
  }, [section.content, onUpdate]);

  const updateTrustStat = useCallback((index: number, field: 'value' | 'label', value: string) => {
    const current = [...(section.content.trustStats || [])];
    current[index] = { ...current[index], [field]: value };
    onUpdate({
      content: {
        ...section.content,
        trustStats: current,
      },
    });
  }, [section.content, onUpdate]);

  const removeTrustStat = useCallback((index: number) => {
    const current = [...(section.content.trustStats || [])];
    current.splice(index, 1);
    onUpdate({
      content: {
        ...section.content,
        trustStats: current,
      },
    });
  }, [section.content, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== TEXTES ========== */}
      <CollapsibleSection title="Textes & Contenu" icon={<Type className="w-5 h-5" />}>
        <LocalInput
          label="Badge (optionnel)"
          value={section.content.badge || ''}
          onChange={(v) => updateContent('badge', v || null)}
          placeholder="🚀 Nouveau"
          hint="Petit texte affiché au-dessus du titre"
        />
        <LocalTextarea
          label="Titre principal"
          value={section.content.titre}
          onChange={(v) => updateContent('titre', v)}
          placeholder="Votre titre accrocheur"
          rows={2}
        />
        <LocalTextarea
          label="Sous-titre"
          value={section.content.sousTitre}
          onChange={(v) => updateContent('sousTitre', v)}
          placeholder="Description courte de votre activité"
          rows={3}
        />
      </CollapsibleSection>

      {/* ========== BOUTONS CTA ========== */}
      <CollapsibleSection title="Boutons d'action" icon={<MousePointer className="w-5 h-5" />}>
        <div className="space-y-4">
          <h4 className="text-white font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            Bouton principal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-cyan-500/30">
            <LocalInput
              label="Texte du bouton"
              value={section.content.ctaPrincipal.text}
              onChange={(v) => updateCtaPrincipal('text', v)}
              placeholder="Commencer"
            />
            <LocalInput
              label="URL / Ancre"
              value={section.content.ctaPrincipal.url}
              onChange={(v) => updateCtaPrincipal('url', v)}
              placeholder="#contact"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <h4 className="text-white font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Bouton secondaire (optionnel)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-slate-500/30">
            <LocalInput
              label="Texte du bouton"
              value={section.content.ctaSecondaire?.text || ''}
              onChange={(v) => updateCtaSecondaire('text', v)}
              placeholder="En savoir plus"
            />
            <LocalInput
              label="URL / Ancre"
              value={section.content.ctaSecondaire?.url || ''}
              onChange={(v) => updateCtaSecondaire('url', v)}
              placeholder="#services"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* ========== TRUST STATS ========== */}
      <CollapsibleSection 
        title="Statistiques de confiance" 
        icon={<Sparkles className="w-5 h-5" />}
        badge={`${section.content.trustStats?.length || 0}`}
        defaultOpen={false}
      >
        <p className="text-slate-400 text-sm mb-4">
          Ajoutez des chiffres clés pour rassurer vos visiteurs (ex: &quot;100+ clients&quot;, &quot;24/7 support&quot;)
        </p>
        
        <div className="space-y-3">
          {(section.content.trustStats || []).map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => updateTrustStat(index, 'value', e.target.value)}
                  placeholder="100%"
                  className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateTrustStat(index, 'label', e.target.value)}
                  placeholder="Satisfaction"
                  className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTrustStat(index)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={addTrustStat}
          className="w-full mt-3 px-4 py-3 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une statistique
        </button>
      </CollapsibleSection>

      {/* ========== MÉDIAS ========== */}
      <CollapsibleSection title="Images & Médias" icon={<ImageIcon className="w-5 h-5" />} defaultOpen={false}>
        <LocalImageInput
          label="Image de fond du Hero"
          value={section.content.backgroundUrl || ''}
          onChange={(v) => updateContent('backgroundUrl', v || null)}
          hint="Image affichée en arrière-plan du hero (recommandé: 1920×1080)"
          category="hero"
          fieldKey="backgroundUrl"
          aspectRatio="video"
        />
        
        <LocalInput
          label="URL de la vidéo (optionnel)"
          value={section.content.videoUrl || ''}
          onChange={(v) => updateContent('videoUrl', v || null)}
          placeholder="https://..."
          type="url"
          hint="Vidéo en boucle en arrière-plan (YouTube, Vimeo ou MP4)"
        />
      </CollapsibleSection>

      {/* ========== DESIGN & STYLE ========== */}
      <CollapsibleSection title="Design & Style" icon={<Settings className="w-5 h-5" />}>
        {/* Variant Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Style du Hero</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {VARIANT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('variant', opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  section.design.variant === opt.value
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block text-lg mb-1">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Height */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Hauteur du Hero</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {HEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('height', opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  section.design.height === opt.value
                    ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block font-medium">{opt.label}</span>
                <span className="text-xs opacity-60">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logo Settings */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h4 className="text-white font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Logo dans le Hero
          </h4>
          
          <LocalSlider
            label="Taille du logo"
            value={section.design.logoSize}
            onChange={(v) => updateDesign('logoSize', v)}
            min={100}
            max={500}
            step={10}
            unit="px"
          />

          <div className="space-y-1">
            <label className="text-white font-medium text-sm">Animation du logo</label>
            <select
              value={section.design.logoAnimation}
              onChange={(e) => updateDesign('logoAnimation', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              {LOGO_ANIMATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Animation */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            Animation du texte
          </label>
          <select
            value={section.design.textAnimation}
            onChange={(e) => updateDesign('textAnimation', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
          >
            {TEXT_ANIMATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const HeroForm = memo(HeroFormComponent);

