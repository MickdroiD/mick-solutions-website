'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Layout, Upload, Link2, Trash2, RefreshCw,
  CheckCircle, AlertTriangle, Image as ImageIcon, Zap, RotateCw, Sparkles, Heart
} from 'lucide-react';
import { AccordionSection } from '../ui/AccordionSection';
import { LocalInput, LocalTextarea } from '../ui/LocalInput';
import AnimatedMedia from '@/components/AnimatedMedia';

// ============================================
// TYPES
// ============================================

interface HeaderSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onImageUpload: (key: string, file: File, category: string) => void;
  uploading: string | null;
}

// ============================================
// LOGO ANIMATION OPTIONS
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
    cssClass: ''
  },
  { 
    id: 'spin', 
    label: 'Spin', 
    emoji: '🔄', 
    description: 'Rotation rapide',
    icon: RotateCw,
    cssClass: 'animate-spin'
  },
  { 
    id: 'rotation', 
    label: 'Rotation', 
    emoji: '🔄', 
    description: 'Rotation lente continue',
    icon: RotateCw,
    cssClass: 'animate-spin-slow'
  },
  { 
    id: 'pulse', 
    label: 'Pulsation', 
    emoji: '💓', 
    description: 'Effet de pulsation',
    icon: Heart,
    cssClass: 'animate-pulse'
  },
  { 
    id: 'bounce', 
    label: 'Rebond', 
    emoji: '📳', 
    description: 'Effet de rebond',
    icon: Zap,
    cssClass: 'animate-bounce'
  },
  { 
    id: 'electric', 
    label: 'Electric ⚡', 
    emoji: '⚡', 
    description: 'Effet flicker électrique',
    icon: Zap,
    cssClass: 'animate-electric'
  },
  { 
    id: 'lightning-circle', 
    label: 'Storm ⚡🎯', 
    emoji: '🌩️', 
    description: 'Tempête électrique chaotique',
    icon: Sparkles,
    cssClass: '',
    highlight: true
  },
  { 
    id: 'tech_hud', 
    label: 'Tech HUD 🎯', 
    emoji: '🔧', 
    description: 'Interface cyberpunk avec griffes',
    icon: Sparkles,
    cssClass: '',
    highlight: true
  },
  { 
    id: 'spin-glow', 
    label: 'Spin + Glow ✨', 
    emoji: '💫', 
    description: 'Rotation avec halo lumineux',
    icon: RotateCw,
    cssClass: ''
  },
  { 
    id: 'vibration', 
    label: 'Vibration 📳', 
    emoji: '📳', 
    description: 'Secousse intense',
    icon: Zap,
    cssClass: ''
  },
];

const LOGO_FRAME_STYLES = [
  { id: 'Square', label: 'Carré', emoji: '⬜' },
  { id: 'Circle', label: 'Cercle', emoji: '⭕' },
  { id: 'ThickCircle', label: 'Cercle épais', emoji: '🔘' },
  { id: 'None', label: 'Sans cadre', emoji: '🚫' },
];

// ============================================
// COMPOSANT
// ============================================

export default function HeaderSection({
  config,
  // options unused for now, but kept for interface compatibility
  onConfigUpdate,
  onImageUpload,
  uploading,
}: HeaderSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionSection externe
  const [uploadMode, setUploadMode] = useState<Record<string, 'upload' | 'url'>>({});

  // Valeurs actuelles
  const logoUrl = String(config.logoUrl || '');
  const logoSvgCode = String(config.logoSvgCode || '').trim();
  const hasLogo = Boolean(logoUrl && logoUrl.length > 0);
  const hasSvgLogo = Boolean(logoSvgCode.length > 0);
  // Use headerLogoAnimation specifically for the header, fallback to logoAnimation for backward compat
  const currentAnimation = String(config.headerLogoAnimation || config.logoAnimation || 'none');
  const currentFrameStyle = String(config.logoFrameStyle || 'Square');
  
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
  // APERÇU ANIMATION - Utilise AnimatedMedia pour preview réaliste
  // ============================================

  const LogoPreview = () => {
    // Préparer le fallback (initiales) si pas de logo
    const initialesFallback = (
      <div className="w-full h-full rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
        {String(config.initialesLogo || 'MS')}
      </div>
    );
    
    return (
      <div className="flex items-center justify-center p-8 bg-[#0a0a0f] rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          {/* Logo avec animation via AnimatedMedia - Preview réaliste */}
          <AnimatedMedia
            svgCode={hasSvgLogo ? logoSvgCode : undefined}
            imageUrl={hasLogo && !hasSvgLogo ? logoUrl : undefined}
            animationType={currentAnimation}
            size={currentAnimation === 'lightning-circle' ? 48 : 48}
            alt="Logo Preview"
            fallback={!hasLogo && !hasSvgLogo ? initialesFallback : undefined}
            primaryColor="rgba(34, 211, 238, 0.5)"
            accentColor="rgba(168, 139, 250, 0.5)"
          />
          
          {/* Nom du site */}
          <span className="text-white font-semibold text-lg">
            {String(config.nomSite || 'Mon Site')}
          </span>
        </div>
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
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Layout className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🎯 Header & Navigation</h2>
            <p className="text-slate-400">Logo, animation du logo et liens de navigation</p>
          </div>
        </div>
      </div>

      {/* Section Logo */}
      <AccordionSection id="logo" title="Logo du Header" emoji="🖼️">
        {/* Bandeau d'information sur le logo */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border mb-4 ${
          hasLogo 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          {hasLogo ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 font-medium">Logo principal défini</p>
                <p className="text-emerald-400/70 text-sm mt-1">
                  Le logo est affiché dans le Header. Vous pouvez personnaliser son animation ci-dessous.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium">Aucun logo défini</p>
                <p className="text-amber-400/70 text-sm mt-1">
                  Sans logo, les <strong>initiales</strong> seront affichées avec un cadre animé.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderImageUploader('logoUrl', 'Logo principal', 'logos', 'PNG, SVG, WebP recommandé')}
          {renderImageUploader('logoDarkUrl', 'Logo mode sombre', 'logos', 'Version claire pour footer sombre')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {renderTextInput('initialesLogo', 'Initiales (fallback)', 'MS', 'Utilisées si pas de logo')}
          {renderTextInput('nomSite', 'Nom du site', 'Mon Entreprise', 'Affiché à côté du logo')}
        </div>

        {/* Code SVG du Logo */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
            <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div className="text-violet-300 text-sm">
              <p className="font-medium mb-1">Code SVG du Logo (Optionnel)</p>
              <p className="text-violet-400/80">
                Si rempli, ce code SVG <strong>remplace</strong> l&apos;image URL du logo dans le Header.
              </p>
            </div>
          </div>

          <LocalTextarea
            value={String(config.logoSvgCode ?? '')}
            onChange={createUpdateHandler('logoSvgCode')}
            label="Code SVG du Logo"
            placeholder="<svg viewBox='0 0 100 100'>...</svg>"
            hint="Collez le code SVG complet. Ce champ est partagé avec le Hero et Footer."
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

      {/* Section Animation Logo */}
      <AccordionSection id="animation" title="Animation du Logo" emoji="⚡">
        <p className="text-slate-400 text-sm mb-4">
          Choisissez l&apos;effet d&apos;animation appliqué au logo dans le header. L&apos;effet <strong className="text-cyan-400">Electric ⚡</strong> ajoute des éclairs lumineux autour du logo.
        </p>

        {/* Sélecteur d'animation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {LOGO_ANIMATIONS.map((anim) => {
            const isSelected = currentAnimation === anim.id;
            const Icon = anim.icon;
            
            return (
              <button
               type="button"
                key={anim.id}
                onClick={() => onConfigUpdate('headerLogoAnimation', anim.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? (anim.id === 'electric' || anim.id === 'lightning-circle')
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'bg-violet-500/20 border-violet-400 text-violet-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected && (anim.id === 'electric' || anim.id === 'lightning-circle') ? 'text-cyan-400' : ''}`} />
                <span className="text-sm font-medium">{anim.label}</span>
                <span className="text-xs opacity-70">{anim.description}</span>
              </button>
            );
          })}
        </div>

        {/* Taille du Logo */}
        <div className="mb-6">
          <label className="text-white font-medium text-sm mb-3 block">
            📏 Taille du Logo: <span className="text-cyan-400">{Number(config.headerLogoSize) || 40}px</span>
          </label>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs">20px</span>
            <input
              type="range"
              min={20}
              max={500}
              step={5}
              value={Number(config.headerLogoSize) || 40}
              onChange={(e) => onConfigUpdate('headerLogoSize', Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-slate-500 text-xs">500px</span>
          </div>
          <p className="text-slate-500 text-xs mt-2">Ajustez la taille du logo dans le header (largeur en pixels)</p>
        </div>

        {/* Style du cadre (pour initiales) */}
        {!hasLogo && (
          <div className="mb-6">
            <label className="text-white font-medium text-sm mb-3 block">Style du cadre (initiales)</label>
            <div className="flex gap-2 flex-wrap">
              {LOGO_FRAME_STYLES.map((style) => (
                <button
                 type="button"
                  key={style.id}
                  onClick={() => onConfigUpdate('logoFrameStyle', style.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    currentFrameStyle === style.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>{style.emoji}</span>
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu en direct */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Aperçu en direct</label>
          <LogoPreview />
        </div>

        {/* Info effet Electric */}
        {currentAnimation === 'electric' && (
          <div className="flex items-start gap-3 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mt-4">
            <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-cyan-300 font-medium">Effet Electric activé ⚡</p>
              <p className="text-cyan-400/70 text-sm mt-1">
                Cet effet ajoute un flickering électrique subtil au logo pour un style high-tech.
              </p>
            </div>
          </div>
        )}
        
        {/* Info effet Lightning Storm */}
        {currentAnimation === 'lightning-circle' && (
          <div className="flex items-start gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mt-4">
            <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-violet-300 font-medium">⚡ Tempête Électrique activée 🌩️</p>
              <p className="text-violet-400/70 text-sm mt-1">
                Votre logo est entouré d&apos;une <strong>tempête magnétique chaotique</strong> : éclairs SVG rayonnants, cercles rotatifs pulsants.
                L&apos;effet signature &quot;Electric&quot;, pour un rendu futuriste explosif.
              </p>
            </div>
          </div>
        )}
      </AccordionSection>

      {/* Section Navigation */}
      <AccordionSection id="navigation" title="Liens de Navigation" emoji="🔗">
        <p className="text-slate-400 text-sm mb-4">
          Les liens de navigation sont générés automatiquement selon les sections activées sur votre site.
          Vous pouvez personnaliser le CTA principal ici.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('ctaPrincipal', 'Texte CTA principal', 'Demander un devis', 'Bouton principal du header')}
          {renderTextInput('ctaPrincipalUrl', 'Lien CTA', '#contact', 'URL ou ancre (#contact)')}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('ctaSecondaire', 'Texte CTA secondaire', 'Réserver un appel')}
          {renderTextInput('lienBoutonAppel', 'Lien appel (Calendly)', 'https://calendly.com/...')}
        </div>
      </AccordionSection>

      {/* CSS personnalisé pour les animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(168, 139, 250, 0.5)); }
        }
        
        @keyframes electric-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 10px rgba(34, 211, 238, 0.5),
              0 0 20px rgba(34, 211, 238, 0.3),
              0 0 30px rgba(168, 139, 250, 0.2);
          }
          50% { 
            box-shadow: 
              0 0 20px rgba(168, 139, 250, 0.6),
              0 0 40px rgba(34, 211, 238, 0.4),
              0 0 60px rgba(168, 139, 250, 0.3);
          }
        }
        
        @keyframes lightning-ring {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-electric {
          animation: electric-pulse 1.5s ease-in-out infinite;
          border-radius: 12px;
        }
        
        .animate-electric-border {
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), transparent);
          animation: electric-pulse 1.5s ease-in-out infinite;
        }
        
        .animate-lightning-ring {
          animation: lightning-ring 2s ease-in-out infinite;
        }
        
        .animate-lightning-ring-delayed {
          animation: lightning-ring 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-lightning-circle {
          position: relative;
        }
        
        .animate-lightning-circle::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent,
            rgba(34, 211, 238, 0.5),
            transparent,
            rgba(168, 139, 250, 0.5),
            transparent
          );
          animation: spin-slow 3s linear infinite;
          filter: blur(4px);
        }
      `}</style>
    </motion.div>
  );
}

