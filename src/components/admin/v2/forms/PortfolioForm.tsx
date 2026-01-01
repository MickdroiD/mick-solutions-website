'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Type, Palette, ChevronDown, 
  Calendar, Tag, Link as LinkIcon
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { PortfolioSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface PortfolioFormProps {
  section: PortfolioSection & { _rowId?: number };
  onUpdate: (updates: Partial<PortfolioSection>) => void;
}

interface ProjectItem extends ListItem {
  id: string;
  nom: string;
  descriptionCourte: string | null;
  imageUrl: string | null;
  lienSite: string | null;
  slug: string;
  tags: string[];
  clientName?: string;
  date?: string;
}

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

const LAYOUT_OPTIONS = [
  { value: 'Grid', label: 'Grille', emoji: '⊞' },
  { value: 'Masonry', label: 'Masonry', emoji: '🧱' },
  { value: 'Carousel', label: 'Carousel', emoji: '🎠' },
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
  color = 'from-indigo-500/20 to-purple-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-indigo-400`}>
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
// TAGS EDITOR
// ============================================

interface TagsEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const PRESET_TAGS = ['Web', 'Design', 'n8n', 'SEO', 'E-commerce', 'App Mobile', 'API', 'Automation'];

function TagsEditor({ value, onChange }: TagsEditorProps) {
  const [newTag, setNewTag] = useState('');

  const handleAdd = useCallback(() => {
    if (newTag.trim() && !value.includes(newTag.trim())) {
      onChange([...value, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, value, onChange]);

  const handleRemove = useCallback((tag: string) => {
    onChange(value.filter(t => t !== tag));
  }, [value, onChange]);

  const handlePresetClick = useCallback((tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <label className="text-white font-medium text-sm flex items-center gap-2">
        <Tag className="w-4 h-4 text-slate-400" />
        Tags
      </label>
      
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span
            key={tag}
            className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm flex items-center gap-2"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Preset Tags */}
      <div className="flex flex-wrap gap-1">
        {PRESET_TAGS.filter(t => !value.includes(t)).map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handlePresetClick(tag)}
            className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded hover:bg-slate-600 hover:text-white transition-colors"
          >
            + {tag}
          </button>
        ))}
      </div>

      {/* Custom Tag Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="Tag personnalisé..."
          className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newTag.trim()}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

// ============================================
// PORTFOLIO FORM COMPONENT
// ============================================

function PortfolioFormComponent({ section, onUpdate }: PortfolioFormProps) {
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

  // ========== PROJECTS HANDLERS ==========
  const handleProjectsChange = useCallback((newProjects: ProjectItem[]) => {
    updateContent('projets', newProjects);
  }, [updateContent]);

  const createProject = useCallback((): ProjectItem => ({
    id: `project_${Date.now()}`,
    nom: 'Nouveau Projet',
    descriptionCourte: '',
    imageUrl: null,
    lienSite: null,
    slug: `projet-${Date.now()}`,
    tags: [],
    clientName: '',
    date: new Date().toISOString().split('T')[0],
  }), []);

  // ========== PROJECT ITEM RENDER ==========
  const renderProjectItem = useCallback((item: ProjectItem) => {
    return (
      <div className="flex items-center gap-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.nom}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {item.nom || 'Sans titre'}
          </p>
          <p className="text-slate-500 text-sm truncate">
            {item.clientName || 'Client non défini'}
          </p>
        </div>
        {item.tags.length > 0 && (
          <div className="flex gap-1">
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }, []);

  // ========== PROJECT FORM RENDER ==========
  const renderProjectForm = useCallback((
    item: ProjectItem,
    index: number,
    onChange: (item: ProjectItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Nom du projet"
            value={item.nom}
            onChange={(v) => onChange({ ...item, nom: v })}
            placeholder="Ex: Refonte site e-commerce"
          />

          <LocalInput
            label="Client"
            value={item.clientName || ''}
            onChange={(v) => onChange({ ...item, clientName: v })}
            placeholder="Ex: Startup XYZ"
          />
        </div>

        <LocalTextarea
          label="Description courte"
          value={item.descriptionCourte || ''}
          onChange={(v) => onChange({ ...item, descriptionCourte: v })}
          placeholder="Une description concise du projet..."
          rows={3}
        />

        <LocalImageInput
          label="Image de couverture"
          value={item.imageUrl || ''}
          onChange={(v) => onChange({ ...item, imageUrl: v || null })}
          hint="Image principale du projet (1200x800 recommandé)"
          category="portfolio"
          fieldKey={`cover_${index}`}
          aspectRatio="video"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-white font-medium text-sm flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-400" />
              Lien du site
            </label>
            <input
              type="url"
              value={item.lienSite || ''}
              onChange={(e) => onChange({ ...item, lienSite: e.target.value || null })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white font-medium text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Date
            </label>
            <input
              type="date"
              value={item.date || ''}
              onChange={(e) => onChange({ ...item, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <TagsEditor
          value={item.tags}
          onChange={(v) => onChange({ ...item, tags: v })}
        />

        <LocalInput
          label="Slug (URL)"
          value={item.slug}
          onChange={(v) => onChange({ ...item, slug: v.toLowerCase().replace(/\s+/g, '-') })}
          placeholder="mon-projet"
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
        color="from-indigo-500/20 to-purple-500/20"
      >
        <LocalInput
          label="Titre de la section"
          value={section.content.titre}
          onChange={(v) => updateContent('titre', v)}
          placeholder="Nos Projets"
        />
        <LocalTextarea
          label="Sous-titre (optionnel)"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Découvrez nos réalisations..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== LISTE DES PROJETS ========== */}
      <CollapsibleSection 
        title="Projets" 
        icon={<Briefcase className="w-5 h-5" />}
        badge={`${section.content.projets?.length || 0}`}
        color="from-purple-500/20 to-pink-500/20"
      >
        <ListEditor<ProjectItem>
          items={(section.content.projets || []) as ProjectItem[]}
          onChange={handleProjectsChange}
          renderItem={renderProjectItem}
          renderForm={renderProjectForm}
          createItem={createProject}
          label="Projets"
          addItemLabel="Ajouter un projet"
          emptyMessage="Aucun projet"
          emptyIcon={<Briefcase className="w-10 h-10 mx-auto opacity-30" />}
        />
      </CollapsibleSection>

      {/* ========== DESIGN & STYLE ========== */}
      <CollapsibleSection 
        title="Design & Style" 
        icon={<Palette className="w-5 h-5" />} 
        defaultOpen={false}
        color="from-cyan-500/20 to-blue-500/20"
      >
        {/* Layout Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Disposition</label>
          <div className="grid grid-cols-3 gap-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('layout', opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  (section.design as unknown as { layout?: string }).layout === opt.value
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

        {/* Variant Selection */}
        <div className="space-y-2 pt-4 border-t border-white/5">
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

export const PortfolioForm = memo(PortfolioFormComponent);

