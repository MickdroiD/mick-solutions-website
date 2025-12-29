'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, List, Search, Upload, Trash2, Copy, Check, 
  Image as ImageIcon, Loader2, RefreshCw, X, FolderOpen
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size?: number;
  type?: string;
  createdAt?: string;
  thumbnailUrl?: string;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  onClose?: () => void;
  mode?: 'browser' | 'picker';
  selectedUrl?: string;
}

// ============================================
// MEDIA LIBRARY COMPONENT
// ============================================

function MediaLibraryComponent({
  onSelect,
  onClose,
  mode = 'browser',
  selectedUrl,
}: MediaLibraryProps) {
  // État
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(selectedUrl || null);

  // ========== FETCH MEDIA ==========
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simuler un fetch depuis une API ou Baserow
      // Pour l'instant, on récupère les images depuis le localStorage ou une liste statique
      const stored = localStorage.getItem('mediaLibrary');
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        // Liste vide par défaut
        setItems([]);
      }
    } catch (err) {
      console.error('[MediaLibrary] Fetch error:', err);
      setError('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // ========== UPLOAD ==========
  const handleUpload = useCallback(async (file: File) => {
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'media-library');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (data.success) {
        const newItem: MediaItem = {
          id: `media_${Date.now()}`,
          url: data.url || data.logoUrl,
          name: data.fileName || file.name,
          size: file.size,
          type: file.type,
          createdAt: new Date().toISOString(),
        };

        const updatedItems = [newItem, ...items];
        setItems(updatedItems);
        localStorage.setItem('mediaLibrary', JSON.stringify(updatedItems));

        // Auto-select le nouveau fichier en mode picker
        if (mode === 'picker') {
          setSelectedItem(newItem.url);
        }
      }
    } catch (err) {
      console.error('[MediaLibrary] Upload error:', err);
      setError(err instanceof Error ? err.message : 'Erreur upload');
    } finally {
      setUploadingFile(false);
    }
  }, [items, mode]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  }, [handleUpload]);

  // ========== DELETE ==========
  const handleDelete = useCallback((itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem('mediaLibrary', JSON.stringify(updatedItems));
  }, [items]);

  // ========== COPY URL ==========
  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      console.error('[MediaLibrary] Copy failed');
    }
  }, []);

  // ========== SELECT (Picker mode) ==========
  const handleSelect = useCallback((url: string) => {
    setSelectedItem(url);
    if (mode === 'picker' && onSelect) {
      // Ne pas appeler immédiatement, attendre confirmation
    }
  }, [mode, onSelect]);

  const confirmSelection = useCallback(() => {
    if (selectedItem && onSelect) {
      onSelect(selectedItem);
      onClose?.();
    }
  }, [selectedItem, onSelect, onClose]);

  // ========== FILTER ==========
  const filteredItems = searchQuery
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  // ========== RENDER ==========
  return (
    <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Médiathèque</h2>
            <p className="text-slate-400 text-sm">{items.length} fichier{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Button */}
        <label className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors">
          {uploadingFile ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Upload
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploadingFile}
            className="hidden"
          />
        </label>

        {/* Refresh */}
        <button
          type="button"
          onClick={fetchMedia}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <p className="text-slate-400">Chargement...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-white font-medium mb-1">Aucun média</p>
            <p className="text-slate-400 text-sm mb-4">
              {searchQuery ? 'Aucun résultat pour cette recherche' : 'Uploadez votre première image'}
            </p>
            {!searchQuery && (
              <label className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Upload une image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleSelect(item.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedItem === item.url
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item.url);
                          }}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                        >
                          {copiedUrl === item.url ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="p-1.5 bg-red-500/30 hover:bg-red-500/50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-300" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {selectedItem === item.url && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => handleSelect(item.url)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedItem === item.url
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : 'bg-slate-800/50 border border-white/5 hover:bg-slate-800'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-slate-500 text-xs truncate">{item.url}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item.url);
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer (Picker mode) */}
      {mode === 'picker' && (
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={confirmSelection}
            disabled={!selectedItem}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
          >
            Sélectionner
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const MediaLibrary = memo(MediaLibraryComponent);

