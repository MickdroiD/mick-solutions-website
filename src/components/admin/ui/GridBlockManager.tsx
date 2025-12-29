'use client';

import { useState, useCallback, CSSProperties } from 'react';
import { motion, AnimatePresence, Reorder, Transition, TargetAndTransition, Easing } from 'framer-motion';
import Image from 'next/image';
import {
  GripVertical, Plus, Trash2, Image as ImageIcon, Type, Circle, Square,
  Sparkles, RotateCw, Zap, Heart, ChevronDown, Upload, Link2, X
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type BlockWidth = 1 | 2 | 4;
export type BlockType = 'image' | 'logo' | 'icon' | 'shape' | 'text';
export type BlockAnimation = 'none' | 'fade' | 'bounce' | 'rotate' | 'lightning_circle' | 'pulse' | 'float' | 'shake';

export interface GridBlock {
  id: string;
  width: BlockWidth;
  type: BlockType;
  animation: BlockAnimation;
  content: string;
  // Options additionnelles
  shapeType?: 'square' | 'circle' | 'rounded';
  iconName?: string;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

interface GridBlockManagerProps {
  blocks: GridBlock[];
  onChange: (blocks: GridBlock[]) => void;
  onImageUpload?: (blockId: string, file: File) => void;
  maxBlocks?: number;
  className?: string;
}

// ============================================
// CONSTANTES
// ============================================

const WIDTH_OPTIONS: { value: BlockWidth; label: string; icon: string }[] = [
  { value: 1, label: '25%', icon: '▪' },
  { value: 2, label: '50%', icon: '▬' },
  { value: 4, label: '100%', icon: '█' },
];

const TYPE_OPTIONS: { value: BlockType; label: string; Icon: React.ElementType }[] = [
  { value: 'image', label: 'Image', Icon: ImageIcon },
  { value: 'logo', label: 'Logo', Icon: Sparkles },
  { value: 'icon', label: 'Icône', Icon: Zap },
  { value: 'shape', label: 'Forme', Icon: Circle },
  { value: 'text', label: 'Texte', Icon: Type },
];

const ANIMATION_OPTIONS: { value: BlockAnimation; label: string; Icon: React.ElementType; description: string }[] = [
  { value: 'none', label: 'Aucune', Icon: X, description: 'Pas d\'animation' },
  { value: 'fade', label: 'Fondu', Icon: Circle, description: 'Apparition en fondu' },
  { value: 'bounce', label: 'Rebond', Icon: Heart, description: 'Effet de rebond' },
  { value: 'rotate', label: 'Rotation', Icon: RotateCw, description: 'Rotation continue' },
  { value: 'lightning_circle', label: 'Cercle Éclairs', Icon: Zap, description: 'Effet électrique circulaire' },
  { value: 'pulse', label: 'Pulsation', Icon: Heart, description: 'Pulsation douce' },
  { value: 'float', label: 'Flottant', Icon: Sparkles, description: 'Mouvement flottant' },
  { value: 'shake', label: 'Tremblement', Icon: Zap, description: 'Tremblement léger' },
];

const SHAPE_OPTIONS = [
  { value: 'square', label: 'Carré', Icon: Square },
  { value: 'circle', label: 'Rond', Icon: Circle },
  { value: 'rounded', label: 'Arrondi', Icon: Square },
];

// ============================================
// HELPERS
// ============================================

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface AnimationVariant {
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
  style?: CSSProperties;
}

const getAnimationVariants = (animation: BlockAnimation): AnimationVariant => {
  const linear: Easing = 'linear';
  const easeInOut: Easing = 'easeInOut';
  
  switch (animation) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 }
      };
    case 'bounce':
      return {
        animate: { y: [0, -10, 0] },
        transition: { duration: 1, repeat: Infinity }
      };
    case 'rotate':
      return {
        animate: { rotate: 360 },
        transition: { duration: 3, repeat: Infinity, ease: linear }
      };
    case 'pulse':
      return {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity }
      };
    case 'float':
      return {
        animate: { y: [0, -8, 0], x: [0, 3, 0] },
        transition: { duration: 3, repeat: Infinity, ease: easeInOut }
      };
    case 'shake':
      return {
        animate: { x: [-2, 2, -2, 2, 0] },
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
      };
    case 'lightning_circle':
      return {
        animate: { 
          boxShadow: [
            '0 0 0 0 rgba(34, 211, 238, 0)',
            '0 0 20px 10px rgba(34, 211, 238, 0.4)',
            '0 0 40px 20px rgba(168, 139, 250, 0.3)',
            '0 0 20px 10px rgba(34, 211, 238, 0.4)',
            '0 0 0 0 rgba(34, 211, 238, 0)',
          ]
        },
        transition: { duration: 2, repeat: Infinity }
      };
    default:
      return {};
  }
};

// ============================================
// COMPOSANT BLOC INDIVIDUEL
// ============================================

interface BlockEditorProps {
  block: GridBlock;
  onUpdate: (block: GridBlock) => void;
  onDelete: () => void;
  onImageUpload?: (file: File) => void;
}

function BlockEditor({ block, onUpdate, onDelete, onImageUpload }: BlockEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');

  const handleUpdate = (key: keyof GridBlock, value: unknown) => {
    onUpdate({ ...block, [key]: value });
  };

  const animationProps = getAnimationVariants(block.animation);

  return (
    <motion.div
      layout
      className={`relative bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden group
        ${block.width === 1 ? 'col-span-1' : block.width === 2 ? 'col-span-2' : 'col-span-4'}`}
    >
      {/* Header du bloc */}
      <div className="flex items-center justify-between p-3 bg-slate-800/80 border-b border-white/5">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
          <span className="text-white text-sm font-medium capitalize">{block.type}</span>
          {block.animation !== 'none' && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
              {ANIMATION_OPTIONS.find(a => a.value === block.animation)?.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prévisualisation du contenu avec animations */}
      <div className="p-4 min-h-[100px] flex items-center justify-center relative overflow-hidden">
        {/* Effet Lightning Circle - SVG animé */}
        {block.animation === 'lightning_circle' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-24 h-24 rounded-full border-2 border-cyan-400/50"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(34, 211, 238, 0)',
                  '0 0 20px 10px rgba(34, 211, 238, 0.4)',
                  '0 0 40px 20px rgba(168, 139, 250, 0.3)',
                  '0 0 20px 10px rgba(34, 211, 238, 0.4)',
                  '0 0 0 0 rgba(34, 211, 238, 0)',
                ],
                scale: [1, 1.05, 1.1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
        
        <motion.div 
          className="w-full h-full flex items-center justify-center relative z-10"
          initial={animationProps.initial}
          animate={animationProps.animate}
          transition={animationProps.transition}
        >
          {block.type === 'image' || block.type === 'logo' ? (
            block.content ? (
              <Image 
                src={block.content} 
                alt="" 
                width={200} 
                height={100} 
                className="max-h-24 object-contain rounded-lg"
                unoptimized
              />
            ) : (
              <div className="text-slate-500 text-sm flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8" />
                <span>Aucune image</span>
              </div>
            )
          ) : block.type === 'text' ? (
            <p className={`text-white ${
              block.textSize === 'sm' ? 'text-sm' :
              block.textSize === 'lg' ? 'text-lg' :
              block.textSize === 'xl' ? 'text-2xl' : 'text-base'
            }`}>
              {block.content || 'Texte...'}
            </p>
          ) : block.type === 'shape' ? (
            <motion.div 
              className={`w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-500 ${
                block.shapeType === 'circle' ? 'rounded-full' :
                block.shapeType === 'rounded' ? 'rounded-2xl' : 'rounded-none'
              }`}
              animate={block.animation === 'lightning_circle' ? {
                boxShadow: [
                  '0 0 10px rgba(34, 211, 238, 0.3)',
                  '0 0 30px rgba(34, 211, 238, 0.6)',
                  '0 0 10px rgba(168, 139, 250, 0.3)',
                  '0 0 30px rgba(168, 139, 250, 0.6)',
                  '0 0 10px rgba(34, 211, 238, 0.3)',
                ],
              } : undefined}
              transition={block.animation === 'lightning_circle' ? { duration: 2, repeat: Infinity } : undefined}
            />
          ) : block.type === 'icon' ? (
            <Zap className="w-12 h-12 text-cyan-400" />
          ) : null}
        </motion.div>
      </div>

      {/* Options étendues */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 p-4 space-y-4 bg-slate-900/50"
          >
            {/* Sélecteur de largeur */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Largeur</label>
              <div className="flex gap-2">
                {WIDTH_OPTIONS.map(opt => (
                  <button type="button"
                    key={opt.value}
                    onClick={() => handleUpdate('width', opt.value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      block.width === opt.value
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur de type */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Type</label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map(opt => (
                  <button type="button"
                    key={opt.value}
                    onClick={() => handleUpdate('type', opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      block.type === opt.value
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <opt.Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur d'animation */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Animation</label>
              <div className="grid grid-cols-4 gap-2">
                {ANIMATION_OPTIONS.map(opt => (
                  <button type="button"
                    key={opt.value}
                    onClick={() => handleUpdate('animation', opt.value)}
                    title={opt.description}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all ${
                      block.animation === opt.value
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <opt.Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu selon le type */}
            {(block.type === 'image' || block.type === 'logo') && (
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Image</label>
                <div className="flex gap-2 mb-2">
                  <button type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      uploadMode === 'upload' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-1" /> Upload
                  </button>
                  <button type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      uploadMode === 'url' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Link2 className="w-4 h-4 inline mr-1" /> URL
                  </button>
                </div>
                {uploadMode === 'upload' ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onImageUpload) onImageUpload(file);
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                  />
                ) : (
                  <input
                    type="url"
                    value={block.content}
                    onChange={(e) => handleUpdate('content', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                  />
                )}
              </div>
            )}

            {block.type === 'text' && (
              <>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Texte</label>
                  <textarea
                    value={block.content}
                    onChange={(e) => handleUpdate('content', e.target.value)}
                    placeholder="Votre texte..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Taille</label>
                  <div className="flex gap-2">
                    {['sm', 'md', 'lg', 'xl'].map(size => (
                      <button type="button"
                        key={size}
                        onClick={() => handleUpdate('textSize', size)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          block.textSize === size
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {block.type === 'shape' && (
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Forme</label>
                <div className="flex gap-2">
                  {SHAPE_OPTIONS.map(opt => (
                    <button type="button"
                      key={opt.value}
                      onClick={() => handleUpdate('shapeType', opt.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        block.shapeType === opt.value
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <opt.Icon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function GridBlockManager({
  blocks,
  onChange,
  onImageUpload,
  maxBlocks = 12,
  className = '',
}: GridBlockManagerProps) {
  const handleAddBlock = useCallback(() => {
    if (blocks.length >= maxBlocks) return;
    
    const newBlock: GridBlock = {
      id: generateId(),
      width: 2,
      type: 'image',
      animation: 'none',
      content: '',
      shapeType: 'rounded',
      textSize: 'md',
    };
    
    onChange([...blocks, newBlock]);
  }, [blocks, maxBlocks, onChange]);

  const handleUpdateBlock = useCallback((id: string, updatedBlock: GridBlock) => {
    onChange(blocks.map(b => b.id === id ? updatedBlock : b));
  }, [blocks, onChange]);

  const handleDeleteBlock = useCallback((id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  }, [blocks, onChange]);

  const handleReorder = useCallback((newOrder: GridBlock[]) => {
    onChange(newOrder);
  }, [onChange]);

  const handleBlockImageUpload = useCallback((blockId: string, file: File) => {
    if (onImageUpload) {
      onImageUpload(blockId, file);
    }
  }, [onImageUpload]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Info sur la grille */}
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-sm">
          <span className="text-white font-medium">{blocks.length}</span> / {maxBlocks} blocs
          <span className="text-slate-600 ml-2">• Grille 4 colonnes</span>
        </div>
        <button type="button"
          onClick={handleAddBlock}
          disabled={blocks.length >= maxBlocks}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            blocks.length >= maxBlocks
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
          }`}
        >
          <Plus className="w-4 h-4" />
          Ajouter un bloc
        </button>
      </div>

      {/* Grille de blocs avec drag & drop */}
      {blocks.length === 0 ? (
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center">
          <div className="text-slate-500 mb-4">
            <Square className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-white font-medium mb-1">Aucun bloc</p>
            <p className="text-sm">Ajoutez des blocs pour construire votre mise en page</p>
          </div>
          <button type="button"
            onClick={handleAddBlock}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-all"
          >
            <Plus className="w-5 h-5" />
            Créer le premier bloc
          </button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={blocks}
          onReorder={handleReorder}
          className="grid grid-cols-4 gap-4"
        >
          {blocks.map(block => (
            <Reorder.Item key={block.id} value={block} className="contents">
              <BlockEditor
                block={block}
                onUpdate={(updated) => handleUpdateBlock(block.id, updated)}
                onDelete={() => handleDeleteBlock(block.id)}
                onImageUpload={(file) => handleBlockImageUpload(block.id, file)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Aide */}
      <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-sm">
        <Zap className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
        <div className="text-violet-300">
          <p className="font-medium mb-1">Animation &quot;Cercle Éclairs&quot;</p>
          <p className="text-violet-400/80">
            Effet spécial avec des éclairs lumineux autour de l&apos;élément. Idéal pour mettre en valeur un logo ou une image clé.
          </p>
        </div>
      </div>
    </div>
  );
}

