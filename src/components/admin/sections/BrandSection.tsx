'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Palette, Upload, Link2, Trash2, RefreshCw,
  CheckCircle, AlertTriangle, Image as ImageIcon
} from 'lucide-react';
import { AccordionSection } from '../ui/AccordionSection';
import { LocalInput, LocalTextarea, LocalColorPicker } from '../ui/LocalInput';

// ============================================
// TYPES
// ============================================

interface BrandSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onImageUpload: (key: string, file: File, category: string) => void;
  uploading: string | null;
}

// ============================================
// COMPOSANT
// ============================================

export default function BrandSection({
  config,
  options,
  onConfigUpdate,
  onImageUpload,
  uploading,
}: BrandSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionSection externe
  const [uploadMode, setUploadMode] = useState<Record<string, 'upload' | 'url'>>({});

  // Vérifier si un logo est défini (URL valide)
  const hasLogoUrl = Boolean(config.logoUrl && String(config.logoUrl).length > 0);
  
  // Handler stable pour les updates
  const createUpdateHandler = useCallback((key: string) => {
    return (value: string) => onConfigUpdate(key, value);
  }, [onConfigUpdate]);

  // ============================================
  // RENDER HELPERS (Utilisant LocalInput pour éviter re-renders)
  // ============================================

  const renderTextInput = (key: string, label: string, placeholder?: string, hint?: string) => (
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

  const renderColorPicker = (key: string, label: string, hint?: string) => (
    <LocalColorPicker
      value={String(config[key] ?? '')}
      onChange={createUpdateHandler(key)}
      label={label}
      hint={hint}
    />
  );

  const renderSelect = (key: string, label: string, selectOptions: string[], hint?: string) => (
    <div className="space-y-1">
      <label className="text-white font-medium text-sm">{label}</label>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}
      <select
        value={String(config[key] ?? '')}
        onChange={(e) => onConfigUpdate(key, e.target.value)}
        className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all [&>option]:bg-slate-800"
      >
        <option value="">Choisir...</option>
        {selectOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const renderImageUploader = (key: string, label: string, category: string, hint?: string) => {
    const currentValue = String(config[key] || '');
    const mode = uploadMode[key] || 'upload';

    return (
      <div className="space-y-2">
        <label className="text-white font-medium text-sm">{label}</label>
        {hint && <p className="text-slate-500 text-xs">{hint}</p>}

        <div className="flex gap-2 mb-2">
          <button
            type="button" onClick={() => setUploadMode({ ...uploadMode, [key]: 'upload' })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'upload' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <Upload className="w-4 h-4 inline mr-1" /> Upload
          </button>
          <button
            type="button" onClick={() => setUploadMode({ ...uploadMode, [key]: 'url' })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'url' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <Link2 className="w-4 h-4 inline mr-1" /> URL
          </button>
        </div>

        {mode === 'upload' ? (
          <div className="relative">
            <input
              type="file"
              accept="image/*,.svg,.heic,.avif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(key, file, category);
              }}
              className="hidden"
              id={`upload-${key}`}
              disabled={uploading === key}
            />
            <label
              htmlFor={`upload-${key}`}
              className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                uploading === key ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/20 hover:border-cyan-500/50'
              }`}
            >
              {uploading === key ? (
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-slate-400 text-sm">Cliquez pour uploader</span>
                  <span className="text-slate-600 text-xs">Conversion auto WebP ✨</span>
                </>
              )}
            </label>
          </div>
        ) : (
          <LocalInput
            value={currentValue}
            onChange={createUpdateHandler(key)}
            label=""
            placeholder="https://..."
            type="url"
          />
        )}

        {currentValue && (
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden">
              <Image src={currentValue} alt="" width={64} height={64} className="w-full h-full object-contain" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{label}</p>
              <p className="text-slate-500 text-xs truncate">{currentValue.split('/').pop()}</p>
            </div>
            <button
              type="button" onClick={() => onConfigUpdate(key, '')}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

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
      <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
            <Palette className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🎨 Marque & Style</h2>
            <p className="text-slate-400">Identité visuelle, logos, couleurs, polices et SEO</p>
          </div>
        </div>
      </div>

      {/* Identité de base */}
      <AccordionSection id="identity" title="Identité du site" emoji="🎯">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('nomSite', 'Nom du site', 'Mon Entreprise', 'Apparaît dans le header et le SEO')}
          {renderTextInput('initialesLogo', 'Initiales', 'ME', 'Utilisées si pas de logo')}
        </div>
        {renderTextarea('slogan', 'Slogan', 'Votre accroche...', 'Phrase d\'accroche principale')}
      </AccordionSection>

      {/* Logos & Images */}
      <AccordionSection id="logos" title="Logos & Images" emoji="🖼️">
        {/* Bandeau d'information sur le logo */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border mb-4 ${
          hasLogoUrl 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          {hasLogoUrl ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 font-medium">Logo principal défini</p>
                <p className="text-emerald-400/70 text-sm mt-1">
                  Le logo est affiché dans le Header et le Footer. Les initiales ne sont plus utilisées.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium">Aucun logo défini</p>
                <p className="text-amber-400/70 text-sm mt-1">
                  Sans logo, les <strong>initiales</strong> seront affichées dans le Header/Footer.
                  Ajoutez un logo ci-dessous pour une apparence professionnelle.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`relative ${!hasLogoUrl ? 'ring-2 ring-amber-500/50 rounded-xl' : ''}`}>
            {renderImageUploader('logoUrl', 'Logo principal', 'logos', 'PNG, SVG, JPG (conversion auto WebP) - Clé: site_logo')}
            {!hasLogoUrl && (
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-medium">
                Recommandé
              </div>
            )}
          </div>
          {renderImageUploader('logoDarkUrl', 'Logo mode sombre', 'logos', 'Version claire pour fond sombre')}
          {renderImageUploader('faviconUrl', 'Favicon', 'favicon', 'Icône navigateur (32x32)')}
          {renderImageUploader('ogImageUrl', 'Image OpenGraph', 'og', 'Pour partages réseaux (1200x630)')}
        </div>

        {/* Aperçu du logo dans le Header */}
        {hasLogoUrl && (
          <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-white/10">
            <p className="text-slate-400 text-sm mb-3">Aperçu dans le Header :</p>
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg">
              <Image
                src={String(config.logoUrl)}
                alt="Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                unoptimized
              />
              <span className="text-white font-semibold">
                {String(config.nomSite || 'Nom du site')}
              </span>
            </div>
          </div>
        )}
      </AccordionSection>

      {/* Couleurs */}
      <AccordionSection id="colors" title="Couleurs" emoji="🎨">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderColorPicker('couleurPrimaire', 'Couleur primaire', 'Couleur principale du site')}
          {renderColorPicker('couleurAccent', 'Couleur accent', 'Couleur des boutons et liens')}
          {renderColorPicker('couleurBackground', 'Fond', 'Couleur de fond')}
          {renderColorPicker('couleurText', 'Texte', 'Couleur du texte')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          {renderSelect('themeGlobal', 'Thème global', options.themeGlobal || ['Minimal', 'Corporate', 'Electric', 'Bold', 'Custom'])}
          {renderSelect('borderRadius', 'Style des coins', options.borderRadius || ['None', 'Small', 'Medium', 'Large', 'Full'])}
        </div>
      </AccordionSection>

      {/* Typographie */}
      <AccordionSection id="typography" title="Typographie" emoji="🔤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect('fontPrimary', 'Police principale', options.fontPrimary || ['Inter', 'Poppins', 'Space-Grotesk', 'Outfit', 'Montserrat', 'DM-Sans', 'Custom'], 'Police pour le contenu')}
          {renderSelect('fontHeading', 'Police titres', options.fontHeading || ['Inter', 'Poppins', 'Space-Grotesk', 'Outfit', 'Montserrat', 'DM-Sans', 'Custom'], 'Police pour les titres')}
        </div>
        {renderTextInput('fontCustomUrl', 'URL police personnalisée', 'https://fonts.googleapis.com/css2?family=...', 'Pour charger une police custom')}
      </AccordionSection>

      {/* SEO & Métatags */}
      <AccordionSection id="seo" title="SEO & Métatags" emoji="🔍">
        {renderTextInput('metaTitre', 'Meta Titre', 'Titre pour Google', '50-60 caractères recommandés')}
        {renderTextarea('metaDescription', 'Meta Description', 'Description pour Google', '150-160 caractères recommandés')}
        {renderTextarea('motsCles', 'Mots-clés', 'mot1, mot2, mot3', 'Séparés par des virgules')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          {renderTextInput('siteUrl', 'URL du site', 'https://monsite.ch')}
          {renderTextInput('langue', 'Langue', 'fr', 'Code langue (fr, en, de...)')}
        </div>
        
        {/* Toggle indexation */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
          <div>
            <p className="text-white font-medium">Indexation Google</p>
            <p className="text-slate-500 text-sm">Autoriser Google à indexer votre site</p>
          </div>
          <button
            type="button" onClick={() => onConfigUpdate('robotsIndex', !config.robotsIndex)}
            className={`w-14 h-8 rounded-full transition-all ${config.robotsIndex ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${config.robotsIndex ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </AccordionSection>

    </motion.div>
  );
}

