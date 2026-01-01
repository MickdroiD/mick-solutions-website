'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, Type, Palette, ChevronDown,
  Grid, Columns, LayoutGrid
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { GallerySection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface GalleryFormProps {
  section: GallerySection & { _rowId?: number };
  onUpdate: (updates: Partial<GallerySection>) => void;
}

interface GalleryItem extends ListItem {
  id: string;
  titre: string | null;
  imageUrl: string;
  type: 'Slider' | 'Grille' | 'Zoom';
  caption?: string;
  altText?: string;
}

// ============================================
// OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Grid', label: 'Grille', emoji: '⊞', icon: Grid },
  { value: 'Slider', label: 'Slider', emoji: '↔️', icon: LayoutGrid },
  { value: 'Masonry', label: 'Masonry', emoji: '🧱', icon: Columns },
  { value: 'AI', label: 'AI Dynamic', emoji: '🤖', icon: ImageIcon },
];

const COLUMNS_OPTIONS = [
  { value: '2', label: '2 colonnes' },
  { value: '3', label: '3 colonnes' },
  { value: '4', label: '4 colonnes' },
  { value: 'Auto', label: 'Automatique' },
];

const ANIMATION_OPTIONS = [
  { value: 'Fade', label: 'Fondu', emoji: '✨' },
  { value: 'Slide', label: 'Glissement', emoji: '➡️' },
  { value: 'Zoom', label: 'Zoom', emoji: '🔍' },
  { value: 'Flip', label: 'Retournement', emoji: '🔄' },
  { value: 'None', label: 'Aucun', emoji: '⏹️' },
];

const IMAGE_STYLE_OPTIONS = [
  { value: 'Square', label: 'Carré' },
  { value: 'Rounded', label: 'Arrondi' },
  { value: 'Circle', label: 'Cercle' },
  { value: 'Custom', label: 'Personnalisé' },
];

const IMAGE_FILTER_OPTIONS = [
  { value: 'None', label: 'Aucun' },
  { value: 'Grayscale', label: 'N&B' },
  { value: 'Sepia', label: 'Sépia' },
  { value: 'Contrast', label: 'Contraste' },
  { value: 'Blur', label: 'Flou' },
];

const ASPECT_RATIO_OPTIONS = [
  { value: '1:1', label: '1:1 (Carré)' },
  { value: '4:3', label: '4:3 (Standard)' },
  { value: '16:9', label: '16:9 (Wide)' },
  { value: '3:4', label: '3:4 (Portrait)' },
  { value: 'auto', label: 'Original' },
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
  color = 'from-violet-500/20 to-pink-500/20'
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
// GALLERY FORM COMPONENT
// ============================================

function GalleryFormComponent({ section, onUpdate }: GalleryFormProps) {
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

  // ========== ITEMS HANDLERS ==========
  const handleItemsChange = useCallback((newItems: GalleryItem[]) => {
    updateContent('items', newItems);
  }, [updateContent]);

  const createItem = useCallback((): GalleryItem => ({
    id: `gallery_${Date.now()}`,
    titre: '',
    imageUrl: '',
    type: 'Grille',
    caption: '',
    altText: '',
  }), []);

  // ========== ITEM RENDER ==========
  const renderGalleryItem = useCallback((item: GalleryItem) => {
    return (
      <div className="flex items-center gap-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.altText || item.titre || 'Image'}
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center text-violet-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {item.titre || 'Sans titre'}
          </p>
          <p className="text-slate-500 text-sm truncate">
            {item.caption || 'Aucune légende'}
          </p>
        </div>
      </div>
    );
  }, []);

  // ========== FORM RENDER ==========
  const renderGalleryForm = useCallback((
    item: GalleryItem,
    index: number,
    onChange: (item: GalleryItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <LocalImageInput
          label="Image"
          value={item.imageUrl}
          onChange={(v) => onChange({ ...item, imageUrl: v })}
          hint="Image de la galerie (haute résolution recommandée)"
          category="gallery"
          fieldKey={`image_${index}`}
          aspectRatio="video"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Titre (optionnel)"
            value={item.titre || ''}
            onChange={(v) => onChange({ ...item, titre: v || null })}
            placeholder="Titre affiché sur l'image"
          />

          <LocalInput
            label="Texte alternatif (SEO)"
            value={item.altText || ''}
            onChange={(v) => onChange({ ...item, altText: v })}
            placeholder="Description pour l'accessibilité"
          />
        </div>

        <LocalTextarea
          label="Légende (optionnel)"
          value={item.caption || ''}
          onChange={(v) => onChange({ ...item, caption: v })}
          placeholder="Description affichée sous l'image..."
          rows={2}
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
        color="from-violet-500/20 to-pink-500/20"
      >
        <LocalInput
          label="Titre de la section"
          value={section.content.titre}
          onChange={(v) => updateContent('titre', v)}
          placeholder="Galerie"
        />
        <LocalTextarea
          label="Sous-titre (optionnel)"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Découvrez notre univers en images..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== LISTE DES IMAGES ========== */}
      <CollapsibleSection 
        title="Images" 
        icon={<ImageIcon className="w-5 h-5" />}
        badge={`${section.content.items?.length || 0}`}
        color="from-pink-500/20 to-rose-500/20"
      >
        <ListEditor<GalleryItem>
          items={(section.content.items || []) as GalleryItem[]}
          onChange={handleItemsChange}
          renderItem={renderGalleryItem}
          renderForm={renderGalleryForm}
          createItem={createItem}
          label="Images"
          addItemLabel="Ajouter une image"
          emptyMessage="Aucune image"
          emptyIcon={<ImageIcon className="w-10 h-10 mx-auto opacity-30" />}
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

        {/* Columns */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Nombre de colonnes</label>
          <div className="flex flex-wrap gap-2">
            {COLUMNS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('columns', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  section.design.columns === opt.value
                    ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animation */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Animation</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {ANIMATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('animation', opt.value)}
                className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                  section.design.animation === opt.value
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="block text-base mb-0.5">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Style */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Style des images</label>
          <div className="flex flex-wrap gap-2">
            {IMAGE_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('imageStyle', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  section.design.imageStyle === opt.value
                    ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Filter */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Filtre d&apos;image</label>
          <div className="flex flex-wrap gap-2">
            {IMAGE_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('imageFilter', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  section.design.imageFilter === opt.value
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio (bonus setting) */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Ratio d&apos;aspect</label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDesign('aspectRatio', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  (section.design as unknown as { aspectRatio?: string }).aspectRatio === opt.value
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
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

export const GalleryForm = memo(GalleryFormComponent);

