'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Image as ImageIcon, Sparkles,
  Plus, Trash2, FolderOpen, RefreshCw, ExternalLink, Upload
} from 'lucide-react';
import { AccordionWithToggle } from '../ui/AccordionWithToggle';
import { AccordionSection } from '../ui/AccordionSection';

// ============================================
// TYPES
// ============================================

interface MediaSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onConfigUpdateMultiple: (updates: Record<string, unknown>) => void;
  onOpenAIModal: (context: { sectionKey: string; variantKey: string; showKey: string }) => void;
}

interface MediaItem {
  id: number;
  Titre?: string;
  Image?: Array<{ url: string; thumbnails?: { small?: { url: string } } }>;
  [key: string]: unknown;
}

interface ProjectItem {
  id: number;
  Nom?: string;
  name?: string; // Mapped field
  'Description courte'?: string;
  description?: string; // Mapped field
  'Image de couverture'?: Array<{ url: string; thumbnails?: { small?: { url: string } } }>;
  coverImage?: string; // Mapped field
  coverImage_full?: Array<{ url: string; thumbnails?: { small?: { url: string } } }>;
  Statut?: { id?: number; value?: string; color?: string };
  status?: string; // Mapped value
  status_raw?: { id?: number; value?: string; color?: string };
  [key: string]: unknown;
}

// ============================================
// VARIANTES
// ============================================

const GALLERY_VARIANTS = [
  { id: 'Désactivé', label: 'Off', emoji: '🚫', color: 'bg-slate-500/20 border-slate-500' },
  { id: 'Grid', label: 'Grille', emoji: '📊', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'Slider', label: 'Slider', emoji: '↔️', color: 'bg-cyan-500/20 border-cyan-500' },
  { id: 'Masonry', label: 'Masonry', emoji: '🧱', color: 'bg-violet-500/20 border-violet-500' },
];

// ============================================
// COMPOSANT
// ============================================

export default function MediaSection({
  config,
  options,
  onConfigUpdate,
  onConfigUpdateMultiple,
  onOpenAIModal,
}: MediaSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionSection/AccordionWithToggle
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState({ gallery: false, projects: false });

  const isGalleryActive = config.showGallery === true;
  const isPortfolioActive = config.showPortfolio === true;
  const galleryVariant = String(config.galleryVariant || 'Grid');

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchContent = useCallback(async (type: 'gallery' | 'projects') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`/api/admin/content?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (type === 'gallery') {
          setGallery(data.items || []);
        } else {
          setProjects(data.items || []);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    fetchContent('gallery');
    fetchContent('projects');
  }, [fetchContent]);

  // ============================================
  // RENDER HELPERS
  // ============================================

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

  // ============================================
  // GALLERY GRID
  // ============================================

  const GalleryGrid = ({ 
    items,
    isLoading,
    onRefresh 
  }: { 
    items: MediaItem[];
    isLoading: boolean;
    onRefresh: () => void;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">{items.length} image(s)</span>
        <div className="flex items-center gap-2">
          <button
           type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
           type="button"
            onClick={() => onOpenAIModal({ sectionKey: 'gallery', variantKey: 'image', showKey: 'showGallery' })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm hover:bg-violet-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Générer
          </button>
          <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-all">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Aucune image dans la galerie</p>
          <div className="flex justify-center gap-2">
            <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-all text-sm">
              <Upload className="w-4 h-4" />
              Uploader
            </button>
            <button
             type="button"
              onClick={() => onOpenAIModal({ sectionKey: 'gallery', variantKey: 'image', showKey: 'showGallery' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Générer avec l&apos;IA
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const imageUrl = item.Image?.[0]?.thumbnails?.small?.url || item.Image?.[0]?.url;
            return (
              <div
                key={item.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/10 hover:border-cyan-500/50 transition-all"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.Titre || 'Image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium truncate">{item.Titre || 'Sans titre'}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button type="button" className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ============================================
  // PROJECTS LIST (Editable)
  // ============================================

  const ProjectsList = ({ 
    items,
    isLoading,
    onRefresh 
  }: { 
    items: ProjectItem[];
    isLoading: boolean;
    onRefresh: () => void;
  }) => {
    // État local pour l'édition - 🔒 PRIORITAIRE sur les données serveur
    const [editingProjects, setEditingProjects] = useState<Record<number, { name: string; description: string; isDirty: boolean }>>({});
    const [savingProject, setSavingProject] = useState<number | null>(null);
    
    // 🔒 REF pour tracker TOUS les items en cours d'édition
    const activeEditingRef = useRef<Set<number>>(new Set());
    
    // 🔒 REF pour garder une copie des données locales pendant la sauvegarde
    const pendingSaveRef = useRef<Record<number, { name: string; description: string }>>({});

    // ✅ FIX COMPLET: Ne JAMAIS écraser un item qui est "dirty" ou en cours de sauvegarde
    useEffect(() => {
      setEditingProjects(prev => {
        const newState = { ...prev };
        items.forEach(item => {
          const existing = prev[item.id];
          const isBeingEdited = activeEditingRef.current.has(item.id);
          const hasPendingSave = pendingSaveRef.current[item.id] !== undefined;
          const isDirty = existing?.isDirty === true;
          
          // Ne JAMAIS écraser si:
          // 1. L'item est actuellement édité (focus actif)
          // 2. Une sauvegarde est en cours pour cet item
          // 3. L'item a été modifié mais pas encore sauvegardé (isDirty)
          if (isBeingEdited || hasPendingSave || isDirty) {
            return; // Garder l'état local tel quel
          }
          
          // Sinon, synchroniser avec les données serveur
          newState[item.id] = {
            name: item.Nom || item.name || '',
            description: item['Description courte'] || item.description || '',
            isDirty: false,
          };
        });
        return newState;
      });
    }, [items]);

    // Handler pour mettre à jour le state local - marque comme "dirty"
    const handleProjectChange = (id: number, field: 'name' | 'description', value: string) => {
      activeEditingRef.current.add(id);
      setEditingProjects(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: value, isDirty: true }
      }));
    };

    // Handler pour le focus - marque comme en édition
    const handleFieldFocus = (id: number) => {
      activeEditingRef.current.add(id);
    };

    // Handler pour marquer la fin de l'édition
    const handleFieldBlur = (id: number) => {
      // Ne pas retirer immédiatement pour permettre la sauvegarde
      setTimeout(() => {
        activeEditingRef.current.delete(id);
      }, 500);
    };

    // Handler pour sauvegarder un projet - avec protection optimiste
    const handleSaveProject = async (id: number) => {
      const projectData = editingProjects[id];
      if (!projectData) {
        console.warn('[Projects] No data to save for id:', id);
        return;
      }

      // 🔒 Garder une copie des données AVANT la sauvegarde
      pendingSaveRef.current[id] = { name: projectData.name, description: projectData.description };
      
      setSavingProject(id);
      try {
        console.log('[Projects] Saving:', id, projectData);
        const res = await fetch('/api/admin/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'projects',
            id,
            data: {
              Nom: projectData.name,
              'Description courte': projectData.description,
            }
          }),
        });
        
        if (res.ok) {
          console.log('[Projects] Saved successfully:', id);
          // ✅ Marquer comme non-dirty seulement après succès
          setEditingProjects(prev => ({
            ...prev,
            [id]: { ...prev[id], isDirty: false }
          }));
        } else {
          console.error('[Projects] Save failed:', await res.text());
        }
      } catch (error) {
        console.error('[Projects] Save error:', error);
      } finally {
        setSavingProject(null);
        // 🔒 Nettoyer la ref après un délai (laisser le temps au re-render)
        setTimeout(() => {
          delete pendingSaveRef.current[id];
        }, 1000);
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">{items.length} projet(s)</span>
          <div className="flex items-center gap-2">
<button
           type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-all">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
            <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Aucun projet dans le portfolio</p>
            <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-all text-sm mx-auto">
              <Plus className="w-4 h-4" />
              Créer un projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => {
              // Essayer plusieurs sources pour l'image
              const imageFromCover = item['Image de couverture']?.[0];
              const imageFromCoverFull = item.coverImage_full?.[0];
              const imageUrl = imageFromCover?.thumbnails?.small?.url 
                || imageFromCover?.url 
                || imageFromCoverFull?.thumbnails?.small?.url 
                || imageFromCoverFull?.url
                || item.coverImage;
              
              // Essayer plusieurs sources pour le statut
              const statusValue = item.Statut?.value || item.status || item.status_raw?.value;
              const isPublished = statusValue === 'Publié';
              
              // Valeurs éditables
              const editData = editingProjects[item.id] || { name: '', description: '' };
              const isSaving = savingProject === item.id;
              
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-slate-800/50 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all"
                >
                  {/* Image thumbnail */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={editData.name || 'Project'}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  
                    {/* Editable fields - avec gestion locale PRIORITAIRE */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editData.name}
                        onFocus={() => handleFieldFocus(item.id)}
                        onChange={(e) => handleProjectChange(item.id, 'name', e.target.value)}
                        onBlur={() => {
                          handleFieldBlur(item.id);
                          handleSaveProject(item.id);
                        }}
                        placeholder="Titre du projet"
                        className="flex-1 px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg text-white font-medium focus:outline-none focus:border-cyan-500 transition-all"
                      />
                      <span className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                        isPublished 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {statusValue || 'Brouillon'}
                      </span>
                    </div>
                    
                    <textarea
                      value={editData.description}
                      onFocus={() => handleFieldFocus(item.id)}
                      onChange={(e) => handleProjectChange(item.id, 'description', e.target.value)}
                      onBlur={() => {
                        handleFieldBlur(item.id);
                        handleSaveProject(item.id);
                      }}
                      placeholder="Description courte du projet..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-cyan-500 transition-all resize-none"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button type="button" className="p-1.5 rounded-lg bg-slate-700 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button type="button" className="p-1.5 rounded-lg bg-slate-700 text-red-400 hover:bg-red-500/20 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {isSaving && (
                        <span className="flex items-center gap-1 text-cyan-400 text-xs">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Sauvegarde...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // IMAGES ACTUELLEMENT UTILISÉES
  // ============================================

  const UsedImages = () => {
    const usedImages = [
      { key: 'logoUrl', label: 'Logo principal', value: config.logoUrl },
      { key: 'logoDarkUrl', label: 'Logo sombre', value: config.logoDarkUrl },
      { key: 'faviconUrl', label: 'Favicon', value: config.faviconUrl },
      { key: 'ogImageUrl', label: 'Image OG', value: config.ogImageUrl },
      { key: 'heroBackgroundUrl', label: 'Hero Background', value: config.heroBackgroundUrl },
    ].filter(img => img.value);

    return (
      <div className="space-y-3">
        <p className="text-slate-400 text-sm">Images actuellement assignées :</p>
        {usedImages.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Aucune image configurée</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {usedImages.map((img) => (
              <div key={img.key} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                  <Image
                    src={String(img.value)}
                    alt={img.label}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
                <span className="absolute bottom-1 left-1 right-1 text-center text-xs bg-black/70 text-white rounded px-1 py-0.5 truncate">
                  {img.label}
                </span>
              </div>
            ))}
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
      <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🖼️ Médias & Portfolio</h2>
            <p className="text-slate-400">Galerie d&apos;images, projets et médiathèque</p>
          </div>
        </div>
      </div>

      {/* Section Galerie */}
      <AccordionWithToggle
        id="gallery"
        title="Galerie d'images"
        emoji="🖼️"
        isActive={isGalleryActive}
        onToggle={() => onConfigUpdate('showGallery', !isGalleryActive)}
      >
        {isGalleryActive && (
          <>
            {/* Variante de style */}
            <div className="mb-4">
              <label className="text-white font-medium text-sm mb-3 block">Style d&apos;affichage</label>
              <div className="grid grid-cols-4 gap-2">
                {GALLERY_VARIANTS.map((variant) => {
                  const isDisabled = variant.id === 'Désactivé';
                  const isSelected = isDisabled
                    ? !isGalleryActive
                    : isGalleryActive && galleryVariant === variant.id;

                  return (
                    <button
                     type="button"
                      key={variant.id}
                      onClick={() => {
                        if (isDisabled) {
                          onConfigUpdate('showGallery', false);
                        } else {
                          onConfigUpdateMultiple({ showGallery: true, galleryVariant: variant.id });
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

            <div className="grid grid-cols-2 gap-4 mb-4">
              {renderSelect('galleryColumns', 'Colonnes', options.galleryColumns || ['2', '3', '4', 'Auto'])}
              {renderSelect('galleryAnimation', 'Animation', options.galleryAnimation || ['None', 'Fade', 'Slide', 'Zoom'])}
            </div>

            <GalleryGrid 
              items={gallery}
              isLoading={loading.gallery}
              onRefresh={() => fetchContent('gallery')}
            />
          </>
        )}
      </AccordionWithToggle>

      {/* Section Portfolio */}
      <AccordionWithToggle
        id="portfolio"
        title="Portfolio / Projets"
        emoji="📁"
        isActive={isPortfolioActive}
        onToggle={() => onConfigUpdate('showPortfolio', !isPortfolioActive)}
      >
        {isPortfolioActive && (
          <ProjectsList 
            items={projects}
            isLoading={loading.projects}
            onRefresh={() => fetchContent('projects')}
          />
        )}
      </AccordionWithToggle>

      {/* Section Médiathèque */}
      <AccordionSection
        id="mediaLibrary"
        title="Images utilisées sur le site"
        emoji="📷"
      >
        <UsedImages />
      </AccordionSection>
    </motion.div>
  );
}

