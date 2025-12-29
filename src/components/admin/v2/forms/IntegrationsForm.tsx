'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Webhook, Settings, ChevronDown,
  Activity, Eye, MousePointer, TrendingUp,
  Send, Database, CreditCard, Mail as MailIcon
} from 'lucide-react';
import { LocalInput } from '@/components/admin/ui/LocalInput';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface IntegrationsFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

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
  color = 'from-emerald-500/20 to-teal-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-emerald-400`}>
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
// INTEGRATION CARD
// ============================================

interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  isActive: boolean;
  children: React.ReactNode;
  color?: string;
}

function IntegrationCard({ icon, name, description, isActive, children, color = 'from-slate-600/20 to-slate-500/20' }: IntegrationCardProps) {
  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      isActive 
        ? 'border-emerald-500/50 bg-emerald-500/5' 
        : 'border-white/5 bg-slate-900/30'
    }`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium">{name}</h4>
            {isActive && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                Actif
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ============================================
// INTEGRATIONS FORM COMPONENT
// ============================================

function IntegrationsFormComponent({ config, onUpdate }: IntegrationsFormProps) {
  // ========== HANDLERS ==========
  const updateIntegrations = useCallback((key: string, value: string | null) => {
    onUpdate({
      integrations: {
        ...config.integrations,
        [key]: value || null,
      },
    });
  }, [config.integrations, onUpdate]);

  const updateContact = useCallback((key: string, value: string | null) => {
    onUpdate({
      contact: {
        ...config.contact,
        [key]: value || null,
      },
    });
  }, [config.contact, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== ANALYTICS ========== */}
      <CollapsibleSection 
        title="Analytics & Tracking" 
        icon={<BarChart3 className="w-5 h-5" />}
        color="from-blue-500/20 to-indigo-500/20"
      >
        {/* Umami */}
        <IntegrationCard
          icon={<Activity className="w-5 h-5" />}
          name="Umami Analytics"
          description="Analytics open-source respectueux de la vie privée"
          isActive={!!config.integrations.umamiSiteId}
          color="from-purple-500/20 to-violet-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocalInput
              label="Site ID"
              value={config.integrations.umamiSiteId || ''}
              onChange={(v) => updateIntegrations('umamiSiteId', v)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <LocalInput
              label="URL du script"
              value={config.integrations.umamiScriptUrl || ''}
              onChange={(v) => updateIntegrations('umamiScriptUrl', v)}
              placeholder="https://analytics.example.com/script.js"
              type="url"
            />
          </div>
        </IntegrationCard>

        {/* Google Analytics */}
        <IntegrationCard
          icon={<TrendingUp className="w-5 h-5" />}
          name="Google Analytics 4"
          description="Analytics de Google (GA4)"
          isActive={!!config.integrations.gaMeasurementId}
          color="from-orange-500/20 to-amber-500/20"
        >
          <LocalInput
            label="Measurement ID"
            value={config.integrations.gaMeasurementId || ''}
            onChange={(v) => updateIntegrations('gaMeasurementId', v)}
            placeholder="G-XXXXXXXXXX"
          />
        </IntegrationCard>

        {/* GTM */}
        <IntegrationCard
          icon={<Settings className="w-5 h-5" />}
          name="Google Tag Manager"
          description="Gestionnaire de tags Google"
          isActive={!!config.integrations.gtmContainerId}
          color="from-blue-500/20 to-cyan-500/20"
        >
          <LocalInput
            label="Container ID"
            value={config.integrations.gtmContainerId || ''}
            onChange={(v) => updateIntegrations('gtmContainerId', v)}
            placeholder="GTM-XXXXXXX"
          />
        </IntegrationCard>

        {/* Hotjar */}
        <IntegrationCard
          icon={<Eye className="w-5 h-5" />}
          name="Hotjar"
          description="Heatmaps et enregistrements de sessions"
          isActive={!!config.integrations.hotjarSiteId}
          color="from-red-500/20 to-orange-500/20"
        >
          <LocalInput
            label="Site ID"
            value={config.integrations.hotjarSiteId || ''}
            onChange={(v) => updateIntegrations('hotjarSiteId', v)}
            placeholder="1234567"
          />
        </IntegrationCard>

        {/* Facebook Pixel */}
        <IntegrationCard
          icon={<MousePointer className="w-5 h-5" />}
          name="Facebook Pixel"
          description="Tracking Meta/Facebook"
          isActive={!!config.integrations.facebookPixelId}
          color="from-blue-600/20 to-blue-500/20"
        >
          <LocalInput
            label="Pixel ID"
            value={config.integrations.facebookPixelId || ''}
            onChange={(v) => updateIntegrations('facebookPixelId', v)}
            placeholder="123456789012345"
          />
        </IntegrationCard>
      </CollapsibleSection>

      {/* ========== WEBHOOKS n8n ========== */}
      <CollapsibleSection 
        title="Webhooks n8n" 
        icon={<Webhook className="w-5 h-5" />}
        color="from-orange-500/20 to-red-500/20"
      >
        <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 mb-4">
          <p className="text-slate-400 text-sm">
            💡 Connectez vos workflows n8n pour automatiser le traitement des formulaires et notifications.
          </p>
        </div>

        <div className="space-y-4">
          <LocalInput
            label="Webhook Formulaire de Contact"
            value={config.integrations.n8nWebhookContact || ''}
            onChange={(v) => updateIntegrations('n8nWebhookContact', v)}
            placeholder="https://n8n.example.com/webhook/contact"
            type="url"
            hint="URL appelée lors de la soumission du formulaire de contact"
          />

          <LocalInput
            label="Webhook Newsletter"
            value={config.integrations.n8nWebhookNewsletter || ''}
            onChange={(v) => updateIntegrations('n8nWebhookNewsletter', v)}
            placeholder="https://n8n.example.com/webhook/newsletter"
            type="url"
            hint="URL appelée lors d'une inscription newsletter"
          />

          <LocalInput
            label="Webhook CRM (Leads)"
            value={config.contact.n8nWebhookUrl || ''}
            onChange={(v) => updateContact('n8nWebhookUrl', v)}
            placeholder="https://n8n.example.com/webhook/lead"
            type="url"
            hint="URL pour le traitement des leads (CRM Lite)"
          />
        </div>
      </CollapsibleSection>

      {/* ========== SERVICES TIERS ========== */}
      <CollapsibleSection 
        title="Services tiers" 
        icon={<Database className="w-5 h-5" />}
        defaultOpen={false}
        color="from-violet-500/20 to-purple-500/20"
      >
        {/* Stripe */}
        <IntegrationCard
          icon={<CreditCard className="w-5 h-5" />}
          name="Stripe"
          description="Paiements en ligne"
          isActive={!!config.integrations.stripePublicKey}
          color="from-violet-500/20 to-indigo-500/20"
        >
          <LocalInput
            label="Clé publique"
            value={config.integrations.stripePublicKey || ''}
            onChange={(v) => updateIntegrations('stripePublicKey', v)}
            placeholder="pk_live_..."
            hint="Uniquement la clé publique (pk_), jamais la clé secrète"
          />
        </IntegrationCard>

        {/* Mailchimp */}
        <IntegrationCard
          icon={<MailIcon className="w-5 h-5" />}
          name="Mailchimp"
          description="Email marketing"
          isActive={!!config.integrations.mailchimpListId}
          color="from-yellow-500/20 to-amber-500/20"
        >
          <LocalInput
            label="List ID"
            value={config.integrations.mailchimpListId || ''}
            onChange={(v) => updateIntegrations('mailchimpListId', v)}
            placeholder="abc123def4"
          />
        </IntegrationCard>

        {/* SendGrid */}
        <IntegrationCard
          icon={<Send className="w-5 h-5" />}
          name="SendGrid"
          description="Envoi d'emails transactionnels"
          isActive={!!config.integrations.sendgridApiKey}
          color="from-blue-500/20 to-cyan-500/20"
        >
          <LocalInput
            label="API Key"
            value={config.integrations.sendgridApiKey || ''}
            onChange={(v) => updateIntegrations('sendgridApiKey', v)}
            placeholder="SG.xxxxx..."
          />
        </IntegrationCard>

        {/* Notion */}
        <IntegrationCard
          icon={<Database className="w-5 h-5" />}
          name="Notion"
          description="Base de données Notion"
          isActive={!!config.integrations.notionDatabaseId}
          color="from-slate-500/20 to-zinc-500/20"
        >
          <LocalInput
            label="Database ID"
            value={config.integrations.notionDatabaseId || ''}
            onChange={(v) => updateIntegrations('notionDatabaseId', v)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </IntegrationCard>

        {/* Airtable */}
        <IntegrationCard
          icon={<Database className="w-5 h-5" />}
          name="Airtable"
          description="Base de données Airtable"
          isActive={!!config.integrations.airtableBaseId}
          color="from-green-500/20 to-emerald-500/20"
        >
          <LocalInput
            label="Base ID"
            value={config.integrations.airtableBaseId || ''}
            onChange={(v) => updateIntegrations('airtableBaseId', v)}
            placeholder="appXXXXXXXXXXXXXX"
          />
        </IntegrationCard>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const IntegrationsForm = memo(IntegrationsFormComponent);

