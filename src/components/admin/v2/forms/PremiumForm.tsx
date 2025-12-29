'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Shield, Code, Globe, ChevronDown,
  Calendar, Zap, Lock, Settings, AlertTriangle
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface PremiumFormProps {
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
  color = 'from-amber-500/20 to-yellow-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-amber-400`}>
            {icon}
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
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
// PREMIUM FORM COMPONENT
// ============================================

function PremiumFormComponent({ config, onUpdate }: PremiumFormProps) {
  // ========== HANDLERS ==========
  const updatePremium = useCallback((key: string, value: unknown) => {
    onUpdate({
      premium: {
        ...config.premium,
        [key]: value,
      },
    });
  }, [config.premium, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== MAINTENANCE MODE ========== */}
      <CollapsibleSection 
        title="Mode Maintenance" 
        icon={<AlertTriangle className="w-5 h-5" />}
        badge={config.premium.maintenanceMode ? '⚠️ ACTIF' : undefined}
        color="from-red-500/20 to-orange-500/20"
      >
        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
          config.premium.maintenanceMode 
            ? 'bg-red-500/10 border-red-500/50' 
            : 'bg-slate-900/50 border-white/5'
        }`}>
          <div>
            <h4 className="text-white font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Mode maintenance
            </h4>
            <p className="text-slate-500 text-sm">
              Affiche une page &quot;Coming Soon&quot; aux visiteurs (les admins voient le site normalement)
            </p>
          </div>
          <button
            type="button"
            onClick={() => updatePremium('maintenanceMode', !config.premium.maintenanceMode)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.premium.maintenanceMode 
                ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              config.premium.maintenanceMode ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {config.premium.maintenanceMode && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Le site est actuellement en maintenance. Seuls les administrateurs connectés peuvent le voir.
            </p>
          </div>
        )}
      </CollapsibleSection>

      {/* ========== PREMIUM STATUS ========== */}
      <CollapsibleSection 
        title="Statut Premium" 
        icon={<Crown className="w-5 h-5" />}
        badge={config.premium.isPremium ? '👑 PREMIUM' : undefined}
        color="from-amber-500/20 to-yellow-500/20"
      >
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
          <div>
            <h4 className="text-white font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Compte Premium
            </h4>
            <p className="text-slate-500 text-sm">
              Active les fonctionnalités avancées
            </p>
          </div>
          <button
            type="button"
            onClick={() => updatePremium('isPremium', !config.premium.isPremium)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.premium.isPremium 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              config.premium.isPremium ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {config.premium.isPremium && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <label className="text-white font-medium text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Date d&apos;expiration
              </label>
              <input
                type="datetime-local"
                value={config.premium.premiumUntil?.slice(0, 16) || ''}
                onChange={(e) => updatePremium('premiumUntil', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-white font-medium text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                Rate Limit API
              </label>
              <input
                type="number"
                value={config.premium.rateLimitApi}
                onChange={(e) => updatePremium('rateLimitApi', parseInt(e.target.value) || 1000)}
                min={100}
                max={100000}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <p className="text-slate-500 text-xs">Requêtes par heure</p>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* ========== CUSTOM DOMAIN ========== */}
      <CollapsibleSection 
        title="Domaine personnalisé" 
        icon={<Globe className="w-5 h-5" />}
        color="from-blue-500/20 to-indigo-500/20"
      >
        <LocalInput
          label="Domaine personnalisé"
          value={config.premium.customDomain || ''}
          onChange={(v) => updatePremium('customDomain', v || null)}
          placeholder="www.monsite.ch"
          hint="Domaine personnalisé pour ce site (sans https://)"
        />

        <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
          <p className="text-slate-400 text-sm">
            💡 Pour configurer un domaine personnalisé, vous devez ajouter un enregistrement CNAME 
            pointant vers votre instance et configurer le SSL.
          </p>
        </div>
      </CollapsibleSection>

      {/* ========== CUSTOM CODE ========== */}
      <CollapsibleSection 
        title="Code personnalisé" 
        icon={<Code className="w-5 h-5" />}
        defaultOpen={false}
        color="from-emerald-500/20 to-teal-500/20"
      >
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
          <p className="text-amber-400 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            Attention : Le code personnalisé est injecté directement dans le site. 
            Assurez-vous de sa sécurité.
          </p>
        </div>

        <LocalTextarea
          label="CSS personnalisé"
          value={config.premium.customCss || ''}
          onChange={(v) => updatePremium('customCss', v || null)}
          placeholder={`/* Vos styles CSS personnalisés */
.mon-element {
  color: red;
}`}
          rows={8}
          monospace
          hint="Injecté dans <head> avec une balise <style>"
        />

        <LocalTextarea
          label="JavaScript personnalisé"
          value={config.premium.customJs || ''}
          onChange={(v) => updatePremium('customJs', v || null)}
          placeholder={`// Votre code JavaScript
console.log('Hello World');`}
          rows={8}
          monospace
          hint="Injecté à la fin de <body>"
        />
      </CollapsibleSection>

      {/* ========== FEATURE FLAGS ========== */}
      <CollapsibleSection 
        title="Feature Flags" 
        icon={<Zap className="w-5 h-5" />}
        defaultOpen={false}
        color="from-violet-500/20 to-purple-500/20"
      >
        <LocalInput
          label="Feature Flags"
          value={(config.premium.featureFlags || []).join(', ')}
          onChange={(v) => updatePremium('featureFlags', v ? v.split(',').map(s => s.trim()).filter(Boolean) : [])}
          placeholder="beta, ai-chat, new-gallery"
          hint="Fonctionnalités expérimentales activées (séparées par des virgules)"
        />

        <div className="flex flex-wrap gap-2 pt-2">
          {(config.premium.featureFlags || []).map((flag: string) => (
            <span 
              key={flag} 
              className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm"
            >
              {flag}
            </span>
          ))}
          {(config.premium.featureFlags || []).length === 0 && (
            <span className="text-slate-500 text-sm">Aucun flag actif</span>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const PremiumForm = memo(PremiumFormComponent);
