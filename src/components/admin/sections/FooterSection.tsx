'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Footprints, Upload, Link2, Trash2, RefreshCw,
  Image as ImageIcon, Linkedin, Instagram, Twitter, Youtube, Github, MapPin, Phone, Mail,
  Zap, RotateCw, Sparkles, Heart
} from 'lucide-react';
import { AccordionSection } from '../ui/AccordionSection';
import { LocalInput, LocalTextarea } from '../ui/LocalInput';
import AnimatedMedia from '@/components/AnimatedMedia';

// ============================================
// LOGO ANIMATION OPTIONS (même que Header)
// ============================================

// ============================================
// LOGO ANIMATION OPTIONS - Valeurs EXACTES acceptées par Baserow
// ============================================
const LOGO_ANIMATIONS = [
  { 
    id: 'none', 
    label: 'Aucune', 
    emoji: '⭕', 
    description: 'Logo statique',
    icon: ImageIcon,
  },
  { 
    id: 'spin', 
    label: 'Spin', 
    emoji: '🔄', 
    description: 'Rotation rapide',
    icon: RotateCw,
  },
  { 
    id: 'rotation', 
    label: 'Rotation', 
    emoji: '🔄', 
    description: 'Rotation lente continue',
    icon: RotateCw,
  },
  { 
    id: 'pulse', 
    label: 'Pulsation', 
    emoji: '💓', 
    description: 'Effet de pulsation',
    icon: Heart,
  },
  { 
    id: 'bounce', 
    label: 'Rebond', 
    emoji: '📳', 
    description: 'Effet de rebond',
    icon: Zap,
  },
  { 
    id: 'electric', 
    label: 'Electric ⚡', 
    emoji: '⚡', 
    description: 'Effet flicker électrique',
    icon: Zap,
  },
  { 
    id: 'lightning-circle', 
    label: 'Storm ⚡🎯', 
    emoji: '🌩️', 
    description: 'Tempête électrique chaotique',
    icon: Sparkles,
    highlight: true,
  },
  { 
    id: 'tech_hud', 
    label: 'Tech HUD 🎯', 
    emoji: '🔧', 
    description: 'Interface cyberpunk avec griffes',
    icon: Sparkles,
    highlight: true,
  },
  { 
    id: 'spin-glow', 
    label: 'Spin + Glow ✨', 
    emoji: '💫', 
    description: 'Rotation avec halo lumineux',
    icon: RotateCw,
  },
  { 
    id: 'vibration', 
    label: 'Vibration 📳', 
    emoji: '📳', 
    description: 'Secousse intense',
    icon: Zap,
  },
];

// ============================================
// TYPES
// ============================================

interface FooterSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onImageUpload: (key: string, file: File, category: string) => void;
  uploading: string | null;
}

// ============================================
// FOOTER VARIANTS
// ============================================

const FOOTER_VARIANTS = [
  { id: 'Minimal', label: 'Minimal', emoji: '⚪', description: 'Simple et épuré' },
  { id: 'Corporate', label: 'Corporate', emoji: '🏢', description: 'Style entreprise' },
  { id: 'Electric', label: 'Electric', emoji: '⚡', description: 'Style high-tech' },
  { id: 'Bold', label: 'Bold', emoji: '🔥', description: 'Style audacieux' },
];

// ============================================
// COMPOSANT
// ============================================

export default function FooterSection({
  config,
  // options unused for now, but kept for interface compatibility
  onConfigUpdate,
  onImageUpload,
  uploading,
}: FooterSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionSection externe
  const [uploadMode, setUploadMode] = useState<Record<string, 'upload' | 'url'>>({});

  const footerLogoUrl = String(config.logoDarkUrl || config.logoUrl || '');
  const logoSvgCode = String(config.logoSvgCode || '').trim();
  const hasFooterLogo = Boolean(footerLogoUrl && footerLogoUrl.length > 0);
  const hasSvgLogo = Boolean(logoSvgCode.length > 0);
  const currentVariant = String(config.footerVariant || 'Electric');
  
  // Handler stable pour les updates
  const createUpdateHandler = useCallback((key: string) => {
    return (value: string) => onConfigUpdate(key, value);
  }, [onConfigUpdate]);

  // ============================================
  // RENDER HELPERS (Utilisant LocalInput pour éviter re-renders)
  // ============================================

  const renderTextInput = (key: string, label: string, placeholder?: string, hint?: string, icon?: React.ReactNode) => {
    // Combine label avec icon si présent
    const labelWithIcon = icon ? (
      <span className="flex items-center gap-2">{icon}{label}</span>
    ) : label;
    
    return (
      <LocalInput
        value={String(config[key] ?? '')}
        onChange={createUpdateHandler(key)}
        label={String(labelWithIcon)}
        placeholder={placeholder}
        hint={hint}
      />
    );
  };

  const renderTextarea = (key: string, label: string, placeholder?: string, hint?: string) => (
    <LocalTextarea
      value={String(config[key] ?? '')}
      onChange={createUpdateHandler(key)}
      label={label}
      placeholder={placeholder}
      hint={hint}
    />
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
           type="button"
            onClick={() => setUploadMode({ ...uploadMode, [key]: 'upload' })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'upload' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <Upload className="w-4 h-4 inline mr-1" /> Upload
          </button>
          <button
           type="button"
            onClick={() => setUploadMode({ ...uploadMode, [key]: 'url' })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'url' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <Link2 className="w-4 h-4 inline mr-1" /> URL
          </button>
        </div>

        {mode === 'upload' ? (
          <div className="relative">
            <input
              type="file"
              accept="image/*,.svg"
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
                  <span className="text-slate-400 text-sm">Uploader</span>
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
            <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden">
              <Image src={currentValue} alt="" width={48} height={48} className="w-full h-full object-contain" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentValue.split('/').pop()}</p>
            </div>
            <button
             type="button"
              onClick={() => onConfigUpdate(key, '')}
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
      <div className="bg-gradient-to-br from-slate-600/20 to-gray-500/20 border border-slate-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center">
            <Footprints className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">👣 Footer</h2>
            <p className="text-slate-400">Logo, copyright, réseaux sociaux et informations légales</p>
          </div>
        </div>
      </div>

      {/* Section Branding Footer */}
      <AccordionSection id="branding" title="Logo & Branding" emoji="🖼️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderImageUploader('logoDarkUrl', 'Logo Footer (mode sombre)', 'logos', 'Version claire pour le fond sombre du footer')}
          
          <div className="space-y-4">
            {renderTextInput('slogan', 'Slogan', 'Votre accroche...', 'Affiché sous le logo')}
            {renderTextInput('nomSite', 'Nom du site', 'Mon Entreprise')}
          </div>
        </div>

        {/* Aperçu - Utilise AnimatedMedia pour preview réaliste */}
        {(hasSvgLogo || hasFooterLogo) && (
          <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-white/10">
            <p className="text-slate-400 text-sm mb-3">Aperçu Footer :</p>
            <div className="flex items-center gap-3">
              <AnimatedMedia
                svgCode={hasSvgLogo ? logoSvgCode : undefined}
                imageUrl={!hasSvgLogo && hasFooterLogo ? footerLogoUrl : undefined}
                animationType={String(config.footerLogoAnimation || 'none')}
                size={Number(config.footerLogoSize) || 40}
                alt="Logo Footer"
                primaryColor="rgba(34, 211, 238, 0.5)"
                accentColor="rgba(168, 139, 250, 0.5)"
              />
              <div>
                <span className="text-white font-semibold">
                  {String(config.nomSite || 'Mon Site')}
                </span>
                <p className="text-slate-500 text-sm">
                  {String(config.slogan || 'Votre slogan ici')}
                </p>
              </div>
            </div>
            
            {/* Info Lightning Storm */}
            {String(config.footerLogoAnimation) === 'lightning-circle' && (
              <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mt-3">
                <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <p className="text-violet-400/80 text-xs">
                  <strong>⚡ Storm</strong> - Tempête électrique chaotique autour du logo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Taille du Logo Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <label className="text-white font-medium text-sm mb-3 block">
            📏 Taille du Logo Footer: <span className="text-cyan-400">{Number(config.footerLogoSize) || 40}px</span>
          </label>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs">20px</span>
            <input
              type="range"
              min={20}
              max={500}
              step={5}
              value={Number(config.footerLogoSize) || 40}
              onChange={(e) => onConfigUpdate('footerLogoSize', Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-slate-500 text-xs">500px</span>
          </div>
          <p className="text-slate-500 text-xs mt-2">Ajustez la taille du logo dans le footer (largeur en pixels)</p>
        </div>

        {/* Animation du Logo Footer */}
        <div className="mt-6">
          <label className="text-white font-medium text-sm mb-3 block">⚡ Animation du Logo Footer</label>
          <p className="text-slate-400 text-sm mb-4">
            Choisissez l&apos;effet d&apos;animation appliqué au logo dans le footer.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {LOGO_ANIMATIONS.map((anim) => {
              const isSelected = String(config.footerLogoAnimation || 'none') === anim.id;
              const Icon = anim.icon;
              
              return (
                <button
                 type="button"
                  key={anim.id}
                  onClick={() => onConfigUpdate('footerLogoAnimation', anim.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? anim.id === 'electric'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'bg-violet-500/20 border-violet-400 text-violet-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected && anim.id === 'electric' ? 'text-cyan-400' : ''}`} />
                  <span className="text-xs font-medium">{anim.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code SVG du Logo */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
            <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div className="text-violet-300 text-sm">
              <p className="font-medium mb-1">Code SVG du Logo (Optionnel)</p>
              <p className="text-violet-400/80">
                Si rempli, ce code SVG <strong>remplace</strong> l&apos;image URL du logo dans le Footer.
              </p>
            </div>
          </div>

          <LocalTextarea
            value={String(config.logoSvgCode ?? '')}
            onChange={createUpdateHandler('logoSvgCode')}
            label="Code SVG du Logo"
            placeholder="<svg viewBox='0 0 100 100'>...</svg>"
            hint="Collez le code SVG complet. Ce champ est partagé avec le Header et Hero."
            rows={6}
            monospace
          />

          {/* Aperçu SVG inline */}
          {hasSvgLogo && (
            <div className="mt-4 space-y-2">
              <label className="text-white font-medium text-sm">Aperçu du SVG</label>
              <div className="flex items-center justify-center p-6 bg-[#0a0a0f] rounded-xl border border-white/10">
                <div 
                  className="max-w-[120px] max-h-[120px] [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: logoSvgCode }}
                />
              </div>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Section Contact */}
      <AccordionSection id="contact" title="Informations de Contact" emoji="📞">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('email', 'Email', 'contact@example.com', 'Email de contact principal', <Mail className="w-4 h-4 text-cyan-400" />)}
          {renderTextInput('telephone', 'Téléphone', '+41 22 123 45 67', 'Numéro de téléphone', <Phone className="w-4 h-4 text-cyan-400" />)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('adresse', 'Adresse complète', 'Genève, Suisse', 'Adresse affichée dans le footer', <MapPin className="w-4 h-4 text-cyan-400" />)}
          {renderTextInput('adresseCourte', 'Adresse courte', 'Genève', 'Version courte pour mobile')}
        </div>
      </AccordionSection>

      {/* Section Réseaux Sociaux */}
      <AccordionSection id="social" title="Réseaux Sociaux" emoji="📱">
        <p className="text-slate-400 text-sm mb-4">
          Ajoutez vos liens vers les réseaux sociaux. Ils apparaîtront automatiquement dans le footer.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('lienLinkedin', 'LinkedIn', 'https://linkedin.com/company/...', undefined, <Linkedin className="w-4 h-4 text-blue-400" />)}
          {renderTextInput('lienInstagram', 'Instagram', 'https://instagram.com/...', undefined, <Instagram className="w-4 h-4 text-pink-400" />)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('lienTwitter', 'Twitter/X', 'https://twitter.com/...', undefined, <Twitter className="w-4 h-4 text-sky-400" />)}
          {renderTextInput('lienYoutube', 'YouTube', 'https://youtube.com/...', undefined, <Youtube className="w-4 h-4 text-red-400" />)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('lienGithub', 'GitHub', 'https://github.com/...', undefined, <Github className="w-4 h-4 text-white" />)}
          {renderTextInput('lienWhatsapp', 'WhatsApp', 'https://wa.me/...', 'Lien WhatsApp direct')}
        </div>
      </AccordionSection>

      {/* Section Légal */}
      <AccordionSection id="legal" title="Textes Légaux" emoji="⚖️">
        {renderTextInput('copyrightTexte', 'Texte Copyright', '© 2025 Mon Site. Tous droits réservés.')}
        {renderTextInput('paysHebergement', 'Pays hébergement', 'Hébergé en Suisse 🇨🇭', 'Indicateur de localisation des données')}
        
        {renderTextarea('customFooterText', 'Texte personnalisé', 'Texte supplémentaire...', 'Texte additionnel sous le copyright')}

        {/* Toggle liens légaux - ✅ CORRECTION: utiliser Boolean() */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
          <div>
            <p className="text-white font-medium">Afficher les liens légaux</p>
            <p className="text-slate-500 text-sm">Mentions légales, CGV, Confidentialité...</p>
          </div>
          <button
           type="button"
            onClick={() => onConfigUpdate('showLegalLinks', !Boolean(config.showLegalLinks))}
            className={`w-14 h-8 rounded-full transition-all ${Boolean(config.showLegalLinks) ? 'bg-cyan-500' : 'bg-slate-700'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${Boolean(config.showLegalLinks) ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* ✅ NOUVEAU: Info sur l'édition des documents légaux */}
        <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-violet-300 font-medium mb-1">📄 Modifier les documents légaux</p>
              <p className="text-violet-400/80 text-sm mb-2">
                Le contenu des pages légales (Mentions légales, CGV, Politique de confidentialité) 
                est géré dans Baserow, table <strong>&quot;SITEWEB Legal_Docs&quot;</strong>.
              </p>
              <a 
                href="https://baserow.mick-solutions.ch/database/76/table/753" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/30 transition-all"
              >
                📝 Ouvrir dans Baserow
              </a>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Section Style */}
      <AccordionSection id="style" title="Style du Footer" emoji="🎨">
        <p className="text-slate-400 text-sm mb-4">
          Choisissez la variante de design pour votre footer.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FOOTER_VARIANTS.map((variant) => {
            const isSelected = currentVariant === variant.id;
            
            return (
              <button
               type="button"
                key={variant.id}
                onClick={() => onConfigUpdate('footerVariant', variant.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{variant.emoji}</span>
                <span className="text-sm font-medium">{variant.label}</span>
                <span className="text-xs opacity-70">{variant.description}</span>
              </button>
            );
          })}
        </div>

        {/* CTA Footer optionnel */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <p className="text-white font-medium text-sm mb-3">CTA Footer (optionnel)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextInput('footerCtaText', 'Texte CTA', 'Démarrer maintenant', 'Bouton d\'action dans le footer')}
            {renderTextInput('footerCtaUrl', 'Lien CTA', '#contact')}
          </div>
        </div>
      </AccordionSection>
    </motion.div>
  );
}

