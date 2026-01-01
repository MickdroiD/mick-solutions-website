'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Type, Palette, ChevronDown, Star, User } from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { TestimonialsSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface TestimonialsFormProps {
  section: TestimonialsSection & { _rowId?: number };
  onUpdate: (updates: Partial<TestimonialsSection>) => void;
}

interface TestimonialItem extends ListItem {
  id: string;
  nom: string;
  poste: string | null;
  message: string;
  note: number;
  photoUrl: string | null;
}

// ============================================
// VARIANT OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Minimal', label: 'Minimal', emoji: '🎯' },
  { value: 'Carousel', label: 'Carousel', emoji: '🎠' },
  { value: 'Cards', label: 'Cartes', emoji: '🃏' },
  { value: 'Video', label: 'Vidéo', emoji: '🎬' },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center text-pink-400">
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
// STAR RATING
// ============================================

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">Note</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TESTIMONIALS FORM COMPONENT
// ============================================

function TestimonialsFormComponent({ section, onUpdate }: TestimonialsFormProps) {
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

  // ========== TESTIMONIALS HANDLERS ==========
  const handleTestimonialsChange = useCallback((newTestimonials: TestimonialItem[]) => {
    updateContent('temoignages', newTestimonials);
  }, [updateContent]);

  const createTestimonial = useCallback((): TestimonialItem => ({
    id: `testimonial_${Date.now()}`,
    nom: '',
    poste: null,
    message: '',
    note: 5,
    photoUrl: null,
  }), []);

  // ========== TESTIMONIAL ITEM RENDER ==========
  const renderTestimonialItem = useCallback((item: TestimonialItem) => {
    return (
      <div className="flex items-center gap-3">
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt={item.nom}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-500/30 flex items-center justify-center text-pink-400">
            <User className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {item.nom || 'Client anonyme'}
          </p>
          <p className="text-slate-500 text-sm truncate">
            {item.poste || 'Poste non défini'}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${
                star <= item.note
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }, []);

  // ========== TESTIMONIAL FORM RENDER ==========
  const renderTestimonialForm = useCallback((
    item: TestimonialItem,
    index: number,
    onChange: (item: TestimonialItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Nom du client"
            value={item.nom}
            onChange={(v) => onChange({ ...item, nom: v })}
            placeholder="Ex: Jean Dupont"
          />

          <LocalInput
            label="Poste / Entreprise"
            value={item.poste || ''}
            onChange={(v) => onChange({ ...item, poste: v || null })}
            placeholder="Ex: CEO @ StartupXYZ"
          />
        </div>

        <LocalTextarea
          label="Témoignage"
          value={item.message}
          onChange={(v) => onChange({ ...item, message: v })}
          placeholder="Ce que le client dit de vous..."
          rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StarRating
            value={item.note}
            onChange={(v) => onChange({ ...item, note: v })}
          />

          <LocalImageInput
            label="Photo (optionnel)"
            value={item.photoUrl || ''}
            onChange={(v) => onChange({ ...item, photoUrl: v || null })}
            hint="Photo de profil du client"
            category="testimonials"
            fieldKey={`photo_${index}`}
            aspectRatio="square"
          />
        </div>
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
          placeholder="Témoignages"
        />
        <LocalTextarea
          label="Sous-titre (optionnel)"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Ce que nos clients disent de nous..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== LISTE DES TÉMOIGNAGES ========== */}
      <CollapsibleSection 
        title="Témoignages clients" 
        icon={<MessageSquare className="w-5 h-5" />}
        badge={`${section.content.temoignages?.length || 0}`}
      >
        <ListEditor<TestimonialItem>
          items={(section.content.temoignages || []) as TestimonialItem[]}
          onChange={handleTestimonialsChange}
          renderItem={renderTestimonialItem}
          renderForm={renderTestimonialForm}
          createItem={createTestimonial}
          label="Témoignages"
          addItemLabel="Ajouter un témoignage"
          emptyMessage="Aucun témoignage"
          emptyIcon={<MessageSquare className="w-10 h-10 mx-auto opacity-30" />}
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

export const TestimonialsForm = memo(TestimonialsFormComponent);

