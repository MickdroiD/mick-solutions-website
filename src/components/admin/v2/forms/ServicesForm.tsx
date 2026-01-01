'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Type, Palette, ChevronDown,
  Zap, Code, Globe, Shield, Rocket, Heart, Star,
  Users, DollarSign, Clock, CheckCircle
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import type { ServicesSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface ServicesFormProps {
  section: ServicesSection & { _rowId?: number };
  onUpdate: (updates: Partial<ServicesSection>) => void;
}

interface ServiceItem extends ListItem {
  id: string;
  titre: string;
  description: string;
  icone: string | null;
  pointsCles: string[];
  tarif: string | null;
  type: 'Prestation unique' | 'Abonnement mensuel' | null;
}

// ============================================
// ICON OPTIONS
// ============================================

const ICON_OPTIONS = [
  { value: 'Zap', label: 'Éclair', icon: Zap },
  { value: 'Code', label: 'Code', icon: Code },
  { value: 'Globe', label: 'Globe', icon: Globe },
  { value: 'Shield', label: 'Bouclier', icon: Shield },
  { value: 'Rocket', label: 'Fusée', icon: Rocket },
  { value: 'Heart', label: 'Cœur', icon: Heart },
  { value: 'Star', label: 'Étoile', icon: Star },
  { value: 'Users', label: 'Utilisateurs', icon: Users },
  { value: 'DollarSign', label: 'Dollar', icon: DollarSign },
  { value: 'Clock', label: 'Horloge', icon: Clock },
  { value: 'CheckCircle', label: 'Check', icon: CheckCircle },
  { value: 'Briefcase', label: 'Mallette', icon: Briefcase },
];

// ============================================
// VARIANT OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Grid', label: 'Grille', emoji: '⊞' },
  { value: 'Accordion', label: 'Accordéon', emoji: '☰' },
  { value: 'Cards', label: 'Cartes', emoji: '🃏' },
  { value: 'Showcase', label: 'Showcase', emoji: '✨' },
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

const SERVICE_TYPE_OPTIONS = [
  { value: 'Prestation unique', label: 'Prestation unique', emoji: '📦' },
  { value: 'Abonnement mensuel', label: 'Abonnement mensuel', emoji: '🔄' },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400">
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
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
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
// POINTS CLES EDITOR
// ============================================

interface PointsClesEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function PointsClesEditor({ value, onChange }: PointsClesEditorProps) {
  const handleAdd = useCallback(() => {
    onChange([...value, '']);
  }, [value, onChange]);

  const handleUpdate = useCallback((index: number, text: string) => {
    const newPoints = [...value];
    newPoints[index] = text;
    onChange(newPoints);
  }, [value, onChange]);

  const handleRemove = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index));
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">Points clés</label>
      <div className="space-y-2">
        {value.map((point, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">•</span>
            <input
              type="text"
              value={point}
              onChange={(e) => handleUpdate(index, e.target.value)}
              placeholder={`Point ${index + 1}`}
              className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        + Ajouter un point
      </button>
    </div>
  );
}

// ============================================
// SERVICES FORM COMPONENT
// ============================================

function ServicesFormComponent({ section, onUpdate }: ServicesFormProps) {
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

  // ========== SERVICES HANDLERS ==========
  const handleServicesChange = useCallback((newServices: ServiceItem[]) => {
    updateContent('services', newServices);
  }, [updateContent]);

  const createService = useCallback((): ServiceItem => ({
    id: `service_${Date.now()}`,
    titre: 'Nouveau Service',
    description: '',
    icone: 'Zap',
    pointsCles: [],
    tarif: null,
    type: 'Prestation unique',
  }), []);

  // ========== SERVICE ITEM RENDER ==========
  const renderServiceItem = useCallback((item: ServiceItem) => {
    const IconComponent = ICON_OPTIONS.find(o => o.value === item.icone)?.icon || Briefcase;
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{item.titre || 'Sans titre'}</p>
          <p className="text-slate-500 text-sm truncate">
            {item.tarif || 'Prix non défini'} • {item.type || 'Type non défini'}
          </p>
        </div>
        {item.pointsCles.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
            {item.pointsCles.length} points
          </span>
        )}
      </div>
    );
  }, []);

  // ========== SERVICE FORM RENDER ==========
  const renderServiceForm = useCallback((
    item: ServiceItem,
    _index: number,
    onChange: (item: ServiceItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <LocalInput
          label="Titre du service"
          value={item.titre}
          onChange={(v) => onChange({ ...item, titre: v })}
          placeholder="Ex: Développement Web"
        />

        <LocalTextarea
          label="Description"
          value={item.description}
          onChange={(v) => onChange({ ...item, description: v })}
          placeholder="Décrivez ce service en quelques lignes..."
          rows={3}
        />

        <IconPicker
          value={item.icone}
          onChange={(v) => onChange({ ...item, icone: v })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Tarif indicatif"
            value={item.tarif || ''}
            onChange={(v) => onChange({ ...item, tarif: v || null })}
            placeholder="Ex: Dès 500 CHF"
          />

          <div className="space-y-1">
            <label className="text-white font-medium text-sm">Type de service</label>
            <div className="flex gap-2">
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...item, type: opt.value as ServiceItem['type'] })}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    item.type === opt.value
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="mr-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PointsClesEditor
          value={item.pointsCles}
          onChange={(v) => onChange({ ...item, pointsCles: v })}
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
          placeholder="Nos Services"
        />
        <LocalTextarea
          label="Sous-titre (optionnel)"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Une description courte de vos services..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== LISTE DES SERVICES ========== */}
      <CollapsibleSection 
        title="Mes Services" 
        icon={<Briefcase className="w-5 h-5" />}
        badge={`${section.content.services?.length || 0}`}
      >
        <ListEditor<ServiceItem>
          items={(section.content.services || []) as ServiceItem[]}
          onChange={handleServicesChange}
          renderItem={renderServiceItem}
          renderForm={renderServiceForm}
          createItem={createService}
          label="Services"
          addItemLabel="Ajouter un service"
          emptyMessage="Aucun service défini"
          emptyIcon={<Briefcase className="w-10 h-10 mx-auto opacity-30" />}
        />
      </CollapsibleSection>

      {/* ========== DESIGN & STYLE ========== */}
      <CollapsibleSection title="Design & Style" icon={<Palette className="w-5 h-5" />} defaultOpen={false}>
        {/* Variant Selection */}
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

export const ServicesForm = memo(ServicesFormComponent);

