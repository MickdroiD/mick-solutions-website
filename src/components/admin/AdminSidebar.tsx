'use client';

import Image from 'next/image';
import {
  LayoutDashboard, Palette, Rocket, Zap, Image as ImageIcon,
  MessageSquare, Phone, Settings, LogOut, ExternalLink, X,
  PanelTop, PanelBottom, User
} from 'lucide-react';
// Note: framer-motion retiré - logo statique Mick Solutions

// ============================================
// TYPES
// ============================================

export interface NavSection {
  id: string;
  title: string;
  icon: React.ElementType;
  emoji: string;
  color: string;
  description: string;
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

// ============================================
// SECTIONS DE NAVIGATION
// ============================================

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    emoji: '📊',
    color: 'from-blue-500 to-cyan-500',
    description: 'Vue globale',
  },
  {
    id: 'brand',
    title: 'Marque & Style',
    icon: Palette,
    emoji: '🎨',
    color: 'from-pink-500 to-rose-500',
    description: 'Identité visuelle',
  },
  {
    id: 'header',
    title: 'Header & Logo',
    icon: PanelTop,
    emoji: '🔝',
    color: 'from-cyan-500 to-teal-500',
    description: 'Navigation & Animation',
  },
  {
    id: 'hero',
    title: 'Section Hero',
    icon: Rocket,
    emoji: '🚀',
    color: 'from-amber-500 to-orange-500',
    description: 'Première impression',
  },
  {
    id: 'features',
    title: 'Avantages & Services',
    icon: Zap,
    emoji: '⚡',
    color: 'from-yellow-500 to-lime-500',
    description: 'Points forts',
  },
  {
    id: 'media',
    title: 'Médias & Portfolio',
    icon: ImageIcon,
    emoji: '🖼️',
    color: 'from-violet-500 to-purple-500',
    description: 'Galerie & Projets',
  },
  {
    id: 'social',
    title: 'Preuve Sociale',
    icon: MessageSquare,
    emoji: '💬',
    color: 'from-green-500 to-emerald-500',
    description: 'Témoignages',
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: Phone,
    emoji: '📞',
    color: 'from-cyan-500 to-blue-500',
    description: 'Coordonnées',
  },
  {
    id: 'footer',
    title: 'Footer',
    icon: PanelBottom,
    emoji: '🔻',
    color: 'from-indigo-500 to-purple-500',
    description: 'Pied de page & Liens',
  },
  {
    id: 'system',
    title: 'Système',
    icon: Settings,
    emoji: '⚙️',
    color: 'from-slate-500 to-gray-600',
    description: 'API & Configuration',
  },
  {
    id: 'account',
    title: 'Mon Compte',
    icon: User,
    emoji: '👤',
    color: 'from-indigo-500 to-purple-500',
    description: 'Profil & Sécurité',
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  onLogout,
  isMobile = false,
  onClose,
}: AdminSidebarProps) {
  return (
    <aside className={`flex flex-col bg-slate-800/50 border-r border-white/5 ${isMobile ? 'w-72' : 'w-72'}`}>
      {/* Logo Mick Solutions - Identité éditeur */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0 bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <Image 
                src="/admin-logo.svg"
                alt="Logo"
                width={40}
                height={40}
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-white text-sm leading-tight">Panneau de configuration</span>
              <span className="text-[10px] uppercase tracking-wider mt-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent font-bold">
                Powered by Mick-Solutions
              </span>
            </div>
          </div>
          {isMobile && onClose && (
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {NAV_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                type="button"
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id);
                  if (isMobile && onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                  isActive
                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{section.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block">{section.title}</span>
                  <span className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                    {section.description}
                  </span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-8 bg-white/30 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all group"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm font-medium">👁️ Voir le site</span>
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

