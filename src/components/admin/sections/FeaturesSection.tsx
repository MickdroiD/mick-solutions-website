'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Sparkles, ChevronDown, ChevronRight,
  Plus, Edit, Trash2, Star, Briefcase, RefreshCw, GripVertical, Grid3X3
} from 'lucide-react';
import GridBlockManager, { type GridBlock } from '../ui/GridBlockManager';
import { AccordionWithToggle } from '../ui/AccordionWithToggle';

// ============================================
// TYPES
// ============================================

interface FeaturesSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onConfigUpdateMultiple: (updates: Record<string, unknown>) => void;
  onOpenAIModal: (context: { sectionKey: string; variantKey: string; showKey: string }) => void;
}

interface ContentItem {
  id: number;
  [key: string]: unknown;
}

// ============================================
// VARIANTES
// ============================================

const SERVICES_VARIANTS = [
  { id: 'Désactivé', label: 'Off', emoji: '🚫', color: 'bg-slate-500/20 border-slate-500' },
  { id: 'Grid', label: 'Grille', emoji: '📊', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'Accordion', label: 'Accordéon', emoji: '📋', color: 'bg-green-500/20 border-green-500' },
  { id: 'Cards', label: 'Cartes', emoji: '🃏', color: 'bg-orange-500/20 border-orange-500' },
  { id: 'Showcase', label: 'Showcase', emoji: '✨', color: 'bg-pink-500/20 border-pink-500' },
];

// ============================================
// COMPOSANT
// ============================================

export default function FeaturesSection({
  config,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options,
  onConfigUpdate,
  onConfigUpdateMultiple,
  onOpenAIModal,
}: FeaturesSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionWithToggle
  const [gridBlocksExpanded, setGridBlocksExpanded] = useState(false);
  const [advantages, setAdvantages] = useState<ContentItem[]>([]);
  const [services, setServices] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState({ advantages: false, services: false });

  const isAdvantagesActive = config.showAdvantages === true;
  const isServicesActive = config.showServices === true;
  const servicesVariant = String(config.servicesVariant || 'Grid');

  // État pour les blocs de grille (stocké dans config.featuresBlocks)
  const featuresBlocks: GridBlock[] = useMemo(() => {
    return Array.isArray(config.featuresBlocks) 
      ? config.featuresBlocks as GridBlock[]
      : [];
  }, [config.featuresBlocks]);

  // Handler pour mettre à jour les blocs
  const handleBlocksChange = useCallback((newBlocks: GridBlock[]) => {
    onConfigUpdate('featuresBlocks', newBlocks);
  }, [onConfigUpdate]);

  // Handler pour upload d'image dans un bloc
  const handleBlockImageUpload = useCallback(async (blockId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'features');

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const updatedBlocks = featuresBlocks.map(block => 
          block.id === blockId ? { ...block, content: data.url } : block
        );
        onConfigUpdate('featuresBlocks', updatedBlocks);
      }
    } catch (error) {
      console.error('[FeaturesSection] Upload error:', error);
    }
  }, [featuresBlocks, onConfigUpdate]);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchContent = useCallback(async (type: 'advantages' | 'services') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`/api/admin/content?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (type === 'advantages') {
          setAdvantages(data.items || []);
        } else {
          setServices(data.items || []);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    fetchContent('advantages');
    fetchContent('services');
  }, [fetchContent]);

  // ============================================
  // CONTENT LIST
  // ============================================

  const ContentList = ({ 
    items, 
    type,
    isLoading,
    onRefresh 
  }: { 
    items: ContentItem[]; 
    type: 'advantages' | 'services';
    isLoading: boolean;
    onRefresh: () => void;
  }) => {
    const titleKey = type === 'advantages' ? 'Titre' : 'Titre';
    const descKey = type === 'advantages' ? 'Description' : 'Description';

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">{items.length} élément(s)</span>
          <div className="flex items-center gap-2">
            <button
              type="button" onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button" onClick={() => onOpenAIModal({ sectionKey: type, variantKey: `${type}Variant`, showKey: `show${type.charAt(0).toUpperCase() + type.slice(1)}` })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm hover:bg-violet-500/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Générer
            </button>
            <a
              href={`/admin?section=content&type=${type}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="mb-2">Aucun élément</p>
            <button
              type="button" onClick={() => onOpenAIModal({ sectionKey: type, variantKey: `${type}Variant`, showKey: `show${type.charAt(0).toUpperCase() + type.slice(1)}` })}
              className="text-violet-400 hover:text-violet-300 underline text-sm"
            >
              Générer avec l&apos;IA
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-800/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-slate-400">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {String(item[titleKey] || `Élément #${index + 1}`)}
                  </p>
                  <p className="text-slate-500 text-sm truncate">
                    {String(item[descKey] || '').slice(0, 60)}...
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button type="button" className="p-2 rounded-lg bg-slate-700 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 rounded-lg bg-slate-700 text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {items.length > 5 && (
              <p className="text-center text-slate-500 text-sm py-2">
                + {items.length - 5} autres éléments
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

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
      <div className="bg-gradient-to-br from-yellow-500/20 to-lime-500/20 border border-yellow-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-lime-500 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">⚡ Avantages & Services</h2>
            <p className="text-slate-400">Mettez en avant vos points forts et offres</p>
          </div>
        </div>
      </div>

      {/* Section Avantages */}
      <AccordionWithToggle
        id="advantages"
        title="Avantages / Points forts"
        emoji="⭐"
        isActive={isAdvantagesActive}
        onToggle={() => onConfigUpdate('showAdvantages', !isAdvantagesActive)}
      >
        {isAdvantagesActive && (
          <>
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
              <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm">
                Les avantages apparaissent généralement après le Hero pour rassurer les visiteurs.
              </p>
            </div>
            <ContentList 
              items={advantages} 
              type="advantages"
              isLoading={loading.advantages}
              onRefresh={() => fetchContent('advantages')}
            />
          </>
        )}
      </AccordionWithToggle>

      {/* Section Services */}
      <AccordionWithToggle
        id="services"
        title="Services / Offres"
        emoji="💼"
        isActive={isServicesActive}
        onToggle={() => onConfigUpdate('showServices', !isServicesActive)}
      >
        {isServicesActive && (
          <>
            {/* Variante de style */}
            <div className="mb-4">
              <label className="text-white font-medium text-sm mb-3 block">Style d&apos;affichage</label>
              <div className="grid grid-cols-5 gap-2">
                {SERVICES_VARIANTS.map((variant) => {
                  const isDisabled = variant.id === 'Désactivé';
                  const isSelected = isDisabled
                    ? !isServicesActive
                    : isServicesActive && servicesVariant === variant.id;

                  return (
                    <button
                      type="button" key={variant.id}
                      onClick={() => {
                        if (isDisabled) {
                          onConfigUpdate('showServices', false);
                        } else {
                          onConfigUpdateMultiple({ showServices: true, servicesVariant: variant.id });
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${variant.color} text-white shadow-lg`
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl mb-1">{variant.emoji}</span>
                      <span className="text-xs">{variant.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
              <Briefcase className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-blue-300 text-sm">
                Décrivez vos services avec des icônes, tarifs et points clés.
              </p>
            </div>
            <ContentList 
              items={services} 
              type="services"
              isLoading={loading.services}
              onRefresh={() => fetchContent('services')}
            />
          </>
        )}
      </AccordionWithToggle>

      {/* Grille de blocs avancée */}
      <div className="border border-white/10 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setGridBlocksExpanded(!gridBlocksExpanded)}
          className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <span className="text-white font-medium">Grille de blocs (Avancé)</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs">
              Beta
            </span>
          </div>
          {gridBlocksExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {gridBlocksExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4 bg-slate-900/50">
              <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
                <Grid3X3 className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div className="text-violet-300 text-sm">
                  <p className="font-medium mb-1">Mode grille flexible</p>
                  <p className="text-violet-400/80">
                    Construisez votre section avec des blocs personnalisables incluant des animations spéciales.
                  </p>
                </div>
              </div>
              
              <GridBlockManager
                blocks={featuresBlocks}
                onChange={handleBlocksChange}
                onImageUpload={handleBlockImageUpload}
                maxBlocks={12}
              />
            </div>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}

