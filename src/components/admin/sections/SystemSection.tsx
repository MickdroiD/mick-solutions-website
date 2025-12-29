'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bot, Sparkles, Key, 
  Webhook, Check, Crown, Eye, EyeOff,
  RefreshCw, FolderSync, HardDrive, Database, CheckCircle, AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { DEFAULT_AI_CONFIG } from '@/lib/auth';
import { AccordionSection } from '../ui/AccordionSection';
import { LocalInput, LocalTextarea } from '../ui/LocalInput';

// ============================================
// TYPES
// ============================================

interface SystemSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onOpenAIModal: (context: { sectionKey: string; variantKey: string; showKey: string }) => void;
}

// ============================================
// COMPOSANT
// ============================================

export default function SystemSection({
  config,
  options,
  onConfigUpdate,
  onOpenAIModal,
}: SystemSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionSection
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    result: null | {
      success: boolean;
      added: number;
      scanned: number;
      existing: number;
      errors?: string[];
    };
  }>({ loading: false, result: null });

  const isAiAssistantActive = config.showAiAssistant === true;

  // Fonction de synchronisation des fichiers VPS -> DB
  const handleSyncFiles = async () => {
    setSyncStatus({ loading: true, result: null });
    
    try {
      const response = await fetch('/api/admin/sync-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSyncStatus({ loading: false, result: { success: true, ...data } });
      } else {
        setSyncStatus({ 
          loading: false, 
          result: { success: false, added: 0, scanned: 0, existing: 0, errors: [data.error || 'Erreur inconnue'] } 
        });
      }
    } catch (error) {
      console.error('[Sync] Erreur:', error);
      setSyncStatus({ 
        loading: false, 
        result: { success: false, added: 0, scanned: 0, existing: 0, errors: ['Erreur de connexion'] } 
      });
    }
  };

  // Handler stable pour les updates
  const createUpdateHandler = useCallback((key: string) => {
    return (value: string) => onConfigUpdate(key, value);
  }, [onConfigUpdate]);

  // ============================================
  // RENDER HELPERS (utilisant LocalInput pour éviter les re-renders)
  // ============================================

  const renderTextInput = (key: string, label: string, placeholder?: string, hint?: string) => (
    <LocalInput
      value={String(config[key] ?? '')}
      onChange={createUpdateHandler(key)}
      label={label}
      placeholder={placeholder}
      hint={hint}
    />
  );

  const renderTextarea = (key: string, label: string, placeholder?: string, hint?: string) => (
    <LocalTextarea
      value={String(config[key] ?? '')}
      onChange={createUpdateHandler(key)}
      label={label}
      placeholder={placeholder}
      hint={hint}
      rows={3}
      monospace
    />
  );

  const renderSelect = (key: string, label: string, selectOptions: string[], hint?: string) => (
    <div className="space-y-1">
      <label className="text-white font-medium text-sm">{label}</label>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}
      <select
        value={String(config[key] ?? '')}
        onChange={(e) => onConfigUpdate(key, e.target.value)}
        className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all [&>option]:bg-slate-800"
      >
        <option value="">Choisir...</option>
        {selectOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const renderToggle = (key: string, label: string, hint?: string) => (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/10">
      <div>
        <p className="text-white font-medium">{label}</p>
        {hint && <p className="text-slate-500 text-sm">{hint}</p>}
      </div>
      <button
        type="button" onClick={() => onConfigUpdate(key, !config[key])}
        className={`w-14 h-8 rounded-full transition-all ${config[key] ? 'bg-cyan-500' : 'bg-slate-700'}`}
      >
        <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${config[key] ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

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
      <div className="bg-gradient-to-br from-slate-600/20 to-gray-600/20 border border-slate-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">⚙️ Système</h2>
            <p className="text-slate-400">Configuration IA, analytics, webhooks et premium</p>
          </div>
        </div>
      </div>

      {/* Section SEO & Métadonnées */}
      <AccordionSection
        id="seo"
        title="SEO & Métadonnées"
        emoji="🔍"
        badge={
          <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Important
          </span>
        }
      >
        {/* Titre et Description globaux */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
          <Settings className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium">Configuration SEO Globale</p>
            <p className="text-blue-400/70 text-sm mt-1">
              Ces paramètres affectent le référencement de votre site sur Google et les aperçus sur les réseaux sociaux.
            </p>
          </div>
        </div>

        {renderTextInput('metaTitre', 'Meta Titre', 'Titre pour Google', '50-60 caractères recommandés - Apparaît dans les résultats de recherche')}
        {renderTextarea('metaDescription', 'Meta Description', 'Description pour Google', '150-160 caractères recommandés - Résumé affiché sous le titre dans Google')}
        {renderTextarea('motsCles', 'Mots-clés', 'mot1, mot2, mot3', 'Séparés par des virgules - Utilisés pour le SEO et la catégorisation')}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          {renderTextInput('siteUrl', 'URL canonique du site', 'https://www.monsite.ch', 'URL principale utilisée pour les liens canoniques')}
          {renderTextInput('langue', 'Langue principale', 'fr', 'Code langue ISO (fr, en, de...)')}
        </div>

        {/* Image OpenGraph */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Image OpenGraph (partage réseaux sociaux)
          </h4>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-400 text-sm">
              Image affichée lors du partage sur Facebook, LinkedIn, Twitter. Taille recommandée: <strong>1200x630 pixels</strong>
            </p>
          </div>
          {renderTextInput('ogImageUrl', 'URL de l\'image OG', 'https://...', 'URL complète de l\'image pour les partages')}
        </div>

        {/* Toggle indexation */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
          <div>
            <p className="text-white font-medium">Indexation Google</p>
            <p className="text-slate-500 text-sm">Autoriser Google à indexer votre site (robots.txt)</p>
          </div>
          <button
            type="button" onClick={() => onConfigUpdate('robotsIndex', !config.robotsIndex)}
            className={`w-14 h-8 rounded-full transition-all ${config.robotsIndex ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${config.robotsIndex ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Aperçu Google */}
        <div className="p-4 bg-white rounded-xl mt-4">
          <p className="text-slate-400 text-xs mb-2">Aperçu dans les résultats Google :</p>
          <div className="font-sans">
            <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
              {String(config.metaTitre || 'Titre de votre site')} | {String(config.nomSite || 'Nom du site')}
            </p>
            <p className="text-green-700 text-sm truncate">
              {String(config.siteUrl || 'https://www.example.com')}
            </p>
            <p className="text-slate-600 text-sm line-clamp-2">
              {String(config.metaDescription || 'Description de votre site pour les moteurs de recherche...')}
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Section Synchronisation VPS */}
      <AccordionSection
        id="sync"
        title="Synchronisation Fichiers VPS"
        emoji="🔄"
        badge={
          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs flex items-center gap-1">
            <HardDrive className="w-3 h-3" /> Serveur
          </span>
        }
      >
        {/* Explication */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
          <FolderSync className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium">Synchronisation VPS → Base de données</p>
            <p className="text-blue-400/70 text-sm mt-1">
              Scanne le dossier <code className="bg-blue-500/20 px-1 rounded">public/uploads/</code> et ajoute 
              automatiquement les fichiers manquants dans la base de données (Baserow).
            </p>
          </div>
        </div>

        {/* Bouton de synchronisation */}
        <div className="flex items-center gap-4">
          <button
            type="button" onClick={handleSyncFiles}
            disabled={syncStatus.loading}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
              syncStatus.loading
                ? 'bg-slate-700 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {syncStatus.loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Synchronisation en cours...
              </>
            ) : (
              <>
                <FolderSync className="w-5 h-5" />
                🔄 Synchroniser Fichiers VPS
              </>
            )}
          </button>

          {/* Infos rapides */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <HardDrive className="w-4 h-4" />
              <span>VPS</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-4 h-4" />
              <span>Baserow</span>
            </div>
          </div>
        </div>

        {/* Résultat de la synchronisation */}
        {syncStatus.result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl border ${
              syncStatus.result.success
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {syncStatus.result.success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Synchronisation terminée</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Erreur lors de la synchronisation</span>
                </>
              )}
            </div>

            {syncStatus.result.success && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-white">{syncStatus.result.scanned}</p>
                  <p className="text-slate-400 text-xs">Fichiers scannés</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-400">{syncStatus.result.added}</p>
                  <p className="text-slate-400 text-xs">Nouveaux ajoutés</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-slate-400">{syncStatus.result.existing}</p>
                  <p className="text-slate-400 text-xs">Déjà présents</p>
                </div>
              </div>
            )}

            {syncStatus.result.errors && syncStatus.result.errors.length > 0 && (
              <div className="mt-3 text-sm text-red-400">
                <p className="font-medium mb-1">Erreurs:</p>
                <ul className="list-disc list-inside">
                  {syncStatus.result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AccordionSection>

      {/* Section IA */}
      <AccordionSection
        id="ai"
        title="Intelligence Artificielle"
        emoji="🤖"
        badge={
          <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Inclus
          </span>
        }
      >
        {/* Bandeau API incluse */}
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 font-medium">Clé API incluse</p>
            <p className="text-emerald-400/70 text-sm">Pas besoin de configurer de clé API, tout est inclus dans votre abonnement.</p>
          </div>
        </div>

        {/* Configuration IA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect('aiMode', 'Mode IA', options.aiMode || ['Disabled', 'Placeholder', 'Live'], 'Activer la génération de contenu')}
          {renderSelect('aiProvider', 'Fournisseur', options.aiProvider || ['OpenAI', 'Anthropic', 'n8n', 'Custom'])}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect('aiModel', 'Modèle', options.aiModel || ['gpt-4o-mini', 'gpt-4o', 'gemini-2.0-flash', 'gemini-2.5-pro'], `Par défaut: ${DEFAULT_AI_CONFIG.model}`)}
          {renderSelect('aiTone', 'Ton du contenu', options.aiTone || ['Professional', 'Friendly', 'Casual', 'Formal'])}
        </div>

        {/* Assistant IA sur le site */}
        <div className="flex items-center justify-between p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-violet-400" />
            <div>
              <p className="text-white font-medium">Assistant IA (Chatbot)</p>
              <p className="text-slate-500 text-sm">Bouton chat en bas à droite du site</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAiAssistantActive ? (
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" /> Visible
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs flex items-center gap-1">
                <EyeOff className="w-3 h-3" /> Caché
              </span>
            )}
            <button
              type="button" onClick={() => onConfigUpdate('showAiAssistant', !isAiAssistantActive)}
              className={`w-12 h-6 rounded-full transition-all ${isAiAssistantActive ? 'bg-violet-500' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isAiAssistantActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {renderSelect('aiAssistantStyle', 'Style assistant', options.aiAssistantStyle || ['Chat', 'Voice', 'Banner', 'Hidden'])}

        {renderTextarea('aiSystemPrompt', 'Prompt système', 'Tu es un assistant...', `Par défaut: "${DEFAULT_AI_CONFIG.systemPrompt.slice(0, 80)}..."`)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('chatbotWelcomeMessage', 'Message de bienvenue', 'Bonjour ! Comment puis-je vous aider ?')}
          {renderTextInput('chatbotPlaceholder', 'Placeholder', 'Écrivez votre message...')}
        </div>

        {/* Boutons de génération */}
        <div className="p-4 bg-white/5 rounded-xl">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Génération rapide
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button" onClick={() => onOpenAIModal({ sectionKey: 'hero', variantKey: 'heroVariant', showKey: 'showHero' })}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
            >
              ✨ Hero
            </button>
            <button
              type="button" onClick={() => onOpenAIModal({ sectionKey: 'services', variantKey: 'servicesVariant', showKey: 'showServices' })}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
            >
              💼 Services
            </button>
            <button
              type="button" onClick={() => onOpenAIModal({ sectionKey: 'faq', variantKey: 'faqVariant', showKey: 'showFaq' })}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
            >
              ❓ FAQ
            </button>
            <button
              type="button" onClick={() => onOpenAIModal({ sectionKey: 'image', variantKey: 'image', showKey: 'image' })}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-400 text-sm font-medium hover:from-pink-500/30 hover:to-rose-500/30 transition-all"
            >
              🖼️ Image
            </button>
          </div>
        </div>
      </AccordionSection>

      {/* Section Analytics */}
      <AccordionSection id="analytics" title="Analytics & Tracking" emoji="📊">
        {renderToggle('showAnalytics', 'Activer les analytics', 'Suivi des visiteurs')}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('gaMeasurementId', 'Google Analytics ID', 'G-XXXXXXXXXX')}
          {renderTextInput('gtmContainerId', 'GTM Container ID', 'GTM-XXXXXXX')}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('umamiSiteId', 'Umami Site ID')}
          {renderTextInput('umamiScriptUrl', 'Umami Script URL')}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextInput('hotjarSiteId', 'Hotjar Site ID')}
          {renderTextInput('facebookPixelId', 'Facebook Pixel ID')}
        </div>
      </AccordionSection>

      {/* Section Webhooks */}
      <AccordionSection id="webhooks" title="Webhooks & Intégrations" emoji="🔗">
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
          <Webhook className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-sm">
            Connectez vos workflows n8n pour automatiser les actions (contacts, newsletter...).
          </p>
        </div>

        {renderTextInput('n8nWebhookContact', 'Webhook Contact', 'https://n8n.example.com/webhook/...', 'Reçoit les soumissions du formulaire contact')}
        {renderTextInput('n8nWebhookNewsletter', 'Webhook Newsletter', 'https://n8n.example.com/webhook/...', 'Reçoit les inscriptions newsletter')}
        {renderTextInput('aiWebhookUrl', 'Webhook IA principal', 'https://...')}
        {renderTextInput('aiImageWebhook', 'Webhook génération images', 'https://...')}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          {renderTextInput('stripePublicKey', 'Stripe Public Key')}
          {renderTextInput('mailchimpListId', 'Mailchimp List ID')}
          {renderTextInput('sendgridApiKey', 'Sendgrid API Key')}
        </div>
      </AccordionSection>

      {/* Section Animations */}
      <AccordionSection id="animations" title="Animations & Effets" emoji="⚡">
        {renderToggle('enableAnimations', 'Activer les animations', 'Effets visuels sur le site')}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect('animationSpeed', 'Vitesse', options.animationSpeed || ['Slow', 'Normal', 'Fast', 'Instant'])}
          {renderSelect('scrollEffect', 'Effet au scroll', options.scrollEffect || ['None', 'Fade', 'Slide', 'Zoom', 'Parallax'])}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect('hoverEffect', 'Effet au survol', options.hoverEffect || ['None', 'Scale', 'Glow', 'Lift', 'Shake'])}
          {renderSelect('loadingStyle', 'Style de chargement', options.loadingStyle || ['None', 'Skeleton', 'Spinner', 'Progress'])}
        </div>

        {renderToggle('lazyLoading', 'Chargement différé (images)', 'Améliore les performances')}
      </AccordionSection>

      {/* Section Premium */}
      <AccordionSection 
        id="premium" 
        title="Premium & Avancé" 
        emoji="👑"
        badge={
          config.isPremium ? (
            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs flex items-center gap-1">
              <Crown className="w-3 h-3" /> Actif
            </span>
          ) : null
        }
      >
        {renderToggle('isPremium', 'Compte Premium', 'Débloque les fonctions avancées')}
        {renderTextInput('premiumUntil', 'Premium jusqu\'au', '2025-12-31', 'Date d\'expiration')}
        {renderTextInput('customDomain', 'Domaine personnalisé', 'www.monsite.ch')}
        {renderTextInput('rateLimitApi', 'Limite API/jour', '1000')}

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            Code personnalisé
          </h4>
          {renderTextarea('customCss', 'CSS personnalisé', '/* Votre CSS */')}
          {renderTextarea('customJs', 'JavaScript personnalisé', '// Votre JS')}
        </div>
      </AccordionSection>
    </motion.div>
  );
}

