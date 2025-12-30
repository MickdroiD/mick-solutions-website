'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Settings, Layers, Eye, EyeOff, Plus, Trash2, 
  GripVertical, Check, AlertCircle, RefreshCw,
  PanelRightClose, PanelRight, Menu, X,
  Sparkles, ChevronRight, ExternalLink, 
  LayoutGrid, Zap, MessageSquare, HelpCircle, Users, Image as ImageIcon,
  Construction, UserCircle, Webhook, Bot, Palette, Crown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminV2Provider, useAdminV2, isHeroSection } from '@/components/admin/v2/AdminContext';
import { 
  GlobalForm, HeroForm, JsonForm, ServicesForm, FAQForm, 
  TestimonialsForm, ContactForm, AdvantagesForm, PortfolioForm,
  TrustForm, GalleryForm, HeaderForm, FooterForm,
  BlogForm, AIAssistantForm, CustomForm,
  IntegrationsForm, AIConfigForm, AnimationsForm, PremiumForm
} from '@/components/admin/v2/forms';
import { SitePreviewBlock } from '@/components/admin/ui';
import type { 
  Section, HeroSection, ServicesSection, FAQSection, 
  TestimonialsSection, ContactSection, AdvantagesSection,
  PortfolioSection, TrustSection, GallerySection,
  BlogSection, AIAssistantSection, CustomSection
} from '@/lib/schemas/factory';

// Type guards pour les sections
function isServicesSection(section: Section): section is ServicesSection {
  return section.type === 'services';
}

function isFAQSection(section: Section): section is FAQSection {
  return section.type === 'faq';
}

function isTestimonialsSection(section: Section): section is TestimonialsSection {
  return section.type === 'testimonials';
}

function isContactSection(section: Section): section is ContactSection {
  return section.type === 'contact';
}

function isAdvantagesSection(section: Section): section is AdvantagesSection {
  return section.type === 'advantages';
}

function isPortfolioSection(section: Section): section is PortfolioSection {
  return section.type === 'portfolio';
}

function isTrustSection(section: Section): section is TrustSection {
  return section.type === 'trust';
}

function isGallerySection(section: Section): section is GallerySection {
  return section.type === 'gallery';
}

function isBlogSection(section: Section): section is BlogSection {
  return section.type === 'blog';
}

function isAIAssistantSection(section: Section): section is AIAssistantSection {
  return section.type === 'ai-assistant';
}

function isCustomSection(section: Section): section is CustomSection {
  return section.type === 'custom';
}

// ============================================
// SECTION TYPE CONFIG
// ============================================

const SECTION_ICONS: Record<string, string> = {
  hero: '🦸',
  services: '🛠️',
  advantages: '✅',
  gallery: '🖼️',
  portfolio: '💼',
  testimonials: '💬',
  trust: '🤝',
  faq: '❓',
  contact: '📧',
  blog: '📝',
  'ai-assistant': '🤖',
  custom: '🎨',
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  services: 'Services',
  advantages: 'Avantages',
  gallery: 'Galerie',
  portfolio: 'Portfolio',
  testimonials: 'Témoignages',
  trust: 'Confiance',
  faq: 'FAQ',
  contact: 'Contact',
  blog: 'Blog',
  'ai-assistant': 'Assistant IA',
  custom: 'Custom',
};

// Section types available for creation
const AVAILABLE_SECTION_TYPES = [
  { type: 'hero', label: 'Hero', icon: Zap, description: 'Section d\'accueil principale' },
  { type: 'services', label: 'Services', icon: LayoutGrid, description: 'Liste de vos services' },
  { type: 'advantages', label: 'Avantages', icon: Check, description: 'Points forts de votre offre' },
  { type: 'portfolio', label: 'Portfolio', icon: ImageIcon, description: 'Vos réalisations' },
  { type: 'testimonials', label: 'Témoignages', icon: MessageSquare, description: 'Avis de vos clients' },
  { type: 'trust', label: 'Confiance', icon: Users, description: 'Éléments de réassurance' },
  { type: 'gallery', label: 'Galerie', icon: ImageIcon, description: 'Galerie d\'images' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Questions fréquentes' },
  { type: 'contact', label: 'Contact', icon: MessageSquare, description: 'Formulaire de contact' },
  { type: 'blog', label: 'Blog', icon: Layers, description: 'Articles et actualités' },
  { type: 'ai-assistant', label: 'Assistant IA', icon: Sparkles, description: 'Chatbot intégré' },
  { type: 'custom', label: 'Custom', icon: LayoutGrid, description: 'Section HTML personnalisée' },
] as const;

// ============================================
// SIDEBAR SECTION ITEM
// ============================================

interface SectionItemProps {
  section: Section & { _rowId?: number };
  isSelected: boolean;
  onSelect: () => void;
  onToggleActive: (isActive: boolean) => void;
  onDelete: () => void;
}

function SectionItem({ section, isSelected, onSelect, onToggleActive, onDelete }: SectionItemProps) {
  return (
    <Reorder.Item
      value={section}
      id={String(section._rowId)}
      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
          : 'bg-slate-800/50 border border-white/5 hover:border-white/10'
      }`}
    >
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Section Info */}
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 flex items-center gap-2 text-left min-w-0"
      >
        <span className="text-base">{SECTION_ICONS[section.type] || '📦'}</span>
        <div className="flex-1 min-w-0">
          <span className={`block text-sm font-medium truncate ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
            {SECTION_LABELS[section.type] || section.type}
          </span>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(!section.isActive);
          }}
          className={`p-1 rounded transition-colors ${
            section.isActive
              ? 'text-emerald-400 hover:bg-emerald-500/20'
              : 'text-slate-500 hover:bg-slate-700'
          }`}
          title={section.isActive ? 'Désactiver' : 'Activer'}
        >
          {section.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Supprimer cette section ?')) {
              onDelete();
            }
          }}
          className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active indicator */}
      {!section.isActive && (
        <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 text-[10px]">
          Off
        </span>
      )}
    </Reorder.Item>
  );
}

// ============================================
// MAIN DASHBOARD CONTENT
// ============================================

function DashboardContent() {
  const {
    globalConfig,
    allSections,
    isLoading,
    error,
    updateGlobal,
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    toggleSectionActive,
    refresh,
    hasUnsavedChanges,
  } = useAdminV2();

  // UI State - extended with new config panels
  const [selectedView, setSelectedView] = useState<'global' | 'header' | 'footer' | 'integrations' | 'ai-config' | 'animations' | 'premium' | number>('global');
  const [showPreview, setShowPreview] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Show notification helper
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Selected section
  const selectedSection = useMemo(() => {
    if (selectedView === 'global') return null;
    return allSections.find(s => s._rowId === selectedView) || null;
  }, [selectedView, allSections]);

  // Handle section update with optimistic UI
  const handleSectionUpdate = useCallback((updates: Partial<Section>) => {
    if (selectedSection?._rowId) {
      updateSection(selectedSection._rowId, updates);
      setLastSaveTimestamp(Date.now());
    }
  }, [selectedSection, updateSection]);

  // Handle reorder
  const handleReorder = useCallback((newOrder: (Section & { _rowId?: number })[]) => {
    const orderedIds = newOrder.map(s => s._rowId).filter((id): id is number => id !== undefined);
    reorderSections(orderedIds);
  }, [reorderSections]);

  // Handle global update
  const handleGlobalUpdate = useCallback((updates: Parameters<typeof updateGlobal>[0]) => {
    updateGlobal(updates);
    setLastSaveTimestamp(Date.now());
  }, [updateGlobal]);

  // Handle add section
  const handleAddSection = useCallback(async (type: string) => {
    // Default content/design for new sections
    const defaultContent: Record<string, unknown> = {};
    const defaultDesign: Record<string, unknown> = {};

    // Set some defaults based on type
    if (type === 'hero') {
      defaultContent.titre = 'Nouveau titre';
      defaultContent.sousTitre = 'Sous-titre de votre section';
      defaultContent.badge = 'Nouveau';
      defaultContent.ctaPrincipal = { text: 'Action', url: '#contact' };
      defaultDesign.variant = 'Electric';
      defaultDesign.height = 'Tall';
    } else if (type === 'services') {
      defaultContent.titre = 'Nos Services';
      defaultContent.items = [];
      defaultDesign.variant = 'Cards';
    } else if (type === 'faq') {
      defaultContent.titre = 'Questions Fréquentes';
      defaultContent.items = [];
      defaultDesign.variant = 'Accordion';
    }

    const newSection = {
      type: type as Section['type'],
      isActive: true,
      order: allSections.length,
      page: 'home',
      content: defaultContent,
      design: defaultDesign,
    };

    const newId = await addSection(newSection as Omit<Section, 'id'>);
    
    if (newId) {
      showNotification('success', `Section "${SECTION_LABELS[type] || type}" créée`);
      // Select the new section
      setSelectedView(newId);
    } else {
      showNotification('error', 'Erreur lors de la création');
    }
  }, [addSection, allSections.length, showNotification]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Chargement de l&apos;interface Admin V2...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !globalConfig) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-red-300/70 mb-4">{error || 'Configuration non disponible'}</p>
          <button
            type="button"
            onClick={refresh}
            className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ========== NOTIFICATION TOAST ========== */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
            <span className="text-white font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* ========== SIDEBAR ========== */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 w-64 h-full bg-slate-800/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 overflow-visible`}>
          {/* Logo */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-black rounded-xl p-1.5">
                  <Image src="/admin-logo.svg" width={40} height={40} alt="Logo" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm">Panneau de configuration</span>
                  <span className="block text-[10px] uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent font-bold">Powered by Mick-Solutions</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Global Settings Button */}
          <div className="p-3 border-b border-white/5 space-y-2">
            <button
              type="button"
              onClick={() => setSelectedView('global')}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                selectedView === 'global'
                  ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30'
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div className="text-left flex-1">
                <span className={`block font-medium text-sm ${selectedView === 'global' ? 'text-violet-400' : 'text-white'}`}>
                  Configuration
                </span>
                <span className="text-xs text-slate-500">Identité, SEO, Couleurs</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${selectedView === 'global' ? 'text-violet-400' : 'text-slate-500'}`} />
            </button>

            {/* Header & Footer Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedView('header')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                  selectedView === 'header'
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                }`}
              >
                <Menu className="w-4 h-4" />
                <span className="text-xs font-medium">Header</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedView('footer')}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                  selectedView === 'footer'
                    ? 'bg-slate-500/20 border border-slate-400/30 text-slate-300'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs font-medium">Footer</span>
              </button>
            </div>

            {/* Advanced Config Panels */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <h4 className="text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">Avancé</h4>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedView('integrations')}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-all ${
                    selectedView === 'integrations'
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Webhook className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Intégrations</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('ai-config')}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-all ${
                    selectedView === 'ai-config'
                      ? 'bg-violet-500/20 border border-violet-500/30 text-violet-400'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Config IA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('animations')}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-all ${
                    selectedView === 'animations'
                      ? 'bg-pink-500/20 border border-pink-500/30 text-pink-400'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Animations</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('premium')}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-all ${
                    selectedView === 'premium'
                      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Premium</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto overflow-x-visible p-3">
            {/* Active Sections */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-500 text-xs font-medium flex items-center gap-2 uppercase tracking-wider">
                <Eye className="w-3 h-3" />
                Actives ({allSections.filter(s => s.isActive).length})
              </h3>
            </div>

            <Reorder.Group
              axis="y"
              values={allSections.filter(s => s.isActive)}
              onReorder={handleReorder}
              className="space-y-1.5"
            >
              {allSections.filter(s => s.isActive).map((section) => (
                <SectionItem
                  key={section._rowId}
                  section={section}
                  isSelected={selectedView === section._rowId}
                  onSelect={() => setSelectedView(section._rowId!)}
                  onToggleActive={(isActive) => toggleSectionActive(section._rowId!, isActive)}
                  onDelete={() => {
                    deleteSection(section._rowId!);
                    if (selectedView === section._rowId) {
                      setSelectedView('global');
                    }
                  }}
                />
              ))}
            </Reorder.Group>

            {allSections.filter(s => s.isActive).length === 0 && (
              <div className="text-center py-4 text-slate-600">
                <p className="text-xs">Aucune section active</p>
              </div>
            )}

            {/* Inactive Sections (désactivées mais existantes) */}
            {allSections.filter(s => !s.isActive).length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <h3 className="text-slate-600 text-[10px] font-medium flex items-center gap-2 uppercase tracking-wider mb-2">
                  <EyeOff className="w-3 h-3" />
                  Désactivées ({allSections.filter(s => !s.isActive).length})
                </h3>
                
                <div className="space-y-1">
                  {allSections.filter(s => !s.isActive).map((section) => {
                    const sectionConfig = AVAILABLE_SECTION_TYPES.find(t => t.type === section.type);
                    const Icon = sectionConfig?.icon || Layers;
                    const label = SECTION_LABELS[section.type] || section.type;
                    
                    return (
                      <div
                        key={section._rowId}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all group ${
                          selectedView === section._rowId
                            ? 'bg-slate-700/50 border border-cyan-500/30'
                            : 'bg-slate-800/30 border border-white/5 hover:border-white/10 opacity-60 hover:opacity-80'
                        }`}
                      >
                        {/* Zone cliquable pour sélectionner */}
                        <button
                          type="button"
                          onClick={() => setSelectedView(section._rowId!)}
                          className="flex items-center gap-2 flex-1 min-w-0"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <span className="text-slate-400 text-xs font-medium truncate block">{label}</span>
                            <span className="text-slate-600 text-[10px]">Cliquer pour modifier</span>
                          </div>
                        </button>
                        
                        {/* Actions: Activer + Supprimer */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionActive(section._rowId!, true);
                            }}
                            className="p-1 hover:bg-emerald-500/20 rounded text-slate-500 hover:text-emerald-400 transition-colors"
                            title="Activer cette section"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Supprimer définitivement la section "${label}" ? Cette action est irréversible.`)) {
                                deleteSection(section._rowId!);
                                if (selectedView === section._rowId) {
                                  setSelectedView('global');
                                }
                              }
                            }}
                            className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Section (types non encore créés) */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <h3 className="text-slate-600 text-[10px] font-medium flex items-center gap-2 uppercase tracking-wider mb-2">
                <Plus className="w-3 h-3" />
                Créer une section
              </h3>
              
              <div className="space-y-1">
                {AVAILABLE_SECTION_TYPES.map(({ type, label, icon: Icon }) => {
                  // Vérifie si une section de ce type existe déjà (active ou non)
                  const existingSection = allSections.find(s => s.type === type);
                  
                  // Si la section existe déjà, ne pas afficher le bouton de création
                  if (existingSection) return null;
                  
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddSection(type)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-800/20 border border-dashed border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-700/30 group-hover:bg-cyan-500/20 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="text-slate-500 group-hover:text-slate-300 text-xs font-medium truncate block transition-colors">{label}</span>
                        <span className="text-slate-600 text-[10px]">+ Créer cette section</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="p-4 border-t border-white/5">
            <h4 className="text-slate-500 text-xs font-medium mb-3 uppercase tracking-wider">
              Premium Features
            </h4>
            <Link
              href="/admin/v2/leads"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all mb-2"
            >
              <UserCircle className="w-5 h-5" />
              <div className="text-left">
                <span className="block font-medium text-sm">CRM Lite</span>
                <span className="text-xs text-cyan-400/70">Gestion des leads</span>
              </div>
            </Link>
          </div>

          {/* Footer Actions */}
          {/* Footer Actions */}
          <div className="p-4 border-t border-white/5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              👁️ Voir le site
            </a>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ========== MAIN CONTENT ========== */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen overflow-hidden">
          {/* Form Area */}
          <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            showPreview ? 'lg:w-1/2 lg:max-w-[60%]' : 'lg:w-full'
          }`}>
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/10"
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {selectedView === 'global' ? '⚙️' 
                        : selectedView === 'header' ? '🔝'
                        : selectedView === 'footer' ? '📋'
                        : selectedView === 'integrations' ? '🔗'
                        : selectedView === 'ai-config' ? '🤖'
                        : selectedView === 'animations' ? '✨'
                        : selectedView === 'premium' ? '👑'
                        : SECTION_ICONS[selectedSection?.type || ''] || '📦'}
                    </span>
                    <h1 className="text-white font-bold">
                      {selectedView === 'global'
                        ? 'Configuration Globale'
                        : selectedView === 'header'
                        ? 'Header & Navigation'
                        : selectedView === 'footer'
                        ? 'Footer & Contact'
                        : selectedView === 'integrations'
                        ? 'Intégrations & Webhooks'
                        : selectedView === 'ai-config'
                        ? 'Configuration IA'
                        : selectedView === 'animations'
                        ? 'Animations & Effets'
                        : selectedView === 'premium'
                        ? 'Premium & Avancé'
                        : SECTION_LABELS[selectedSection?.type || ''] || 'Section'}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Maintenance Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = !(globalConfig.premium?.maintenanceMode ?? false);
                      updateGlobal({
                        premium: {
                          ...globalConfig.premium,
                          maintenanceMode: newValue,
                        },
                      });
                      showNotification(
                        'success',
                        newValue ? 'Mode Maintenance activé' : 'Mode Maintenance désactivé'
                      );
                    }}
                    className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      globalConfig.premium?.maintenanceMode
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                    title={globalConfig.premium?.maintenanceMode ? 'Désactiver le mode maintenance' : 'Activer le mode maintenance'}
                  >
                    <Construction className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {globalConfig.premium?.maintenanceMode ? 'Maintenance ON' : 'Maintenance'}
                    </span>
                  </button>

                  {/* Preview Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      showPreview
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                    title={showPreview ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
                  >
                    {showPreview ? (
                      <>
                        <PanelRightClose className="w-4 h-4" />
                        <span className="text-xs font-medium">Aperçu</span>
                      </>
                    ) : (
                      <>
                        <PanelRight className="w-4 h-4" />
                        <span className="text-xs font-medium">Focus</span>
                      </>
                    )}
                  </button>

                  {/* Refresh */}
                  <button
                    type="button"
                    onClick={refresh}
                    className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  {/* Status indicator */}
                  {!hasUnsavedChanges ? (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">À jour</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Modifications</span>
                    </span>
                  )}
                </div>
              </div>
            </header>

            {/* Form Content */}
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedView === 'global' ? (
                  <motion.div
                    key="global"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <GlobalForm
                      config={globalConfig}
                      onUpdate={handleGlobalUpdate}
                    />
                  </motion.div>
                ) : selectedView === 'header' ? (
                  <motion.div
                    key="header"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <HeaderForm
                      config={globalConfig}
                      onUpdate={handleGlobalUpdate}
                    />
                  </motion.div>
                ) : selectedView === 'footer' ? (
                  <motion.div
                    key="footer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <FooterForm
                      config={globalConfig}
                      onUpdate={handleGlobalUpdate}
                    />
                  </motion.div>
                ) : selectedView === 'integrations' ? (
                  <motion.div
                    key="integrations"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <IntegrationsForm
                      config={globalConfig}
                      onUpdate={handleGlobalUpdate}
                    />
                  </motion.div>
                ) : selectedView === 'ai-config' ? (
                  <motion.div
                    key="ai-config"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <AIConfigForm
                      config={globalConfig}
                      onUpdate={handleGlobalUpdate}
                    />
                  </motion.div>
                ) : selectedView === 'animations' ? (
                  <motion.div
                    key="animations"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <AnimationsForm
                      config={globalConfig}
                      onUpdate={handleGlobalUpdate}
                    />
                  </motion.div>
                ) : selectedView === 'premium' ? (
                  <motion.div
                    key="premium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <PremiumForm
                      config={globalConfig}
                      onUpdate={handleGlobalUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isHeroSection(selectedSection) ? (
                  <motion.div
                    key={`hero-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <HeroForm
                      section={selectedSection as HeroSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isServicesSection(selectedSection) ? (
                  <motion.div
                    key={`services-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ServicesForm
                      section={selectedSection as ServicesSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isFAQSection(selectedSection) ? (
                  <motion.div
                    key={`faq-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <FAQForm
                      section={selectedSection as FAQSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isTestimonialsSection(selectedSection) ? (
                  <motion.div
                    key={`testimonials-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <TestimonialsForm
                      section={selectedSection as TestimonialsSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isContactSection(selectedSection) ? (
                  <motion.div
                    key={`contact-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ContactForm
                      section={selectedSection as ContactSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isAdvantagesSection(selectedSection) ? (
                  <motion.div
                    key={`advantages-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <AdvantagesForm
                      section={selectedSection as AdvantagesSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isPortfolioSection(selectedSection) ? (
                  <motion.div
                    key={`portfolio-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <PortfolioForm
                      section={selectedSection as PortfolioSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isTrustSection(selectedSection) ? (
                  <motion.div
                    key={`trust-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <TrustForm
                      section={selectedSection as TrustSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isGallerySection(selectedSection) ? (
                  <motion.div
                    key={`gallery-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <GalleryForm
                      section={selectedSection as GallerySection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isBlogSection(selectedSection) ? (
                  <motion.div
                    key={`blog-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <BlogForm
                      section={selectedSection as BlogSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isAIAssistantSection(selectedSection) ? (
                  <motion.div
                    key={`ai-assistant-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <AIAssistantForm
                      section={selectedSection as AIAssistantSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection && isCustomSection(selectedSection) ? (
                  <motion.div
                    key={`custom-${selectedSection._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <CustomForm
                      section={selectedSection as CustomSection & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : selectedSection ? (
                  <motion.div
                    key={`json-${(selectedSection as Section & { _rowId?: number })._rowId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <JsonForm
                      section={selectedSection as Section & { _rowId?: number }}
                      onUpdate={handleSectionUpdate}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* ========== PREVIEW PANEL ========== */}
          {/* 🔧 FIXED: Forcer h-screen et sticky pour que le preview prenne toute la hauteur */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '50%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col border-l border-white/10 bg-slate-950/50 h-screen sticky top-0"
                style={{ minWidth: '400px', maxWidth: '50%' }}
              >
                <SitePreviewBlock
                  lastUpdate={lastSaveTimestamp}
                  previewUrl="/"
                  height="100vh"
                  className="h-[100vh] rounded-none border-0"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE WRAPPER WITH PROVIDER
// ============================================

export default function AdminV2Page() {
  return (
    <AdminV2Provider>
      <DashboardContent />
    </AdminV2Provider>
  );
}

