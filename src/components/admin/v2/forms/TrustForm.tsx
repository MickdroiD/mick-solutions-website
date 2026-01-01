'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Type, Palette, ChevronDown, 
  Award, TrendingUp, CheckCircle, Star, Zap
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { TrustSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface TrustFormProps {
  section: TrustSection & { _rowId?: number };
  onUpdate: (updates: Partial<TrustSection>) => void;
}

interface TrustItem extends ListItem {
  id: string;
  titre: string;
  description: string | null;
  icone: string | null;
  badge: string | null;
  type?: 'stat' | 'logo' | 'point';
  value?: string;
  imageUrl?: string;
}

// ============================================
// ICON OPTIONS
// ============================================

const ICON_OPTIONS = [
  { value: 'Shield', label: 'Bouclier', icon: Shield },
  { value: 'Award', label: 'Récompense', icon: Award },
  { value: 'TrendingUp', label: 'Croissance', icon: TrendingUp },
  { value: 'CheckCircle', label: 'Validé', icon: CheckCircle },
  { value: 'Star', label: 'Étoile', icon: Star },
  { value: 'Zap', label: 'Éclair', icon: Zap },
];

// ============================================
// VARIANT OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Electric', label: 'Électrique', emoji: '⚡' },
  { value: 'Minimal', label: 'Minimal', emoji: '🎯' },
  { value: 'Corporate', label: 'Corporate', emoji: '🏢' },
  { value: 'Bold', label: 'Bold', emoji: '💪' },
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
];

const TRUST_TYPE_OPTIONS = [
  { value: 'point', label: 'Point de confiance', emoji: '✅', description: 'Texte avec icône' },
  { value: 'stat', label: 'Statistique', emoji: '📊', description: 'Chiffre + label' },
  { value: 'logo', label: 'Logo partenaire', emoji: '🤝', description: 'Image de logo' },
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
  color?: string;
}

function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false, 
  badge,
  color = 'from-teal-500/20 to-emerald-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-teal-400`}>
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
                  ? 'border-teal-500 bg-teal-500/20 text-teal-400'
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
// TRUST FORM COMPONENT
// ============================================

function TrustFormComponent({ section, onUpdate }: TrustFormProps) {
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

  // ========== POINTS HANDLERS ==========
  const handlePointsChange = useCallback((newPoints: TrustItem[]) => {
    updateContent('points', newPoints);
  }, [updateContent]);

  const createPoint = useCallback((): TrustItem => ({
    id: `trust_${Date.now()}`,
    titre: '',
    description: null,
    icone: 'Shield',
    badge: null,
    type: 'point',
    value: '',
    imageUrl: '',
  }), []);

  // ========== ITEM RENDER ==========
  const renderTrustItem = useCallback((item: TrustItem) => {
    const IconComponent = ICON_OPTIONS.find(o => o.value === item.icone)?.icon || Shield;
    const typeConfig = TRUST_TYPE_OPTIONS.find(t => t.value === item.type);

    return (
      <div className="flex items-center gap-3">
        {item.type === 'logo' && item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.titre}
            className="w-10 h-10 rounded-lg object-contain bg-white p-1"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-400">
            <IconComponent className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {item.type === 'stat' ? `${item.value || '?'} - ${item.titre}` : item.titre || 'Sans titre'}
          </p>
          <p className="text-slate-500 text-sm truncate">
            {typeConfig?.label || 'Point de confiance'}
          </p>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs">
            {item.badge}
          </span>
        )}
      </div>
    );
  }, []);

  // ========== FORM RENDER ==========
  const renderTrustForm = useCallback((
    item: TrustItem,
    index: number,
    onChange: (item: TrustItem) => void
  ) => {
    const currentType = item.type || 'point';

    return (
      <div className="space-y-4">
        {/* Type Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Type d&apos;élément</label>
          <div className="grid grid-cols-3 gap-2">
            {TRUST_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...item, type: opt.value as TrustItem['type'] })}
                className={`px-3 py-3 rounded-xl border-2 text-left transition-all ${
                  currentType === opt.value
                    ? 'border-teal-500 bg-teal-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-lg block mb-1">{opt.emoji}</span>
                <span className={`font-medium text-sm ${currentType === opt.value ? 'text-teal-400' : 'text-white'}`}>
                  {opt.label}
                </span>
                <span className="text-slate-500 text-xs block">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Fields based on Type */}
        {currentType === 'stat' && (
          <div className="grid grid-cols-2 gap-4">
            <LocalInput
              label="Valeur (chiffre)"
              value={item.value || ''}
              onChange={(v) => onChange({ ...item, value: v })}
              placeholder="Ex: 99% / 500+ / 24/7"
            />
            <LocalInput
              label="Label"
              value={item.titre}
              onChange={(v) => onChange({ ...item, titre: v })}
              placeholder="Ex: Satisfaction client"
            />
          </div>
        )}

        {currentType === 'logo' && (
          <>
            <LocalInput
              label="Nom du partenaire"
              value={item.titre}
              onChange={(v) => onChange({ ...item, titre: v })}
              placeholder="Ex: Google Partner"
            />
            <LocalImageInput
              label="Logo"
              value={item.imageUrl || ''}
              onChange={(v) => onChange({ ...item, imageUrl: v })}
              hint="Logo du partenaire (PNG transparent recommandé)"
              category="trust"
              fieldKey={`logo_${index}`}
              aspectRatio="square"
            />
          </>
        )}

        {currentType === 'point' && (
          <>
            <LocalInput
              label="Titre"
              value={item.titre}
              onChange={(v) => onChange({ ...item, titre: v })}
              placeholder="Ex: Données hébergées en Suisse"
            />
            <LocalTextarea
              label="Description (optionnel)"
              value={item.description || ''}
              onChange={(v) => onChange({ ...item, description: v || null })}
              placeholder="Explication détaillée..."
              rows={2}
            />
            <IconPicker
              value={item.icone}
              onChange={(v) => onChange({ ...item, icone: v })}
            />
          </>
        )}

        {/* Badge (pour tous les types) */}
        <LocalInput
          label="Badge (optionnel)"
          value={item.badge || ''}
          onChange={(v) => onChange({ ...item, badge: v || null })}
          placeholder="Ex: Certifié / Nouveau / Exclusif"
        />
      </div>
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* ========== TITRE & DESCRIPTION ========== */}
      <CollapsibleSection 
        title="Textes de la section" 
        icon={<Type className="w-5 h-5" />}
        color="from-teal-500/20 to-emerald-500/20"
      >
        <LocalInput
          label="Titre de la section"
          value={section.content.titre}
          onChange={(v) => updateContent('titre', v)}
          placeholder="Pourquoi nous faire confiance"
        />
        <LocalTextarea
          label="Sous-titre (optionnel)"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Des garanties solides pour votre tranquillité..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== LISTE DES POINTS ========== */}
      <CollapsibleSection 
        title="Éléments de confiance" 
        icon={<Shield className="w-5 h-5" />}
        badge={`${section.content.points?.length || 0}`}
        color="from-emerald-500/20 to-green-500/20"
      >
        <ListEditor<TrustItem>
          items={(section.content.points || []) as TrustItem[]}
          onChange={handlePointsChange}
          renderItem={renderTrustItem}
          renderForm={renderTrustForm}
          createItem={createPoint}
          label="Éléments"
          addItemLabel="Ajouter un élément"
          emptyMessage="Aucun élément de confiance"
          emptyIcon={<Shield className="w-10 h-10 mx-auto opacity-30" />}
        />
      </CollapsibleSection>

      {/* ========== DESIGN & STYLE ========== */}
      <CollapsibleSection 
        title="Design & Style" 
        icon={<Palette className="w-5 h-5" />} 
        defaultOpen={false}
        color="from-cyan-500/20 to-blue-500/20"
      >
        {/* Variant Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Style visuel</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

export const TrustForm = memo(TrustFormComponent);

