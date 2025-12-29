'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Brain, Settings, ChevronDown, 
  Zap, MessageSquare,
  Thermometer, Hash, Building2
} from 'lucide-react';
import { LocalInput, LocalTextarea, LocalSlider } from '@/components/admin/ui/LocalInput';
import type { GlobalConfig } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface AIConfigFormProps {
  config: GlobalConfig;
  onUpdate: (updates: Partial<GlobalConfig>) => void;
}

// ============================================
// OPTIONS
// ============================================

const AI_MODE_OPTIONS = [
  { value: 'Disabled', label: 'Désactivé', emoji: '⏹️', description: 'IA désactivée' },
  { value: 'Placeholder', label: 'Placeholder', emoji: '🔄', description: 'Messages pré-définis' },
  { value: 'Live', label: 'Live', emoji: '🟢', description: 'IA en temps réel' },
];

const AI_PROVIDER_OPTIONS = [
  { value: 'OpenAI', label: 'OpenAI', emoji: '🤖', description: 'GPT-4, GPT-3.5' },
  { value: 'Anthropic', label: 'Anthropic', emoji: '🧠', description: 'Claude' },
  { value: 'n8n', label: 'n8n Webhook', emoji: '🔗', description: 'Via workflow' },
  { value: 'Custom', label: 'Custom', emoji: '⚙️', description: 'API personnalisée' },
];

const AI_TONE_OPTIONS = [
  { value: 'Professional', label: 'Professionnel' },
  { value: 'Friendly', label: 'Amical' },
  { value: 'Casual', label: 'Décontracté' },
  { value: 'Formal', label: 'Formel' },
];

const AI_INDUSTRY_OPTIONS = [
  { value: 'Tech', label: 'Tech / IT' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Health', label: 'Santé' },
  { value: 'Retail', label: 'Commerce' },
  { value: 'Services', label: 'Services' },
  { value: 'Other', label: 'Autre' },
];

const AI_MODEL_OPTIONS = [
  { value: 'gpt-4o', label: 'GPT-4o (recommandé)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (économique)' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'custom', label: 'Modèle personnalisé' },
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
  color = 'from-violet-500/20 to-purple-500/20'
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
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-violet-400`}>
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
// AI CONFIG FORM COMPONENT
// ============================================

function AIConfigFormComponent({ config, onUpdate }: AIConfigFormProps) {
  // ========== HANDLERS ==========
  const updateAI = useCallback((key: string, value: unknown) => {
    onUpdate({
      ai: {
        ...config.ai,
        [key]: value,
      },
    });
  }, [config.ai, onUpdate]);

  const isAIEnabled = config.ai.aiMode !== 'Disabled';

  return (
    <div className="space-y-6">
      {/* ========== MODE & PROVIDER ========== */}
      <CollapsibleSection 
        title="Configuration IA" 
        icon={<Bot className="w-5 h-5" />}
        badge={isAIEnabled ? 'Actif' : 'Inactif'}
        color="from-violet-500/20 to-purple-500/20"
      >
        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm">Mode IA</label>
          <div className="grid grid-cols-3 gap-3">
            {AI_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateAI('aiMode', opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  config.ai.aiMode === opt.value
                    ? 'border-violet-500 bg-violet-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-2xl block mb-2">{opt.emoji}</span>
                <span className={`font-medium text-sm block ${
                  config.ai.aiMode === opt.value ? 'text-violet-400' : 'text-white'
                }`}>
                  {opt.label}
                </span>
                <span className="text-slate-500 text-xs">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {isAIEnabled && (
          <>
            {/* Provider Selection */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-white font-medium text-sm">Fournisseur IA</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AI_PROVIDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateAI('aiProvider', opt.value)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      config.ai.aiProvider === opt.value
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="block text-lg mb-1">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            {config.ai.aiProvider !== 'n8n' && (
              <div className="space-y-1 pt-4 border-t border-white/5">
                <label className="text-white font-medium text-sm">Modèle</label>
                <select
                  value={config.ai.aiModel}
                  onChange={(e) => updateAI('aiModel', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                >
                  {AI_MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </CollapsibleSection>

      {/* ========== CREDENTIALS ========== */}
      {isAIEnabled && (
        <CollapsibleSection 
          title="Clés & Webhooks" 
          icon={<Zap className="w-5 h-5" />}
          color="from-amber-500/20 to-orange-500/20"
        >
          {config.ai.aiProvider !== 'n8n' && (
            <LocalInput
              label="Clé API"
              value={config.ai.aiApiKey || ''}
              onChange={(v) => updateAI('aiApiKey', v || null)}
              placeholder={config.ai.aiProvider === 'OpenAI' ? 'sk-...' : 'sk-ant-...'}
              hint="Stockée de manière sécurisée, jamais exposée côté client"
            />
          )}

          <LocalInput
            label="Webhook IA (n8n)"
            value={config.ai.aiWebhookUrl || ''}
            onChange={(v) => updateAI('aiWebhookUrl', v || null)}
            placeholder="https://n8n.example.com/webhook/ai-chat"
            type="url"
            hint="URL du webhook n8n pour traiter les requêtes IA"
          />

          <LocalInput
            label="Webhook Génération d'images"
            value={config.ai.aiImageWebhook || ''}
            onChange={(v) => updateAI('aiImageWebhook', v || null)}
            placeholder="https://n8n.example.com/webhook/ai-image"
            type="url"
            hint="Pour la génération d'images via IA (optionnel)"
          />
        </CollapsibleSection>
      )}

      {/* ========== SYSTEM PROMPT ========== */}
      {isAIEnabled && (
        <CollapsibleSection 
          title="Comportement de l'IA" 
          icon={<Brain className="w-5 h-5" />}
          color="from-pink-500/20 to-rose-500/20"
        >
          <LocalTextarea
            label="System Prompt"
            value={config.ai.aiSystemPrompt || ''}
            onChange={(v) => updateAI('aiSystemPrompt', v || null)}
            placeholder="Tu es un assistant virtuel pour [Nom de l'entreprise]. Tu aides les visiteurs à..."
            rows={6}
            hint="Instructions données à l'IA pour définir son comportement et sa personnalité"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            {/* Tone */}
            <div className="space-y-1">
              <label className="text-white font-medium text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Ton
              </label>
              <select
                value={config.ai.aiTone}
                onChange={(e) => updateAI('aiTone', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
              >
                {AI_TONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div className="space-y-1">
              <label className="text-white font-medium text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                Secteur d&apos;activité
              </label>
              <select
                value={config.ai.aiIndustry}
                onChange={(e) => updateAI('aiIndustry', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
              >
                {AI_INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <LocalInput
            label="Audience cible"
            value={config.ai.aiTargetAudience || ''}
            onChange={(v) => updateAI('aiTargetAudience', v || null)}
            placeholder="PME, startups, entrepreneurs..."
            hint="Aide l'IA à adapter ses réponses"
          />

          <LocalInput
            label="Mots-clés métier"
            value={config.ai.aiKeywords || ''}
            onChange={(v) => updateAI('aiKeywords', v || null)}
            placeholder="automation, n8n, développement web, IA..."
            hint="Termes importants pour votre activité (séparés par des virgules)"
          />
        </CollapsibleSection>
      )}

      {/* ========== PARAMETERS ========== */}
      {isAIEnabled && (
        <CollapsibleSection 
          title="Paramètres avancés" 
          icon={<Settings className="w-5 h-5" />}
          defaultOpen={false}
          color="from-slate-500/20 to-zinc-500/20"
        >
          <div className="space-y-6">
            {/* Temperature */}
            <div className="space-y-2">
              <label className="text-white font-medium text-sm flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-slate-400" />
                Température (créativité)
              </label>
              <LocalSlider
                label=""
                value={config.ai.aiTemperature}
                onChange={(v) => updateAI('aiTemperature', v)}
                min={0}
                max={2}
                step={0.1}
              />
              <p className="text-slate-500 text-xs">
                0 = Réponses très factuelles • 1 = Équilibré • 2 = Très créatif
              </p>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <label className="text-white font-medium text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-400" />
                Max Tokens
              </label>
              <LocalSlider
                label=""
                value={config.ai.aiMaxTokens}
                onChange={(v) => updateAI('aiMaxTokens', v)}
                min={100}
                max={4000}
                step={100}
              />
              <p className="text-slate-500 text-xs">
                Limite la longueur des réponses (1 token ≈ 4 caractères)
              </p>
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const AIConfigForm = memo(AIConfigFormComponent);

