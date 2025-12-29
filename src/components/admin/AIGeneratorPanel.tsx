'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  MessageSquare,
  HelpCircle,
  Star,
  Copy,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AIGeneratorPanelProps {
  onGenerate: (type: string, content: unknown) => void;
  config: {
    aiProvider?: string;
    aiModel?: string;
    aiTone?: string;
    aiIndustry?: string;
    aiKeywords?: string;
    aiTargetAudience?: string;
    nomSite?: string;
    slogan?: string;
  };
}

interface GeneratedContent {
  type: string;
  data: unknown;
  timestamp: Date;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function AIGeneratorPanel({ onGenerate, config }: AIGeneratorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // ============================================
  // GÉNÉRATION
  // ============================================

  const generateContent = async (type: 'hero' | 'services' | 'faq' | 'testimonial') => {
    setIsGenerating(type);
    setError(null);
    setGeneratedContent(null);

    const businessDescription = `${config.nomSite || 'Mon entreprise'} - ${config.slogan || ''}. 
Secteur: ${config.aiIndustry || 'Services'}. 
Mots-clés: ${config.aiKeywords || ''}. 
Cible: ${config.aiTargetAudience || 'Professionnels'}.
${customPrompt ? `Instructions supplémentaires: ${customPrompt}` : ''}`;

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type,
          prompt: businessDescription,
          provider: config.aiProvider || 'openai',
          model: config.aiModel || 'gpt-4o-mini',
          context: {
            industry: config.aiIndustry,
            tone: config.aiTone || 'Professional',
            keywords: config.aiKeywords,
            targetAudience: config.aiTargetAudience,
            language: 'fr',
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.content) {
        setGeneratedContent({
          type,
          data: data.content,
          timestamp: new Date(),
        });
      } else {
        throw new Error(data.error || 'Erreur de génération');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(null);
    }
  };

  const applyContent = () => {
    if (generatedContent) {
      onGenerate(generatedContent.type, generatedContent.data);
      setGeneratedContent(null);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  const generationTypes = [
    { id: 'hero', label: 'Hero / Accueil', icon: Zap, color: 'from-amber-500 to-orange-500' },
    { id: 'services', label: 'Services (×3)', icon: Sparkles, color: 'from-purple-500 to-violet-500' },
    { id: 'faq', label: 'FAQ (×5)', icon: HelpCircle, color: 'from-blue-500 to-cyan-500' },
    { id: 'testimonial', label: 'Témoignage', icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl overflow-hidden">
      {/* Header cliquable */}
      <button type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold">🤖 Génération IA</h3>
            <p className="text-slate-400 text-sm">Créer du contenu automatiquement</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs">
            {config.aiProvider || 'openai'} / {config.aiModel || 'gpt-4o-mini'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Contenu expandable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Instructions personnalisées */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Instructions supplémentaires (optionnel)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ex: Mettre l'accent sur la sécurité des données, ton décontracté..."
                  rows={2}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all resize-none text-sm"
                />
              </div>

              {/* Boutons de génération */}
              <div className="grid grid-cols-2 gap-3">
                {generationTypes.map((type) => (
                  <button type="button"
                    key={type.id}
                    onClick={() => generateContent(type.id as 'hero' | 'services' | 'faq' | 'testimonial')}
                    disabled={isGenerating !== null}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${type.color} text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isGenerating === type.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <type.icon className="w-4 h-4" />
                    )}
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Contenu généré */}
              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">
                        Contenu généré : {generatedContent.type}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">
                      {generatedContent.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Preview du contenu */}
                  <div className="bg-slate-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono">
                      {JSON.stringify(generatedContent.data, null, 2)}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={applyContent}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl font-medium transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Appliquer
                    </button>
                    <button type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(generatedContent.data, null, 2));
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button type="button"
                      onClick={() => setGeneratedContent(null)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all"
                    >
                      Ignorer
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Info */}
              <p className="text-slate-500 text-xs text-center">
                💡 La génération utilise {config.aiProvider || 'OpenAI'} avec le modèle {config.aiModel || 'gpt-4o-mini'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

