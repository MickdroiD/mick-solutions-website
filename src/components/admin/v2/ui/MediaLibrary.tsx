'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, FolderOpen, Image as ImageIcon, 
  Trash2, Check, Loader2, Upload, RefreshCw,
  Grid, List, ChevronDown
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AssetItem {
  id: string;
  name: string;
  url: string;
  category: string;
  size: number;
  type: string;
  createdAt: string;
  thumbnail: string;
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
  allowedTypes?: string[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================
// CATEGORY LABELS
// ============================================

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  logos: { label: 'Logos', emoji: '🏷️' },
  branding: { label: 'Branding', emoji: '🎨' },
  hero: { label: 'Hero', emoji: '🦸' },
  gallery: { label: 'Galerie', emoji: '🖼️' },
  portfolio: { label: 'Portfolio', emoji: '💼' },
  general: { label: 'Général', emoji: '📁' },
  seo: { label: 'SEO', emoji: '🔍' },
  ai: { label: 'IA', emoji: '🤖' },
};

// ============================================
// MEDIA LIBRARY COMPONENT
// ============================================

function MediaLibraryComponent({
  isOpen,
  onClose,
  onSelect,
  currentValue,
}: MediaLibraryProps) {
  // État
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Charger les assets
  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/assets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des assets');
      }

      const data = await response.json();
      
      if (data.success) {
        setAssets(data.assets);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('[MediaLibrary] Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Charger au premier rendu et quand les filtres changent
  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, loadAssets]);

  // Sélection
  const handleSelect = useCallback((asset: AssetItem) => {
    setSelectedAsset(asset.url);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    }
  }, [selectedAsset, onSelect, onClose]);

  // Suppression
  const handleDelete = useCallback(async (assetId: string) => {
    if (!confirm('Supprimer cet asset ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(assetId);

    try {
      const response = await fetch('/api/admin/assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Retirer l'asset de la liste
      setAssets(prev => prev.filter(a => a.id !== assetId));
      
      // Désélectionner si c'était l'asset sélectionné
      if (selectedAsset === assets.find(a => a.id === assetId)?.url) {
        setSelectedAsset(null);
      }
    } catch (err) {
      console.error('[MediaLibrary] Delete error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
    } finally {
      setIsDeleting(null);
    }
  }, [assets, selectedAsset]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-slate-800 rounded-2xl border border-white/10 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Bibliothèque média</h2>
                <p className="text-slate-400 text-sm">{assets.length} fichiers disponibles</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-4 shrink-0">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                {selectedCategory 
                  ? CATEGORY_LABELS[selectedCategory]?.label || selectedCategory
                  : 'Toutes catégories'
                }
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl min-w-[180px] hidden group-focus-within:block">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  Toutes catégories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <span>{CATEGORY_LABELS[cat]?.emoji || '📁'}</span>
                    {CATEGORY_LABELS[cat]?.label || cat}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-700/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadAssets}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Category Pills */}
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white'
              }`}
            >
              Tout ({assets.length})
            </button>
            {categories.map(cat => {
              const count = assets.filter(a => a.category === cat).length;
              const catInfo = CATEGORY_LABELS[cat] || { label: cat, emoji: '📁' };
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{catInfo.emoji}</span>
                  {catInfo.label}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">{error}</div>
                <button
                  type="button"
                  onClick={loadAssets}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && assets.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Aucun fichier</h3>
                <p className="text-slate-500 text-sm">
                  Uploadez des images pour les voir ici
                </p>
              </div>
            )}

            {/* Grid View */}
            {!isLoading && !error && assets.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {assets.map(asset => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedAsset === asset.url
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                        : currentValue === asset.url
                        ? 'border-emerald-500'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => handleSelect(asset)}
                  >
                    {/* Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Selected Indicator */}
                    {selectedAsset === asset.url && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Current Value Indicator */}
                    {currentValue === asset.url && selectedAsset !== asset.url && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 rounded-full text-xs text-white">
                        Actuel
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-medium truncate">{asset.name}</p>
                        <p className="text-slate-400 text-xs">{formatFileSize(asset.size)}</p>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(asset.id);
                        }}
                        disabled={isDeleting === asset.id}
                        className="absolute top-2 left-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                      >
                        {isDeleting === asset.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {!isLoading && !error && assets.length > 0 && viewMode === 'list' && (
              <div className="space-y-2">
                {assets.map(asset => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAsset === asset.url
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : currentValue === asset.url
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/5 hover:border-white/20 bg-slate-800/50'
                    }`}
                    onClick={() => handleSelect(asset)}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{asset.name}</p>
                      <p className="text-slate-500 text-sm">
                        {CATEGORY_LABELS[asset.category]?.label || asset.category} • {formatFileSize(asset.size)} • {formatDate(asset.createdAt)}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      {currentValue === asset.url && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                          Actuel
                        </span>
                      )}
                      {selectedAsset === asset.url && (
                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      disabled={isDeleting === asset.id}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      {isDeleting === asset.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between shrink-0">
            <div className="text-slate-500 text-sm">
              {selectedAsset && (
                <span className="text-cyan-400">1 fichier sélectionné</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedAsset}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Sélectionner
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// EXPORT
// ============================================

export const MediaLibrary = memo(MediaLibraryComponent);

