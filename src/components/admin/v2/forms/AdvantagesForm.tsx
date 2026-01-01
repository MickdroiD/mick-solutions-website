'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Type, Palette, ChevronDown,
  Zap, Shield, Clock, Target, Heart, Star,
  Award, Rocket, Users, DollarSign
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { AdvantagesSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface AdvantagesFormProps {
  section: AdvantagesSection & { _rowId?: number };
  onUpdate: (updates: Partial<AdvantagesSection>) => void;
}

interface AdvantageItem extends ListItem {
  id: string;
  titre: string;
  description: string;
  icone: string | null;
  badge: string | null;
}

// ============================================
// ICON OPTIONS
// ============================================

const ICON_OPTIONS = [
  { value: 'CheckCircle', label: 'Check', icon: CheckCircle },
  { value: 'Zap', label: 'Éclair', icon: Zap },
  { value: 'Shield', label: 'Bouclier', icon: Shield },
  { value: 'Clock', label: 'Horloge', icon: Clock },
  { value: 'Target', label: 'Cible', icon: Target },
  { value: 'Heart', label: 'Cœur', icon: Heart },
  { value: 'Star', label: 'Étoile', icon: Star },
  { value: 'Award', label: 'Récompense', icon: Award },
  { value: 'Rocket', label: 'Fusée', icon: Rocket },
  { value: 'Users', label: 'Équipe', icon: Users },
  { value: 'DollarSign', label: 'Économie', icon: DollarSign },
];

// ============================================
// VARIANT OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Grid', label: 'Grille', emoji: '⊞' },
  { value: 'List', label: 'Liste', emoji: '☰' },
  { value: 'Cards', label: 'Cartes', emoji: '🃏' },
  { value: 'Compact', label: 'Compact', emoji: '📦' },
];

const CARD_STYLE_OPTIONS = [
  { value: 'Flat', label: 'Plat' },
  { value: 'Shadow', label: 'Ombre' },
  { value: 'Border', label: 'Bordure' },
  { value: 'Glassmorphism', label: 'Glass' },
];

const HOVER_EFFECT_OPTIONS = [
  { value: 'None', label: 'Aucun' },
  { value: 'Scale', label: 'Agrandir' },
  { value: 'Glow', label: 'Lueur' },
  { value: 'Lift', label: 'Élever' },
  { value: 'Shake', label: 'Secouer' },
];

// ============================================
// COLLAPSIBLE SECTION
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false, badge }: CollapsibleSectionProps) {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-green-400">
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
// ICON PICKER
// ============================================

interface IconPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">Icône</label>
      <div className="grid grid-cols-6 gap-2">
        {ICON_OPTIONS.map((opt) => {
          const IconComponent = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(value === opt.value ? null : opt.value)}
              className={`p-3 rounded-xl border-2 transition-all ${
                value === opt.value
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
              title={opt.label}
            >
              <IconComponent className="w-5 h-5 mx-auto" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// ADVANTAGES FORM COMPONENT
// ============================================

function AdvantagesFormComponent({ section, onUpdate }: AdvantagesFormProps) {
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

  // ========== ADVANTAGES HANDLERS ==========
  const handleAdvantagesChange = useCallback((newAdvantages: AdvantageItem[]) => {
    updateContent('avantages', newAdvantages);
  }, [updateContent]);

  const createAdvantage = useCallback((): AdvantageItem => ({
    id: `adv_${Date.now()}`,
    titre: 'Nouvel Avantage',
    description: '',
    icone: 'CheckCircle',
    badge: null,
  }), []);

  // ========== ADVANTAGE ITEM RENDER ==========
  const renderAdvantageItem = useCallback((item: AdvantageItem) => {
    const IconComponent = ICON_OPTIONS.find(o => o.value === item.icone)?.icon || CheckCircle;
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-green-400">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{item.titre || 'Sans titre'}</p>
          <p className="text-slate-500 text-sm truncate">{item.description || 'Pas de description'}</p>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
            {item.badge}
          </span>
        )}
      </div>
    );
  }, []);

  // ========== ADVANTAGE FORM RENDER ==========
  const renderAdvantageForm = useCallback((
    item: AdvantageItem,
    _index: number,
    onChange: (item: AdvantageItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <LocalInput
          label="Titre"
          value={item.titre}
          onChange={(v) => onChange({ ...item, titre: v })}
          placeholder="Ex: Rapidité d'exécution"
        />

        <LocalTextarea
          label="Description"
          value={item.description}
          onChange={(v) => onChange({ ...item, description: v })}
          placeholder="Décrivez cet avantage..."
          rows={2}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Badge (optionnel)"
            value={item.badge || ''}
            onChange={(v) => onChange({ ...item, badge: v || null })}
            placeholder="Ex: #1 en Suisse"
          />
        </div>

        <IconPicker
          value={item.icone}
          onChange={(v) => onChange({ ...item, icone: v })}
        />
      </div>
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* ========== TITRE & DESCRIPTION ========== */}
      <CollapsibleSection title="Textes de la section" icon={<Type className="w-5 h-5" />}>
        <LocalInput
          label="Titre de la section"
          value={section.content.titre}
          onChange={(v) => updateContent('titre', v)}
          placeholder="Nos Avantages"
        />
        <LocalTextarea
          label="Sous-titre (optionnel)"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Pourquoi nous choisir..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== LISTE DES AVANTAGES ========== */}
      <CollapsibleSection 
        title="Mes Avantages" 
        icon={<CheckCircle className="w-5 h-5" />}
        badge={`${section.content.avantages?.length || 0}`}
      >
        <ListEditor<AdvantageItem>
          items={(section.content.avantages || []) as AdvantageItem[]}
          onChange={handleAdvantagesChange}
          renderItem={renderAdvantageItem}
          renderForm={renderAdvantageForm}
          createItem={createAdvantage}
          label="Avantages"
          addItemLabel="Ajouter un avantage"
          emptyMessage="Aucun avantage défini"
          emptyIcon={<CheckCircle className="w-10 h-10 mx-auto opacity-30" />}
        />
      </CollapsibleSection>

      {/* ========== DESIGN ========== */}
      <CollapsibleSection title="Design" icon={<Palette className="w-5 h-5" />} defaultOpen={false}>
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Style d&apos;affichage</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {VARIANT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('variant', opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  section.design.variant === opt.value
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block text-lg mb-1">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Style */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Style des cartes</label>
          <div className="flex flex-wrap gap-2">
            {CARD_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('cardStyle', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  section.design.cardStyle === opt.value
                    ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Effet au survol</label>
          <div className="flex flex-wrap gap-2">
            {HOVER_EFFECT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('hoverEffect', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  section.design.hoverEffect === opt.value
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

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

export const AdvantagesForm = memo(AdvantagesFormComponent);

