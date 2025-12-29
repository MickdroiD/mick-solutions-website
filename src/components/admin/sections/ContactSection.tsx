'use client';

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Eye, EyeOff, ChevronDown, ChevronRight,
  Mail, MapPin, Linkedin, Instagram, Twitter, Youtube, Github, 
  Calendar, MessageCircle, FileText
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '../ui/LocalInput';

// ============================================
// TYPES
// ============================================

interface ContactSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onConfigUpdateMultiple: (updates: Record<string, unknown>) => void;
}

// ============================================
// VARIANTES
// ============================================

const CONTACT_VARIANTS = [
  { id: 'Désactivé', label: 'Off', emoji: '🚫', color: 'bg-slate-500/20 border-slate-500' },
  { id: 'Minimal', label: 'Minimal', emoji: '◽', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'Form', label: 'Formulaire', emoji: '📝', color: 'bg-green-500/20 border-green-500' },
  { id: 'Calendar', label: 'Calendrier', emoji: '📅', color: 'bg-orange-500/20 border-orange-500' },
  { id: 'Chat', label: 'Chat', emoji: '💬', color: 'bg-violet-500/20 border-violet-500' },
];

const FOOTER_VARIANTS = [
  { id: 'Minimal', label: 'Minimal', emoji: '◽', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'Corporate', label: 'Corporate', emoji: '🏢', color: 'bg-emerald-500/20 border-emerald-500' },
  { id: 'Electric', label: 'Electric', emoji: '⚡', color: 'bg-yellow-500/20 border-yellow-500' },
  { id: 'Bold', label: 'Bold', emoji: '💪', color: 'bg-red-500/20 border-red-500' },
];

// ============================================
// COMPOSANT
// ============================================

// ============================================
// ACCORDION AVEC TOGGLE (version spéciale pour cette section)
// ============================================

const ContactAccordionSection = memo(function ContactAccordionSection({ 
  id, 
  title, 
  emoji,
  isActive,
  onToggle,
  defaultExpanded = true,
  children 
}: { 
  id: string; 
  title: string; 
  emoji: string;
  isActive?: boolean;
  onToggle?: () => void;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-slate-800/50">
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="flex items-center gap-3 hover:opacity-80 transition-all"
        >
          <span className="text-xl">{emoji}</span>
          <span className="text-white font-medium">{title}</span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {onToggle !== undefined && (
          <div className="flex items-center gap-3">
            {isActive ? (
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" /> Activé
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-xs flex items-center gap-1">
                <EyeOff className="w-3 h-3" /> Off
              </span>
            )}
            <button
              type="button"
              onClick={onToggle}
              className={`w-12 h-6 rounded-full transition-all ${isActive ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        )}
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`content-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4 bg-slate-900/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ContactSection({
  config,
  // options unused for now, but kept for interface compatibility
  onConfigUpdate,
  onConfigUpdateMultiple,
}: ContactSectionProps) {
  const isContactActive = config.showContact === true;
  const contactVariant = String(config.contactVariant || 'Form');
  const footerVariant = String(config.footerVariant || 'Corporate');
  
  // Handler stable pour les updates
  const createUpdateHandler = useCallback((key: string) => {
    return (value: string) => onConfigUpdate(key, value);
  }, [onConfigUpdate]);

  // ============================================
  // RENDER HELPERS (Utilisant LocalInput pour éviter re-renders)
  // ============================================

  const renderTextInput = (key: string, label: string, placeholder?: string, icon?: React.ReactNode, hint?: string) => (
    <LocalInput
      value={String(config[key] ?? '')}
      onChange={createUpdateHandler(key)}
      label={label}
      placeholder={placeholder}
      hint={hint}
    />
  );

  const renderTextarea = (key: string, label: string, placeholder?: string, hint?: string) => (
    <LocalTextarea
      value={String(config[key] ?? '')}
      onChange={createUpdateHandler(key)}
      label={label}
      placeholder={placeholder}
      hint={hint}
    />
  );

  const renderUrlInput = (key: string, label: string, icon: React.ReactNode, placeholder?: string) => (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex-1">
        <LocalInput
          value={String(config[key] ?? '')}
          onChange={createUpdateHandler(key)}
          label={label}
          placeholder={placeholder || 'https://...'}
          type="url"
        />
      </div>
    </div>
  );

  const renderToggle = (key: string, label: string, hint?: string) => (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/10">
      <div>
        <p className="text-white font-medium">{label}</p>
        {hint && <p className="text-slate-500 text-sm">{hint}</p>}
      </div>
      <button
        type="button" onClick={() => onConfigUpdate(key, !config[key])}
        className={`w-14 h-8 rounded-full transition-all ${config[key] ? 'bg-cyan-500' : 'bg-slate-700'}`}
      >
        <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${config[key] ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Phone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">📞 Contact & Pied de page</h2>
            <p className="text-slate-400">Formulaire, coordonnées, réseaux sociaux et footer</p>
          </div>
        </div>
      </div>

      {/* Section Contact */}
      <ContactAccordionSection
        id="contact"
        title="Section Contact"
        emoji="📧"
        isActive={isContactActive}
        onToggle={() => onConfigUpdate('showContact', !isContactActive)}
      >
        {/* Variante de style */}
        <div className="mb-4">
          <label className="text-white font-medium text-sm mb-3 block">Style du formulaire</label>
          <div className="grid grid-cols-5 gap-2">
            {CONTACT_VARIANTS.map((variant) => {
              const isDisabled = variant.id === 'Désactivé';
              const isSelected = isDisabled
                ? !isContactActive
                : isContactActive && contactVariant === variant.id;

              return (
                <button
                  type="button" key={variant.id}
                  onClick={() => {
                    if (isDisabled) {
                      onConfigUpdate('showContact', false);
                    } else {
                      onConfigUpdateMultiple({ showContact: true, contactVariant: variant.id });
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `${variant.color} text-white shadow-lg`
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl mb-1">{variant.emoji}</span>
                  <span className="text-xs">{variant.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coordonnées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('email', 'Email', 'contact@exemple.ch', <Mail className="w-4 h-4 text-cyan-400" />)}
          {renderTextInput('telephone', 'Téléphone', '+41 79 123 45 67', <Phone className="w-4 h-4 text-emerald-400" />)}
        </div>
        {renderTextarea('adresse', 'Adresse complète', 'Rue Example 1, 1000 Lausanne, Suisse')}
        {renderTextInput('adresseCourte', 'Adresse courte', 'Lausanne, Suisse', <MapPin className="w-4 h-4 text-rose-400" />, 'Version abrégée pour le footer')}

        {/* Webhook Contact */}
        {renderTextInput('n8nWebhookContact', 'Webhook Contact (n8n)', 'https://n8n.example.com/webhook/...', undefined, 'URL pour recevoir les soumissions du formulaire')}
      </ContactAccordionSection>

      {/* Section Réseaux sociaux */}
      <ContactAccordionSection id="socials" title="Réseaux sociaux" emoji="🔗">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderUrlInput('lienLinkedin', 'LinkedIn', <Linkedin className="w-5 h-5" />)}
          {renderUrlInput('lienInstagram', 'Instagram', <Instagram className="w-5 h-5" />)}
          {renderUrlInput('lienTwitter', 'Twitter / X', <Twitter className="w-5 h-5" />)}
          {renderUrlInput('lienYoutube', 'YouTube', <Youtube className="w-5 h-5" />)}
          {renderUrlInput('lienGithub', 'GitHub', <Github className="w-5 h-5" />)}
          {renderUrlInput('lienCalendly', 'Calendly', <Calendar className="w-5 h-5" />)}
          {renderUrlInput('lienWhatsapp', 'WhatsApp', <MessageCircle className="w-5 h-5" />)}
        </div>
      </ContactAccordionSection>

      {/* Section Footer */}
      <ContactAccordionSection id="footer" title="Pied de page (Footer)" emoji="📄">
        {/* Variante de style */}
        <div className="mb-4">
          <label className="text-white font-medium text-sm mb-3 block">Style du footer</label>
          <div className="grid grid-cols-4 gap-2">
            {FOOTER_VARIANTS.map((variant) => {
              const isSelected = footerVariant === variant.id;
              return (
                <button
                  type="button" key={variant.id}
                  onClick={() => onConfigUpdate('footerVariant', variant.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `${variant.color} text-white shadow-lg`
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl mb-1">{variant.emoji}</span>
                  <span className="text-xs">{variant.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {renderTextInput('copyrightTexte', 'Texte de copyright', '© 2025 Mon Entreprise. Tous droits réservés.')}
        {renderTextInput('paysHebergement', 'Pays d\'hébergement', 'Suisse', undefined, 'Affiché dans le badge "Hébergé en..."')}
        {renderTextarea('customFooterText', 'Texte personnalisé', 'Texte additionnel pour le footer...')}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('footerCtaText', 'Texte CTA', 'Prendre rendez-vous')}
          {renderTextInput('footerCtaUrl', 'Lien CTA', '#contact')}
        </div>
      </ContactAccordionSection>

      {/* Section Légal */}
      <ContactAccordionSection id="legal" title="Pages légales" emoji="📜" defaultExpanded={false}>
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
          <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            Les pages légales (CGV, Mentions légales, Politique de confidentialité) sont configurables dans la section Gestion de contenu.
          </p>
        </div>

        {renderToggle('showLegalLinks', 'Afficher les liens légaux', 'CGV, Mentions légales, etc. dans le footer')}
        {renderToggle('showCookieBanner', 'Bannière de cookies', 'Afficher la bannière RGPD')}
      </ContactAccordionSection>
    </motion.div>
  );
}

