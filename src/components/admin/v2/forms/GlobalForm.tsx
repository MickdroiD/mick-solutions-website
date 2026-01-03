'use client';

import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Palette, Search, Mail, Phone, MapPin,
  Link2, Linkedin, Instagram, Twitter, Youtube, Github, Calendar,
  Image as ImageIcon, Sparkles, Loader2, X
} from 'lucide-react';
import { LocalInput, LocalTextarea, LocalColorPicker } from '@/components/admin/ui/LocalInput';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface GlobalFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

// ============================================
// SECTION CARD WRAPPER
// ============================================

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SectionCard({ title, icon, children, action }: SectionCardProps & { action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400">
            {icon}
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

// ============================================
// MAGIC PALETTE MODAL
// ============================================

interface MagicPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (palette: { primary: string; accent: string; background: string; text: string }) => void;
}

function MagicPaletteModal({ isOpen, onClose, onApply }: MagicPaletteModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPalette, setGeneratedPalette] = useState<{
    primary: string;
    accent: string;
    background: string;
    text: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 3) {
      setError('Décrivez votre activité (min 3 caractères)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPalette(null);

    try {
      const response = await fetch('/api/admin/ai/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de génération');
      }

      setGeneratedPalette({
        primary: data.primary,
        accent: data.accent,
        background: data.background,
        text: data.text,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedPalette) {
      onApply(generatedPalette);
      onClose();
      setPrompt('');
      setGeneratedPalette(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-slate-800 rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-bold">✨ Magic Palette</h2>
                <p className="text-slate-400 text-sm">Génération IA de couleurs</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-white font-medium text-sm">
                Décrivez votre activité
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Boulangerie artisanale bio, Startup tech moderne..."
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <p className="text-slate-500 text-xs">
                L&apos;IA va générer une palette de couleurs adaptée à votre secteur.
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {generatedPalette && (
              <div className="space-y-3">
                <p className="text-white font-medium text-sm">Palette générée:</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div
                      className="w-full aspect-square rounded-xl border-2 border-white/20 mb-2"
                      style={{ backgroundColor: generatedPalette.primary }}
                    />
                    <span className="text-xs text-slate-400">Primaire</span>
                    <span className="text-xs text-white block">{generatedPalette.primary}</span>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-full aspect-square rounded-xl border-2 border-white/20 mb-2"
                      style={{ backgroundColor: generatedPalette.accent }}
                    />
                    <span className="text-xs text-slate-400">Accent</span>
                    <span className="text-xs text-white block">{generatedPalette.accent}</span>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-full aspect-square rounded-xl border-2 border-white/20 mb-2"
                      style={{ backgroundColor: generatedPalette.background }}
                    />
                    <span className="text-xs text-slate-400">Fond</span>
                    <span className="text-xs text-white block">{generatedPalette.background}</span>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-full aspect-square rounded-xl border-2 border-white/20 mb-2"
                      style={{ backgroundColor: generatedPalette.text }}
                    />
                    <span className="text-xs text-slate-400">Texte</span>
                    <span className="text-xs text-white block">{generatedPalette.text}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            {generatedPalette ? (
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:brightness-110 transition-all"
              >
                Appliquer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Générer
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// GLOBAL FORM COMPONENT
// ============================================

function GlobalFormComponent({ config, onUpdate }: GlobalFormProps) {
  const [showMagicPalette, setShowMagicPalette] = useState(false);

  // ========== IDENTITY HANDLERS ==========
  const updateIdentity = useCallback((key: string, value: string) => {
    onUpdate({
      identity: {
        ...config.identity,
        [key]: value,
      },
    });
  }, [config.identity, onUpdate]);

  // ========== SEO HANDLERS ==========
  const updateSeo = useCallback((key: string, value: string | boolean | number) => {
    onUpdate({
      seo: {
        ...config.seo,
        [key]: value,
      },
    });
  }, [config.seo, onUpdate]);

  // ========== BRANDING HANDLERS ==========
  const updateBranding = useCallback((key: string, value: string) => {
    onUpdate({
      branding: {
        ...config.branding,
        [key]: value,
      },
    });
  }, [config.branding, onUpdate]);

  // ========== MAGIC PALETTE HANDLER ==========
  const applyMagicPalette = useCallback((palette: { primary: string; accent: string; background: string; text: string }) => {
    onUpdate({
      branding: {
        ...config.branding,
        couleurPrimaire: palette.primary,
        couleurAccent: palette.accent,
        couleurBackground: palette.background,
        couleurText: palette.text,
      },
    });
  }, [config.branding, onUpdate]);

  // ========== CONTACT HANDLERS ==========
  const updateContact = useCallback((key: string, value: string | null) => {
    onUpdate({
      contact: {
        ...config.contact,
        [key]: value,
      },
    });
  }, [config.contact, onUpdate]);

  // ========== ASSETS HANDLERS ==========
  const updateAssets = useCallback((key: string, value: string | null) => {
    onUpdate({
      assets: {
        ...config.assets,
        [key]: value,
      },
    });
  }, [config.assets, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== IDENTITY ========== */}
      <SectionCard title="Identité du site" icon={<Globe className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Nom du site"
            value={config.identity.nomSite}
            onChange={(v) => updateIdentity('nomSite', v)}
            placeholder="Mon Super Site"
          />
          <div>
            <LocalInput
              label="Initiales Logo"
              value={config.identity.initialesLogo}
              onChange={(v) => updateIdentity('initialesLogo', v)}
              placeholder="MS"
              disabled={true}
            />
            <p className="text-xs text-slate-500 mt-1">
              Calculé automatiquement depuis le nom du site.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ========== BRANDING (Couleurs) ========== */}
      <SectionCard 
        title="Couleurs & Style" 
        icon={<Palette className="w-5 h-5" />}
        action={
          <button
            type="button"
            onClick={() => setShowMagicPalette(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-400 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Magic Palette
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LocalColorPicker
            label="Couleur Primaire"
            value={config.branding.couleurPrimaire}
            onChange={(v) => updateBranding('couleurPrimaire', v)}
            hint="Utilisée pour les boutons et accents"
          />
          <LocalColorPicker
            label="Couleur Accent"
            value={config.branding.couleurAccent}
            onChange={(v) => updateBranding('couleurAccent', v)}
            hint="Utilisée pour les gradients"
          />
          <LocalColorPicker
            label="Couleur de fond"
            value={config.branding.couleurBackground}
            onChange={(v) => updateBranding('couleurBackground', v)}
            hint="Fond principal du site"
          />
          <LocalColorPicker
            label="Couleur du texte"
            value={config.branding.couleurText}
            onChange={(v) => updateBranding('couleurText', v)}
            hint="Couleur du texte principal"
          />
        </div>
        
        {/* Font & Style selects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
          <div className="space-y-1">
            <label className="text-white font-medium text-sm">Police principale</label>
            <select
              value={config.branding.fontPrimary || 'Inter'}
              onChange={(e) => updateBranding('fontPrimary', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Space-Grotesk">Space Grotesk</option>
              <option value="Outfit">Outfit</option>
              <option value="Montserrat">Montserrat</option>
              <option value="DM-Sans">DM Sans</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-white font-medium text-sm">Police titres</label>
            <select
              value={config.branding.fontHeading || 'Inter'}
              onChange={(e) => updateBranding('fontHeading', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Space-Grotesk">Space Grotesk</option>
              <option value="Outfit">Outfit</option>
              <option value="Montserrat">Montserrat</option>
              <option value="DM-Sans">DM Sans</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-white font-medium text-sm">Thème global</label>
            <select
              value={config.branding.themeGlobal || 'Electric'}
              onChange={(e) => updateBranding('themeGlobal', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Minimal">Minimal</option>
              <option value="Corporate">Corporate</option>
              <option value="Electric">Electric ⚡</option>
              <option value="Bold">Bold</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* ========== LOGOS & IMAGES ========== */}
      <SectionCard title="Logos & Images" icon={<ImageIcon className="w-5 h-5" />}>
        <LocalImageInput
          label="Logo principal"
          value={config.assets?.logoUrl || ''}
          onChange={(v) => updateAssets('logoUrl', v || null)}
          hint="Logo principal du site (recommandé: SVG ou PNG transparent)"
          category="logos"
          fieldKey="logoUrl"
          aspectRatio="square"
          showMagicBadge={true}
        />
        
        <LocalImageInput
          label="Logo sombre (optionnel)"
          value={config.assets?.logoDarkUrl || ''}
          onChange={(v) => updateAssets('logoDarkUrl', v || null)}
          hint="Version sombre du logo pour fonds clairs"
          category="logos"
          fieldKey="logoDarkUrl"
          aspectRatio="square"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalImageInput
            label="Favicon"
            value={config.assets?.faviconUrl || ''}
            onChange={(v) => updateAssets('faviconUrl', v || null)}
            hint="Icône du navigateur (32×32 px)"
            category="logos"
            fieldKey="faviconUrl"
            aspectRatio="square"
          />
          
          <LocalImageInput
            label="OG Image"
            value={config.assets?.ogImageUrl || ''}
            onChange={(v) => updateAssets('ogImageUrl', v || null)}
            hint="Image de partage réseaux sociaux (1200×630)"
            category="seo"
            fieldKey="ogImageUrl"
            aspectRatio="video"
          />
        </div>
        
        <LocalTextarea
          label="Code SVG du logo (optionnel)"
          value={config.assets?.logoSvgCode || ''}
          onChange={(v) => updateAssets('logoSvgCode', v || null)}
          placeholder="<svg>...</svg>"
          hint="Code SVG brut pour intégration inline"
          rows={4}
          monospace
        />
      </SectionCard>

      {/* ========== SEO ========== */}
      <SectionCard title="SEO & Référencement" icon={<Search className="w-5 h-5" />}>
        <LocalInput
          label="Titre SEO (Meta Title)"
          value={config.seo.metaTitre}
          onChange={(v) => updateSeo('metaTitre', v)}
          placeholder="Titre optimisé pour Google"
          hint="60-70 caractères recommandés"
        />
        <LocalTextarea
          label="Description SEO (Meta Description)"
          value={config.seo.metaDescription}
          onChange={(v) => updateSeo('metaDescription', v)}
          placeholder="Description qui apparaîtra dans les résultats Google"
          hint="150-160 caractères recommandés"
          rows={3}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="URL du site"
            value={config.seo.siteUrl}
            onChange={(v) => updateSeo('siteUrl', v)}
            placeholder="https://monsite.ch"
            type="url"
          />
          <LocalInput
            label="Mots-clés"
            value={config.seo.motsCles}
            onChange={(v) => updateSeo('motsCles', v)}
            placeholder="web, design, automation"
            hint="Séparés par des virgules"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-white font-medium text-sm">Langue</label>
            <select
              value={config.seo.langue}
              onChange={(e) => updateSeo('langue', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="robotsIndex"
              checked={config.seo.robotsIndex}
              onChange={(e) => updateSeo('robotsIndex', e.target.checked)}
              className="w-5 h-5 rounded border-white/10 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="robotsIndex" className="text-white text-sm">
              Autoriser l&apos;indexation Google
            </label>
          </div>
        </div>
      </SectionCard>

      {/* ========== CONTACT ========== */}
      <SectionCard title="Informations de contact" icon={<Mail className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <LocalInput
              label="Email"
              value={config.contact.email}
              onChange={(v) => updateContact('email', v)}
              placeholder="contact@example.com"
              type="email"
            />
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <LocalInput
              label="Téléphone"
              value={config.contact.telephone || ''}
              onChange={(v) => updateContact('telephone', v || null)}
              placeholder="+41 79 123 45 67"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <LocalInput
            label="Adresse complète"
            value={config.contact.adresse}
            onChange={(v) => updateContact('adresse', v)}
            placeholder="Rue Example 1, 1000 Lausanne, Suisse"
          />
        </div>
        
        {/* Social Links */}
        <div className="pt-4 border-t border-white/5">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Liens sociaux
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-400" />
              <LocalInput
                label="LinkedIn"
                value={config.contact.lienLinkedin || ''}
                onChange={(v) => updateContact('lienLinkedin', v || null)}
                placeholder="https://linkedin.com/in/..."
                type="url"
              />
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-400" />
              <LocalInput
                label="Instagram"
                value={config.contact.lienInstagram || ''}
                onChange={(v) => updateContact('lienInstagram', v || null)}
                placeholder="https://instagram.com/..."
                type="url"
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4 text-sky-400" />
              <LocalInput
                label="Twitter / X"
                value={config.contact.lienTwitter || ''}
                onChange={(v) => updateContact('lienTwitter', v || null)}
                placeholder="https://twitter.com/..."
                type="url"
              />
            </div>
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-400" />
              <LocalInput
                label="YouTube"
                value={config.contact.lienYoutube || ''}
                onChange={(v) => updateContact('lienYoutube', v || null)}
                placeholder="https://youtube.com/..."
                type="url"
              />
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-300" />
              <LocalInput
                label="GitHub"
                value={config.contact.lienGithub || ''}
                onChange={(v) => updateContact('lienGithub', v || null)}
                placeholder="https://github.com/..."
                type="url"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <LocalInput
                label="Calendly"
                value={config.contact.lienCalendly || ''}
                onChange={(v) => updateContact('lienCalendly', v || null)}
                placeholder="https://calendly.com/..."
                type="url"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ========== MAGIC PALETTE MODAL ========== */}
      <MagicPaletteModal
        isOpen={showMagicPalette}
        onClose={() => setShowMagicPalette(false)}
        onApply={applyMagicPalette}
      />
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const GlobalForm = memo(GlobalFormComponent);

