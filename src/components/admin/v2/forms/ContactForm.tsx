'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Type, Palette, ChevronDown, Send
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import type { ContactSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface ContactFormProps {
  section: ContactSection & { _rowId?: number };
  onUpdate: (updates: Partial<ContactSection>) => void;
}

// ============================================
// VARIANT OPTIONS
// ============================================

const VARIANT_OPTIONS = [
  { value: 'Minimal', label: 'Minimal', emoji: '✨', description: 'Formulaire épuré' },
  { value: 'Form', label: 'Formulaire', emoji: '📝', description: 'Formulaire complet' },
  { value: 'Calendar', label: 'Calendrier', emoji: '📅', description: 'Intégration Calendly' },
  { value: 'Chat', label: 'Chat', emoji: '💬', description: 'Style chat' },
];

const CARD_STYLE_OPTIONS = [
  { value: 'Flat', label: 'Plat' },
  { value: 'Shadow', label: 'Ombre' },
  { value: 'Border', label: 'Bordure' },
  { value: 'Glassmorphism', label: 'Glass' },
];

// ============================================
// COLLAPSIBLE SECTION
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400">
            {icon}
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
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
// CONTACT FORM COMPONENT
// ============================================

function ContactFormComponent({ section, onUpdate }: ContactFormProps) {
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

  return (
    <div className="space-y-6">
      {/* ========== TEXTES ========== */}
      <CollapsibleSection title="Textes de la section" icon={<Type className="w-5 h-5" />}>
        <LocalInput
          label="Titre"
          value={section.content.titre || ''}
          onChange={(v) => updateContent('titre', v)}
          placeholder="Contactez-nous"
        />
        <LocalTextarea
          label="Sous-titre"
          value={section.content.sousTitre || ''}
          onChange={(v) => updateContent('sousTitre', v || null)}
          placeholder="Nous sommes là pour vous aider..."
          rows={2}
        />
      </CollapsibleSection>

      {/* ========== BOUTON D'ENVOI ========== */}
      <CollapsibleSection title="Bouton d'envoi" icon={<Send className="w-5 h-5" />}>
        <LocalInput
          label="Texte du bouton"
          value={section.content.submitText || ''}
          onChange={(v) => updateContent('submitText', v || 'Envoyer')}
          placeholder="Envoyer le message"
        />
        <LocalInput
          label="Message de succès"
          value={section.content.successMessage || ''}
          onChange={(v) => updateContent('successMessage', v || 'Message envoyé avec succès !')}
          placeholder="Merci ! Votre message a été envoyé."
        />
      </CollapsibleSection>

      {/* ========== INFO ========== */}
      <CollapsibleSection title="Configuration avancée" icon={<Mail className="w-5 h-5" />} defaultOpen={false}>
        <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
          <p className="text-slate-400 text-sm">
            💡 <strong className="text-white">Note:</strong> L&apos;email de réception et le webhook n8n 
            sont configurés dans <span className="text-cyan-400">Configuration Globale → Intégrations</span>.
          </p>
        </div>
        
        <div className="space-y-2 pt-4">
          <label className="text-white font-medium text-sm">Champs du formulaire</label>
          <p className="text-slate-500 text-xs">
            {section.content.formFields.length} champ(s) configuré(s)
          </p>
          <div className="space-y-2">
            {section.content.formFields.map((field, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-slate-900/30 rounded-lg">
                <span className="text-white text-sm">{field.label}</span>
                <span className="text-slate-500 text-xs">({field.type})</span>
                {field.required && (
                  <span className="text-red-400 text-xs">*requis</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ========== DESIGN ========== */}
      <CollapsibleSection title="Design" icon={<Palette className="w-5 h-5" />} defaultOpen={false}>
        <div className="space-y-4">
          {/* Variant */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Style d&apos;affichage</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {VARIANT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateDesign('variant', opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    section.design.variant === opt.value
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{opt.emoji}</span>
                  <span className={`block font-medium text-sm ${
                    section.design.variant === opt.value ? 'text-cyan-400' : 'text-white'
                  }`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-500">{opt.description}</span>
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
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const ContactForm = memo(ContactFormComponent);
