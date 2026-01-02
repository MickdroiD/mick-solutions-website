'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Menu, MousePointer, Palette, ChevronDown, LinkIcon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlobalConfig } from '@/lib/schemas/factory';
import { LocalInput } from '@/components/admin/ui/LocalInput';
import { ListEditor } from '@/components/admin/v2/ui/ListEditor';
import { SectionEffects } from '@/components/admin/v2/ui/SectionEffects';
import { SectionText } from '@/components/admin/v2/ui/SectionText';

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

interface MenuLinkItem {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  [key: string]: unknown;
}

function HeaderFormComponent({
  config,
  onUpdate
}: {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}) {
  // Parse existing menu links or default
  const [menuLinks, setMenuLinks] = useState<MenuLinkItem[]>([]);

  // Safe Access to Branding
  const branding = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (config.branding || {}) as Record<string, any>;
  }, [config.branding]);

  const identity = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (config.identity || {}) as Record<string, any>;
  }, [config.identity]);

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
    // Default fallback
    setMenuLinks([
      { id: '1', label: 'Avantages', url: '#avantages' },
      { id: '2', label: 'Services', url: '#services' },
      { id: '3', label: 'Portfolio', url: '#portfolio' },
      { id: '4', label: 'Contact', url: '#contact' },
    ]);
  }, [branding.headerMenuLinks]);

  // Helpers to update branding config
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

  // Get header logo size from branding config
  const headerLogoSize = (branding.headerLogoSize as number) || 40;

  // Resolve Values from Branding (New Schema)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacyConfig = config as unknown as Record<string, any>;
  const ctaText = branding.headerCtaText || branding.headerCtaText === '' ? branding.headerCtaText : ((legacyConfig.ctaPrincipal as string) || 'Contact');
  const ctaUrl = branding.headerCtaUrl || branding.headerCtaUrl === '' ? branding.headerCtaUrl : '#contact';
  const showCta = branding.showHeaderCta !== false;
  const showTopBar = branding.showTopBar !== false;

  return (
    <div className="space-y-4">

      {/* ========== LOGO & STYLE ========== */}
      <CollapsibleSection
        title="Logo & Identité Header"
        icon={<Palette className="w-5 h-5" />}
        defaultOpen={false}
      >
        {/* Style du Header - Top Bar Toggle */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
          <h4 className="text-white font-medium text-sm mb-4">Structure</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-white text-sm font-medium">Barre d&apos;informations (Top Bar)</span>
              <p className="text-slate-400 text-xs">Affiche email, téléphone et adresse tout en haut</p>
            </div>
            <button
              onClick={() => updateBranding('showTopBar', !showTopBar)}
              className={`w-12 h-6 rounded-full transition-colors relative ${showTopBar ? 'bg-primary-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showTopBar ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <LocalInput
          label="URL du Logo Header (Optionnel)"
          value={(branding.headerLogoUrl as string) || ''}
          onChange={(v) => updateBranding('headerLogoUrl', v || null)}
          placeholder="https://..."
          hint="Laissez vide pour utiliser le logo principal"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <label className="text-slate-400 text-xs">Taille du logo (px)</label>
            <input
              type="number"
              min="20"
              max="200"
              value={headerLogoSize}
              onChange={(e) => updateBranding('headerLogoSize', parseInt(e.target.value))}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Initiales du logo (pour AnimatedLogoFrame) */}
        <LocalInput
          label="Initiales du logo"
          value={(identity.initialesLogo as string) || ''}
          onChange={(v) => updateIdentity('initialesLogo', v || null)}
          placeholder="MS"
          hint="2-3 lettres affichées dans le cadre animé (laissez vide pour auto)"
        />

        {/* Slogan (optionnel) */}
        <LocalInput
          label="Slogan (optionnel)"
          value={(identity.slogan as string) || ''}
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
        </div>
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
        title="Bouton d'action (CTA)"
        icon={<MousePointer className="w-5 h-5" />}
        color="from-emerald-500/20 to-teal-500/20"
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Texte du bouton"
            value={ctaText as string}
            onChange={(v) => updateBranding('headerCtaText', v)}
            placeholder="Ex: Contactez-nous"
          />

          <LocalInput
            label="Lien du bouton"
            value={ctaUrl as string}
            onChange={(v) => updateBranding('headerCtaUrl', v)}
            placeholder="Ex: #contact ou /contact"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-white text-sm font-medium">Afficher le bouton dans le header</span>
            <button
              onClick={() => updateBranding('showHeaderCta', !showCta)}
              className={`w-12 h-6 rounded-full transition-colors relative ${showCta ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showCta ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* ========== EFFETS & ANIMATIONS ========== */}
      <SectionEffects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        effects={(branding.headerEffects || {}) as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(updates) => updateBranding('headerEffects', { ...(branding.headerEffects || {}), ...updates } as any)}
        showLogoOptions={true}
        showBackgroundOptions={true}
      />

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
