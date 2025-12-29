'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, Bot, Zap, Eye, TrendingUp, Clock, 
  Activity, Globe, CheckCircle2
} from 'lucide-react';
import { NAV_SECTIONS } from '../AdminSidebar';

// ============================================
// TYPES
// ============================================

interface DashboardSectionProps {
  config: Record<string, unknown>;
  onNavigate: (sectionId: string) => void;
  currentUser?: { name: string; role: string } | null;
}

// ============================================
// COMPOSANT
// ============================================

export default function DashboardSection({ 
  config, 
  onNavigate,
  currentUser 
}: DashboardSectionProps) {
  // Calculer les statistiques
  const activeSections = Object.entries(config)
    .filter(([key, value]) => key.startsWith('show') && value === true)
    .length;
  
  const hasAI = config.aiMode !== 'Disabled' && config.aiMode;
  const isPremium = config.isPremium === true;
  const siteUrl = config.siteUrl as string || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 border border-white/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30">
              ✨ Dashboard
            </span>
            {isPremium && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
                👑 Premium
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenue, {currentUser?.name || 'Admin'} 👋
          </h1>
          <p className="text-slate-400 max-w-xl">
            Gérez votre site en toute simplicité. Toutes vos modifications sont sauvegardées automatiquement.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{activeSections}</p>
          <p className="text-slate-400 text-sm">Sections actives</p>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{hasAI ? 'Actif' : 'Off'}</p>
          <p className="text-slate-400 text-sm">Mode IA</p>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{String(config.themeGlobal || 'Electric')}</p>
          <p className="text-slate-400 text-sm">Thème actuel</p>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{isPremium ? 'Pro' : 'Free'}</p>
          <p className="text-slate-400 text-sm">Forfait</p>
        </div>
      </div>

      {/* AI Credits Banner (si Premium) */}
      {isPremium && (
        <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Crédits IA</h3>
                <p className="text-slate-400 text-sm">Génération de contenu incluse</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-400">∞</p>
              <p className="text-slate-500 text-xs">Illimité avec Premium</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Accès rapide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_SECTIONS.slice(1).map((section) => (
            <button
              type="button" key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`group p-5 rounded-2xl bg-gradient-to-br ${section.color} bg-opacity-10 border border-white/10 hover:border-white/20 hover:scale-[1.02] transition-all text-left`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{section.emoji}</span>
                <h4 className="text-white font-bold">{section.title}</h4>
              </div>
              <p className="text-white/60 text-sm">{section.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Site Status */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Statut du site
          </h3>
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            En ligne
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-slate-400">Domaine</span>
            <span className="text-white font-mono text-xs">{siteUrl || 'Non configuré'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-slate-400">Thème</span>
            <span className="text-white">{String(config.themeGlobal || 'Electric')}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-slate-400">SEO</span>
            <span className={`${config.robotsIndex ? 'text-emerald-400' : 'text-amber-400'}`}>
              {config.robotsIndex ? 'Indexé' : 'Non indexé'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-slate-400">Analytics</span>
            <span className={`${config.showAnalytics ? 'text-emerald-400' : 'text-slate-500'}`}>
              {config.showAnalytics ? 'Activé' : 'Désactivé'}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Conseil du jour</h4>
            <p className="text-slate-400 text-sm">
              Utilisez la génération IA pour créer du contenu professionnel en quelques secondes. 
              Accédez à l&apos;assistant via le bouton flottant <span className="text-violet-400">🤖</span> en bas à droite.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          <h3 className="text-white font-bold">Activité récente</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-slate-300 text-sm">Configuration sauvegardée automatiquement</span>
            <span className="text-slate-500 text-xs ml-auto">À l&apos;instant</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <span className="w-2 h-2 bg-cyan-400 rounded-full" />
            <span className="text-slate-300 text-sm">Site en ligne et fonctionnel</span>
            <span className="text-slate-500 text-xs ml-auto">✓</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

