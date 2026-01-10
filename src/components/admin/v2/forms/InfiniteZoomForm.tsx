'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ZoomIn, Type, Palette, ChevronDown, Settings,
    Image as ImageIcon, Volume2, VolumeX, Eye, EyeOff
} from 'lucide-react';
import { LocalInput, LocalTextarea } from '@/components/admin/ui/LocalInput';
import { LocalImageInput } from '@/components/admin/v2/ui/LocalImageInput';
import { ListEditor, type ListItem } from '@/components/admin/v2/ui/ListEditor';
import type { InfiniteZoomSection } from '@/lib/schemas/factory';

// ============================================
// TYPES
// ============================================

interface InfiniteZoomFormProps {
    section: InfiniteZoomSection & { _rowId?: number };
    onUpdate: (updates: Partial<InfiniteZoomSection>) => void;
}

interface ZoomLayerItem extends ListItem {
    id: string;
    imageUrl: string;
    title: string | null;
    description: string | null;
    focalPointX: number;
    focalPointY: number;
}

// ============================================
// OPTIONS
// ============================================

const VARIANT_OPTIONS = [
    { value: 'fullscreen', label: 'Plein écran', emoji: '🖥️', description: 'Expérience immersive' },
    { value: 'contained', label: 'Contenu', emoji: '📦', description: 'Dans une section' },
    { value: 'hero', label: 'Hero', emoji: '🦸', description: 'Remplace le hero' },
];

const TRANSITION_PRESETS = [
    { value: 400, label: 'Rapide', emoji: '⚡' },
    { value: 800, label: 'Normal', emoji: '🎯' },
    { value: 1200, label: 'Lent', emoji: '🐢' },
    { value: 2000, label: 'Cinématique', emoji: '🎬' },
];

const INTENSITY_PRESETS = [
    { value: 1.5, label: 'Subtil', emoji: '✨' },
    { value: 2.5, label: 'Normal', emoji: '🔍' },
    { value: 3.5, label: 'Intense', emoji: '🚀' },
    { value: 5, label: 'Extrême', emoji: '💥' },
];

// ============================================
// COLLAPSIBLE SECTION
// ============================================

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string;
    color?: string;
}

function CollapsibleSection({
    title,
    icon,
    children,
    defaultOpen = false,
    badge,
    color = 'from-cyan-500/20 to-blue-500/20'
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden"
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-cyan-400`}>
                        {icon}
                    </div>
                    <h3 className="text-white font-semibold text-lg">{title}</h3>
                    {badge && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                            {badge}
                        </span>
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
            >
                <div className="p-6 pt-2 space-y-4 border-t border-white/5">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ============================================
// INFINITE ZOOM FORM COMPONENT
// ============================================

function InfiniteZoomFormComponent({ section, onUpdate }: InfiniteZoomFormProps) {
    // ========== CONTENT HANDLERS ==========
    const updateContent = useCallback((key: string, value: unknown) => {
        onUpdate({
            content: {
                ...section.content,
                [key]: value,
            },
        });
    }, [section.content, onUpdate]);

    // ========== DESIGN HANDLERS ==========
    const updateDesign = useCallback((key: string, value: unknown) => {
        onUpdate({
            design: {
                ...section.design,
                [key]: value,
            },
        });
    }, [section.design, onUpdate]);

    // ========== LAYERS HANDLERS ==========
    const handleLayersChange = useCallback((newLayers: ZoomLayerItem[]) => {
        updateContent('layers', newLayers);
    }, [updateContent]);

    const createLayer = useCallback((): ZoomLayerItem => ({
        id: `layer_${Date.now()}`,
        imageUrl: '',
        title: '',
        description: '',
        focalPointX: 50,
        focalPointY: 50,
    }), []);

    // ========== LAYER RENDER ==========
    const renderLayerItem = useCallback((item: ZoomLayerItem, index: number) => {
        return (
            <div className="flex items-center gap-3">
                {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.imageUrl}
                        alt={item.title || `Image ${index + 1}`}
                        className="w-14 h-14 rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-cyan-400">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                        {item.title || `Image ${index + 1}`}
                    </p>
                    <p className="text-slate-500 text-sm truncate">
                        Point focal: {item.focalPointX}%, {item.focalPointY}%
                    </p>
                </div>
            </div>
        );
    }, []);

    // ========== FORM RENDER ==========
    const renderLayerForm = useCallback((
        item: ZoomLayerItem,
        index: number,
        onChange: (item: ZoomLayerItem) => void
    ) => {
        return (
            <div className="space-y-4">
                <LocalImageInput
                    label="Image"
                    value={item.imageUrl}
                    onChange={(v) => onChange({ ...item, imageUrl: v })}
                    hint="Image haute résolution (1920x1080 recommandé)"
                    category="zoom"
                    fieldKey={`image_${index}`}
                    aspectRatio="video"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LocalInput
                        label="Titre (optionnel)"
                        value={item.title || ''}
                        onChange={(v) => onChange({ ...item, title: v || null })}
                        placeholder="Titre affiché pendant le zoom"
                    />

                    <LocalInput
                        label="Description (optionnel)"
                        value={item.description || ''}
                        onChange={(v) => onChange({ ...item, description: v || null })}
                        placeholder="Description courte"
                    />
                </div>

                {/* Point focal */}
                <div className="p-4 bg-slate-700/30 rounded-xl">
                    <p className="text-slate-300 text-sm font-medium mb-3">
                        📍 Point focal (vers où le zoom se dirige)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-400 text-xs mb-1 block">
                                Position X ({item.focalPointX}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={item.focalPointX}
                                onChange={(e) => onChange({ ...item, focalPointX: parseInt(e.target.value) })}
                                className="w-full accent-cyan-500"
                            />
                            <div className="flex justify-between text-slate-500 text-[10px]">
                                <span>Gauche</span>
                                <span>Centre</span>
                                <span>Droite</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs mb-1 block">
                                Position Y ({item.focalPointY}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={item.focalPointY}
                                onChange={(e) => onChange({ ...item, focalPointY: parseInt(e.target.value) })}
                                className="w-full accent-cyan-500"
                            />
                            <div className="flex justify-between text-slate-500 text-[10px]">
                                <span>Haut</span>
                                <span>Centre</span>
                                <span>Bas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, []);

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <ZoomIn className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-cyan-400 font-semibold mb-1">Zoom Infini</h3>
                        <p className="text-slate-400 text-sm">
                            Effet immersif où le visiteur navigue dans les images via scroll ou pinch.
                            Ajoutez plusieurs images pour créer un voyage visuel.
                        </p>
                        <a
                            href="/zoom"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 text-sm mt-2 hover:underline"
                        >
                            👁️ Prévisualiser l&apos;effet →
                        </a>
                    </div>
                </div>
            </div>

            {/* ========== TEXTES ========== */}
            <CollapsibleSection
                title="Textes"
                icon={<Type className="w-5 h-5" />}
                color="from-violet-500/20 to-pink-500/20"
                defaultOpen={true}
            >
                <LocalInput
                    label="Titre"
                    value={section.content.titre}
                    onChange={(v) => updateContent('titre', v)}
                    placeholder="Explorez"
                />
                <LocalTextarea
                    label="Sous-titre (optionnel)"
                    value={section.content.sousTitre || ''}
                    onChange={(v) => updateContent('sousTitre', v || null)}
                    placeholder="Une expérience visuelle immersive..."
                    rows={2}
                />
                <LocalInput
                    label="Texte d'instruction"
                    value={section.content.instructionText || 'Scrollez pour explorer'}
                    onChange={(v) => updateContent('instructionText', v)}
                    placeholder="Scrollez pour explorer"
                />
            </CollapsibleSection>

            {/* ========== IMAGES / LAYERS ========== */}
            <CollapsibleSection
                title="Images"
                icon={<ImageIcon className="w-5 h-5" />}
                badge={`${section.content.layers?.length || 0}`}
                color="from-pink-500/20 to-rose-500/20"
                defaultOpen={true}
            >
                <p className="text-slate-400 text-sm mb-4">
                    Ajoutez les images dans l&apos;ordre du zoom. La première image est affichée en premier,
                    puis le zoom révèle les suivantes.
                </p>

                <ListEditor<ZoomLayerItem>
                    items={(section.content.layers || []) as ZoomLayerItem[]}
                    onChange={handleLayersChange}
                    renderItem={renderLayerItem}
                    renderForm={renderLayerForm}
                    createItem={createLayer}
                    label="Couches de zoom"
                    addItemLabel="Ajouter une image"
                    emptyMessage="Aucune image (les images de démo seront utilisées)"
                    emptyIcon={<ImageIcon className="w-10 h-10 mx-auto opacity-30" />}
                />
            </CollapsibleSection>

            {/* ========== DESIGN & STYLE ========== */}
            <CollapsibleSection
                title="Design & Comportement"
                icon={<Palette className="w-5 h-5" />}
                color="from-cyan-500/20 to-blue-500/20"
            >
                {/* Variant Selection */}
                <div className="space-y-2">
                    <label className="text-white font-medium text-sm">Mode d&apos;affichage</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {VARIANT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateDesign('variant', opt.value)}
                                className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${section.design.variant === opt.value
                                        ? 'border-cyan-500 bg-cyan-500/20'
                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <span className="block text-lg mb-1">{opt.emoji}</span>
                                <span className={`block text-sm font-medium ${section.design.variant === opt.value ? 'text-cyan-400' : 'text-white'
                                    }`}>
                                    {opt.label}
                                </span>
                                <span className="block text-xs text-slate-500">{opt.description}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transition Speed */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-white font-medium text-sm">Vitesse de transition</label>
                    <div className="flex flex-wrap gap-2">
                        {TRANSITION_PRESETS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateDesign('transitionDuration', opt.value)}
                                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${section.design.transitionDuration === opt.value
                                        ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                                        : 'border-white/10 text-slate-400 hover:border-white/20'
                                    }`}
                            >
                                <span className="mr-1">{opt.emoji}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zoom Intensity */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-white font-medium text-sm">Intensité du zoom</label>
                    <div className="flex flex-wrap gap-2">
                        {INTENSITY_PRESETS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateDesign('zoomIntensity', opt.value)}
                                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${section.design.zoomIntensity === opt.value
                                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                        : 'border-white/10 text-slate-400 hover:border-white/20'
                                    }`}
                            >
                                <span className="mr-1">{opt.emoji}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CollapsibleSection>

            {/* ========== OPTIONS AVANCÉES ========== */}
            <CollapsibleSection
                title="Options avancées"
                icon={<Settings className="w-5 h-5" />}
                color="from-amber-500/20 to-orange-500/20"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Show Indicators */}
                    <button
                        type="button"
                        onClick={() => updateDesign('showIndicators', !section.design.showIndicators)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${section.design.showIndicators
                                ? 'border-cyan-500/50 bg-cyan-500/10'
                                : 'border-white/10 bg-slate-800/50'
                            }`}
                    >
                        {section.design.showIndicators ? (
                            <Eye className="w-5 h-5 text-cyan-400" />
                        ) : (
                            <EyeOff className="w-5 h-5 text-slate-500" />
                        )}
                        <div className="text-left">
                            <span className={`block text-sm font-medium ${section.design.showIndicators ? 'text-cyan-400' : 'text-slate-400'
                                }`}>
                                Indicateurs
                            </span>
                            <span className="block text-xs text-slate-500">Points de navigation</span>
                        </div>
                    </button>

                    {/* Show Progress */}
                    <button
                        type="button"
                        onClick={() => updateDesign('showProgress', !section.design.showProgress)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${section.design.showProgress
                                ? 'border-violet-500/50 bg-violet-500/10'
                                : 'border-white/10 bg-slate-800/50'
                            }`}
                    >
                        {section.design.showProgress ? (
                            <Eye className="w-5 h-5 text-violet-400" />
                        ) : (
                            <EyeOff className="w-5 h-5 text-slate-500" />
                        )}
                        <div className="text-left">
                            <span className={`block text-sm font-medium ${section.design.showProgress ? 'text-violet-400' : 'text-slate-400'
                                }`}>
                                Progression
                            </span>
                            <span className="block text-xs text-slate-500">Barre de progression</span>
                        </div>
                    </button>

                    {/* Enable Sound */}
                    <button
                        type="button"
                        onClick={() => updateDesign('enableSound', !section.design.enableSound)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${section.design.enableSound
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : 'border-white/10 bg-slate-800/50'
                            }`}
                    >
                        {section.design.enableSound ? (
                            <Volume2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <VolumeX className="w-5 h-5 text-slate-500" />
                        )}
                        <div className="text-left">
                            <span className={`block text-sm font-medium ${section.design.enableSound ? 'text-emerald-400' : 'text-slate-400'
                                }`}>
                                Son
                            </span>
                            <span className="block text-xs text-slate-500">Effet sonore au zoom</span>
                        </div>
                    </button>
                </div>
            </CollapsibleSection>
        </div>
    );
}

// ============================================
// EXPORT
// ============================================

export const InfiniteZoomForm = memo(InfiniteZoomFormComponent);
