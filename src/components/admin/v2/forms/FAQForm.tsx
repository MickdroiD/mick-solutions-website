'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Type, Palette, ChevronDown } from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { FAQSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface FAQFormProps {
  section: FAQSection & { _rowId?: number };
  onUpdate: (updates: Partial<FAQSection>) => void;
}

interface FAQItem extends ListItem {
  id: string;
  question: string;
  reponse: string;
  ordre: number;
}

// ============================================
// VARIANT OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Minimal', label: 'Minimal', emoji: '🎯' },
  { value: 'Accordion', label: 'Accordéon', emoji: '☰' },
  { value: 'Tabs', label: 'Onglets', emoji: '📑' },
  { value: 'Search', label: 'Recherche', emoji: '🔍' },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400">
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
// FAQ FORM COMPONENT
// ============================================

function FAQFormComponent({ section, onUpdate }: FAQFormProps) {
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

  // ========== FAQ HANDLERS ==========
  const handleQuestionsChange = useCallback((newQuestions: FAQItem[]) => {
    // Update ordre based on position
    const orderedQuestions = newQuestions.map((q, i) => ({ ...q, ordre: i }));
    updateContent('questions', orderedQuestions);
  }, [updateContent]);

  const createQuestion = useCallback((): FAQItem => ({
    id: `faq_${Date.now()}`,
    question: '',
    reponse: '',
    ordre: (section.content.questions?.length || 0),
  }), [section.content.questions?.length]);

  // ========== FAQ ITEM RENDER ==========
  const renderFAQItem = useCallback((item: FAQItem) => {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {item.question || 'Question sans titre'}
          </p>
          <p className="text-slate-500 text-sm truncate">
            {item.reponse ? `${item.reponse.substring(0, 60)}...` : 'Réponse non définie'}
          </p>
        </div>
      </div>
    );
  }, []);

  // ========== FAQ FORM RENDER ==========
  const renderFAQForm = useCallback((
    item: FAQItem,
    _index: number,
    onChange: (item: FAQItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <LocalInput
          label="Question"
          value={item.question}
          onChange={(v) => onChange({ ...item, question: v })}
          placeholder="Ex: Comment fonctionne votre service ?"
        />

        <LocalTextarea
          label="Réponse"
          value={item.reponse}
          onChange={(v) => onChange({ ...item, reponse: v })}
          placeholder="Répondez à la question de manière claire et concise..."
          rows={4}
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
          placeholder="Questions Fréquentes"
        />
        <LocalTextarea
          label="Sous-titre (optionnel)"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Trouvez les réponses à vos questions..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== LISTE DES QUESTIONS ========== */}
      <CollapsibleSection 
        title="Questions & Réponses" 
        icon={<HelpCircle className="w-5 h-5" />}
        badge={`${section.content.questions?.length || 0}`}
      >
        <ListEditor<FAQItem>
          items={(section.content.questions || []) as FAQItem[]}
          onChange={handleQuestionsChange}
          renderItem={renderFAQItem}
          renderForm={renderFAQForm}
          createItem={createQuestion}
          label="Questions"
          addItemLabel="Ajouter une question"
          emptyMessage="Aucune question définie"
          emptyIcon={<HelpCircle className="w-10 h-10 mx-auto opacity-30" />}
        />
      </CollapsibleSection>

      {/* ========== DESIGN & STYLE ========== */}
      <CollapsibleSection title="Design & Style" icon={<Palette className="w-5 h-5" />} defaultOpen={false}>
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
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
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
        onChange={(updates) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onUpdate({ effects: { ...(section.effects || {}), ...updates } as any });
        }}
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

export const FAQForm = memo(FAQFormComponent);

