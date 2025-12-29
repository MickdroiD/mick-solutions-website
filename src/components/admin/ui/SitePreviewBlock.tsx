'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, RefreshCw, Monitor, Smartphone, Tablet, ExternalLink, Maximize2, Minimize2, X
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

interface SitePreviewBlockProps {
  /** Timestamp de dernière mise à jour (pour forcer le rafraîchissement) */
  lastUpdate?: number;
  /** Mode de vue : desktop, tablet ou mobile */
  viewMode?: ViewMode;
  /** Callback quand le viewMode change */
  onViewModeChange?: (mode: ViewMode) => void;
  /** URL du site à prévisualiser (par défaut: /) */
  previewUrl?: string;
  /** Hauteur du bloc */
  height?: string | number;
  /** Classes additionnelles */
  className?: string;
  /** Masquer le bloc */
  hidden?: boolean;
}

const VIEWPORT_SIZES: Record<ViewMode, { width: number; height: number; label: string; icon: string }> = {
  desktop: { width: 1440, height: 1600, label: 'Desktop', icon: '🖥️' }, // 🔧 Hauteur augmentée
  tablet: { width: 768, height: 1024, label: 'Tablette', icon: '📱' },
  mobile: { width: 375, height: 812, label: 'Mobile', icon: '📲' },
};

// ============================================
// COMPOSANT
// ============================================

export default function SitePreviewBlock({
  lastUpdate,
  viewMode: externalViewMode,
  onViewModeChange,
  previewUrl = '/',
  height = '100%',
  className = '',
  hidden = false,
}: SitePreviewBlockProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1); // 🧮 Smart Scale dynamique
  const [containerHeight, setContainerHeight] = useState(0); // 📐 Hauteur du conteneur pour calcul précis
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null); // Ref pour la zone de prévisualisation

  // Utiliser le viewMode externe s'il est fourni, sinon interne
  const viewMode = externalViewMode ?? internalViewMode;

  // 🧮 SMART SCALING - Calcul dynamique du scale (version optimisée)
  useEffect(() => {
    if (!previewContainerRef.current) return;

    const updateScaleAndHeight = () => {
      if (!previewContainerRef.current) return;
      
      // Utiliser clientWidth/clientHeight pour la taille visible réelle
      const containerWidth = previewContainerRef.current.clientWidth;
      const currentContainerHeight = previewContainerRef.current.clientHeight;
      const targetWidth = VIEWPORT_SIZES[viewMode].width;
      
      // 🎯 Marge minimale (20px total) pour maximiser l'espace
      const horizontalMargin = 20;
      const availableWidth = containerWidth - horizontalMargin;
      
      // Calcul du scale
      let newScale = availableWidth / targetWidth;
      
      // Plafond à 1 (pas de zoom pixelisé)
      if (newScale > 1) newScale = 1;
      
      // Sécurité pour éviter division par zéro
      if (newScale <= 0) newScale = 0.1;
      
      setScale(newScale);
      setContainerHeight(currentContainerHeight);
    };

    // Calcul initial
    updateScaleAndHeight();

    // 🎯 ResizeObserver avec requestAnimationFrame pour fluidité
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(updateScaleAndHeight);
    });

    resizeObserver.observe(previewContainerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [viewMode, isFullscreen]); // Recalculer si viewMode ou fullscreen change

  // Rafraîchir l'iframe
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  }, []);

  // Rafraîchissement automatique quand lastUpdate change
  useEffect(() => {
    if (lastUpdate !== undefined && lastUpdate > 0) {
      handleRefresh();
    }
  }, [lastUpdate, handleRefresh]);

  // Gestion du changement de vue
  const handleViewModeChange = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // Handler pour le chargement de l'iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  // Gestion du fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Écouter les changements de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (hidden) return null;

  const viewportConfig = VIEWPORT_SIZES[viewMode];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex flex-col bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* ========== BARRE D'OUTILS ========== */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-white/10 shrink-0">
        {/* Titre + Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium text-sm">Aperçu</span>
          </div>
          {isLoading && (
            <span className="flex items-center gap-1.5 text-amber-400 text-xs">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Chargement...
            </span>
          )}
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-1.5">
          {/* Switch Desktop/Tablet/Mobile */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 mr-2">
            <button
              type="button"
              onClick={() => handleViewModeChange('desktop')}
              title="Vue Desktop (1440px)"
              className={`p-2 rounded-md transition-all ${
                viewMode === 'desktop'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('tablet')}
              title="Vue Tablette (768px)"
              className={`p-2 rounded-md transition-all ${
                viewMode === 'tablet'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('mobile')}
              title="Vue Mobile (375px)"
              className={`p-2 rounded-md transition-all ${
                viewMode === 'mobile'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Bouton Rafraîchir */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Rafraîchir l'aperçu"
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bouton Plein écran */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Bouton Ouvrir dans un nouvel onglet */}
          <button
            type="button"
            onClick={openInNewTab}
            title="Ouvrir dans un nouvel onglet"
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Bouton Fermer (seulement en fullscreen) */}
          {isFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Fermer"
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========== CONTAINER IFRAME ========== */}
      {/* 🎯 FIXED V3: overflow-auto permet le scroll, flex-1 remplit l'espace */}
      <div 
        ref={previewContainerRef}
        className="flex-1 w-full relative bg-slate-950 overflow-auto flex justify-center pt-3"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-slate-400 text-sm">Chargement de l&apos;aperçu...</p>
            </div>
          </div>
        )}

        {/* 
          🧮 SMART SCALING V3:
          - Desktop: hauteur calculée pour remplir tout l'espace visible
          - La hauteur après scaling doit = (100vh - 120px - padding)
          - Formule: iframeHeight = visibleHeight / scale
        */}
        {/* 🛠️ WRAPPER IFRAME */}
        <div
          className="bg-white shadow-2xl origin-top flex-shrink-0"
          style={{
            width: `${viewportConfig.width}px`,
            // 🎯 FIXED V3: Pour Desktop, calculer la hauteur pour remplir l'écran
            // visibleHeight = containerHeight, donc iframeHeight = containerHeight / scale
            height: viewMode === 'desktop' && containerHeight > 0 && scale > 0
              ? `${Math.max(2400, (containerHeight - 20) / scale)}px`
              : `${viewportConfig.height}px`,
            transformOrigin: 'top center',
            transform: `scale(${scale})`,
          }}
        >
          <iframe
            ref={iframeRef}
            key={`${viewMode}-${iframeKey}`}
            src={`${previewUrl}?preview=true&_t=${lastUpdate || Date.now()}`}
            title="Aperçu du site"
            className="w-full h-full border-0 block"
            style={{ backgroundColor: '#ffffff' }}
            onLoad={handleIframeLoad}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>

        {/* Badge viewport (en mode mobile/tablet) */}
        {viewMode !== 'desktop' && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 text-xs font-medium backdrop-blur-sm border border-white/10">
            {viewportConfig.icon} {viewportConfig.label} ({viewportConfig.width}px)
          </div>
        )}
      </div>

      {/* ========== FOOTER ========== */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-t border-white/5 text-xs shrink-0">
        <span className="text-slate-500">
          URL: <span className="text-slate-400">{previewUrl}</span>
        </span>
        {lastUpdate && (
          <span className="text-slate-500">
            Mis à jour: <span className="text-emerald-400">{new Date(lastUpdate).toLocaleTimeString('fr-FR')}</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
