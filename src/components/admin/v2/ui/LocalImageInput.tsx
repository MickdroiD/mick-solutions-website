'use client';

import { useState, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, RefreshCw, Image as ImageIcon, 
  Loader2, CheckCircle, AlertCircle, Sparkles, FolderOpen
} from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';

// ============================================
// TYPES
// ============================================

interface LocalImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
  category?: string;
  fieldKey?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'free';
  maxSizeMB?: number;
  showMagicBadge?: boolean;
}

interface UploadResponse {
  success: true;
  url?: string;
  isMagicUpload?: boolean;
  logoUrl?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  message?: string;
  fileName?: string;
  converted?: boolean;
}

interface MagicUploadResult {
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
}

// ============================================
// CONSTANTS
// ============================================

const ASPECT_RATIOS = {
  square: 'aspect-square',
  video: 'aspect-video',
  banner: 'aspect-[3/1]',
  free: 'aspect-auto min-h-[200px]',
};

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/avif',
  'image/x-icon',
];

// ============================================
// LOCAL IMAGE INPUT COMPONENT
// ============================================

function LocalImageInputComponent({
  value,
  onChange,
  label,
  hint,
  category = 'general',
  fieldKey = '',
  aspectRatio = 'video',
  maxSizeMB = 10,
  showMagicBadge = false,
}: LocalImageInputProps) {
  // État
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [magicResult, setMagicResult] = useState<MagicUploadResult | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // ========== UPLOAD LOGIC ==========
  const uploadFile = useCallback(async (file: File) => {
    // Validation
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(svg|heic|avif|ico)$/i)) {
      setErrorMessage('Format non supporté. Utilisez PNG, JPG, SVG, WebP, GIF, HEIC, AVIF ou ICO.');
      setUploadProgress('error');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`Fichier trop volumineux (max ${maxSizeMB}MB)`);
      setUploadProgress('error');
      return;
    }

    setIsUploading(true);
    setUploadProgress('uploading');
    setErrorMessage('');
    setMagicResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('fieldKey', fieldKey);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const data: UploadResponse = await response.json();

      if (data.success) {
        setUploadProgress('success');

        // Gérer Magic Upload (logo → favicon + OG)
        if (data.isMagicUpload && data.logoUrl) {
          setMagicResult({
            logoUrl: data.logoUrl,
            faviconUrl: data.faviconUrl || '',
            ogImageUrl: data.ogImageUrl || '',
          });
          onChange(data.logoUrl);
        } else if (data.url) {
          onChange(data.url);
        }

        // Reset après 2s
        setTimeout(() => setUploadProgress('idle'), 2000);
      }
    } catch (error) {
      console.error('[LocalImageInput] Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
      setUploadProgress('error');
    } finally {
      setIsUploading(false);
    }
  }, [category, fieldKey, maxSizeMB, onChange]);

  // ========== DRAG & DROP ==========
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  // ========== FILE INPUT ==========
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input pour permettre le même fichier
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [uploadFile]);

  const triggerFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // ========== ACTIONS ==========
  const handleRemove = useCallback(() => {
    onChange('');
    setMagicResult(null);
    setErrorMessage('');
    setUploadProgress('idle');
  }, [onChange]);

  const handleReplace = useCallback(() => {
    triggerFileSelect();
  }, [triggerFileSelect]);

  // ========== RENDER ==========
  const hasValue = Boolean(value);
  const aspectClass = ASPECT_RATIOS[aspectRatio];

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-white font-medium text-sm flex items-center gap-2">
          {label}
          {showMagicBadge && fieldKey === 'logoUrl' && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/30 to-purple-500/30 text-violet-300 text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Magic Upload
            </span>
          )}
        </label>
        {/* Bouton Bibliothèque */}
        <button
          type="button"
          onClick={() => setShowMediaLibrary(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700/50 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all text-xs"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Bibliothèque
        </button>
      </div>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Zone / Preview */}
      <AnimatePresence mode="wait">
        {hasValue ? (
          // ========== PREVIEW MODE ==========
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative ${aspectClass} rounded-xl overflow-hidden border-2 border-white/10 group`}
          >
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.svg';
              }}
            />

            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReplace}
                  disabled={isUploading}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Remplacer
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Upload indicator overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm">Upload en cours...</p>
                </div>
              </div>
            )}

            {/* Success indicator */}
            {uploadProgress === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full"
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
            )}
          </motion.div>
        ) : (
          // ========== UPLOAD ZONE ==========
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={!isUploading ? triggerFileSelect : undefined}
            className={`
              relative ${aspectClass} rounded-xl border-2 border-dashed 
              ${isDragging 
                ? 'border-cyan-500 bg-cyan-500/10' 
                : 'border-white/20 hover:border-cyan-500/50 bg-slate-800/50 hover:bg-slate-800/80'
              }
              transition-all duration-200 cursor-pointer
              flex flex-col items-center justify-center gap-3 p-6
              ${isUploading ? 'pointer-events-none' : ''}
            `}
          >
            {isUploading ? (
              // Uploading state
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-white font-medium">Upload en cours...</p>
                <p className="text-slate-400 text-sm mt-1">Patientez...</p>
              </div>
            ) : isDragging ? (
              // Dragging state
              <div className="text-center">
                <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-bounce" />
                <p className="text-cyan-400 font-medium">Déposez l&apos;image ici</p>
              </div>
            ) : (
              // Default state
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-7 h-7 text-cyan-400" />
                </div>
                <p className="text-white font-medium">Glissez-déposez une image</p>
                <p className="text-slate-400 text-sm mt-1">ou cliquez pour parcourir</p>
                <p className="text-slate-500 text-xs mt-3">
                  PNG, JPG, SVG, WebP • Max {maxSizeMB}MB
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {uploadProgress === 'error' && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Magic Upload Results */}
      {magicResult && (magicResult.faviconUrl || magicResult.ogImageUrl) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-violet-300 font-medium">
            <Sparkles className="w-4 h-4" />
            Magic Upload généré automatiquement :
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            {magicResult.faviconUrl && (
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={magicResult.faviconUrl} 
                  alt="Favicon" 
                  className="w-6 h-6 rounded"
                />
                <span className="text-slate-300">Favicon (32×32)</span>
              </div>
            )}
            {magicResult.ogImageUrl && (
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={magicResult.ogImageUrl} 
                  alt="OG Image" 
                  className="w-10 h-6 rounded object-cover"
                />
                <span className="text-slate-300">OG Image</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* URL Text Input (fallback) */}
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ou collez une URL directement..."
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(url) => {
          onChange(url);
          setShowMediaLibrary(false);
        }}
        currentValue={value}
      />
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export const LocalImageInput = memo(LocalImageInputComponent);

