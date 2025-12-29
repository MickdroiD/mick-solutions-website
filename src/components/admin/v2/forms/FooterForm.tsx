'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Type, Palette, ChevronDown, Link as LinkIcon,
  Linkedin, Instagram, Twitter, Youtube, Github, 
  MessageCircle, Calendar, Mail, Phone, MapPin, Sparkles
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface FooterFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

interface FooterLinkItem extends ListItem {
  id: string;
  label: string;
  url: string;
  column?: number;
}

// ============================================
// OPTIONS
// ============================================

const FOOTER_VARIANT_OPTIONS = [
  { value: 'Minimal', label: 'Minimal', emoji: '🎯', description: 'Simple et léger' },
  { value: 'Corporate', label: 'Corporate', emoji: '🏢', description: 'Multi-colonnes' },
  { value: 'Electric', label: 'Électrique', emoji: '⚡', description: 'Style Mick Solutions' },
  { value: 'Bold', label: 'Bold', emoji: '💪', description: 'Impact visuel fort' },
];

const LOGO_ANIMATION_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'spin', label: 'Rotation' },
  { value: 'bounce', label: 'Rebond' },
  { value: 'electric', label: 'Électrique' },
];

const SOCIAL_LINKS = [
  { key: 'lienLinkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-600/20 to-blue-500/20', textColor: 'text-blue-400' },
  { key: 'lienInstagram', label: 'Instagram', icon: Instagram, color: 'from-pink-600/20 to-purple-500/20', textColor: 'text-pink-400' },
  { key: 'lienTwitter', label: 'Twitter / X', icon: Twitter, color: 'from-sky-600/20 to-sky-500/20', textColor: 'text-sky-400' },
  { key: 'lienYoutube', label: 'YouTube', icon: Youtube, color: 'from-red-600/20 to-red-500/20', textColor: 'text-red-400' },
  { key: 'lienGithub', label: 'GitHub', icon: Github, color: 'from-slate-600/20 to-slate-500/20', textColor: 'text-slate-400' },
  { key: 'lienWhatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'from-green-600/20 to-green-500/20', textColor: 'text-green-400' },
  { key: 'lienCalendly', label: 'Calendly', icon: Calendar, color: 'from-indigo-600/20 to-indigo-500/20', textColor: 'text-indigo-400' },
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
  defaultOpen = true, 
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
// FOOTER FORM COMPONENT
// ============================================

function FooterFormComponent({ config, onUpdate }: FooterFormProps) {
  // State for footer links
  const [footerLinks, setFooterLinks] = useState<FooterLinkItem[]>(() => {
    const stored = (config as unknown as { footerData?: { links?: FooterLinkItem[] } })?.footerData?.links;
    return stored || [];
  });

  // ========== HANDLERS ==========
  const updateFooter = useCallback((key: string, value: unknown) => {
    onUpdate({
      footer: {
        ...config.footer,
        [key]: value,
      },
    });
  }, [config.footer, onUpdate]);

  const updateContact = useCallback((key: string, value: unknown) => {
    onUpdate({
      contact: {
        ...config.contact,
        [key]: value,
      },
    });
  }, [config.contact, onUpdate]);

  const updateAssets = useCallback((key: string, value: unknown) => {
    onUpdate({
      assets: {
        ...config.assets,
        [key]: value,
      },
    });
  }, [config.assets, onUpdate]);

  // Handle footer links change
  const handleFooterLinksChange = useCallback((newLinks: FooterLinkItem[]) => {
    setFooterLinks(newLinks);
    onUpdate({
      // @ts-expect-error - extending config
      footerData: { links: newLinks },
    });
  }, [onUpdate]);

  const createFooterLink = useCallback((): FooterLinkItem => ({
    id: `footer_${Date.now()}`,
    label: 'Nouveau lien',
    url: '#',
    column: 1,
  }), []);

  // ========== RENDER FOOTER LINK ==========
  const renderFooterLink = useCallback((item: FooterLinkItem) => {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600/20 to-zinc-600/20 flex items-center justify-center text-slate-400">
          <LinkIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{item.label}</p>
          <p className="text-slate-500 text-sm truncate">{item.url}</p>
        </div>
        {item.column && (
          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
            Col. {item.column}
          </span>
        )}
      </div>
    );
  }, []);

  // ========== RENDER FOOTER LINK FORM ==========
  const renderFooterLinkForm = useCallback((
    item: FooterLinkItem,
    _index: number,
    onChange: (item: FooterLinkItem) => void
  ) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LocalInput
            label="Libellé"
            value={item.label}
            onChange={(v) => onChange({ ...item, label: v })}
            placeholder="Ex: Mentions légales"
          />

          <LocalInput
            label="URL"
            value={item.url}
            onChange={(v) => onChange({ ...item, url: v })}
            placeholder="Ex: /legal/mentions"
          />

          <div className="space-y-1">
            <label className="text-white font-medium text-sm">Colonne</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => onChange({ ...item, column: col })}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    item.column === col
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* ========== COPYRIGHT & TEXT ========== */}
      <CollapsibleSection 
        title="Textes du footer" 
        icon={<Type className="w-5 h-5" />}
        color="from-slate-500/20 to-zinc-500/20"
      >
        <LocalInput
          label="Texte de copyright"
          value={config.footer.copyrightTexte}
          onChange={(v) => updateFooter('copyrightTexte', v)}
          placeholder="© 2024 Mon Site. Tous droits réservés."
        />

        <LocalInput
          label="Pays d'hébergement"
          value={config.footer.paysHebergement}
          onChange={(v) => updateFooter('paysHebergement', v)}
          placeholder="Hébergé en Suisse 🇨🇭"
        />

        <LocalTextarea
          label="Texte personnalisé (optionnel)"
          value={config.footer.customFooterText || ''}
          onChange={(v) => updateFooter('customFooterText', v || null)}
          placeholder="Un message ou slogan à afficher dans le footer..."
          rows={2}
        />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => updateFooter('showLegalLinks', !config.footer.showLegalLinks)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm transition-all ${
              config.footer.showLegalLinks
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : 'border-white/10 text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            Afficher les liens légaux
          </button>
        </div>
      </CollapsibleSection>

      {/* ========== CONTACT INFO ========== */}
      <CollapsibleSection 
        title="Informations de contact" 
        icon={<Mail className="w-5 h-5" />}
        color="from-blue-500/20 to-indigo-500/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-white font-medium text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Email
            </label>
            <input
              type="email"
              value={config.contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white font-medium text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              Téléphone
            </label>
            <input
              type="tel"
              value={config.contact.telephone || ''}
              onChange={(e) => updateContact('telephone', e.target.value || null)}
              placeholder="+41 79 123 45 67"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-white font-medium text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            Adresse
          </label>
          <input
            type="text"
            value={config.contact.adresse}
            onChange={(e) => updateContact('adresse', e.target.value)}
            placeholder="123 Rue Example, 1000 Ville, Suisse"
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </CollapsibleSection>

      {/* ========== SOCIAL LINKS ========== */}
      <CollapsibleSection 
        title="Réseaux sociaux" 
        icon={<Linkedin className="w-5 h-5" />}
        color="from-blue-600/20 to-indigo-600/20"
      >
        <div className="space-y-3">
          {SOCIAL_LINKS.map((social) => {
            const Icon = social.icon;
            const value = config.contact[social.key as keyof typeof config.contact] as string | null;
            
            return (
              <div key={social.key} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center ${social.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={value || ''}
                  onChange={(e) => updateContact(social.key, e.target.value || null)}
                  placeholder={`URL ${social.label}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                {value && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                    Actif
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* ========== FOOTER LINKS ========== */}
      <CollapsibleSection 
        title="Liens du footer" 
        icon={<LinkIcon className="w-5 h-5" />}
        badge={`${footerLinks.length}`}
        color="from-slate-600/20 to-zinc-600/20"
        defaultOpen={false}
      >
        <ListEditor<FooterLinkItem>
          items={footerLinks}
          onChange={handleFooterLinksChange}
          renderItem={renderFooterLink}
          renderForm={renderFooterLinkForm}
          createItem={createFooterLink}
          label="Liens"
          addItemLabel="Ajouter un lien"
          emptyMessage="Aucun lien personnalisé"
          emptyIcon={<LinkIcon className="w-10 h-10 mx-auto opacity-30" />}
        />
      </CollapsibleSection>

      {/* ========== CTA FOOTER ========== */}
      <CollapsibleSection 
        title="Appel à l'action (CTA)" 
        icon={<Sparkles className="w-5 h-5" />}
        color="from-violet-500/20 to-purple-500/20"
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocalInput
            label="Texte du CTA"
            value={config.footer.footerCtaText || ''}
            onChange={(v) => updateFooter('footerCtaText', v || null)}
            placeholder="Ex: Démarrer un projet"
          />

          <LocalInput
            label="URL du CTA"
            value={config.footer.footerCtaUrl || ''}
            onChange={(v) => updateFooter('footerCtaUrl', v || null)}
            placeholder="Ex: #contact"
          />
        </div>
      </CollapsibleSection>

      {/* ========== FOOTER LOGO ========== */}
      <CollapsibleSection 
        title="Logo du footer" 
        icon={<Sparkles className="w-5 h-5" />}
        color="from-amber-500/20 to-orange-500/20"
        defaultOpen={false}
      >
        <LocalImageInput
          label="Logo footer (optionnel)"
          value={config.assets.logoDarkUrl || config.assets.logoUrl || ''}
          onChange={(v) => updateAssets('logoDarkUrl', v || null)}
          hint="Logo affiché dans le footer (peut être différent du header)"
          category="branding"
          fieldKey="footerLogo"
          aspectRatio="free"
        />

        {/* Logo Size */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Taille du logo</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={24}
              max={80}
              value={config.footer.footerLogoSize}
              onChange={(e) => updateFooter('footerLogoSize', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-cyan-400 font-medium w-12 text-right">
              {config.footer.footerLogoSize}px
            </span>
          </div>
        </div>

        {/* Logo Animation */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-white font-medium text-sm">Animation du logo</label>
          <div className="flex flex-wrap gap-2">
            {LOGO_ANIMATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFooter('footerLogoAnimation', opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  config.footer.footerLogoAnimation === opt.value
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ========== STYLE ========== */}
      <CollapsibleSection 
        title="Style du footer" 
        icon={<Palette className="w-5 h-5" />}
        defaultOpen={false}
        color="from-cyan-500/20 to-blue-500/20"
      >
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Variante du footer</label>
          <div className="grid grid-cols-2 gap-3">
            {FOOTER_VARIANT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFooter('footerVariant', opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  config.footer.footerVariant === opt.value
                    ? 'border-cyan-500 bg-cyan-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-2xl block mb-2">{opt.emoji}</span>
                <span className={`font-medium text-sm block ${
                  config.footer.footerVariant === opt.value ? 'text-cyan-400' : 'text-white'
                }`}>
                  {opt.label}
                </span>
                <span className="text-slate-500 text-xs">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const FooterForm = memo(FooterFormComponent);

