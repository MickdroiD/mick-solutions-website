'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  Menu, MousePointer, Palette, ChevronDown, LinkIcon, ExternalLink,
  Sparkles, Layout, Zap, Image as ImageIcon, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlobalConfig } from '@/lib/schemas/factory';
import { LocalInput } from '@/components/admin/ui/LocalInput';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor } from '@/components/admin/v2/ui/ListEditor';
import { SectionText } from '@/components/admin/v2/ui/SectionText';

// ============================================
// CONSTANTS - Logo & Effects Options
// ============================================

const LOGO_ANIMATIONS = [
  { id: 'none', label: 'Aucune', emoji: '⭕', description: 'Logo statique' },
  { id: 'spin', label: 'Spin', emoji: '🔄', description: 'Rotation rapide' },
  { id: 'rotation', label: 'Rotation', emoji: '🔄', description: 'Rotation lente continue' },
  { id: 'pulse', label: 'Pulsation', emoji: '💓', description: 'Effet de pulsation' },
  { id: 'bounce', label: 'Rebond', emoji: '📳', description: 'Effet de rebond' },
  { id: 'electric', label: 'Electric ⚡', emoji: '⚡', description: 'Effet flicker électrique', highlight: true },
  { id: 'lightning-circle', label: 'Storm ⚡🎯', emoji: '🌩️', description: 'Tempête électrique', highlight: true },
  { id: 'tech_hud', label: 'Tech HUD 🎯', emoji: '🔧', description: 'Interface cyberpunk', highlight: true },
  { id: 'float', label: 'Flottement', emoji: '🎈', description: 'Mouvement léger' },
];

const DIRECT_EFFECTS = [
  { value: 'none', label: 'Aucun', emoji: '⭕' },
  { value: 'float', label: 'Flottement', emoji: '🎈' },
  { value: 'swing', label: 'Balancement', emoji: '↔️' },
  { value: 'pulse', label: 'Pulsation', emoji: '💓' },
  { value: 'bounce', label: 'Rebond', emoji: '🏀' },
  { value: 'spin', label: 'Rotation', emoji: '🌀' },
];

const INDIRECT_EFFECTS = [
  { value: 'none', label: 'Aucun', emoji: '⭕' },
  { value: 'neon-outline', label: 'Contour néon', emoji: '💫' },
  { value: 'particle-orbit', label: 'Particules', emoji: '🌌' },
  { value: 'ripple', label: 'Ondes', emoji: '〰️' },
  { value: 'aura-glow', label: 'Halo', emoji: '✨' },
  { value: 'scan-line', label: 'Scan line', emoji: '📡' },
];

const FRAME_SHAPES = [
  { value: 'none', label: 'Aucun', emoji: '⭕' },
  { value: 'square', label: 'Carré', emoji: '⬜' },
  { value: 'rounded-square', label: 'Arrondi', emoji: '▢' },
  { value: 'rounded', label: 'Très arrondi', emoji: '🔲' },
  { value: 'circle', label: 'Cercle', emoji: '🔵' },
  { value: 'pill', label: 'Pilule', emoji: '💊' },
];

const FRAME_ANIMATIONS = [
  { value: 'none', label: 'Aucune', emoji: '⏸️' },
  { value: 'color-flow', label: 'Flux couleur', emoji: '🌊' },
  { value: 'glow-pulse', label: 'Pulsation', emoji: '💓' },
  { value: 'spin-border', label: 'Bordure tournante', emoji: '🔄' },
  { value: 'neon-sign', label: 'Enseigne néon', emoji: '💡' },
];

const FRAME_COLORS = [
  { value: 'cyan', label: 'Cyan', color: '#22d3ee' },
  { value: 'purple', label: 'Violet', color: '#a78bfa' },
  { value: 'pink', label: 'Rose', color: '#f472b6' },
  { value: 'emerald', label: 'Émeraude', color: '#34d399' },
  { value: 'amber', label: 'Ambre', color: '#fbbf24' },
  { value: 'red', label: 'Rouge', color: '#ef4444' },
  { value: 'blue', label: 'Bleu', color: '#3b82f6' },
  { value: 'white', label: 'Blanc', color: '#ffffff' },
];

const ANIMATION_SPEEDS = [
  { value: 'slow', label: 'Lent', emoji: '🐢' },
  { value: 'normal', label: 'Normal', emoji: '🚶' },
  { value: 'fast', label: 'Rapide', emoji: '🚀' },
];

const ANIMATION_INTENSITIES = [
  { value: 'subtle', label: 'Subtil', emoji: '🌙' },
  { value: 'normal', label: 'Normal', emoji: '☀️' },
  { value: 'strong', label: 'Fort', emoji: '🔥' },
  { value: 'intense', label: 'Intense', emoji: '💥' },
];

const COLOR_PRESETS = [
  { value: 'cyan', label: 'Cyan', color: '#22d3ee' },
  { value: 'purple', label: 'Violet', color: '#a78bfa' },
  { value: 'pink', label: 'Rose', color: '#f472b6' },
  { value: 'emerald', label: 'Émeraude', color: '#34d399' },
  { value: 'amber', label: 'Ambre', color: '#fbbf24' },
  { value: 'red', label: 'Rouge', color: '#ef4444' },
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
  color = 'from-slate-500/20 to-zinc-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-slate-400`}>
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
// SUB-SECTION
// ============================================

function SubSection({
  title,
  icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 pt-2 space-y-4 border-t border-white/5 bg-slate-900/30">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// TYPES
// ============================================

interface MenuLinkItem {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  [key: string]: unknown;
}

// ============================================
// MAIN COMPONENT
// ============================================

function HeaderFormComponent({
  config,
  onUpdate
}: {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}) {
  // Parse existing menu links or default
  const [menuLinks, setMenuLinks] = useState<MenuLinkItem[]>([]);

  // Safe Access to Branding & Identity
  const branding = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (config.branding || {}) as Record<string, any>;
  }, [config.branding]);

  const identity = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (config.identity || {}) as Record<string, any>;
  }, [config.identity]);

  const assets = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (config.assets || {}) as Record<string, any>;
  }, [config.assets]);

  const contact = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (config.contact || {}) as Record<string, any>;
  }, [config.contact]);

  // Header effects settings
  const headerEffects = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (branding.headerEffects || {}) as Record<string, any>;
  }, [branding.headerEffects]);

  useEffect(() => {
    if (branding.headerMenuLinks) {
      try {
        const parsed = JSON.parse(branding.headerMenuLinks);
        if (Array.isArray(parsed)) {
          setMenuLinks(parsed);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse menu links', e);
      }
    }
    // 🚫 Pas de liens par défaut - l'admin doit tout configurer
    setMenuLinks([]);
  }, [branding.headerMenuLinks]);

  // Helpers to update config
  const updateBranding = useCallback((key: string, value: unknown) => {
    onUpdate({
      branding: {
        ...branding,
        [key]: value,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }, [branding, onUpdate]);

  const updateIdentity = useCallback((key: string, value: unknown) => {
    onUpdate({
      identity: {
        ...identity,
        [key]: value,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }, [identity, onUpdate]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateAssets = useCallback((key: string, value: unknown) => {
    onUpdate({
      assets: {
        ...assets,
        [key]: value,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }, [assets, onUpdate]);

  const updateContact = useCallback((key: string, value: unknown) => {
    onUpdate({
      contact: {
        ...contact,
        [key]: value,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }, [contact, onUpdate]);

  const updateHeaderEffects = useCallback((key: string, value: unknown) => {
    onUpdate({
      branding: {
        ...branding,
        headerEffects: {
          ...headerEffects,
          [key]: value,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  }, [branding, headerEffects, onUpdate]);

  // Handle menu links change
  const handleMenuLinksChange = useCallback((newLinks: MenuLinkItem[]) => {
    setMenuLinks(newLinks);
    // Store as JSON string in branding config
    updateBranding('headerMenuLinks', JSON.stringify(newLinks));
  }, [updateBranding]);

  const createMenuLink = useCallback((): MenuLinkItem => ({
    id: `nav_${Date.now()}`,
    label: 'Nouveau lien',
    url: '#',
    isExternal: false,
  }), []);

  // ========== MENU LINK RENDER ==========
  const renderMenuLink = useCallback((item: MenuLinkItem) => {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400">
          {item.isExternal ? <ExternalLink className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{item.label}</p>
          <p className="text-slate-500 text-sm truncate">{item.url}</p>
        </div>
        {item.isExternal && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
            Externe
          </span>
        )}
      </div>
    );
  }, []);

  // ========== MENU LINK FORM ==========
  const renderMenuLinkForm = useCallback((
    item: MenuLinkItem,
    _index: number,
    onChange: (item: MenuLinkItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Libellé"
            value={item.label}
            onChange={(v) => onChange({ ...item, label: v })}
            placeholder="Ex: À propos"
          />

          <LocalInput
            label="URL / Ancre"
            value={item.url}
            onChange={(v) => onChange({ ...item, url: v })}
            placeholder="Ex: #about ou /page"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...item, isExternal: !item.isExternal })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm transition-all ${item.isExternal
              ? 'border-amber-500 bg-amber-500/20 text-amber-400'
              : 'border-white/10 text-slate-400 hover:border-white/20'
              }`}
          >
            <ExternalLink className="w-4 h-4" />
            Lien externe (nouvel onglet)
          </button>
        </div>
      </div>
    );
  }, []);

  // Get values from branding config
  const headerLogoSize = (branding.headerLogoSize as number) || 40;
  // 🚫 Pas de fallbacks hardcodés - tout doit être configuré depuis l'admin
  const ctaText = (branding.headerCtaText as string) || '';
  const ctaUrl = (branding.headerCtaUrl as string) || '';
  const showCta = branding.showHeaderCta !== false;
  
  // Bouton d'appel secondaire (depuis Contact)
  const callButtonText = (contact.texteBoutonAppel as string) || '';
  const callButtonUrl = (contact.lienBoutonAppel as string) || '';
  const showTopBar = branding.showTopBar !== false;

  // Logo URL: priorité au logo header spécifique, sinon logo principal
  const headerLogoUrl = (branding.headerLogoUrl as string) || '';
  const mainLogoUrl = (assets.logoUrl as string) || '';
  const effectiveLogoUrl = headerLogoUrl || mainLogoUrl;

  return (
    <div className="space-y-4">

      {/* ========== LOGO, IMAGE & EFFETS (FUSIONNÉ) ========== */}
      <CollapsibleSection
        title="Logo, Image & Effets"
        icon={<ImageIcon className="w-5 h-5" />}
        defaultOpen={true}
        color="from-cyan-500/20 to-violet-500/20"
      >
        {/* Logo Header */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium">Logo du Header</h4>
                <p className="text-slate-400 text-sm">
                  {headerLogoUrl 
                    ? "Un logo spécifique est défini pour le header." 
                    : "Le logo principal sera utilisé. Vous pouvez définir un logo différent pour le header ci-dessous."}
                </p>
              </div>
            </div>
            
            {/* Aperçu du logo actuel */}
            {effectiveLogoUrl && (
              <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg mb-4">
                <div 
                  className="bg-slate-800 rounded-lg p-2 flex items-center justify-center"
                  style={{ width: headerLogoSize + 20, height: headerLogoSize + 20 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={effectiveLogoUrl} 
                    alt="Logo actuel" 
                    className="object-contain"
                    style={{ maxWidth: headerLogoSize, maxHeight: headerLogoSize }}
                  />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Logo actuellement affiché</p>
                  <p className="text-white text-sm font-medium">
                    {headerLogoUrl ? 'Logo Header personnalisé' : 'Logo Principal'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Logo Header (optionnel) */}
          <LocalImageInput
            label="Logo Header personnalisé (optionnel)"
            value={headerLogoUrl}
            onChange={(v) => updateBranding('headerLogoUrl', v || null)}
            hint="Laissez vide pour utiliser le logo principal. Formats: PNG, SVG, WebP"
            category="logos"
            fieldKey="headerLogoUrl"
            aspectRatio="square"
          />

          {/* Taille du logo */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">
              Taille du logo: {headerLogoSize}px
            </label>
            <input
              type="range"
              min="20"
              max="200"
              value={headerLogoSize}
              onChange={(e) => updateBranding('headerLogoSize', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Petit (20px)</span>
              <span>Grand (200px)</span>
            </div>
          </div>

          {/* Initiales du logo (fallback) */}
          <LocalInput
            label="Initiales du logo"
            value={(identity.initialesLogo as string) || ''}
            onChange={(v) => updateIdentity('initialesLogo', v || null)}
            placeholder="MS"
            hint="2-3 lettres affichées si aucun logo n'est défini"
          />
        </div>

        {/* ========== ANIMATIONS DU LOGO ========== */}
        <SubSection title="Animation du Logo" icon={<Sparkles className="w-4 h-4" />} defaultOpen={false}>
          <p className="text-slate-400 text-xs mb-4">
            Choisissez l&apos;effet d&apos;animation appliqué au logo dans le header.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {LOGO_ANIMATIONS.map((anim) => {
              // 🔧 FIX: Lire depuis branding.headerLogoAnimation (pas headerEffects)
              const isSelected = branding.headerLogoAnimation === anim.id;
              return (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => updateBranding('headerLogoAnimation', anim.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? anim.highlight
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'bg-violet-500/20 border-violet-400 text-violet-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-lg">{anim.emoji}</span>
                  <span className="text-xs font-medium text-center">{anim.label}</span>
                </button>
              );
            })}
          </div>

          {/* Info effet Electric */}
          {branding.headerLogoAnimation === 'electric' && (
            <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mt-4">
              <span className="text-cyan-400">⚡</span>
              <div>
                <p className="text-cyan-300 font-medium text-sm">Effet Electric activé</p>
                <p className="text-cyan-400/70 text-xs mt-1">
                  Effet flickering électrique subtil pour un style high-tech.
                </p>
              </div>
            </div>
          )}
        </SubSection>

        {/* ========== EFFETS DIRECTS & INDIRECTS ========== */}
        <SubSection title="Effets Logo/Image avancés" icon={<Zap className="w-4 h-4" />} defaultOpen={false}>
          {/* Effet Direct */}
          <div>
            <label className="text-white font-medium text-sm mb-3 block">Effet Direct</label>
            <div className="grid grid-cols-3 gap-2">
              {DIRECT_EFFECTS.map((effect) => (
                <button
                  key={effect.value}
                  type="button"
                  onClick={() => updateHeaderEffects('logoDirectEffect', effect.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${headerEffects.logoDirectEffect === effect.value
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <span className="block text-base mb-1">{effect.emoji}</span>
                  {effect.label}
                </button>
              ))}
            </div>
          </div>

          {/* Effet Indirect */}
          <div>
            <label className="text-white font-medium text-sm mb-2 block">Effet Indirect (Glow)</label>
            <p className="text-slate-500 text-xs mb-3">
              💡 Ces effets s&apos;appliquent autour du logo (auras, néons).
            </p>
            <div className="grid grid-cols-3 gap-2">
              {INDIRECT_EFFECTS.map((effect) => (
                <button
                  key={effect.value}
                  type="button"
                  onClick={() => updateHeaderEffects('logoIndirectEffect', effect.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${headerEffects.logoIndirectEffect === effect.value
                      ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <span className="block text-base mb-1">{effect.emoji}</span>
                  {effect.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cadre du Logo */}
          <div>
            <label className="text-white text-sm mb-2 block">Forme du Cadre</label>
            <div className="grid grid-cols-6 gap-1">
              {FRAME_SHAPES.map((shape) => (
                <button
                  key={shape.value}
                  type="button"
                  onClick={() => updateHeaderEffects('logoFrameShape', shape.value)}
                  className={`px-2 py-2 rounded-lg border text-xs transition-all flex flex-col items-center ${headerEffects.logoFrameShape === shape.value
                      ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <span className="text-base">{shape.emoji}</span>
                  <span className="text-[10px] mt-1">{shape.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options cadre si activé */}
          {headerEffects.logoFrameShape && headerEffects.logoFrameShape !== 'none' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Couleur du Cadre</label>
                  <div className="grid grid-cols-4 gap-1">
                    {FRAME_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateHeaderEffects('logoFrameColor', color.value)}
                        className={`px-2 py-2 rounded-lg border text-xs transition-all flex flex-col items-center gap-1 ${headerEffects.logoFrameColor === color.value
                            ? 'border-cyan-500 bg-cyan-500/20'
                            : 'border-white/10 hover:border-white/20'
                          }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-[10px] text-slate-400">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Épaisseur: {headerEffects.logoFrameThickness || 2}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={headerEffects.logoFrameThickness || 2}
                    onChange={(e) => updateHeaderEffects('logoFrameThickness', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Animation du Cadre</label>
                <div className="grid grid-cols-5 gap-1">
                  {FRAME_ANIMATIONS.map((anim) => (
                    <button
                      key={anim.value}
                      type="button"
                      onClick={() => updateHeaderEffects('logoFrameAnimation', anim.value)}
                      className={`px-2 py-2 rounded-lg border text-xs transition-all flex flex-col items-center ${headerEffects.logoFrameAnimation === anim.value
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <span className="text-base">{anim.emoji}</span>
                      <span className="text-[10px] mt-1">{anim.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </SubSection>

        {/* ========== VITESSE & INTENSITÉ ========== */}
        <SubSection title="Vitesse & Intensité" icon={<Eye className="w-4 h-4" />} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Vitesse animations</label>
              <div className="grid grid-cols-3 gap-2">
                {ANIMATION_SPEEDS.map((speed) => (
                  <button
                    key={speed.value}
                    type="button"
                    onClick={() => updateHeaderEffects('animationSpeed', speed.value)}
                    className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${headerEffects.animationSpeed === speed.value
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    <span className="block text-base mb-1">{speed.emoji}</span>
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Intensité</label>
              <div className="grid grid-cols-4 gap-1">
                {ANIMATION_INTENSITIES.map((intensity) => (
                  <button
                    key={intensity.value}
                    type="button"
                    onClick={() => updateHeaderEffects('animationIntensity', intensity.value)}
                    className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${headerEffects.animationIntensity === intensity.value
                        ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    {intensity.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-white font-medium text-sm mb-3 block">Couleur des Effets</label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateHeaderEffects('effectPrimaryColor', preset.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-xs transition-all flex items-center gap-2 ${headerEffects.effectPrimaryColor === preset.value
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </SubSection>

        {/* ========== COULEURS DU HEADER ========== */}
        <SubSection title="Couleurs du Header" icon={<Palette className="w-4 h-4" />} defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Background Color */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Fond du header</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(branding.headerBgColor as string) || '#0a0a0f'}
                  onChange={(e) => updateBranding('headerBgColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateBranding('headerBgColor', null)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg"
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Couleur du texte</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(branding.headerTextColor as string) || '#ffffff'}
                  onChange={(e) => updateBranding('headerTextColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateBranding('headerTextColor', null)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg"
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Border Color */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Bordure</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(branding.headerBorderColor as string) || '#ffffff'}
                  onChange={(e) => updateBranding('headerBorderColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateBranding('headerBorderColor', null)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg"
                >
                  Aucune
                </button>
              </div>
            </div>
          </div>
        </SubSection>
      </CollapsibleSection>

      {/* ========== STRUCTURE DU HEADER ========== */}
      <CollapsibleSection
        title="Structure du Header"
        icon={<Layout className="w-5 h-5" />}
        defaultOpen={false}
        color="from-blue-500/20 to-indigo-500/20"
      >
        {/* Top Bar Toggle */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-white text-sm font-medium">Barre d&apos;informations (Top Bar)</span>
              <p className="text-slate-400 text-xs">Affiche email, téléphone et adresse tout en haut</p>
            </div>
            <button
              onClick={() => {
                const current = branding.showTopBar !== false;
                updateBranding('showTopBar', !current);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${showTopBar ? 'bg-primary-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showTopBar ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Titre du site dans le header */}
        <LocalInput
          label="Titre du site (Header)"
          value={(branding.headerSiteTitle as string) || ''}
          onChange={(v) => updateBranding('headerSiteTitle', v || null)}
          placeholder={(identity.nomSite as string) || 'Mon Site'}
          hint="Laissez vide pour utiliser le nom du site global. Permet de personnaliser le texte affiché dans le header."
        />

      </CollapsibleSection>

      {/* ========== MENU LINKS ========== */}
      <CollapsibleSection
        title="Liens du menu"
        icon={<Menu className="w-5 h-5" />}
        badge={`${menuLinks.length}`}
        color="from-blue-500/20 to-cyan-500/20"
        defaultOpen={false}
      >
        <ListEditor<MenuLinkItem>
          items={menuLinks}
          onChange={handleMenuLinksChange}
          renderItem={renderMenuLink}
          renderForm={renderMenuLinkForm}
          createItem={createMenuLink}
          label="Liens"
          addItemLabel="Ajouter un lien"
          emptyMessage="Aucun lien"
          emptyIcon={<LinkIcon className="w-10 h-10 mx-auto opacity-30" />}
          maxItems={8}
        />
      </CollapsibleSection>

      {/* ========== CTA BUTTON ========== */}
      <CollapsibleSection
        title="Boutons d'action"
        icon={<MousePointer className="w-5 h-5" />}
        color="from-emerald-500/20 to-teal-500/20"
        defaultOpen={false}
      >
        {/* CTA Principal */}
        <SubSection title="CTA Principal" icon={<MousePointer className="w-4 h-4" />} defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocalInput
              label="Texte du bouton CTA"
              value={ctaText}
              onChange={(v) => updateBranding('headerCtaText', v || null)}
              placeholder="Ex: Contactez-nous"
              hint="Laissez vide pour masquer le CTA"
            />

            <LocalInput
              label="Lien du bouton CTA"
              value={ctaUrl}
              onChange={(v) => updateBranding('headerCtaUrl', v || null)}
              placeholder="Ex: #contact ou /contact"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-white text-sm font-medium">Afficher le CTA</span>
              <button
                type="button"
                onClick={() => updateBranding('showHeaderCta', !showCta)}
                className={`w-12 h-6 rounded-full transition-colors relative ${showCta ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showCta ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </SubSection>

        {/* Bouton d'appel secondaire */}
        <SubSection title="Bouton d'appel (secondaire)" icon={<ExternalLink className="w-4 h-4" />} defaultOpen={false}>
          <p className="text-slate-400 text-xs mb-4">
            Bouton secondaire pour réserver un appel. Les deux champs doivent être remplis pour afficher le bouton.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocalInput
              label="Texte du bouton"
              value={callButtonText}
              onChange={(v) => updateContact('texteBoutonAppel', v || null)}
              placeholder="Ex: Réserver un appel"
              hint="Laissez vide pour masquer"
            />

            <LocalInput
              label="Lien (Calendly, Cal.com...)"
              value={callButtonUrl}
              onChange={(v) => updateContact('lienBoutonAppel', v || null)}
              placeholder="Ex: https://calendly.com/..."
            />
          </div>
        </SubSection>
      </CollapsibleSection>

      {/* ========== TYPOGRAPHIE ========== */}
      <SectionText
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        text={(branding.headerTextSettings || {}) as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(updates) => updateBranding('headerTextSettings', { ...(branding.headerTextSettings || {}), ...updates } as any)}
        showTitleOptions={true}
        showSubtitleOptions={false}
        showBodyOptions={true}
      />
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const HeaderForm = memo(HeaderFormComponent);
