'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Rocket, Eye, EyeOff, Sparkles,
  Upload, Link2, Trash2, RefreshCw, Image as ImageIcon, Video, BarChart3,
  Grid3X3, Zap, RotateCw, Heart
} from 'lucide-react';
import GridBlockManager, { type GridBlock } from '../ui/GridBlockManager';
import { AccordionSection } from '../ui/AccordionSection';
import { LocalInput, LocalTextarea, LocalSlider } from '../ui/LocalInput';
// Note: AnimatedMedia retiré - aperçu déplacé vers Split View

// ============================================
// TYPES
// ============================================

interface HeroSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onConfigUpdateMultiple: (updates: Record<string, unknown>) => void;
  onImageUpload: (key: string, file: File, category: string) => void;
  onOpenAIModal: (context: { sectionKey: string; variantKey: string; showKey: string }) => void;
  uploading: string | null;
}

// ============================================
// VARIANTES HERO
// ============================================

const HERO_VARIANTS = [
  { id: 'Désactivé', label: 'Désactivé', emoji: '🚫', color: 'bg-slate-500/20 border-slate-500' },
  { id: 'Minimal', label: 'Minimal', emoji: '◽', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'Corporate', label: 'Corporate', emoji: '🏢', color: 'bg-emerald-500/20 border-emerald-500' },
  { id: 'Electric', label: 'Electric', emoji: '⚡', color: 'bg-yellow-500/20 border-yellow-500' },
  { id: 'Bold', label: 'Bold', emoji: '💪', color: 'bg-red-500/20 border-red-500' },
  { id: 'AI', label: 'AI', emoji: '🤖', color: 'bg-purple-500/20 border-purple-500' },
];

// ============================================
// HERO LOGO ANIMATION OPTIONS
// ============================================

// ============================================
// HERO LOGO ANIMATION OPTIONS - Valeurs EXACTES acceptées par Baserow
// ============================================
const HERO_LOGO_ANIMATIONS = [
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
    description: 'Effet de battement',
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
    highlight: true,
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
    id: 'shake', 
    label: 'Shake 📳', 
    emoji: '📳', 
    description: 'Secousse rapide',
    icon: Zap,
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
// COMPOSANT
// ============================================

export default function HeroSection({
  config,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options,
  onConfigUpdate,
  onConfigUpdateMultiple,
  onImageUpload,
  onOpenAIModal,
  uploading,
}: HeroSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionSection externe
  const [uploadMode, setUploadMode] = useState<Record<string, 'upload' | 'url'>>({});

  const isHeroActive = config.showHero === true;
  const currentVariant = String(config.heroVariant || 'Electric');

  // État pour les blocs de grille (stocké dans config.heroBlocks)
  const heroBlocks: GridBlock[] = useMemo(() => {
    return Array.isArray(config.heroBlocks) 
      ? config.heroBlocks as GridBlock[]
      : [];
  }, [config.heroBlocks]);

  // Handler pour mettre à jour les blocs
  const handleBlocksChange = useCallback((newBlocks: GridBlock[]) => {
    onConfigUpdate('heroBlocks', newBlocks);
  }, [onConfigUpdate]);

  // Handler pour upload d'image dans un bloc
  const handleBlockImageUpload = useCallback(async (blockId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'hero');

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const updatedBlocks = heroBlocks.map(block => 
          block.id === blockId ? { ...block, content: data.url } : block
        );
        onConfigUpdate('heroBlocks', updatedBlocks);
      }
    } catch (error) {
      console.error('[HeroSection] Upload error:', error);
    }
  }, [heroBlocks, onConfigUpdate]);

  // ============================================
  // RENDER HELPERS (Utilisant les composants LocalInput pour éviter re-renders)
  // ============================================

  // 🔒 REF pour stocker les handlers mémorisés par clé (évite re-création)
  const handlersRef = useRef<Record<string, (value: string) => void>>({});
  
  // Getter de handler stable - crée une fois et réutilise
  const getStableHandler = useCallback((key: string) => {
    if (!handlersRef.current[key]) {
      handlersRef.current[key] = (value: string) => onConfigUpdate(key, value);
    }
    return handlersRef.current[key];
  }, [onConfigUpdate]);

  // 🔒 Stocker les valeurs initiales pour éviter la resync pendant l'édition
  const initialValuesRef = useRef<Record<string, string>>({});
  
  const getStableValue = useCallback((key: string) => {
    const currentValue = String(config[key] ?? '');
    // Mémoriser la première valeur vue
    if (initialValuesRef.current[key] === undefined) {
      initialValuesRef.current[key] = currentValue;
    }
    return currentValue;
  }, [config]);

  const renderTextInput = (key: string, label: string, placeholder?: string, hint?: string) => (
    <LocalInput
      value={getStableValue(key)}
      onChange={getStableHandler(key)}
      label={label}
      placeholder={placeholder}
      hint={hint}
    />
  );

  const renderTextarea = (key: string, label: string, placeholder?: string, hint?: string) => (
    <LocalTextarea
      value={getStableValue(key)}
      onChange={getStableHandler(key)}
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
          {/* Bouton IA pour générer une image */}
          <button
            type="button" onClick={() => onOpenAIModal({ sectionKey: 'hero', variantKey: 'image', showKey: 'image' })}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30"
          >
            <Sparkles className="w-4 h-4 inline mr-1" /> IA
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
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                uploading === key ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/20 hover:border-cyan-500/50'
              }`}
            >
              {uploading === key ? (
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-slate-400 text-sm">Cliquez pour uploader</span>
                  <span className="text-slate-600 text-xs">Conversion auto WebP ✨</span>
                </>
              )}
            </label>
          </div>
        ) : (
          <LocalInput
            value={currentValue}
            onChange={getStableHandler(key)}
            label=""
            placeholder="https://..."
            type="url"
          />
        )}

        {currentValue && (
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <Image 
              src={currentValue} 
              alt="" 
              width={400} 
              height={200} 
              className="w-full h-40 object-cover" 
              unoptimized 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              type="button" onClick={() => onConfigUpdate(key, '')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <p className="absolute bottom-2 left-2 text-white/70 text-xs truncate max-w-[80%]">
              {currentValue.split('/').pop()}
            </p>
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
      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">🚀 Section Hero</h2>
              <p className="text-slate-400">Le premier élément que vos visiteurs voient</p>
            </div>
          </div>
          
          {/* Toggle Activer/Désactiver */}
          <div className="flex items-center gap-3">
            {isHeroActive ? (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" /> Activé
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-sm flex items-center gap-2">
                <EyeOff className="w-4 h-4" /> Désactivé
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sélecteur de variante */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Style de la section Hero
          </h3>
          <button
            type="button" onClick={() => onOpenAIModal({ sectionKey: 'hero', variantKey: 'heroVariant', showKey: 'showHero' })}
            className="px-4 py-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm font-medium hover:bg-violet-500/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Générer avec l&apos;IA
          </button>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {HERO_VARIANTS.map((variant) => {
            const isDisabled = variant.id === 'Désactivé';
            const isSelected = isDisabled
              ? !isHeroActive
              : isHeroActive && currentVariant === variant.id;

            return (
              <button
                type="button" key={variant.id}
                onClick={() => {
                  if (isDisabled) {
                    onConfigUpdate('showHero', false);
                  } else if (variant.id === 'AI') {
                    onOpenAIModal({ sectionKey: 'hero', variantKey: 'heroVariant', showKey: 'showHero' });
                  } else {
                    onConfigUpdateMultiple({ showHero: true, heroVariant: variant.id });
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${variant.color} text-white shadow-lg`
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-2xl mb-2">{variant.emoji}</span>
                <span className="text-xs font-medium">{variant.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu - Visible seulement si Hero est activé */}
      {isHeroActive && (
        <>
          {/* Hero Logo Configuration */}
          <AccordionSection id="heroLogo" title="Logo Central (Big Element)" emoji="⚡">
            <div className="flex items-start gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-4">
              <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-cyan-300 text-sm">
                <p className="font-medium mb-1">Le grand logo au centre du Hero</p>
                <p className="text-cyan-400/80">
                  Configurez l&apos;animation et la taille du logo principal affiché dans la section Hero.
                  Ceci est indépendant du logo dans le menu Header.
                </p>
              </div>
            </div>

            {/* Animation Selector */}
            <div className="mb-6">
              <label className="text-white font-medium text-sm mb-3 block">🎬 Animation du Logo Hero</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HERO_LOGO_ANIMATIONS.map((anim) => {
                  const isSelected = String(config.heroLogoAnimation || 'electric') === anim.id;
                  const Icon = anim.icon;
                  const isHighlight = 'highlight' in anim && anim.highlight;
                  
                  return (
                    <button
                      type="button"
                      key={anim.id}
                      onClick={() => onConfigUpdate('heroLogoAnimation', anim.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? isHighlight
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                            : 'bg-violet-500/20 border-violet-400 text-violet-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected && isHighlight ? 'text-cyan-400' : ''}`} />
                      <span className="text-sm font-medium">{anim.label}</span>
                      <span className="text-xs opacity-70">{anim.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Slider - Utilise LocalSlider pour éviter le spam API */}
            <div className="mb-6">
              <LocalSlider
                value={Number(config.heroLogoSize) || 280}
                onChange={(value) => onConfigUpdate('heroLogoSize', value)}
                label="📏 Taille du Logo Hero"
                min={100}
                max={600}
                step={10}
                hint="Ajustez la taille du logo central affiché dans la section Hero (valeur envoyée au relâchement)"
                unit="px"
              />
            </div>

            {/* Info pour Electric */}
            {String(config.heroLogoAnimation) === 'electric' && (
              <div className="flex items-start gap-3 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mt-4">
                <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-cyan-300 font-medium">Effet Electric activé ⚡</p>
                  <p className="text-cyan-400/70 text-sm mt-1">
                    Le logo central affichera un effet de flickering électrique subtil.
                  </p>
                </div>
              </div>
            )}
            
            {/* Info pour Lightning Storm */}
            {String(config.heroLogoAnimation) === 'lightning-circle' && (
              <div className="flex items-start gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mt-4">
                <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-violet-300 font-medium">⚡ Tempête Électrique activée 🌩️</p>
                  <p className="text-violet-400/70 text-sm mt-1">
                    Votre logo est entouré d&apos;une <strong>tempête magnétique chaotique</strong> : éclairs SVG rayonnants et cercles rotatifs pulsants.
                    L&apos;effet signature &quot;Electric&quot; pour un rendu futuriste explosif.
                  </p>
                </div>
              </div>
            )}
          </AccordionSection>

          {/* Contenu texte */}
          <AccordionSection id="content" title="Contenu texte" emoji="✏️">
            {renderTextInput('badgeHero', 'Badge', 'Nouveau!', 'Petit texte au-dessus du titre')}
            {renderTextarea('titreHero', 'Titre principal', 'Votre titre accrocheur', 'Le titre principal de votre Hero')}
            {renderTextarea('sousTitreHero', 'Sous-titre', 'Description courte...', 'Texte descriptif sous le titre')}
          </AccordionSection>

          {/* Code SVG du Logo */}
          <AccordionSection id="logoSvg" title="Code SVG du Logo (Avancé)" emoji="🎨">
            <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
              <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div className="text-violet-300 text-sm">
                <p className="font-medium mb-1">Logo SVG personnalisé (Optionnel)</p>
                <p className="text-violet-400/80">
                  Si rempli, ce code SVG <strong>remplace</strong> l&apos;image URL du logo. 
                  Collez directement le code SVG (ex: <code className="bg-slate-800 px-1 rounded">&lt;svg&gt;...&lt;/svg&gt;</code>).
                </p>
              </div>
            </div>

            {/* Champ textarea pour le SVG */}
            <LocalTextarea
              value={getStableValue('logoSvgCode')}
              onChange={getStableHandler('logoSvgCode')}
              label="Code SVG du Logo"
              placeholder="<svg viewBox='0 0 100 100'>...</svg>"
              hint="Collez le code SVG complet de votre logo. Il sera affiché à la place de l'image URL."
              rows={8}
              monospace
            />

            {/* Aperçu du SVG */}
            {String(config.logoSvgCode || '').trim() && (
              <div className="mt-4 space-y-2">
                <label className="text-white font-medium text-sm">Aperçu du SVG</label>
                <div className="flex items-center justify-center p-6 bg-[#0a0a0f] rounded-xl border border-white/10">
                  <div 
                    className="max-w-[200px] max-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: String(config.logoSvgCode) }}
                  />
                </div>
              </div>
            )}
          </AccordionSection>

          {/* Boutons CTA */}
          <AccordionSection id="cta" title="Boutons d'action (CTA)" emoji="🎯">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                <h4 className="text-cyan-400 font-medium text-sm">Bouton principal</h4>
                {renderTextInput('ctaPrincipal', 'Texte', 'Commencer')}
                {renderTextInput('ctaPrincipalUrl', 'Lien', '#contact')}
              </div>
              <div className="space-y-4 p-4 bg-slate-500/5 rounded-xl border border-white/10">
                <h4 className="text-slate-400 font-medium text-sm">Bouton secondaire</h4>
                {renderTextInput('ctaSecondaire', 'Texte', 'En savoir plus')}
                {renderTextInput('ctaSecondaireUrl', 'Lien', '#services')}
              </div>
            </div>
          </AccordionSection>

          {/* Médias */}
          <AccordionSection id="media" title="Image & Vidéo de fond" emoji="🎬">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium text-sm">Image de fond</span>
                </div>
                {renderImageUploader('heroBackgroundUrl', 'Image Hero', 'hero', 'Image d\'arrière-plan')}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-violet-400" />
                  <span className="text-white font-medium text-sm">Vidéo de fond</span>
                </div>
                {renderTextInput('heroVideoUrl', 'URL Vidéo', 'https://...', 'Lien vers une vidéo (YouTube, Vimeo...)')}
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 text-sm">Lecture automatique</span>
                  <button
                    type="button" onClick={() => onConfigUpdate('videoAutoplay', !config.videoAutoplay)}
                    className={`w-12 h-6 rounded-full transition-all ${config.videoAutoplay ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.videoAutoplay ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Statistiques de confiance */}
          <AccordionSection id="stats" title="Statistiques de confiance" emoji="📊">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium text-sm">Stat 1</span>
                </div>
                {renderTextInput('trustStat1Value', 'Valeur', '150+')}
                {renderTextInput('trustStat1Label', 'Label', 'Clients satisfaits')}
              </div>
              <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium text-sm">Stat 2</span>
                </div>
                {renderTextInput('trustStat2Value', 'Valeur', '98%')}
                {renderTextInput('trustStat2Label', 'Label', 'Taux satisfaction')}
              </div>
              <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <span className="text-white font-medium text-sm">Stat 3</span>
                </div>
                {renderTextInput('trustStat3Value', 'Valeur', '24h')}
                {renderTextInput('trustStat3Label', 'Label', 'Temps de réponse')}
              </div>
            </div>
          </AccordionSection>

          {/* Grille de blocs avancée */}
          <AccordionSection id="gridBlocks" title="Grille de blocs (Avancé)" emoji="⚡">
            <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
              <Grid3X3 className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div className="text-violet-300 text-sm">
                <p className="font-medium mb-1">Mode grille flexible</p>
                <p className="text-violet-400/80">
                  Construisez votre Hero avec des blocs personnalisables : images, logos, textes, formes 
                  avec animations (dont l&apos;effet &quot;Cercle Éclairs&quot;). Les blocs font 25%, 50% ou 100% de largeur.
                </p>
              </div>
            </div>
            
            <GridBlockManager
              blocks={heroBlocks}
              onChange={handleBlocksChange}
              onImageUpload={handleBlockImageUpload}
              maxBlocks={8}
            />
          </AccordionSection>
        </>
      )}
    </motion.div>
  );
}

