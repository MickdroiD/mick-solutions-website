'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu, ChevronDown, Link as LinkIcon, Type,
  Image as ImageIcon, MousePointer, ExternalLink, Sparkles
} from 'lucide-react';
import { LocalInput } from '@/components/admin/ui/LocalInput';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import { SectionEffects, type EffectSettings } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText, type TextSettings } from '@/components/admin/v2/ui/SectionText';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface HeaderFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

interface MenuLinkItem extends ListItem {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
}

// ============================================
// OPTIONS
// ============================================

// Note: Les variantes sont gérées dans la section Branding

const LOGO_ANIMATION_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'spin', label: 'Rotation' },
  { value: 'bounce', label: 'Rebond' },
  { value: 'electric', label: 'Électrique' },
  { value: 'lightning-circle', label: 'Éclair' },
];

const LOGO_SIZE_PRESETS = [
  { value: 32, label: 'S' },
  { value: 40, label: 'M' },
  { value: 48, label: 'L' },
  { value: 56, label: 'XL' },
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
  color = 'from-blue-500/20 to-indigo-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-blue-400`}>
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
// HEADER FORM COMPONENT
// ============================================

function HeaderFormComponent({ config, onUpdate }: HeaderFormProps) {
  // State for menu links (stored in a dedicated place)
  const [menuLinks, setMenuLinks] = useState<MenuLinkItem[]>(() => {
    // Try to get from config or use defaults
    const stored = (config as unknown as { header?: { menuLinks?: MenuLinkItem[] } })?.header?.menuLinks;
    return stored || [
      { id: 'nav_1', label: 'Accueil', url: '/', isExternal: false },
      { id: 'nav_2', label: 'Services', url: '#services', isExternal: false },
      { id: 'nav_3', label: 'Portfolio', url: '#portfolio', isExternal: false },
      { id: 'nav_4', label: 'Contact', url: '#contact', isExternal: false },
    ];
  });

  // ========== HANDLERS ==========
  const updateAssets = useCallback((key: string, value: unknown) => {
    onUpdate({
      assets: {
        ...config.assets,
        [key]: value,
      },
    });
  }, [config.assets, onUpdate]);

  const updateBranding = useCallback((key: string, value: unknown) => {
    onUpdate({
      branding: {
        ...config.branding,
        [key]: value,
      },
    });
  }, [config.branding, onUpdate]);

  const updateIdentity = useCallback((key: string, value: unknown) => {
    onUpdate({
      identity: {
        ...config.identity,
        [key]: value,
      },
    });
  }, [config.identity, onUpdate]);

  // Note: updateAnimations can be added later if needed for header-specific animations
  // const updateAnimations = useCallback((key: string, value: unknown) => {
  //   onUpdate({ animations: { ...config.animations, [key]: value } });
  // }, [config.animations, onUpdate]);

  // Handle menu links change (store in a custom location)
  const handleMenuLinksChange = useCallback((newLinks: MenuLinkItem[]) => {
    setMenuLinks(newLinks);
    // Store in config.header.menuLinks (extend the config)
    onUpdate({
      // @ts-expect-error - extending config with header
      header: {
        menuLinks: newLinks,
      },
    });
  }, [onUpdate]);

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

  // Get header logo size from branding config
  const headerLogoSize = config.branding.headerLogoSize ?? 40;
  const headerLogoAnimation = config.branding.headerLogoAnimation || 'none';

  return (
    <div className="space-y-6">
      {/* ========== LOGO ========== */}
      <CollapsibleSection
        title="Logo"
        icon={<ImageIcon className="w-5 h-5" />}
        color="from-violet-500/20 to-purple-500/20"
      >
        {/* 🆕 Logo dédié header (optionnel, sinon utilise le logo principal) */}
        <LocalImageInput
          label="Logo header (dédié)"
          value={config.branding.headerLogoUrl || ''}
          onChange={(v) => updateBranding('headerLogoUrl', v || null)}
          hint="Logo spécifique au header (laissez vide pour utiliser le logo principal)"
          category="branding"
          fieldKey="headerLogoUrl"
          aspectRatio="free"
          showMagicBadge
        />

        <LocalImageInput
          label="Logo principal (fallback)"
          value={config.assets.logoUrl || ''}
          onChange={(v) => updateAssets('logoUrl', v || null)}
          hint="Logo utilisé si aucun logo header dédié n'est défini"
          category="branding"
          fieldKey="logoUrl"
          aspectRatio="free"
        />

        {/* Logo Size */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Taille du logo</label>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {LOGO_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateBranding('headerLogoSize', preset.value)}
                  className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all ${headerLogoSize === preset.value
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={headerLogoSize}
              onChange={(e) => updateBranding('headerLogoSize', parseInt(e.target.value) || 40)}
              className="w-20 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              min={24}
              max={80}
            />
            <span className="text-slate-500 text-sm">px</span>
          </div>
        </div>

        {/* Logo Animation */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Animation du logo
          </label>
          <div className="flex flex-wrap gap-2">
            {LOGO_ANIMATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateBranding('headerLogoAnimation', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${headerLogoAnimation === opt.value
                  ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                  : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ========== TEXTES & STYLE ========== */}
      <CollapsibleSection
        title="Textes & Style"
        icon={<Type className="w-5 h-5" />}
        color="from-cyan-500/20 to-blue-500/20"
      >
        {/* Nom du site */}
        <LocalInput
          label="Nom du site"
          value={config.identity.nomSite}
          onChange={(v) => updateIdentity('nomSite', v)}
          placeholder="Mon Site"
          hint="Affiché dans le header à côté du logo"
        />

        {/* Initiales du logo (pour AnimatedLogoFrame) */}
        <LocalInput
          label="Initiales du logo"
          value={config.identity.initialesLogo || ''}
          onChange={(v) => updateIdentity('initialesLogo', v || null)}
          placeholder="MS"
          hint="2-3 lettres affichées dans le cadre animé (laissez vide pour auto)"
        />

        {/* Slogan (optionnel) */}
        <LocalInput
          label="Slogan (optionnel)"
          value={config.identity.slogan || ''}
          onChange={(v) => updateIdentity('slogan', v || null)}
          placeholder="Votre slogan ici..."
          hint="Peut être affiché selon la variante de header"
        />

        {/* Couleurs du header */}
        <div className="pt-4 border-t border-white/5 space-y-4">
          <h4 className="text-white font-medium text-sm">Couleurs du header</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Background Color */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Fond du header</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.branding.headerBgColor || '#0a0a0f'}
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
                  value={config.branding.headerTextColor || '#ffffff'}
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
                  value={config.branding.headerBorderColor || '#ffffff'}
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
        </div>
      </CollapsibleSection>

      {/* ========== MENU LINKS ========== */}
      <CollapsibleSection
        title="Liens du menu"
        icon={<Menu className="w-5 h-5" />}
        badge={`${menuLinks.length}`}
        color="from-blue-500/20 to-cyan-500/20"
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
        title="Bouton d'action (CTA)"
        icon={<MousePointer className="w-5 h-5" />}
        color="from-emerald-500/20 to-teal-500/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Texte du bouton"
            value={(config as unknown as { header?: { ctaText?: string } })?.header?.ctaText || 'Contact'}
            onChange={(v) => onUpdate({
              // @ts-expect-error - extending config
              header: { ctaText: v },
            })}
            placeholder="Ex: Contactez-nous"
          />

          <LocalInput
            label="Lien du bouton"
            value={(config as unknown as { header?: { ctaUrl?: string } })?.header?.ctaUrl || '#contact'}
            onChange={(v) => onUpdate({
              // @ts-expect-error - extending config
              header: { ctaUrl: v },
            })}
            placeholder="Ex: #contact ou /contact"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onUpdate({
              // @ts-expect-error - extending config
              header: {
                showCta: !(config as unknown as { header?: { showCta?: boolean } })?.header?.showCta,
              },
            })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm transition-all ${(config as unknown as { header?: { showCta?: boolean } })?.header?.showCta !== false
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
              : 'border-white/10 text-slate-400'
              }`}
          >
            Afficher le CTA dans le header
          </button>
        </div>
      </CollapsibleSection>

      {/* ========== EFFETS & ANIMATIONS ========== */}
      <SectionEffects
        effects={(config.branding.headerEffects || {}) as EffectSettings}
        onChange={(updates) => updateBranding('headerEffects', { ...(config.branding.headerEffects || {}), ...updates })}
        showLogoOptions={true}
        showBackgroundOptions={true}
      />

      {/* ========== TYPOGRAPHIE ========== */}
      <SectionText
        text={(config.branding.headerTextSettings || {}) as TextSettings}
        onChange={(updates) => updateBranding('headerTextSettings', { ...(config.branding.headerTextSettings || {}), ...updates })}
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

