'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, MessageSquare, Palette,
  Mic, MicOff
} from 'lucide-react';
import { LocalInput } from '@/components/admin/ui/LocalInput';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import type { AIAssistantSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface AIAssistantFormProps {
  section: AIAssistantSection & { _rowId?: number };
  onUpdate: (updates: Partial<AIAssistantSection>) => void;
}

// ============================================
// STYLE OPTIONS (from AIAssistantStyleEnum)
// ============================================

const STYLE_OPTIONS = [
  { value: 'Chat', label: 'Chat', emoji: '💬', description: 'Interface de messagerie classique' },
  { value: 'Bubble', label: 'Bulle', emoji: '🫧', description: 'Bulle flottante compacte' },
  { value: 'Embedded', label: 'Intégré', emoji: '📄', description: 'Intégré dans la page' },
];

const VOICE_LANGUAGE_OPTIONS = [
  { value: 'fr-FR', label: '🇫🇷 Français' },
  { value: 'en-US', label: '🇺🇸 English' },
  { value: 'de-DE', label: '🇩🇪 Deutsch' },
  { value: 'it-IT', label: '🇮🇹 Italiano' },
];

// ============================================
// AI ASSISTANT FORM COMPONENT
// ============================================

function AIAssistantFormComponent({ section, onUpdate }: AIAssistantFormProps) {
  // ========== HANDLERS ==========
  const updateContent = useCallback((key: string, value: unknown) => {
    onUpdate({
      content: {
        ...section.content,
        [key]: value,
      },
    });
  }, [section.content, onUpdate]);

  const updateDesign = useCallback((key: string, value: unknown) => {
    onUpdate({
      design: {
        ...section.design,
        [key]: value,
      },
    });
  }, [section.design, onUpdate]);

  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Assistant IA</h2>
            <p className="text-slate-400 text-sm">Configurez le chatbot intégré</p>
          </div>
        </div>

        {/* Section Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
          <div>
            <h4 className="text-white font-medium">Section active</h4>
            <p className="text-slate-500 text-sm">Affiche l&apos;assistant IA sur votre site</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ isActive: !section.isActive })}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              section.isActive 
                ? 'bg-gradient-to-r from-violet-500 to-purple-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              section.isActive ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </motion.div>

      {/* ========== MESSAGES ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          Messages
        </h3>

        <div className="space-y-4">
          <LocalInput
            label="Message d'accueil"
            value={section.content.welcomeMessage}
            onChange={(v) => updateContent('welcomeMessage', v)}
            placeholder="Bonjour ! Comment puis-je vous aider ?"
            hint="Premier message affiché à l'utilisateur"
          />

          <LocalInput
            label="Placeholder du champ de saisie"
            value={section.content.placeholder}
            onChange={(v) => updateContent('placeholder', v)}
            placeholder="Posez votre question..."
          />

          <LocalImageInput
            label="Avatar du bot"
            value={section.content.avatarUrl || ''}
            onChange={(v) => updateContent('avatarUrl', v || null)}
            hint="Image affichée à côté des réponses du bot"
            category="ai"
            fieldKey="avatarUrl"
            aspectRatio="square"
          />
        </div>
      </motion.div>

      {/* ========== STYLE ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-400" />
          Style
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateDesign('style', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                section.design.style === opt.value
                  ? 'border-violet-500 bg-violet-500/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-2xl block mb-2">{opt.emoji}</span>
              <span className={`font-medium text-sm block ${
                section.design.style === opt.value ? 'text-violet-400' : 'text-white'
              }`}>
                {opt.label}
              </span>
              <span className="text-slate-500 text-xs">{opt.description}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ========== VOICE ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          {section.content.voiceEnabled ? (
            <Mic className="w-5 h-5 text-emerald-400" />
          ) : (
            <MicOff className="w-5 h-5 text-slate-400" />
          )}
          Synthèse vocale
        </h3>

        {/* Voice Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl mb-4">
          <div>
            <h4 className="text-white font-medium">Activer la voix</h4>
            <p className="text-slate-500 text-sm">Les réponses seront lues à voix haute</p>
          </div>
          <button
            type="button"
            onClick={() => updateContent('voiceEnabled', !section.content.voiceEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              section.content.voiceEnabled 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
              section.content.voiceEnabled ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Voice Language */}
        {section.content.voiceEnabled && (
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Langue de la voix</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {VOICE_LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateContent('voiceLanguage', opt.value)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    section.content.voiceLanguage === opt.value
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const AIAssistantForm = memo(AIAssistantFormComponent);
