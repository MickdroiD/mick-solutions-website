// ============================================
// SECTION EDITOR - Factory V5
// Interface WYSIWYG pour édition de sections
// ============================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HexColorPicker } from 'react-colorful';
import { Image as ImageIcon, Plus, Trash2, GripVertical, Link as LinkIcon, ChevronDown } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UniversalSectionConfig, ContentBlock, BlockType, FormField } from '@/features/sections/types-universal';
import { DEFAULT_UNIVERSAL_CONFIG, DEFAULT_HEADING_BLOCK, DEFAULT_TEXT_BLOCK, DEFAULT_BUTTON_BLOCK } from '@/features/sections/types-universal';
import AssetPicker from './AssetPicker';
import UrlInputWithPicker from './UrlInputWithPicker';
import { StyledInput, StyledSelect, StyledToggle, StyledColorPicker, StyledTextarea } from './EditorControls';

interface SectionEditorProps {
    initialConfig?: UniversalSectionConfig;
    onSave: (config: UniversalSectionConfig) => void;
    onCancel: () => void;
    onChange?: (config: UniversalSectionConfig) => void;
}

// Génère un ID unique pour les blocks
const generateId = () => Math.random().toString(36).substring(2, 10);

export default function SectionEditor({ initialConfig, onSave, onCancel, onChange }: SectionEditorProps) {
    const { data: session } = useSession();
    const tenantId = (session?.user as any)?.tenantId || '';

    const [config, setConfig] = useState<UniversalSectionConfig>(initialConfig || DEFAULT_UNIVERSAL_CONFIG);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState<'from' | 'to' | 'solid' | 'overlay' | null>(null);
    const [activeTab, setActiveTab] = useState<'blocks' | 'layout' | 'design'>('blocks');
    const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

    // Notify parent of changes for Live Preview
    useEffect(() => {
        if (onChange) {
            onChange(config);
        }
    }, [config, onChange]);

    // Ajouter un block
    const addBlock = useCallback((type: BlockType) => {
        const newBlock = createDefaultBlock(type);
        setConfig(prev => ({
            ...prev,
            blocks: [...prev.blocks, newBlock]
        }));
        setSelectedBlockId(newBlock.id);
    }, []);

    // Supprimer un block
    const removeBlock = useCallback((blockId: string) => {
        setConfig(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== blockId)
        }));
        if (selectedBlockId === blockId) setSelectedBlockId(null);
    }, [selectedBlockId]);

    // Mettre à jour un block
    const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
        setConfig(prev => ({
            ...prev,
            blocks: prev.blocks.map(b =>
                b.id === blockId ? { ...b, ...updates } as ContentBlock : b
            )
        }));
    }, []);

    // Déplacer un block (haut/bas)
    const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
        setConfig(prev => {
            const blocks = [...prev.blocks];
            const idx = blocks.findIndex(b => b.id === blockId);
            if (idx === -1) return prev;

            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= blocks.length) return prev;

            [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
            // Recalculer les ordres
            blocks.forEach((b, i) => { b.order = i; });

            return { ...prev, blocks };
        });
    }, []);

    // Drag & Drop handler
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setConfig(prev => {
                const oldIndex = prev.blocks.findIndex(b => b.id === active.id);
                const newIndex = prev.blocks.findIndex(b => b.id === over.id);
                const newBlocks = arrayMove(prev.blocks, oldIndex, newIndex);
                // Recalculer les ordres
                newBlocks.forEach((b, i) => { b.order = i; });
                return { ...prev, blocks: newBlocks };
            });
        }
    }, []);

    const selectedBlock = config.blocks.find(b => b.id === selectedBlockId);

    // Panel Mode Layout (Right Sidebar Style)
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#111118',
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Header / Tabs */}
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {(['blocks', 'layout', 'design'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: activeTab === tab ? 'rgba(34,211,238,0.2)' : 'transparent',
                                border: activeTab === tab ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.25rem',
                                color: activeTab === tab ? '#22d3ee' : '#9ca3af',
                                fontSize: '0.75rem',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

                {/* 1. BLOCKS TAB */}
                {activeTab === 'blocks' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Selected Block Info - Edit Mode */}
                        {selectedBlockId ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,211,238,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#22d3ee', fontWeight: 'bold' }}>
                                        Édition : {config.blocks.find(b => b.id === selectedBlockId)?.type}
                                    </h4>
                                    <button
                                        onClick={() => setSelectedBlockId(null)}
                                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                                    >
                                        Retour liste
                                    </button>
                                </div>
                                <BlockProperties
                                    block={config.blocks.find(b => b.id === selectedBlockId)!}
                                    onUpdate={(updates) => updateBlock(selectedBlockId, updates)}
                                    tenantId={tenantId}
                                />
                            </div>
                        ) : (
                            /* Blocks List & Add */
                            <>
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        Vos Blocs ({config.blocks.length})
                                    </h3>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={config.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {config.blocks.map((block, idx) => (
                                                    <SortableBlockItem
                                                        key={block.id}
                                                        block={block}
                                                        index={idx}
                                                        isSelected={selectedBlockId === block.id}
                                                        onSelect={() => setSelectedBlockId(block.id)}
                                                        onRemove={() => removeBlock(block.id)}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h3 style={{ color: '#fff', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ajouter un bloc</h3>
                                    <BlockCategoriesAccordion addBlock={addBlock} />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* 2. LAYOUT TAB */}
                {/* 2. LAYOUT TAB */}
                {activeTab === 'layout' && (
                    <LayoutProperties
                        config={config}
                        onUpdate={(updates) => {
                            const newConfig = { ...config, ...updates };
                            setConfig(newConfig);
                        }}
                    />
                )}

                {/* 3. DESIGN TAB */}
                {activeTab === 'design' && (
                    <DesignProperties
                        config={config}
                        onUpdate={(updates) => {
                            const newConfig = { ...config, ...updates };
                            setConfig(newConfig);
                        }}
                        showColorPicker={showColorPicker}
                        setShowColorPicker={setShowColorPicker}
                        tenantId={tenantId}
                    />
                )}
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem', background: '#0a0a0f' }}>
                <button
                    onClick={onCancel}
                    style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}
                >
                    Annuler
                </button>
                <button
                    onClick={() => onSave(config)}
                    style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(to right, #22d3ee, #a855f7)', border: 'none', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Sauvegarder
                </button>
            </div>
        </div>
    );
}

// Mini button style
const miniButtonStyle: React.CSSProperties = {
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '0.25rem',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '0.75rem',
};

// Sortable Block Item for Drag & Drop
interface SortableBlockItemProps {
    block: ContentBlock;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
}

function SortableBlockItem({ block, index, isSelected, onSelect, onRemove }: SortableBlockItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onSelect}
        >
            <div
                style={{
                    padding: '0.75rem',
                    background: isSelected ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? '#22d3ee' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        {...attributes}
                        {...listeners}
                        style={{
                            ...miniButtonStyle,
                            cursor: 'grab',
                            touchAction: 'none',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={12} />
                    </button>
                    <span style={{ color: '#d1d5db', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                        {index + 1}. {block.type}
                    </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    style={{ ...miniButtonStyle, color: '#ef4444' }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}

// Block Categories Accordion - Organized block types in collapsible sections
const BLOCK_CATEGORIES: { name: string; icon: string; blocks: { type: BlockType; label: string; emoji: string }[] }[] = [
    {
        name: 'Contenu',
        icon: '📝',
        blocks: [
            { type: 'heading', label: 'Titre', emoji: '📝' },
            { type: 'text', label: 'Texte', emoji: '📄' },
            { type: 'image', label: 'Image', emoji: '🖼️' },
            { type: 'video', label: 'Vidéo', emoji: '🎬' },
        ]
    },
    {
        name: 'Interactif',
        icon: '🔘',
        blocks: [
            { type: 'button', label: 'Bouton', emoji: '🔘' },
            { type: 'form', label: 'Formulaire', emoji: '📋' },
            { type: 'whatsapp-button', label: 'WhatsApp', emoji: '💬' },
        ]
    },
    {
        name: 'Layout',
        icon: '📐',
        blocks: [
            { type: 'spacer', label: 'Espace', emoji: '↕️' },
            { type: 'divider', label: 'Ligne', emoji: '—' },
            { type: 'icon', label: 'Icône', emoji: '⭐' },
        ]
    },
    {
        name: 'Médias',
        icon: '🎬',
        blocks: [
            { type: 'carousel', label: 'Carousel', emoji: '🎠' },
            { type: 'gallery', label: 'Galerie', emoji: '🖼️' },
            { type: 'logo-cloud', label: 'Logos', emoji: '🏢' },
            { type: 'logo-preset' as any, label: 'Logo Simple', emoji: '🖼️' }, // Logo Preset
            { type: 'infinite-zoom', label: 'Zoom', emoji: '🔍' },
            { type: 'before-after', label: 'Avant/Après', emoji: '🔄' },
        ]
    },
    {
        name: 'Social Proof',
        icon: '💬',
        blocks: [
            { type: 'testimonial', label: 'Avis', emoji: '💬' },
            { type: 'faq', label: 'FAQ', emoji: '❓' },
            { type: 'stats-counter', label: 'Stats', emoji: '📊' },
            { type: 'team', label: 'Équipe', emoji: '👥' },
            { type: 'timeline', label: 'Timeline', emoji: '📅' },
        ]
    },
    {
        name: 'Conversion',
        icon: '💳',
        blocks: [
            { type: 'cta-section', label: 'CTA', emoji: '📢' },
            { type: 'pricing', label: 'Tarifs', emoji: '💳' },
            { type: 'countdown', label: 'Compte à rebours', emoji: '⏱️' },
            { type: 'newsletter', label: 'Newsletter', emoji: '📧' },
        ]
    },
    {
        name: 'Avancé',
        icon: '🎯',
        blocks: [
            { type: 'bento-grid', label: 'Bento Grid', emoji: '🎯' },
            { type: 'marquee', label: 'Défilant', emoji: '🎬' },
            { type: 'feature-grid', label: 'Features', emoji: '⭐' },
        ]
    },
];

function BlockCategoriesAccordion({ addBlock }: { addBlock: (type: BlockType) => void }) {
    const [openCategories, setOpenCategories] = useState<string[]>(['Contenu']);

    const toggleCategory = (name: string) => {
        setOpenCategories(prev =>
            prev.includes(name)
                ? prev.filter(c => c !== name)
                : [...prev, name]
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {BLOCK_CATEGORIES.map(cat => (
                <div key={cat.name}>
                    <button
                        onClick={() => toggleCategory(cat.name)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.75rem',
                            background: openCategories.includes(cat.name) ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${openCategories.includes(cat.name) ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '0.5rem',
                            color: openCategories.includes(cat.name) ? '#22d3ee' : '#9ca3af',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                        }}
                    >
                        <span>{cat.icon} {cat.name}</span>
                        <ChevronDown
                            size={14}
                            style={{
                                transform: openCategories.includes(cat.name) ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }}
                        />
                    </button>
                    {openCategories.includes(cat.name) && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.375rem',
                            marginTop: '0.375rem',
                            paddingLeft: '0.25rem'
                        }}>
                            {cat.blocks.map(block => (
                                <button
                                    key={block.type}
                                    onClick={() => addBlock(block.type)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.375rem',
                                        color: '#d1d5db',
                                        cursor: 'pointer',
                                        fontSize: '0.6875rem',
                                        textAlign: 'left',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(34,211,238,0.15)';
                                        e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    {block.emoji} {block.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Créer un block par défaut selon le type
function createDefaultBlock(type: BlockType): ContentBlock {
    const id = generateId();
    const order = 0;

    switch (type) {
        case 'heading':
            return { ...DEFAULT_HEADING_BLOCK, id, order };
        case 'text':
            return { ...DEFAULT_TEXT_BLOCK, id, order };
        case 'button':
            return { ...DEFAULT_BUTTON_BLOCK, id, order };
        case 'image':
            return { id, order, type: 'image', content: { url: 'https://picsum.photos/800/400', alt: 'Image' } };
        case 'logo-preset' as any:
            return {
                id,
                order,
                type: 'image',
                content: { url: 'https://via.placeholder.com/150x50?text=LOGO', alt: 'Logo' },
                style: { objectFit: 'contain', width: '150px', aspectRatio: 'auto' }
            } as ContentBlock;
        case 'spacer':
            return { id, order, type: 'spacer', content: { height: '2rem' } };
        case 'divider':
            return { id, order, type: 'divider', style: { color: 'rgba(255,255,255,0.2)', thickness: '1px' } } as ContentBlock;
        case 'video':
            return { id, order, type: 'video', content: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Vidéo' }, style: { aspectRatio: '16:9' } } as ContentBlock;
        case 'icon':
            return { id, order, type: 'icon', content: { name: 'Star', label: 'Icône' }, style: { size: 'lg', color: '#22d3ee' } } as ContentBlock;
        case 'form':
            return { id, order, type: 'form', content: { title: 'Contactez-nous', submitText: 'Envoyer', fields: [{ id: 'name', type: 'text', label: 'Nom', required: true }, { id: 'email', type: 'email', label: 'Email', required: true }, { id: 'message', type: 'textarea', label: 'Message' }] }, style: { variant: 'bordered', buttonVariant: 'gradient' } } as ContentBlock;
        case 'infinite-zoom':
            return { id, order, type: 'infinite-zoom', content: { layers: [{ id: '1', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', title: 'Layer 1' }] }, style: { variant: 'contained', showIndicators: true } } as ContentBlock;
        case 'carousel':
            return { id, order, type: 'carousel', content: { images: [{ url: 'https://picsum.photos/800/400?random=1', alt: 'Image 1' }, { url: 'https://picsum.photos/800/400?random=2', alt: 'Image 2' }], autoplay: true }, style: { aspectRatio: '16:9', showArrows: true, showDots: true } } as ContentBlock;
        case 'gallery':
            return { id, order, type: 'gallery', content: { images: [{ url: 'https://picsum.photos/400/400?random=1' }, { url: 'https://picsum.photos/400/400?random=2' }, { url: 'https://picsum.photos/400/400?random=3' }] }, style: { columns: 3, gap: 'md', hoverEffect: 'zoom' } } as ContentBlock;
        case 'logo-cloud':
            return { id, order, type: 'logo-cloud', content: { logos: [], title: 'Nos partenaires' }, style: { columns: 4, grayscale: true } } as ContentBlock;
        case 'testimonial':
            return { id, order, type: 'testimonial', content: { quote: 'Un témoignage positif de votre client.', author: 'Jean Dupont', role: 'CEO', company: 'Entreprise SA', rating: 5 }, style: { variant: 'card', showQuoteIcon: true, showRating: true, accentColor: '#8b5cf6' } } as ContentBlock;
        case 'faq':
            return { id, order, type: 'faq', content: { title: 'Questions fréquentes', items: [{ id: 'q1', question: 'Comment ça fonctionne ?', answer: 'C\'est simple et intuitif.' }, { id: 'q2', question: 'Puis-je personnaliser ?', answer: 'Oui, tout est personnalisable.' }] }, style: { variant: 'bordered', accentColor: '#22d3ee' } } as ContentBlock;
        case 'stats-counter':
            return { id, order, type: 'stats-counter', content: { stats: [{ id: 's1', value: 100, suffix: '+', label: 'Clients' }, { id: 's2', value: 50, suffix: 'K', label: 'Visiteurs' }, { id: 's3', value: 99, suffix: '%', label: 'Satisfaction' }] }, style: { variant: 'grid', columns: 3, animate: true, valueColor: '#22d3ee' } } as ContentBlock;
        case 'pricing':
            return { id, order, type: 'pricing', content: { title: 'Nos Offres', plans: [{ id: 'p1', name: 'Starter', price: '29€', period: 'mois', features: ['Feature 1', 'Feature 2'], ctaText: 'Choisir' }, { id: 'p2', name: 'Pro', price: '79€', period: 'mois', features: ['Tout Starter', 'Feature 3', 'Feature 4'], highlighted: true, ctaText: 'Choisir' }, { id: 'p3', name: 'Enterprise', price: 'Sur mesure', features: ['Tout Pro', 'Support dédié'], ctaText: 'Contacter' }] }, style: { variant: 'cards', columns: 3, highlightColor: '#a855f7' } } as ContentBlock;
        case 'timeline':
            return { id, order, type: 'timeline', content: { title: 'Notre Histoire', items: [{ id: 't1', date: '2020', title: 'Fondation', description: 'Création de l\'entreprise' }, { id: 't2', date: '2022', title: 'Croissance', description: 'Expansion internationale' }, { id: 't3', date: '2024', title: 'Innovation', description: 'Lancement V5' }] }, style: { variant: 'vertical', dotColor: '#22d3ee' } } as ContentBlock;
        case 'team':
            return { id, order, type: 'team', content: { title: 'Notre Équipe', members: [{ id: 'm1', name: 'Jean Dupont', role: 'CEO' }, { id: 'm2', name: 'Marie Martin', role: 'CTO' }, { id: 'm3', name: 'Pierre Durand', role: 'Designer' }] }, style: { variant: 'cards', columns: 3, imageShape: 'circle' } } as ContentBlock;
        case 'marquee':
            return { id, order, type: 'marquee', content: { items: [{ text: 'Innovation' }, { text: 'Créativité' }, { text: 'Excellence' }, { text: 'Performance' }] }, style: { speed: 'normal', direction: 'left', pauseOnHover: true } } as ContentBlock;
        case 'feature-grid':
            return { id, order, type: 'feature-grid', content: { title: 'Nos Fonctionnalités', features: [{ id: 'f1', icon: 'Zap', title: 'Rapide', description: 'Performance optimisée' }, { id: 'f2', icon: 'Shield', title: 'Sécurisé', description: 'Protection maximale' }, { id: 'f3', icon: 'Palette', title: 'Personnalisable', description: '100% configurable' }] }, style: { variant: 'cards', columns: 3, iconColor: '#22d3ee' } } as ContentBlock;
        case 'cta-section':
            return { id, order, type: 'cta-section', content: { headline: 'Prêt à commencer ?', subheadline: 'Rejoignez des milliers d’utilisateurs satisfaits.', primaryButtonText: 'Commencer', primaryButtonUrl: '#' }, style: { variant: 'centered', gradientFrom: '#a855f7', gradientTo: '#ec4899' } } as ContentBlock;
        case 'countdown':
            return { id, order, type: 'countdown', content: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), title: 'Événement spécial' }, style: { variant: 'boxes', accentColor: '#22d3ee' } } as ContentBlock;
        case 'newsletter':
            return { id, order, type: 'newsletter', content: { title: 'Restez informé', subtitle: 'Recevez nos dernières actualités', buttonText: 'S\'inscrire' }, style: { variant: 'inline', accentColor: '#22d3ee' } } as ContentBlock;
        case 'whatsapp-button':
            return { id, order, type: 'whatsapp-button', content: { phoneNumber: '+41791234567', message: 'Bonjour !', buttonText: 'Nous contacter' }, style: { variant: 'inline', size: 'md' } } as ContentBlock;
        case 'bento-grid':
            return { id, order, type: 'bento-grid', content: { items: [{ id: 'b1', title: 'Innovation', description: 'Technologies de pointe', icon: 'Zap', span: 'lg' }, { id: 'b2', title: 'Design', icon: 'Palette', span: 'sm' }, { id: 'b3', title: 'Performance', icon: 'Gauge', span: 'md' }, { id: 'b4', title: 'Sécurité', description: 'Protection avancée', icon: 'Shield', span: 'sm' }] }, style: { gap: 'md', rounded: 'lg', showHoverEffect: true } } as ContentBlock;
        case 'before-after':
            return { id, order, type: 'before-after', content: { beforeImage: 'https://placehold.co/800x500/1a1a2e/ffffff?text=AVANT', afterImage: 'https://placehold.co/800x500/22d3ee/000000?text=APRÈS', beforeLabel: 'Avant', afterLabel: 'Après' }, style: { variant: 'slider', sliderPosition: 50, aspectRatio: '16:9' } } as ContentBlock;
        default:
            return { ...DEFAULT_TEXT_BLOCK, id, order };
    }
}

// Preview d'un block
function BlockPreview({ block }: { block: ContentBlock }) {
    switch (block.type) {
        case 'heading':
            return <h2 style={{
                fontSize: block.style?.fontSize || '2rem',
                color: block.style?.gradient ? 'transparent' : (block.style?.color || '#fff'),
                background: block.style?.gradient ? `linear-gradient(to right, ${block.style.gradientFrom || '#22d3ee'}, ${block.style.gradientTo || '#a855f7'})` : undefined,
                WebkitBackgroundClip: block.style?.gradient ? 'text' : undefined,
                WebkitTextFillColor: block.style?.gradient ? 'transparent' : undefined,
                margin: 0,
            }}>{block.content.text}</h2>;
        case 'text':
            return <p style={{ color: block.style?.color || '#d1d5db', fontSize: block.style?.fontSize || '1rem', margin: 0 }}>{block.content.text}</p>;
        case 'button':
            return <button style={{
                padding: '0.75rem 1.5rem',
                background: block.style?.variant === 'gradient' ? 'linear-gradient(to right, #22d3ee, #a855f7)' : '#22d3ee',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                fontWeight: '600',
            }}>{block.content.text}</button>;
        case 'image':
            return <img src={block.content.url} alt={block.content.alt} style={{ width: '100%', borderRadius: '0.5rem' }} />;
        case 'spacer':
            return <div style={{ height: block.content.height || '2rem', background: 'rgba(34,211,238,0.1)', borderRadius: '0.25rem' }} />;
        case 'divider':
            return <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '1rem 0' }} />;
        case 'video':
            return <div style={{ padding: '2rem', background: 'rgba(34,211,238,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#22d3ee' }}>🎬 Vidéo: {(block as any).content?.url || 'Non configuré'}</div>;
        case 'icon':
            return <div style={{ textAlign: 'center', fontSize: '2rem' }}>⭐</div>;
        case 'form':
            return <div style={{ padding: '1.5rem', background: 'rgba(168,85,247,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#a855f7' }}>📋 Formulaire: {(block as any).content?.title || 'Sans titre'}</div>;
        case 'infinite-zoom':
            return <div style={{ padding: '2rem', background: 'rgba(34,211,238,0.15)', borderRadius: '0.5rem', textAlign: 'center', color: '#22d3ee' }}>🔍 Infinite Zoom ({(block as any).content?.layers?.length || 0} layers)</div>;
        case 'carousel':
            return <div style={{ padding: '2rem', background: 'rgba(168,85,247,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#a855f7' }}>🎠 Carousel ({(block as any).content?.images?.length || 0} images)</div>;
        case 'gallery':
            return <div style={{ padding: '2rem', background: 'rgba(34,197,94,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#22c55e' }}>🖼️ Galerie ({(block as any).content?.images?.length || 0} images)</div>;
        case 'logo-cloud':
            return <div style={{ padding: '2rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#f59e0b' }}>🏢 Logos ({(block as any).content?.logos?.length || 0})</div>;
        case 'testimonial':
            return <div style={{ padding: '2rem', background: 'rgba(139,92,246,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#8b5cf6' }}>💬 Avis: "{(block as any).content?.quote?.substring(0, 30) || 'Témoignage'}..."</div>;
        case 'faq':
            return <div style={{ padding: '2rem', background: 'rgba(236,72,153,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#ec4899' }}>❓ FAQ ({(block as any).content?.items?.length || 0} questions)</div>;
        case 'stats-counter':
            return <div style={{ padding: '2rem', background: 'rgba(34,211,238,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#22d3ee' }}>📊 Stats ({(block as any).content?.stats?.length || 0} indicateurs)</div>;
        case 'pricing':
            return <div style={{ padding: '2rem', background: 'rgba(168,85,247,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#a855f7' }}>💳 Tarifs ({(block as any).content?.plans?.length || 0} offres)</div>;
        case 'timeline':
            return <div style={{ padding: '2rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#10b981' }}>📅 Timeline ({(block as any).content?.items?.length || 0} étapes)</div>;
        case 'team':
            return <div style={{ padding: '2rem', background: 'rgba(99,102,241,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#6366f1' }}>👥 Équipe ({(block as any).content?.members?.length || 0} membres)</div>;
        case 'marquee':
            return <div style={{ padding: '2rem', background: 'rgba(244,63,94,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#f43f5e' }}>🎬 Défilant ({(block as any).content?.items?.length || 0} éléments)</div>;
        case 'feature-grid':
            return <div style={{ padding: '2rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#f59e0b' }}>⭐ Features ({(block as any).content?.features?.length || 0} items)</div>;
        case 'cta-section':
            return <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))', borderRadius: '0.5rem', textAlign: 'center', color: '#ec4899' }}>📢 CTA: {(block as any).content?.headline?.substring(0, 25) || 'Call-to-action'}...</div>;
        case 'countdown':
            return <div style={{ padding: '2rem', background: 'rgba(59,130,246,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#3b82f6' }}>⏱️ Countdown: {(block as any).content?.title || 'Timer'}</div>;
        case 'newsletter':
            return <div style={{ padding: '2rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#10b981' }}>📧 Newsletter</div>;
        case 'whatsapp-button':
            return <div style={{ padding: '2rem', background: 'rgba(37,211,102,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#25d366' }}>💬 WhatsApp</div>;
        case 'bento-grid':
            return <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(168,85,247,0.1))', borderRadius: '0.5rem', textAlign: 'center', color: '#22d3ee' }}>🎯 Bento Grid ({(block as any).content?.items?.length || 0} items)</div>;
        case 'before-after':
            return <div style={{ padding: '2rem', background: 'rgba(251,191,36,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#fbbf24' }}>🔍 Avant/Après</div>;
        default:
            return <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', color: '#6b7280' }}>Block: {(block as any).type}</div>;
    }
}

// Properties panel pour un block
function BlockProperties({ block, onUpdate, tenantId }: { block: ContentBlock; onUpdate: (updates: Partial<ContentBlock>) => void; tenantId: string }) {
    const [showAssetPicker, setShowAssetPicker] = useState(false);
    const [assetPickerTarget, setAssetPickerTarget] = useState<'main' | number>('main');

    const openAssetPicker = (target: 'main' | number) => {
        setAssetPickerTarget(target);
        setShowAssetPicker(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: '#22d3ee', fontSize: '0.875rem', margin: 0, textTransform: 'capitalize' }}>
                {block.type} - Propriétés
            </h4>

            {/* Text fields for heading/text/button */}
            {(block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
                <StyledInput
                    label="Texte"
                    value={(block.content as any).text || ''}
                    onChange={(e) => onUpdate({ content: { ...block.content, text: e.target.value } } as any)}
                />
            )}

            {/* Typography Properties (Heading & Text) */}
            {(block.type === 'heading' || block.type === 'text') && (
                <>
                    {block.type === 'heading' && (
                        <StyledSelect
                            label="Niveau (H1-H6)"
                            value={(block.content as any).level || 1}
                            onChange={(e) => onUpdate({ content: { ...block.content, level: Number(e.target.value) } } as any)}
                            options={[1, 2, 3, 4, 5, 6].map(n => ({ value: n, label: `H${n}` }))}
                        />
                    )}

                    {/* Font Family Selector */}
                    <StyledSelect
                        label="Police"
                        value={(block.style as any)?.fontFamily || 'Inter'}
                        onChange={(e) => onUpdate({ style: { ...block.style, fontFamily: e.target.value } } as any)}
                        options={[
                            { value: 'Inter', label: 'Inter' },
                            { value: 'Roboto', label: 'Roboto' },
                            { value: 'Open Sans', label: 'Open Sans' },
                            { value: 'Poppins', label: 'Poppins' },
                            { value: 'Montserrat', label: 'Montserrat' },
                            { value: 'Outfit', label: 'Outfit' },
                            { value: 'Playfair Display', label: 'Playfair Display' },
                            { value: 'Merriweather', label: 'Merriweather' },
                            { value: 'Lora', label: 'Lora' },
                            { value: 'Oswald', label: 'Oswald' },
                            { value: 'Bebas Neue', label: 'Bebas Neue' },
                            { value: 'Righteous', label: 'Righteous' },
                            { value: 'Space Grotesk', label: 'Space Grotesk' },
                            { value: 'Sora', label: 'Sora' },
                            { value: 'DM Sans', label: 'DM Sans' },
                        ]}
                    />

                    {/* Font Size */}
                    <StyledSelect
                        label="Taille texte"
                        value={(block.style as any)?.fontSize || 'auto'}
                        onChange={(e) => onUpdate({ style: { ...block.style, fontSize: e.target.value } } as any)}
                        options={[
                            { value: 'auto', label: 'Auto' },
                            { value: '0.875rem', label: 'Petit (XS)' },
                            { value: '1rem', label: 'Normal (S)' },
                            { value: '1.125rem', label: 'Moyen (M)' },
                            { value: '1.5rem', label: 'Grand (L)' },
                            { value: '2rem', label: 'Titre (XL)' },
                            { value: '3rem', label: 'XXL' },
                            { value: '4rem', label: 'Géant' },
                        ]}
                    />

                    {/* Individual Alignment (Self) */}
                    <StyledSelect
                        label="Alignement Individuel (Override)"
                        value={(block.style as any)?.alignSelf || 'auto'}
                        onChange={(e) => onUpdate({ style: { ...block.style, alignSelf: e.target.value as any } })}
                        options={[
                            { value: 'auto', label: 'Par défaut (Suit la section)' },
                            { value: 'start', label: 'Gauche / Haut' },
                            { value: 'center', label: 'Centré' },
                            { value: 'end', label: 'Droite / Bas' },
                            { value: 'stretch', label: 'Étirer (100%)' },
                        ]}
                    />

                    {/* Gradient Toggle */}
                    <StyledToggle
                        label="Utiliser un dégradé"
                        checked={(block.style as any)?.gradient || false}
                        onChange={(checked) => onUpdate({ style: { ...block.style, gradient: checked } } as any)}
                    />

                    {(block.style as any)?.gradient ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <StyledColorPicker
                                label="Début"
                                value={(block.style as any)?.gradientFrom || '#22d3ee'}
                                onChange={(val) => onUpdate({ style: { ...block.style, gradientFrom: val } } as any)}
                            />
                            <StyledColorPicker
                                label="Fin"
                                value={(block.style as any)?.gradientTo || '#a855f7'}
                                onChange={(val) => onUpdate({ style: { ...block.style, gradientTo: val } } as any)}
                            />
                        </div>
                    ) : (
                        <StyledColorPicker
                            label="Couleur texte"
                            value={(block.style as any)?.color || '#ffffff'}
                            onChange={(val) => onUpdate({ style: { ...block.style, color: val } } as any)}
                        />
                    )}

                    {/* Text Effects */}
                    <StyledSelect
                        label="Effet lumineux"
                        value={(block.style as any)?.textEffect || 'none'}
                        onChange={(e) => onUpdate({ style: { ...block.style, textEffect: e.target.value } } as any)}
                        options={[
                            { value: 'none', label: 'Aucun' },
                            { value: 'glow', label: 'Glow (lueur douce)' },
                            { value: 'neon', label: 'Néon (lumineux)' },
                            { value: 'shadow', label: 'Ombre portée' },
                            { value: 'outline', label: 'Contour' },
                            { value: '3d', label: 'Effet 3D' },
                        ]}
                    />

                    {/* Glow Color (if glow/neon effect selected) */}
                    {((block.style as any)?.textEffect === 'glow' || (block.style as any)?.textEffect === 'neon') && (
                        <StyledColorPicker
                            label="Couleur de la lueur"
                            value={(block.style as any)?.glowColor || '#22d3ee'}
                            onChange={(val) => onUpdate({ style: { ...block.style, glowColor: val } } as any)}
                        />
                    )}

                    {/* Text Alignment */}
                    <div>
                        <label style={labelStyle}>Alignement</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['left', 'center', 'right'].map(align => (
                                <button
                                    key={align}
                                    onClick={() => onUpdate({ style: { ...block.style, textAlign: align } } as any)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: (block.style as any)?.textAlign === align ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                                        border: (block.style as any)?.textAlign === align ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.25rem',
                                        color: '#d1d5db',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* BUTTON PROPERTIES - Phase C */}
            {block.type === 'button' && (
                <>
                    <StyledSelect
                        label="Forme"
                        value={(block.style as any)?.shape || 'rounded'}
                        onChange={(e) => onUpdate({ style: { ...block.style, shape: e.target.value } } as any)}
                        options={[
                            { value: 'rounded', label: 'Arrondi' },
                            { value: 'pill', label: 'Pilule' },
                            { value: 'square', label: 'Carré' },
                        ]}
                    />
                    <StyledSelect
                        label="Alignement Individuel"
                        value={(block.style as any)?.alignSelf || 'auto'}
                        onChange={(e) => onUpdate({ style: { ...block.style, alignSelf: e.target.value as any } })}
                        options={[
                            { value: 'auto', label: 'Par défaut' },
                            { value: 'start', label: 'Gauche' },
                            { value: 'center', label: 'Centré' },
                            { value: 'end', label: 'Droite' },
                            { value: 'stretch', label: 'Étirer' },
                        ]}
                    />
                    <StyledSelect
                        label="Style"
                        value={(block.style as any)?.variant || 'gradient'}
                        onChange={(e) => onUpdate({ style: { ...block.style, variant: e.target.value } } as any)}
                        options={[
                            { value: 'solid', label: 'Solide' },
                            { value: 'gradient', label: 'Dégradé' },
                            { value: 'outline', label: 'Contour' },
                            { value: 'ghost', label: 'Fantôme' },
                            { value: 'gloss', label: 'Gloss (Brillant)' },
                            { value: 'neon', label: 'Néon' },
                            { value: 'glass', label: 'Verre (Glassmorphism)' },
                        ]}
                    />
                    <StyledSelect
                        label="Taille"
                        value={(block.style as any)?.size || 'lg'}
                        onChange={(e) => onUpdate({ style: { ...block.style, size: e.target.value } } as any)}
                        options={[
                            { value: 'sm', label: 'Petit' },
                            { value: 'md', label: 'Moyen' },
                            { value: 'lg', label: 'Grand' },
                            { value: 'xl', label: 'Très grand' },
                        ]}
                    />
                    <StyledSelect
                        label="Effet hover"
                        value={(block.style as any)?.hoverEffect || 'scale'}
                        onChange={(e) => onUpdate({ style: { ...block.style, hoverEffect: e.target.value } } as any)}
                        options={[
                            { value: 'scale', label: 'Agrandir' },
                            { value: 'glow', label: 'Lueur' },
                            { value: 'lift', label: 'Élever' },
                            { value: 'shadow', label: 'Ombre portée' },
                        ]}
                    />
                    <StyledSelect
                        label="Type de lien"
                        value={(block as any).link?.type || 'url'}
                        onChange={(e) => onUpdate({ link: { ...(block as any).link, type: e.target.value } } as any)}
                        options={[
                            { value: 'url', label: 'URL externe' },
                            { value: 'page', label: 'Page interne' },
                            { value: 'email', label: 'Email' },
                            { value: 'phone', label: 'Téléphone' },
                        ]}
                    />
                    <div>
                        <label style={labelStyle}>Destination</label>
                        <UrlInputWithPicker
                            value={(block as any).link?.target || ''}
                            onChange={(url) => onUpdate({ link: { ...(block as any).link, target: url } } as any)}
                            placeholder={(block as any).link?.type === 'email' ? 'contact@example.com' : 'https://...'}
                            tenantId={tenantId}
                            type="any"
                        />
                    </div>
                </>
            )}

            {/* IMAGE PROPERTIES */}
            {block.type === 'image' && (
                <>
                    {(block.content as any).url && (
                        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '0.5rem', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                            <img src={(block.content as any).url} alt={(block.content as any).alt || 'Preview'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    <div>
                        <label style={labelStyle}>Image</label>
                        <UrlInputWithPicker
                            value={(block.content as any).url || ''}
                            onChange={(url) => onUpdate({ content: { ...block.content, url } } as any)}
                            tenantId={tenantId}
                            type="image"
                        />
                    </div>
                    <StyledInput
                        label="Texte alternatif"
                        value={(block.content as any).alt || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, alt: e.target.value } } as any)}
                        placeholder="Description de l'image"
                    />

                    {/* Link Editor for Image */}
                    <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <StyledSelect
                            label="Lien sur l'image"
                            value={(block as any).link?.type || 'none'}
                            onChange={(e) => onUpdate({ link: e.target.value === 'none' ? undefined : { type: e.target.value as any, target: '' } } as any)}
                            options={[
                                { value: 'none', label: 'Aucun lien' },
                                { value: 'url', label: 'URL externe' },
                                { value: 'page', label: 'Page interne' },
                            ]}
                        />
                        {(block as any).link && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <StyledInput
                                    value={(block as any).link.target}
                                    onChange={(e) => onUpdate({ link: { ...(block as any).link, target: e.target.value } } as any)}
                                    placeholder={(block as any).link.type === 'page' ? '/slug-page' : 'https://...'}
                                />
                                {(block as any).link.type === 'page' && (
                                    <div style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <a href="/admin" target="_blank" style={{ fontSize: '0.75rem', color: '#22d3ee', textDecoration: 'none' }}>
                                            + Gérer les pages
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sizing for Logo/Image */}
                    <div style={{ marginTop: '1rem' }}>
                        <StyledInput
                            label="Largeur (Optionnel)"
                            value={(block.style as any)?.width || ''}
                            onChange={(e) => onUpdate({ style: { ...block.style, width: e.target.value } } as any)}
                            placeholder="ex: 150px, 50%"
                        />
                        <StyledInput
                            label="Largeur Max"
                            value={(block.style as any)?.maxWidth || ''}
                            onChange={(e) => onUpdate({ style: { ...block.style, maxWidth: e.target.value } } as any)}
                            placeholder="ex: 100%"
                        />
                    </div>

                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(34,211,238,0.1)', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#22d3ee' }}>
                        💡 Astuce: Pour afficher plusieurs photos, utilisez le bloc <strong>Galerie</strong> ou <strong>Carrousel</strong>.
                    </div>
                </>
            )}

            {/* VIDEO PROPERTIES */}
            {block.type === 'video' && (
                <>
                    <div>
                        <label style={labelStyle}>URL Vidéo (YouTube/Vimeo/MP4)</label>
                        <UrlInputWithPicker
                            value={(block.content as any).url || ''}
                            onChange={(url) => onUpdate({ content: { ...block.content, url } } as any)}
                            placeholder="https://youtube.com/watch?v=..."
                            tenantId={tenantId}
                            type="video"
                        />
                    </div>
                    <StyledSelect
                        label="Format"
                        value={(block.style as any)?.aspectRatio || '16:9'}
                        onChange={(e) => onUpdate({ style: { ...block.style, aspectRatio: e.target.value } } as any)}
                        options={[
                            { value: '16:9', label: '16:9 (Widescreen)' },
                            { value: '4:3', label: '4:3 (Standard)' },
                            { value: '1:1', label: '1:1 (Carré)' },
                            { value: '21:9', label: '21:9 (Cinéma)' },
                        ]}
                    />
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <StyledToggle
                            label="Autoplay"
                            checked={(block.style as any)?.autoplay || false}
                            onChange={(checked) => onUpdate({ style: { ...block.style, autoplay: checked } } as any)}
                        />
                        <StyledToggle
                            label="Loop"
                            checked={(block.style as any)?.loop || false}
                            onChange={(checked) => onUpdate({ style: { ...block.style, loop: checked } } as any)}
                        />
                    </div>
                </>
            )}

            {/* FORM PROPERTIES - Phase A */}
            {block.type === 'form' && (
                <>
                    <StyledInput
                        label="Titre du formulaire"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="Texte du bouton"
                        value={(block.content as any).submitText || 'Envoyer'}
                        onChange={(e) => onUpdate({ content: { ...block.content, submitText: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="Webhook URL (n8n)"
                        value={(block.content as any).webhookUrl || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, webhookUrl: e.target.value } } as any)}
                        placeholder="https://n8n.example.com/webhook/..."
                    />
                    <StyledSelect
                        label="Style"
                        value={(block.style as any)?.variant || 'bordered'}
                        onChange={(e) => onUpdate({ style: { ...block.style, variant: e.target.value } } as any)}
                        options={[
                            { value: 'minimal', label: 'Minimal' },
                            { value: 'bordered', label: 'Bordé' },
                            { value: 'filled', label: 'Rempli' },
                            { value: 'glass', label: 'Verre (Glass)' },
                        ]}
                    />
                    <StyledSelect
                        label="Style bouton"
                        value={(block.style as any)?.buttonVariant || 'gradient'}
                        onChange={(e) => onUpdate({ style: { ...block.style, buttonVariant: e.target.value } } as any)}
                        options={[
                            { value: 'gradient', label: 'Dégradé' },
                            { value: 'solid', label: 'Solide' },
                            { value: 'outline', label: 'Contour' },
                            { value: 'glow', label: 'Lumineux (Glow)' },
                        ]}
                    />
                    <StyledColorPicker
                        label="Couleur accent"
                        value={(block.style as any)?.accentColor || '#22d3ee'}
                        onChange={(val) => onUpdate({ style: { ...block.style, accentColor: val } } as any)}
                    />
                    <StyledInput
                        label="Message de confirmation"
                        value={(block.content as any).successMessage || 'Merci ! Votre message a été envoyé.'}
                        onChange={(e) => onUpdate({ content: { ...block.content, successMessage: e.target.value } } as any)}
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                        <label style={labelStyle}>Champs ({(block.content as any).fields?.length || 0})</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {((block.content as any).fields || []).map((field: FormField, idx: number) => (
                                <div key={field.id} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        <input type="text" value={field.label} onChange={(e) => {
                                            const fields = [...(block.content as any).fields];
                                            fields[idx] = { ...fields[idx], label: e.target.value };
                                            onUpdate({ content: { ...block.content, fields } } as any);
                                        }} style={{ ...inputStyle, flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} placeholder="Label" />
                                        <select value={field.type} onChange={(e) => {
                                            const fields = [...(block.content as any).fields];
                                            fields[idx] = { ...fields[idx], type: e.target.value };
                                            onUpdate({ content: { ...block.content, fields } } as any);
                                        }} style={{ ...inputStyle, width: '80px', padding: '0.25rem', fontSize: '0.75rem' }}>
                                            <option value="text">Texte</option>
                                            <option value="email">Email</option>
                                            <option value="tel">Tél</option>
                                            <option value="textarea">Long</option>
                                            <option value="select">Liste</option>
                                        </select>
                                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.65rem', color: '#9ca3af' }}>
                                            <input type="checkbox" checked={field.required || false} onChange={(e) => {
                                                const fields = [...(block.content as any).fields];
                                                fields[idx] = { ...fields[idx], required: e.target.checked };
                                                onUpdate({ content: { ...block.content, fields } } as any);
                                            }} /> *
                                        </label>
                                        <button onClick={() => {
                                            const fields = (block.content as any).fields.filter((_: any, i: number) => i !== idx);
                                            onUpdate({ content: { ...block.content, fields } } as any);
                                        }} style={{ ...miniButtonStyle, color: '#ef4444' }}><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => {
                                const fields = [...((block.content as any).fields || []), { id: `field_${Date.now()}`, type: 'text', label: 'Nouveau champ', required: false }];
                                onUpdate({ content: { ...block.content, fields } } as any);
                            }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem', gap: '0.25rem' }}>
                                <Plus size={14} /> Ajouter un champ
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* CAROUSEL PROPERTIES - Phase D */}
            {block.type === 'carousel' && (
                <>
                    <div>
                        <label style={labelStyle}>Images ({(block.content as any).images?.length || 0})</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {((block.content as any).images || []).map((img: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                    <div style={{ width: '48px', height: '32px', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                        {img.url && <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <button onClick={() => openAssetPicker(idx)} style={{ ...miniButtonStyle, flex: 1, fontSize: '0.65rem' }}><ImageIcon size={12} /></button>
                                    <button onClick={() => {
                                        const images = (block.content as any).images.filter((_: any, i: number) => i !== idx);
                                        onUpdate({ content: { ...block.content, images } } as any);
                                    }} style={{ ...miniButtonStyle, color: '#ef4444' }}><Trash2 size={12} /></button>
                                </div>
                            ))}
                            <button onClick={() => {
                                const images = [...((block.content as any).images || []), { url: '', alt: '' }];
                                onUpdate({ content: { ...block.content, images } } as any);
                            }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                        </div>
                    </div>
                    <StyledSelect
                        label="Transition"
                        value={(block.style as any)?.transition || 'slide'}
                        onChange={(e) => onUpdate({ style: { ...block.style, transition: e.target.value } } as any)}
                        options={[
                            { value: 'slide', label: 'Glisser' },
                            { value: 'fade', label: 'Fondu' },
                        ]}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <StyledToggle
                            label="Auto"
                            checked={(block.content as any)?.autoplay !== false}
                            onChange={(checked) => onUpdate({ content: { ...block.content, autoplay: checked } } as any)}
                        />
                        <StyledToggle
                            label="Flèches"
                            checked={(block.style as any)?.showArrows !== false}
                            onChange={(checked) => onUpdate({ style: { ...block.style, showArrows: checked } } as any)}
                        />
                        <StyledToggle
                            label="Points"
                            checked={(block.style as any)?.showDots !== false}
                            onChange={(checked) => onUpdate({ style: { ...block.style, showDots: checked } } as any)}
                        />
                    </div>
                    <AssetPicker tenantId={tenantId} isOpen={showAssetPicker} currentUrl={typeof assetPickerTarget === 'number' ? (block.content as any).images?.[assetPickerTarget]?.url : ''} onSelect={(url, alt) => {
                        if (typeof assetPickerTarget === 'number') {
                            const images = [...(block.content as any).images];
                            images[assetPickerTarget] = { ...images[assetPickerTarget], url, alt };
                            onUpdate({ content: { ...block.content, images } } as any);
                        }
                    }} onClose={() => setShowAssetPicker(false)} />
                </>
            )}

            {/* GALLERY PROPERTIES - Phase D */}
            {block.type === 'gallery' && (
                <>
                    <div>
                        <label style={labelStyle}>Images ({(block.content as any).images?.length || 0})</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {((block.content as any).images || []).map((img: any, idx: number) => (
                                <div key={idx} style={{ position: 'relative', aspectRatio: '1', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                    {img.url && <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', display: 'flex', gap: '0.25rem' }}>
                                        <button onClick={() => openAssetPicker(idx)} style={{ ...miniButtonStyle, background: 'rgba(0,0,0,0.7)' }}><ImageIcon size={10} /></button>
                                        <button onClick={() => {
                                            const images = (block.content as any).images.filter((_: any, i: number) => i !== idx);
                                            onUpdate({ content: { ...block.content, images } } as any);
                                        }} style={{ ...miniButtonStyle, background: 'rgba(0,0,0,0.7)', color: '#ef4444' }}><Trash2 size={10} /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => {
                                const images = [...((block.content as any).images || []), { url: '', alt: '' }];
                                onUpdate({ content: { ...block.content, images } } as any);
                            }} style={{ ...miniButtonStyle, aspectRatio: '1', flexDirection: 'column' }}><Plus size={16} /></button>
                        </div>
                    </div>
                    <StyledSelect
                        label="Colonnes"
                        value={(block.style as any)?.columns || 3}
                        onChange={(e) => onUpdate({ style: { ...block.style, columns: Number(e.target.value) } } as any)}
                        options={[
                            { value: 2, label: '2 colonnes' },
                            { value: 3, label: '3 colonnes' },
                            { value: 4, label: '4 colonnes' },
                            { value: 5, label: '5 colonnes' },
                        ]}
                    />
                    <StyledSelect
                        label="Effet hover"
                        value={(block.style as any)?.hoverEffect || 'zoom'}
                        onChange={(e) => onUpdate({ style: { ...block.style, hoverEffect: e.target.value } } as any)}
                        options={[
                            { value: 'none', label: 'Aucun' },
                            { value: 'zoom', label: 'Zoom' },
                            { value: 'lift', label: 'Élever' },
                            { value: 'glow', label: 'Lueur' },
                        ]}
                    />
                    <AssetPicker tenantId={tenantId} isOpen={showAssetPicker} currentUrl={typeof assetPickerTarget === 'number' ? (block.content as any).images?.[assetPickerTarget]?.url : ''} onSelect={(url, alt) => {
                        if (typeof assetPickerTarget === 'number') {
                            const images = [...(block.content as any).images];
                            images[assetPickerTarget] = { ...images[assetPickerTarget], url, alt };
                            onUpdate({ content: { ...block.content, images } } as any);
                        }
                    }} onClose={() => setShowAssetPicker(false)} />
                </>
            )}

            {/* LOGO-CLOUD PROPERTIES */}
            {block.type === 'logo-cloud' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                        placeholder="Nos partenaires"
                    />
                    <div>
                        <label style={labelStyle}>Logos ({(block.content as any).logos?.length || 0})</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            {((block.content as any).logos || []).map((logo: any, idx: number) => (
                                <div key={idx} style={{ position: 'relative', aspectRatio: '3/1', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                    {logo.url && <img src={logo.url} alt={logo.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                                    <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', display: 'flex', gap: '0.25rem' }}>
                                        <button onClick={() => openAssetPicker(idx)} style={{ ...miniButtonStyle, background: 'rgba(0,0,0,0.7)' }}><ImageIcon size={10} /></button>
                                        <button onClick={() => {
                                            const logos = (block.content as any).logos.filter((_: any, i: number) => i !== idx);
                                            onUpdate({ content: { ...block.content, logos } } as any);
                                        }} style={{ ...miniButtonStyle, background: 'rgba(0,0,0,0.7)', color: '#ef4444' }}><Trash2 size={10} /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => {
                                const logos = [...((block.content as any).logos || []), { url: '', alt: '' }];
                                onUpdate({ content: { ...block.content, logos } } as any);
                            }} style={{ ...miniButtonStyle, aspectRatio: '3/1', flexDirection: 'column' }}><Plus size={16} /></button>
                        </div>
                    </div>
                    <StyledSelect
                        label="Colonnes"
                        value={(block.style as any)?.columns || 4}
                        onChange={(e) => onUpdate({ style: { ...block.style, columns: Number(e.target.value) } } as any)}
                        options={[
                            { value: 3, label: '3 colonnes' },
                            { value: 4, label: '4 colonnes' },
                            { value: 5, label: '5 colonnes' },
                            { value: 6, label: '6 colonnes' },
                        ]}
                    />
                    <StyledToggle
                        label="Niveaux de gris (couleur au hover)"
                        checked={(block.style as any)?.grayscale ?? true}
                        onChange={(checked) => onUpdate({ style: { ...block.style, grayscale: checked } } as any)}
                    />
                    <AssetPicker tenantId={tenantId} isOpen={showAssetPicker} currentUrl={typeof assetPickerTarget === 'number' ? (block.content as any).logos?.[assetPickerTarget]?.url : ''} onSelect={(url, alt) => {
                        if (typeof assetPickerTarget === 'number') {
                            const logos = [...(block.content as any).logos];
                            logos[assetPickerTarget] = { ...logos[assetPickerTarget], url, alt };
                            onUpdate({ content: { ...block.content, logos } } as any);
                        }
                    }} onClose={() => setShowAssetPicker(false)} />
                </>
            )}

            {/* TESTIMONIAL PROPERTIES */}
            {block.type === 'testimonial' && (
                <>
                    <StyledTextarea
                        label="Citation"
                        value={(block.content as any).quote || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, quote: e.target.value } } as any)}
                        placeholder="Le témoignage de votre client..."
                    />
                    <StyledInput
                        label="Auteur"
                        value={(block.content as any).author || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, author: e.target.value } } as any)}
                        placeholder="Jean Dupont"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <StyledInput
                            label="Rôle"
                            value={(block.content as any).role || ''}
                            onChange={(e) => onUpdate({ content: { ...block.content, role: e.target.value } } as any)}
                            placeholder="CEO"
                        />
                        <StyledInput
                            label="Entreprise"
                            value={(block.content as any).company || ''}
                            onChange={(e) => onUpdate({ content: { ...block.content, company: e.target.value } } as any)}
                            placeholder="Entreprise SA"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Photo (Avatar)</label>
                        <UrlInputWithPicker
                            value={(block.content as any).avatarUrl || ''}
                            onChange={(url) => onUpdate({ content: { ...block.content, avatarUrl: url } } as any)}
                            tenantId={tenantId}
                            type="image"
                        />
                    </div>
                    <StyledSelect
                        label="Note (étoiles)"
                        value={(block.content as any).rating || 5}
                        onChange={(e) => onUpdate({ content: { ...block.content, rating: Number(e.target.value) } } as any)}
                        options={[
                            { value: 5, label: '5 étoiles' },
                            { value: 4, label: '4 étoiles' },
                            { value: 3, label: '3 étoiles' },
                            { value: 2, label: '2 étoiles' },
                            { value: 1, label: '1 étoile' },
                        ]}
                    />
                    <StyledSelect
                        label="Style"
                        value={(block.style as any)?.variant || 'card'}
                        onChange={(e) => onUpdate({ style: { ...block.style, variant: e.target.value } } as any)}
                        options={[
                            { value: 'card', label: 'Carte (verre)' },
                            { value: 'minimal', label: 'Minimal' },
                            { value: 'quote', label: 'Citation décorative' },
                            { value: 'bubble', label: 'Bulle de chat' },
                        ]}
                    />
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <StyledToggle
                            label="Icône quote"
                            checked={(block.style as any)?.showQuoteIcon !== false}
                            onChange={(checked) => onUpdate({ style: { ...block.style, showQuoteIcon: checked } } as any)}
                        />
                        <StyledToggle
                            label="Afficher note"
                            checked={(block.style as any)?.showRating !== false}
                            onChange={(checked) => onUpdate({ style: { ...block.style, showRating: checked } } as any)}
                        />
                    </div>
                    <AssetPicker tenantId={tenantId} isOpen={showAssetPicker} currentUrl={(block.content as any).avatarUrl || ''} onSelect={(url) => {
                        onUpdate({ content: { ...block.content, avatarUrl: url } } as any);
                    }} onClose={() => setShowAssetPicker(false)} />
                </>
            )}

            {/* SPACER PROPERTIES */}
            {block.type === 'spacer' && (
                <StyledSelect
                    label="Hauteur"
                    value={(block.content as any).height || '2rem'}
                    onChange={(e) => onUpdate({ content: { ...block.content, height: e.target.value } } as any)}
                    options={[
                        { value: '1rem', label: 'Petit (1rem)' },
                        { value: '2rem', label: 'Moyen (2rem)' },
                        { value: '4rem', label: 'Grand (4rem)' },
                        { value: '6rem', label: 'Très grand (6rem)' },
                        { value: '8rem', label: 'Extra (8rem)' },
                    ]}
                />
            )}

            {/* DIVIDER PROPERTIES */}
            {block.type === 'divider' && (
                <>
                    <StyledSelect
                        label="Style"
                        value={(block.style as any)?.variant || 'solid'}
                        onChange={(e) => onUpdate({ style: { ...block.style, variant: e.target.value } } as any)}
                        options={[
                            { value: 'solid', label: 'Ligne pleine' },
                            { value: 'dashed', label: 'Pointillés' },
                            { value: 'gradient', label: 'Dégradé' },
                        ]}
                    />
                    <StyledSelect
                        label="Épaisseur"
                        value={(block.style as any)?.thickness || '1px'}
                        onChange={(e) => onUpdate({ style: { ...block.style, thickness: e.target.value } } as any)}
                        options={[
                            { value: '1px', label: 'Fine' },
                            { value: '2px', label: 'Moyenne' },
                            { value: '4px', label: 'Épaisse' },
                        ]}
                    />
                </>
            )}

            {/* ICON PROPERTIES */}
            {block.type === 'icon' && (
                <>
                    <StyledInput
                        label="Icône (Lucide)"
                        value={(block.content as any).name || 'Star'}
                        onChange={(e) => onUpdate({ content: { ...block.content, name: e.target.value } } as any)}
                        placeholder="Star, Heart, Zap..."
                    />
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '-0.25rem', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
                        Voir <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none' }}>lucide.dev/icons</a> pour la liste
                    </div>
                    <StyledSelect
                        label="Taille"
                        value={(block.style as any)?.size || 'lg'}
                        onChange={(e) => onUpdate({ style: { ...block.style, size: e.target.value } } as any)}
                        options={[
                            { value: 'sm', label: 'Petit' },
                            { value: 'md', label: 'Moyen' },
                            { value: 'lg', label: 'Grand' },
                            { value: 'xl', label: 'Très grand' },
                        ]}
                    />
                </>
            )}

            {/* FAQ PROPERTIES */}
            {block.type === 'faq' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <div>
                        <label style={labelStyle}>Questions ({(block.content as any).items?.length || 0})</label>
                        {((block.content as any).items || []).map((item: any, idx: number) => (
                            <div key={item.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => {
                                        const items = [...(block.content as any).items];
                                        items[idx] = { ...items[idx], question: e.target.value };
                                        onUpdate({ content: { ...block.content, items } } as any);
                                    }}
                                    style={{ ...inputStyle, marginBottom: '0.25rem' }}
                                    placeholder="Question"
                                />
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => {
                                        const items = [...(block.content as any).items];
                                        items[idx] = { ...items[idx], answer: e.target.value };
                                        onUpdate({ content: { ...block.content, items } } as any);
                                    }}
                                    style={{ ...inputStyle, minHeight: '50px' }}
                                    placeholder="Réponse"
                                />
                                <button onClick={() => {
                                    const items = (block.content as any).items.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...miniButtonStyle, marginTop: '0.25rem', color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const items = [...((block.content as any).items || []), { id: `q${Date.now()}`, question: '', answer: '' }];
                            onUpdate({ content: { ...block.content, items } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                </>
            )}

            {/* STATS-COUNTER PROPERTIES */}
            {block.type === 'stats-counter' && (
                <>
                    <div>
                        <label style={labelStyle}>Statistiques ({(block.content as any).stats?.length || 0})</label>
                        {((block.content as any).stats || []).map((stat: any, idx: number) => (
                            <div key={stat.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                                <input type="number" value={stat.value} onChange={(e) => {
                                    const stats = [...(block.content as any).stats];
                                    stats[idx] = { ...stats[idx], value: Number(e.target.value) };
                                    onUpdate({ content: { ...block.content, stats } } as any);
                                }} style={inputStyle} placeholder="Valeur" />
                                <input type="text" value={stat.suffix || ''} onChange={(e) => {
                                    const stats = [...(block.content as any).stats];
                                    stats[idx] = { ...stats[idx], suffix: e.target.value };
                                    onUpdate({ content: { ...block.content, stats } } as any);
                                }} style={inputStyle} placeholder="+ / K / %" />
                                <input type="text" value={stat.label} onChange={(e) => {
                                    const stats = [...(block.content as any).stats];
                                    stats[idx] = { ...stats[idx], label: e.target.value };
                                    onUpdate({ content: { ...block.content, stats } } as any);
                                }} style={{ ...inputStyle, gridColumn: 'span 2' }} placeholder="Label" />
                            </div>
                        ))}
                        <button onClick={() => {
                            const stats = [...((block.content as any).stats || []), { id: `s${Date.now()}`, value: 0, suffix: '', label: '' }];
                            onUpdate({ content: { ...block.content, stats } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                    <StyledToggle
                        label="Animation compteur"
                        checked={(block.style as any)?.animate !== false}
                        onChange={(checked) => onUpdate({ style: { ...block.style, animate: checked } } as any)}
                    />
                </>
            )}

            {/* CTA-SECTION PROPERTIES */}
            {block.type === 'cta-section' && (
                <>
                    <StyledInput
                        label="Titre accrocheur"
                        value={(block.content as any).headline || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, headline: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="Sous-titre"
                        value={(block.content as any).subheadline || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, subheadline: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="Texte du bouton"
                        value={(block.content as any).primaryButtonText || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, primaryButtonText: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="URL du bouton"
                        value={(block.content as any).primaryButtonUrl || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, primaryButtonUrl: e.target.value } } as any)}
                    />
                </>
            )}

            {/* COUNTDOWN PROPERTIES */}
            {block.type === 'countdown' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="Date cible"
                        type="datetime-local"
                        value={(block.content as any).targetDate?.slice(0, 16) || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, targetDate: new Date(e.target.value).toISOString() } } as any)}
                    />
                </>
            )}

            {/* NEWSLETTER PROPERTIES */}
            {block.type === 'newsletter' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="Sous-titre"
                        value={(block.content as any).subtitle || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, subtitle: e.target.value } } as any)}
                    />
                    <StyledInput
                        label="Texte du bouton"
                        value={(block.content as any).buttonText || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, buttonText: e.target.value } } as any)}
                    />
                </>
            )}

            {/* WHATSAPP-BUTTON PROPERTIES */}
            {block.type === 'whatsapp-button' && (
                <>
                    <StyledInput
                        label="Numéro WhatsApp"
                        type="tel"
                        value={(block.content as any).phoneNumber || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, phoneNumber: e.target.value } } as any)}
                        placeholder="+41791234567"
                    />
                    <StyledInput
                        label="Message pré-rempli"
                        value={(block.content as any).message || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, message: e.target.value } } as any)}
                        placeholder="Bonjour !"
                    />
                    <StyledInput
                        label="Texte du bouton"
                        value={(block.content as any).buttonText || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, buttonText: e.target.value } } as any)}
                        placeholder="Nous contacter"
                    />
                </>
            )}

            {/* INFINITE-ZOOM PROPERTIES */}
            {block.type === 'infinite-zoom' && (
                <>
                    <div>
                        <label style={labelStyle}>Layers ({(block.content as any).layers?.length || 0})</label>
                        {((block.content as any).layers || []).map((layer: any, idx: number) => (
                            <div key={layer.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <UrlInputWithPicker
                                            value={layer.imageUrl || ''}
                                            onChange={(url) => {
                                                const layers = [...(block.content as any).layers];
                                                layers[idx] = { ...layers[idx], imageUrl: url };
                                                onUpdate({ content: { ...block.content, layers } } as any);
                                            }}
                                            tenantId={tenantId}
                                            type="image"
                                            placeholder="URL Image"
                                        />
                                    </div>
                                    <button onClick={() => {
                                        const layers = (block.content as any).layers.filter((_: any, i: number) => i !== idx);
                                        onUpdate({ content: { ...block.content, layers } } as any);
                                    }} style={{ ...miniButtonStyle, color: '#ef4444', height: '2.5rem', marginTop: '0' }}><Trash2 size={12} /></button>
                                </div>
                                <input type="text" value={layer.title || ''} onChange={(e) => {
                                    const layers = [...(block.content as any).layers];
                                    layers[idx] = { ...layers[idx], title: e.target.value };
                                    onUpdate({ content: { ...block.content, layers } } as any);
                                }} style={inputStyle} placeholder="Titre du layer" />
                            </div>
                        ))}
                        <button onClick={() => {
                            const layers = [...((block.content as any).layers || []), { id: `l${Date.now()}`, imageUrl: '', title: '' }];
                            onUpdate({ content: { ...block.content, layers } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter layer</button>
                    </div>
                    <AssetPicker tenantId={tenantId} isOpen={showAssetPicker} currentUrl={typeof assetPickerTarget === 'number' ? (block.content as any).layers?.[assetPickerTarget]?.imageUrl : ''} onSelect={(url) => {
                        if (typeof assetPickerTarget === 'number') {
                            const layers = [...(block.content as any).layers];
                            layers[assetPickerTarget] = { ...layers[assetPickerTarget], imageUrl: url };
                            onUpdate({ content: { ...block.content, layers } } as any);
                        }
                    }} onClose={() => setShowAssetPicker(false)} />
                </>
            )}

            {/* BEFORE-AFTER PROPERTIES */}
            {block.type === 'before-after' && (
                <>
                    <div>
                        <label style={labelStyle}>Image AVANT</label>
                        <UrlInputWithPicker
                            value={(block.content as any).beforeImage || ''}
                            onChange={(url) => onUpdate({ content: { ...block.content, beforeImage: url } } as any)}
                            tenantId={tenantId}
                            type="image"
                        />
                        {(block.content as any).beforeImage && <img src={(block.content as any).beforeImage} alt="Before" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '0.25rem', marginTop: '0.25rem' }} />}
                    </div>
                    <div>
                        <label style={labelStyle}>Image APRÈS</label>
                        <UrlInputWithPicker
                            value={(block.content as any).afterImage || ''}
                            onChange={(url) => onUpdate({ content: { ...block.content, afterImage: url } } as any)}
                            tenantId={tenantId}
                            type="image"
                        />
                        {(block.content as any).afterImage && <img src={(block.content as any).afterImage} alt="After" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '0.25rem', marginTop: '0.25rem' }} />}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <StyledInput
                            label="Label Avant"
                            value={(block.content as any).beforeLabel || 'Avant'}
                            onChange={(e) => onUpdate({ content: { ...block.content, beforeLabel: e.target.value } } as any)}
                        />
                        <StyledInput
                            label="Label Après"
                            value={(block.content as any).afterLabel || 'Après'}
                            onChange={(e) => onUpdate({ content: { ...block.content, afterLabel: e.target.value } } as any)}
                        />
                    </div>
                    <AssetPicker tenantId={tenantId} isOpen={showAssetPicker} currentUrl={assetPickerTarget === 0 ? (block.content as any).beforeImage : (block.content as any).afterImage} onSelect={(url) => {
                        if (assetPickerTarget === 0) onUpdate({ content: { ...block.content, beforeImage: url } } as any);
                        else onUpdate({ content: { ...block.content, afterImage: url } } as any);
                    }} onClose={() => setShowAssetPicker(false)} />
                </>
            )}

            {/* MARQUEE PROPERTIES */}
            {block.type === 'marquee' && (
                <>
                    <div>
                        <label style={labelStyle}>Éléments ({(block.content as any).items?.length || 0})</label>
                        {((block.content as any).items || []).map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                <input type="text" value={item.text} onChange={(e) => {
                                    const items = [...(block.content as any).items];
                                    items[idx] = { ...items[idx], text: e.target.value };
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={inputStyle} />
                                <button onClick={() => {
                                    const items = (block.content as any).items.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...miniButtonStyle, color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const items = [...((block.content as any).items || []), { text: 'Nouveau' }];
                            onUpdate({ content: { ...block.content, items } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                    <StyledSelect
                        label="Direction"
                        value={(block.style as any)?.direction || 'left'}
                        onChange={(e) => onUpdate({ style: { ...block.style, direction: e.target.value } } as any)}
                        options={[
                            { value: 'left', label: 'Vers la gauche' },
                            { value: 'right', label: 'Vers la droite' },
                        ]}
                    />
                    <StyledSelect
                        label="Vitesse"
                        value={(block.style as any)?.speed || 'normal'}
                        onChange={(e) => onUpdate({ style: { ...block.style, speed: e.target.value } } as any)}
                        options={[
                            { value: 'slow', label: 'Lent' },
                            { value: 'normal', label: 'Normal' },
                            { value: 'fast', label: 'Rapide' },
                        ]}
                    />
                </>
            )}

            {/* FEATURE-GRID PROPERTIES */}
            {block.type === 'feature-grid' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <div>
                        <label style={labelStyle}>Features ({(block.content as any).features?.length || 0})</label>
                        {((block.content as any).features || []).map((feat: any, idx: number) => (
                            <div key={feat.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <input type="text" value={feat.icon || ''} onChange={(e) => {
                                    const features = [...(block.content as any).features];
                                    features[idx] = { ...features[idx], icon: e.target.value };
                                    onUpdate({ content: { ...block.content, features } } as any);
                                }} style={{ ...inputStyle, marginBottom: '0.25rem' }} placeholder="Icône (Zap, Shield...)" />
                                <input type="text" value={feat.title || ''} onChange={(e) => {
                                    const features = [...(block.content as any).features];
                                    features[idx] = { ...features[idx], title: e.target.value };
                                    onUpdate({ content: { ...block.content, features } } as any);
                                }} style={{ ...inputStyle, marginBottom: '0.25rem' }} placeholder="Titre" />
                                <input type="text" value={feat.description || ''} onChange={(e) => {
                                    const features = [...(block.content as any).features];
                                    features[idx] = { ...features[idx], description: e.target.value };
                                    onUpdate({ content: { ...block.content, features } } as any);
                                }} style={inputStyle} placeholder="Description" />
                                <button onClick={() => {
                                    const features = (block.content as any).features.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, features } } as any);
                                }} style={{ ...miniButtonStyle, marginTop: '0.25rem', color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const features = [...((block.content as any).features || []), { id: `f${Date.now()}`, icon: 'Star', title: '', description: '' }];
                            onUpdate({ content: { ...block.content, features } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                </>
            )}

            {/* BENTO-GRID PROPERTIES */}
            {block.type === 'bento-grid' && (
                <>
                    <div>
                        <label style={labelStyle}>Items ({(block.content as any).items?.length || 0})</label>
                        {((block.content as any).items || []).map((item: any, idx: number) => (
                            <div key={item.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                    <input type="text" value={item.title || ''} onChange={(e) => {
                                        const items = [...(block.content as any).items];
                                        items[idx] = { ...items[idx], title: e.target.value };
                                        onUpdate({ content: { ...block.content, items } } as any);
                                    }} style={inputStyle} placeholder="Titre" />
                                    <select value={item.span || 'md'} onChange={(e) => {
                                        const items = [...(block.content as any).items];
                                        items[idx] = { ...items[idx], span: e.target.value };
                                        onUpdate({ content: { ...block.content, items } } as any);
                                    }} style={{ ...inputStyle, padding: '0.25rem' }}>
                                        <option value="sm">Petit</option>
                                        <option value="md">Moyen</option>
                                        <option value="lg">Grand</option>
                                    </select>
                                </div>
                                <input type="text" value={item.icon || ''} onChange={(e) => {
                                    const items = [...(block.content as any).items];
                                    items[idx] = { ...items[idx], icon: e.target.value };
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={inputStyle} placeholder="Icône" />
                                <button onClick={() => {
                                    const items = (block.content as any).items.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...miniButtonStyle, marginTop: '0.25rem', color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const items = [...((block.content as any).items || []), { id: `b${Date.now()}`, title: '', icon: 'Zap', span: 'md' }];
                            onUpdate({ content: { ...block.content, items } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                </>
            )}

            {/* TIMELINE PROPERTIES */}
            {block.type === 'timeline' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <div>
                        <label style={labelStyle}>Style</label>
                        <select
                            value={(block.style as any)?.variant || 'vertical'}
                            onChange={(e) => onUpdate({ style: { ...block.style, variant: e.target.value } } as any)}
                            style={{ ...inputStyle, marginBottom: '0.5rem' }}
                        >
                            <option value="vertical">Vertical</option>
                            <option value="horizontal">Horizontal</option>
                            <option value="alternating">Alterné</option>
                        </select>
                        <select
                            value={(block.style as any)?.markerStyle || 'dot'}
                            onChange={(e) => onUpdate({ style: { ...block.style, markerStyle: e.target.value } } as any)}
                            style={inputStyle}
                        >
                            <option value="dot">Points</option>
                            <option value="icon">Icones</option>
                            <option value="number">Numéros</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Étapes ({(block.content as any).items?.length || 0})</label>
                        {((block.content as any).items || []).map((item: any, idx: number) => (
                            <div key={item.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <input type="text" value={item.date || ''} onChange={(e) => {
                                    const items = [...(block.content as any).items];
                                    items[idx] = { ...items[idx], date: e.target.value };
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...inputStyle, marginBottom: '0.25rem' }} placeholder="Date/Année" />
                                <input type="text" value={item.title || ''} onChange={(e) => {
                                    const items = [...(block.content as any).items];
                                    items[idx] = { ...items[idx], title: e.target.value };
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...inputStyle, marginBottom: '0.25rem' }} placeholder="Titre" />
                                <input type="text" value={item.description || ''} onChange={(e) => {
                                    const items = [...(block.content as any).items];
                                    items[idx] = { ...items[idx], description: e.target.value };
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={inputStyle} placeholder="Description" />
                                <button onClick={() => {
                                    const items = (block.content as any).items.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...miniButtonStyle, marginTop: '0.25rem', color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const items = [...((block.content as any).items || []), { id: `t${Date.now()}`, date: '', title: '', description: '' }];
                            onUpdate({ content: { ...block.content, items } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                </>
            )}

            {/* TEAM PROPERTIES */}
            {block.type === 'team' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <div>
                        <label style={labelStyle}>Style & Effets</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <select
                                value={(block.style as any)?.variant || 'grid'}
                                onChange={(e) => onUpdate({ style: { ...block.style, variant: e.target.value } } as any)}
                                style={inputStyle}
                            >
                                <option value="grid">Grille</option>
                                <option value="cards">Cartes</option>
                                <option value="list">Liste</option>
                                <option value="carousel">Carrousel</option>
                            </select>
                            <select
                                value={(block.style as any)?.hoverEffect || 'zoom'}
                                onChange={(e) => onUpdate({ style: { ...block.style, hoverEffect: e.target.value } } as any)}
                                style={inputStyle}
                            >
                                <option value="zoom">Zoom</option>
                                <option value="grayscale">Noir & Blanc</option>
                                <option value="lift">Lift</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Membres ({(block.content as any).members?.length || 0})</label>
                        {((block.content as any).members || []).map((member: any, idx: number) => (
                            <div key={member.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <input type="text" value={member.name || ''} onChange={(e) => {
                                    const members = [...(block.content as any).members];
                                    members[idx] = { ...members[idx], name: e.target.value };
                                    onUpdate({ content: { ...block.content, members } } as any);
                                }} style={{ ...inputStyle, marginBottom: '0.25rem' }} placeholder="Nom" />
                                <input type="text" value={member.role || ''} onChange={(e) => {
                                    const members = [...(block.content as any).members];
                                    members[idx] = { ...members[idx], role: e.target.value };
                                    onUpdate({ content: { ...block.content, members } } as any);
                                }} style={inputStyle} placeholder="Rôle" />

                                <div style={{ marginTop: '0.25rem', padding: '0.25rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                    <input type="text" value={member.socials?.linkedin || ''} onChange={(e) => {
                                        const members = [...(block.content as any).members];
                                        members[idx] = { ...members[idx], socials: { ...members[idx].socials, linkedin: e.target.value } };
                                        onUpdate({ content: { ...block.content, members } } as any);
                                    }} style={{ ...inputStyle, fontSize: '0.75rem', marginBottom: '0.1rem' }} placeholder="LinkedIn URL" />
                                    <input type="text" value={member.socials?.email || ''} onChange={(e) => {
                                        const members = [...(block.content as any).members];
                                        members[idx] = { ...members[idx], socials: { ...members[idx].socials, email: e.target.value } };
                                        onUpdate({ content: { ...block.content, members } } as any);
                                    }} style={{ ...inputStyle, fontSize: '0.75rem' }} placeholder="Email" />
                                </div>
                                <button onClick={() => openAssetPicker(idx)} style={{ ...miniButtonStyle, marginTop: '0.25rem', width: '100%' }}><ImageIcon size={12} /> Photo</button>
                                <button onClick={() => {
                                    const members = (block.content as any).members.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, members } } as any);
                                }} style={{ ...miniButtonStyle, marginTop: '0.25rem', color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const members = [...((block.content as any).members || []), { id: `m${Date.now()}`, name: '', role: '' }];
                            onUpdate({ content: { ...block.content, members } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                    <AssetPicker tenantId={tenantId} isOpen={showAssetPicker} currentUrl={typeof assetPickerTarget === 'number' ? (block.content as any).members?.[assetPickerTarget]?.avatarUrl : ''} onSelect={(url) => {
                        if (typeof assetPickerTarget === 'number') {
                            const members = [...(block.content as any).members];
                            members[assetPickerTarget] = { ...members[assetPickerTarget], avatarUrl: url }; // Fixed: using avatarUrl to match V4 schema
                            onUpdate({ content: { ...block.content, members } } as any);
                        }
                    }} onClose={() => setShowAssetPicker(false)} />
                </>
            )}

            {/* PRICING PROPERTIES */}
            {block.type === 'pricing' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <StyledToggle
                        label="Activer Bascule Mensuel / Annuel"
                        checked={(block.style as any)?.enableToggle || false}
                        onChange={(checked) => onUpdate({ style: { ...block.style, enableToggle: checked } } as any)}
                    />
                    <div>
                        <label style={labelStyle}>Offres ({(block.content as any).plans?.length || 0})</label>
                        {((block.content as any).plans || []).map((plan: any, idx: number) => (
                            <div key={plan.id} style={{ marginBottom: '0.75rem', padding: '0.5rem', background: plan.highlighted ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.05)', border: plan.highlighted ? '1px solid #a855f7' : 'none', borderRadius: '0.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                    <input type="text" value={plan.name || ''} onChange={(e) => {
                                        const plans = [...(block.content as any).plans];
                                        plans[idx] = { ...plans[idx], name: e.target.value };
                                        onUpdate({ content: { ...block.content, plans } } as any);
                                    }} style={inputStyle} placeholder="Nom" />
                                    <input type="text" value={plan.price || ''} onChange={(e) => {
                                        const plans = [...(block.content as any).plans];
                                        plans[idx] = { ...plans[idx], price: e.target.value };
                                        onUpdate({ content: { ...block.content, plans } } as any);
                                    }} style={inputStyle} placeholder="Prix" />
                                </div>
                                <input type="text" value={plan.period || ''} onChange={(e) => {
                                    const plans = [...(block.content as any).plans];
                                    plans[idx] = { ...plans[idx], period: e.target.value };
                                    onUpdate({ content: { ...block.content, plans } } as any);
                                }} style={{ ...inputStyle, marginBottom: '0.25rem' }} placeholder="/mois, /an" />
                                {(block.style as any)?.enableToggle && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                        <input type="text" value={plan.priceYearly || ''} onChange={(e) => {
                                            const plans = [...(block.content as any).plans];
                                            plans[idx] = { ...plans[idx], priceYearly: e.target.value };
                                            onUpdate({ content: { ...block.content, plans } } as any);
                                        }} style={inputStyle} placeholder="Prix Annuel" />
                                        <input type="text" value={plan.periodYearly || ''} onChange={(e) => {
                                            const plans = [...(block.content as any).plans];
                                            plans[idx] = { ...plans[idx], periodYearly: e.target.value };
                                            onUpdate({ content: { ...block.content, plans } } as any);
                                        }} style={inputStyle} placeholder="/an" />
                                    </div>
                                )}
                                <textarea value={(plan.features || []).join('\n')} onChange={(e) => {
                                    const plans = [...(block.content as any).plans];
                                    plans[idx] = { ...plans[idx], features: e.target.value.split('\n').filter(Boolean) };
                                    onUpdate({ content: { ...block.content, plans } } as any);
                                }} style={{ ...inputStyle, minHeight: '60px' }} placeholder="Features (une par ligne)" />
                                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    <input type="checkbox" checked={plan.highlighted || false} onChange={(e) => {
                                        const plans = [...(block.content as any).plans];
                                        plans[idx] = { ...plans[idx], highlighted: e.target.checked };
                                        onUpdate({ content: { ...block.content, plans } } as any);
                                    }} /> Mise en avant
                                </label>
                                <button onClick={() => {
                                    const plans = (block.content as any).plans.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, plans } } as any);
                                }} style={{ ...miniButtonStyle, marginTop: '0.25rem', color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const plans = [...((block.content as any).plans || []), { id: `p${Date.now()}`, name: '', price: '', period: '', features: [], ctaText: 'Choisir' }];
                            onUpdate({ content: { ...block.content, plans } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                    </div>
                </>
            )}
            {/* TESTIMONIAL PROPERTIES (V4 FUSION) */}
            {block.type === 'testimonial' && (
                <>
                    <StyledSelect
                        label="Mode d'affichage"
                        value={(block.style as any)?.mode || 'single'}
                        onChange={(e) => onUpdate({ style: { ...block.style, mode: e.target.value } } as any)}
                        options={[
                            { value: 'single', label: 'Unique (Classique)' },
                            { value: 'grid', label: 'Grille' },
                            { value: 'carousel', label: 'Carrousel (V4)' },
                        ]}
                    />

                    {(block.style as any)?.mode !== 'single' ? (
                        /* MULTI-ITEM MODE */
                        <div>
                            <label style={labelStyle}>Témoignages ({(block.content as any).items?.length || 0})</label>
                            {((block.content as any).items || []).map((item: any, idx: number) => (
                                <div key={item.id} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <input type="text" value={item.author || ''} onChange={(e) => {
                                                const items = [...(block.content as any).items];
                                                items[idx] = { ...items[idx], author: e.target.value };
                                                onUpdate({ content: { ...block.content, items } } as any);
                                            }} style={inputStyle} placeholder="Nom" />
                                        </div>
                                        <input type="number" min="1" max="5" value={item.rating || 5} onChange={(e) => {
                                            const items = [...(block.content as any).items];
                                            items[idx] = { ...items[idx], rating: Number(e.target.value) };
                                            onUpdate({ content: { ...block.content, items } } as any);
                                        }} style={{ ...inputStyle, width: '60px' }} placeholder="Note" />
                                    </div>
                                    <textarea value={item.quote || ''} onChange={(e) => {
                                        const items = [...(block.content as any).items];
                                        items[idx] = { ...items[idx], quote: e.target.value };
                                        onUpdate({ content: { ...block.content, items } } as any);
                                    }} style={{ ...inputStyle, minHeight: '60px', marginBottom: '0.5rem' }} placeholder="Témoignage..." />

                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <UrlInputWithPicker
                                                value={item.avatarUrl || ''}
                                                onChange={(url) => {
                                                    const items = [...(block.content as any).items];
                                                    items[idx] = { ...items[idx], avatarUrl: url };
                                                    onUpdate({ content: { ...block.content, items } } as any);
                                                }}
                                                tenantId={tenantId}
                                                type="image"
                                                placeholder="Avatar URL"
                                            />
                                        </div>
                                        <button onClick={() => {
                                            const items = (block.content as any).items.filter((_: any, i: number) => i !== idx);
                                            onUpdate({ content: { ...block.content, items } } as any);
                                        }} style={{ ...miniButtonStyle, color: '#ef4444', padding: '0.5rem' }}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => {
                                const items = [...((block.content as any).items || []), { id: `t${Date.now()}`, author: '', quote: '', rating: 5 }];
                                onUpdate({ content: { ...block.content, items } } as any);
                            }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}><Plus size={14} /> Ajouter un témoignage</button>
                        </div>
                    ) : (
                        /* SINGLE MODE (LEGACY) */
                        <>
                            <StyledTextarea
                                label="Citation"
                                value={(block.content as any).quote || ''}
                                onChange={(e) => onUpdate({ content: { ...block.content, quote: e.target.value } } as any)}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <StyledInput
                                    label="Auteur"
                                    value={(block.content as any).author || ''}
                                    onChange={(e) => onUpdate({ content: { ...block.content, author: e.target.value } } as any)}
                                />
                                <StyledInput
                                    label="Note (1-5)"
                                    type="number"
                                    value={(block.content as any).rating || 5}
                                    onChange={(e) => onUpdate({ content: { ...block.content, rating: Number(e.target.value) } } as any)}
                                />
                            </div>
                        </>
                    )}
                </>
            )}

            {/* GALLERY PROPERTIES */}
            {block.type === 'gallery' && (
                <>
                    <StyledSelect
                        label="Mode d'affichage"
                        value={(block.style as any)?.mode || 'grid'}
                        onChange={(e) => onUpdate({ style: { ...block.style, mode: e.target.value } } as any)}
                        options={[
                            { value: 'grid', label: 'Grille Simple' },
                            { value: 'masonry', label: 'Masonry (Mosaïque)' },
                            { value: 'slider', label: 'Slider / Carrousel' },
                        ]}
                    />
                    <StyledSelect
                        label="Colonnes"
                        value={(block.style as any)?.columns || 3}
                        onChange={(e) => onUpdate({ style: { ...block.style, columns: Number(e.target.value) } } as any)}
                        options={[2, 3, 4, 5].map(n => ({ value: n, label: n.toString() }))}
                    />
                    <StyledSelect
                        label="Format Image"
                        value={(block.style as any)?.aspectRatio || 'square'}
                        onChange={(e) => onUpdate({ style: { ...block.style, aspectRatio: e.target.value } } as any)}
                        options={[
                            { value: 'square', label: 'Carré (1:1)' },
                            { value: 'landscape', label: 'Paysage (3:2)' },
                            { value: 'portrait', label: 'Portrait (2:3)' },
                            { value: 'auto', label: 'Auto (Original)' },
                        ]}
                    />
                    <StyledSelect
                        label="Effet au survol"
                        value={(block.style as any)?.hoverEffect || 'zoom'}
                        onChange={(e) => onUpdate({ style: { ...block.style, hoverEffect: e.target.value } } as any)}
                        options={[
                            { value: 'none', label: 'Aucun' },
                            { value: 'zoom', label: 'Zoom' },
                            { value: 'lift', label: 'Lift (Ombre)' },
                            { value: 'glow', label: 'Glow (Lueur)' },
                        ]}
                    />
                    {(block.style as any)?.mode === 'slider' && (
                        <StyledToggle
                            label="Lecture automatique"
                            checked={(block.style as any)?.autoplay ?? true}
                            onChange={(checked) => onUpdate({ style: { ...block.style, autoplay: checked } } as any)}
                        />
                    )}
                </>
            )}

            {/* FAQ PROPERTIES */}
            {block.type === 'faq' && (
                <>
                    <StyledInput
                        label="Titre"
                        value={(block.content as any).title || ''}
                        onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } } as any)}
                    />
                    <StyledToggle
                        label="Activer la recherche (V4)"
                        checked={(block.style as any)?.enableSearch || false}
                        onChange={(checked) => onUpdate({ style: { ...block.style, enableSearch: checked } } as any)}
                    />
                    {(block.style as any)?.enableSearch && (
                        <StyledInput
                            label="Placeholder Recherche"
                            value={(block.style as any)?.searchPlaceholder || ''}
                            onChange={(e) => onUpdate({ style: { ...block.style, searchPlaceholder: e.target.value } } as any)}
                            placeholder="Rechercher..."
                        />
                    )}
                    <div>
                        <label style={labelStyle}>Questions ({(block.content as any).items?.length || 0})</label>
                        {((block.content as any).items || []).map((item: any, idx: number) => (
                            <div key={item.id} style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <input type="text" value={item.question || ''} onChange={(e) => {
                                    const items = [...(block.content as any).items];
                                    items[idx] = { ...items[idx], question: e.target.value };
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...inputStyle, marginBottom: '0.5rem', fontWeight: 600 }} placeholder="Question" />
                                <textarea value={item.answer || ''} onChange={(e) => {
                                    const items = [...(block.content as any).items];
                                    items[idx] = { ...items[idx], answer: e.target.value };
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...inputStyle, minHeight: '80px' }} placeholder="Réponse..." />
                                <button onClick={() => {
                                    const items = (block.content as any).items.filter((_: any, i: number) => i !== idx);
                                    onUpdate({ content: { ...block.content, items } } as any);
                                }} style={{ ...miniButtonStyle, marginTop: '0.25rem', color: '#ef4444' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const items = [...((block.content as any).items || []), { id: `q${Date.now()}`, question: '', answer: '' }];
                            onUpdate({ content: { ...block.content, items } } as any);
                        }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter une question</button>
                    </div>
                </>
            )}

            {/* GENERIC SPACING & MARGINS (V5 Precision) */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <button
                    onClick={() => {
                        const style = (block.style as any) || {};
                        onUpdate({ style: { ...style, showSpacing: !style.showSpacing } } as any);
                    }}
                    style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', padding: 0
                    }}
                >
                    <span>Espacement (Marges & Padding)</span>
                    <ChevronDown size={14} style={{ transform: (block.style as any)?.showSpacing ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                {(block.style as any)?.showSpacing && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <StyledInput
                                label="Marge Haut (MT)"
                                value={(block.style as any)?.marginTop || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, marginTop: e.target.value } } as any)}
                                placeholder="ex: 2rem"
                            />
                            <StyledInput
                                label="Marge Bas (MB)"
                                value={(block.style as any)?.marginBottom || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, marginBottom: e.target.value } } as any)}
                                placeholder="ex: 2rem"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <StyledInput
                                label="Marge Gauche (ML)"
                                value={(block.style as any)?.marginLeft || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, marginLeft: e.target.value } } as any)}
                                placeholder="ex: auto"
                            />
                            <StyledInput
                                label="Marge Droite (MR)"
                                value={(block.style as any)?.marginRight || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, marginRight: e.target.value } } as any)}
                                placeholder="ex: auto"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <StyledInput
                                label="Pad Haut (PT)"
                                value={(block.style as any)?.paddingTop || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, paddingTop: e.target.value } } as any)}
                                placeholder="ex: 1rem"
                            />
                            <StyledInput
                                label="Pad Bas (PB)"
                                value={(block.style as any)?.paddingBottom || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, paddingBottom: e.target.value } } as any)}
                                placeholder="ex: 1rem"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <StyledInput
                                label="Pad Gauche (PL)"
                                value={(block.style as any)?.paddingLeft || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, paddingLeft: e.target.value } } as any)}
                                placeholder="ex: 1rem"
                            />
                            <StyledInput
                                label="Pad Droite (PR)"
                                value={(block.style as any)?.paddingRight || ''}
                                onChange={(e) => onUpdate({ style: { ...block.style, paddingRight: e.target.value } } as any)}
                                placeholder="ex: 1rem"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* POSITIONING (Universal) */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <StyledToggle
                    label="Positionnement Libre (Absolu)"
                    checked={block.positioning?.mode === 'absolute'}
                    onChange={(checked) => onUpdate({ positioning: { ...block.positioning, mode: checked ? 'absolute' : 'relative' } } as any)}
                />
                {block.positioning?.mode === 'absolute' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <StyledInput
                            label="Haut (Top)"
                            value={block.positioning.top || ''}
                            onChange={(e) => onUpdate({ positioning: { ...block.positioning, top: e.target.value } } as any)}
                            placeholder="ex: 10px, 50%"
                        />
                        <StyledInput
                            label="Gauche (Left)"
                            value={block.positioning.left || ''}
                            onChange={(e) => onUpdate({ positioning: { ...block.positioning, left: e.target.value } } as any)}
                            placeholder="ex: 10px, 50%"
                        />
                        <StyledInput
                            label="Bas (Bottom)"
                            value={block.positioning.bottom || ''}
                            onChange={(e) => onUpdate({ positioning: { ...block.positioning, bottom: e.target.value } } as any)}
                            placeholder="ex: 10px"
                        />
                        <StyledInput
                            label="Droite (Right)"
                            value={block.positioning.right || ''}
                            onChange={(e) => onUpdate({ positioning: { ...block.positioning, right: e.target.value } } as any)}
                            placeholder="ex: 10px"
                        />
                        <StyledInput
                            label="Z-Index"
                            type="number"
                            value={block.positioning.zIndex || 0}
                            onChange={(e) => onUpdate({ positioning: { ...block.positioning, zIndex: Number(e.target.value) } } as any)}
                        />
                        <StyledInput
                            label="Rotation (deg)"
                            type="number"
                            value={block.positioning.rotation || 0}
                            onChange={(e) => onUpdate({ positioning: { ...block.positioning, rotation: Number(e.target.value) } } as any)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

const assetButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(to right, rgba(34,211,238,0.1), rgba(168,85,247,0.1))',
    border: '1px solid rgba(34,211,238,0.3)',
    borderRadius: '0.5rem',
    color: '#22d3ee',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
};

// Layout properties
function LayoutProperties({ config, onUpdate }: { config: UniversalSectionConfig; onUpdate: (updates: Partial<UniversalSectionConfig>) => void }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: '#22d3ee', fontSize: '0.875rem', margin: 0 }}>Layout</h4>

            <StyledSelect
                label="Type de disposition"
                value={config.layout?.type || 'single-column'}
                onChange={(e) => onUpdate({ layout: { ...config.layout, type: e.target.value as any } })}
                options={[
                    { value: 'single-column', label: 'Colonne simple (Centré)' },
                    { value: 'grid', label: 'Grille (Colonnes)' },
                    { value: 'flex', label: 'Flex (Libre)' },
                    { value: 'split', label: 'Divisé (Split)' },
                ]}
            />

            {config.layout?.type === 'grid' && (
                <StyledSelect
                    label="Nombre de colonnes"
                    value={config.layout?.columns || 2}
                    onChange={(e) => onUpdate({ layout: { ...config.layout, columns: Number(e.target.value) } })}
                    options={[2, 3, 4, 5, 6].map(n => ({ value: n, label: `${n} colonnes` }))}
                />
            )}

            <StyledSelect
                label="Espacement (Gap)"
                value={config.layout?.gap || 'md'}
                onChange={(e) => onUpdate({ layout: { ...config.layout, gap: e.target.value as any } })}
                options={[
                    { value: 'none', label: 'Aucun' },
                    { value: 'sm', label: 'Petit' },
                    { value: 'md', label: 'Moyen' },
                    { value: 'lg', label: 'Grand' },
                    { value: 'xl', label: 'Très grand' },
                    { value: '2xl', label: 'Immense' },
                ]}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <StyledSelect
                    label="Padding Horizontal"
                    value={config.sizing?.paddingX || 'lg'}
                    onChange={(e) => onUpdate({ sizing: { ...config.sizing, paddingX: e.target.value as any } })}
                    options={[
                        { value: 'none', label: '0' },
                        { value: 'sm', label: 'S' },
                        { value: 'md', label: 'M' },
                        { value: 'lg', label: 'L' },
                        { value: 'xl', label: 'XL' },
                    ]}
                />
                <StyledSelect
                    label="Padding Vertical"
                    value={config.sizing?.paddingY || 'lg'}
                    onChange={(e) => onUpdate({ sizing: { ...config.sizing, paddingY: e.target.value as any } })}
                    options={[
                        { value: 'none', label: '0' },
                        { value: 'sm', label: 'S' },
                        { value: 'md', label: 'M' },
                        { value: 'lg', label: 'L' },
                        { value: 'xl', label: 'XL' },
                    ]}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Vertical Alignment (Controls justifyContent / layout.alignment) */}
                <div>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Alignement Vertical</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* Corrected order: Left=Start=Top, Right=End=Bottom */}
                        {[
                            { val: 'left', icon: '↑', label: 'Haut' },
                            { val: 'center', icon: '↕', label: 'Centré' },
                            { val: 'right', icon: '↓', label: 'Bas' }
                        ].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => onUpdate({ layout: { ...config.layout, alignment: opt.val as any } })}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: config.layout?.alignment === opt.val ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                                    border: config.layout?.alignment === opt.val ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.25rem',
                                    color: '#d1d5db',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={opt.label}
                            >
                                {opt.icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Horizontal Alignment (Controls alignItems / layout.verticalAlign) */}
                <div>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Alignement Horizontal</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['top', 'center', 'bottom', 'stretch'].map(align => (
                            <button
                                key={align}
                                onClick={() => onUpdate({ layout: { ...config.layout, verticalAlign: align as any } })}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: config.layout?.verticalAlign === align ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                                    border: config.layout?.verticalAlign === align ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.25rem',
                                    color: '#d1d5db',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={align === 'top' ? 'Gauche' : align === 'bottom' ? 'Droite' : align === 'center' ? 'Centré' : 'Plein Largeur'}
                            >
                                {align === 'top' ? '←' : align === 'center' ? '↔' : align === 'bottom' ? '→' : '⟷'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Flex/Grid Alignment Extensions */}
            {(config.layout?.type === 'flex' || config.layout?.type === 'grid' || config.layout?.type === 'split') && (
                <>
                    <StyledSelect
                        label="Alignement Vertical (Items)"
                        value={config.layout?.alignItems || 'stretch'}
                        onChange={(e) => onUpdate({ layout: { ...config.layout, alignItems: e.target.value as any } })}
                        options={[
                            { value: 'start', label: 'Haut' },
                            { value: 'center', label: 'Milieu' },
                            { value: 'end', label: 'Bas' },
                            { value: 'stretch', label: 'Étirer' },
                        ]}
                    />
                    <StyledSelect
                        label="Distribution (Justify)"
                        value={config.layout?.justifyContent || 'start'}
                        onChange={(e) => onUpdate({ layout: { ...config.layout, justifyContent: e.target.value as any } })}
                        options={[
                            { value: 'start', label: 'Début' },
                            { value: 'center', label: 'Centré' },
                            { value: 'end', label: 'Fin' },
                            { value: 'space-between', label: 'Espacé (Between)' },
                            { value: 'space-around', label: 'Autour (Around)' },
                        ]}
                    />
                </>
            )}

            <StyledSelect
                label="Largeur du Conteneur"
                value={config.layout?.containerWidth || 'default'}
                onChange={(e) => onUpdate({ layout: { ...config.layout, containerWidth: e.target.value as any } })}
                options={[
                    { value: 'default', label: 'Défaut (1200px)' },
                    { value: 'narrow', label: 'Étroit (800px)' },
                    { value: 'wide', label: 'Large (1400px)' },
                    { value: 'full', label: 'Plein écran (100%)' },
                ]}
            />

            <StyledSelect
                label="Hauteur Section"
                value={['auto', 'small', 'medium', 'tall', 'fullscreen'].includes(config.sizing?.height || 'auto') ? (config.sizing?.height || 'auto') : 'custom'}
                onChange={(e) => {
                    if (e.target.value === 'custom') {
                        onUpdate({ sizing: { ...config.sizing, height: 'custom-500px' } }); // Default custom start
                    } else {
                        onUpdate({ sizing: { ...config.sizing, height: e.target.value as any } });
                    }
                }}
                options={[
                    { value: 'auto', label: 'Auto (Contenu)' },
                    { value: 'small', label: 'Petite (40vh)' },
                    { value: 'medium', label: 'Moyenne (60vh)' },
                    { value: 'tall', label: 'Grande (80vh)' },
                    { value: 'fullscreen', label: 'Plein écran (100vh)' },
                    { value: 'custom', label: 'Personnalisée (Pixels/VH)' },
                ]}
            />

            {/* Custom Height Input - Show if logic determines 'custom' */}
            {!['auto', 'small', 'medium', 'tall', 'fullscreen'].includes(config.sizing?.height || 'auto') && (
                <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Valeur (ex: 500px, 80vh)</label>
                    <input
                        type="text"
                        value={config.sizing?.height?.replace('custom-', '') || ''}
                        onChange={(e) => onUpdate({ sizing: { ...config.sizing, height: e.target.value } })} // Save directly as value
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.375rem',
                            padding: '0.5rem',
                            color: '#fff',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
            )}

            {/* Max Height Control (New V5) */}
            <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Hauteur Maximum (Optionnel)</label>
                <input
                    type="text"
                    placeholder="ex: 800px, 90vh"
                    value={config.sizing?.maxHeight || ''}
                    onChange={(e) => onUpdate({ sizing: { ...config.sizing, maxHeight: e.target.value } })}
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.375rem',
                        padding: '0.5rem',
                        color: '#fff',
                        fontSize: '0.875rem'
                    }}
                />
            </div>
        </div>
    );
}

// Design properties
function DesignProperties({
    config,
    onUpdate,
    showColorPicker,
    setShowColorPicker,
    tenantId
}: {
    config: UniversalSectionConfig;
    onUpdate: (updates: Partial<UniversalSectionConfig>) => void;
    showColorPicker: 'from' | 'to' | 'solid' | 'overlay' | null;
    setShowColorPicker: (v: 'from' | 'to' | 'solid' | 'overlay' | null) => void;
    tenantId: string;
}) {
    const bgType = config.design?.background?.type || 'solid';
    const bg = config.design?.background || {};

    const updateBg = (updates: any) => {
        onUpdate({ design: { background: { ...config.design?.background, ...updates } } });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: '#22d3ee', fontSize: '0.875rem', margin: 0 }}>Design</h4>

            {/* Background Type */}
            <StyledSelect
                label="Type de fond"
                value={bgType}
                onChange={(e) => updateBg({ type: e.target.value })}
                options={[
                    { value: 'solid', label: 'Couleur unie' },
                    { value: 'gradient', label: 'Dégradé' },
                    { value: 'image', label: 'Image' },
                    { value: 'video', label: 'Vidéo' },
                    { value: 'slideshow', label: 'Diaporama / Zoom Infini' },
                    { value: 'animatedGradient', label: 'Dégradé animé' },
                ]}
            />

            {/* --- SPECIFIC BACKGROUND CONTROLS (Moved Up) --- */}

            {/* SOLID */}
            {bgType === 'solid' && (
                <StyledColorPicker
                    label="Couleur"
                    value={bg.color || '#0a0a0f'}
                    onChange={(color) => updateBg({ color })}
                />
            )}

            {/* GRADIENT */}
            {bgType === 'gradient' && (
                <>
                    <StyledColorPicker
                        label="Couleur début"
                        value={bg.gradientFrom || '#22d3ee'}
                        onChange={(color) => updateBg({ gradientFrom: color })}
                    />
                    <StyledColorPicker
                        label="Couleur fin"
                        value={bg.gradientTo || '#a855f7'}
                        onChange={(color) => updateBg({ gradientTo: color })}
                    />
                    <StyledSelect
                        label="Direction"
                        value={bg.gradientDirection || 'to-br'}
                        onChange={(e) => updateBg({ gradientDirection: e.target.value })}
                        options={[
                            { value: 'to-r', label: '→ Droite' },
                            { value: 'to-br', label: '↘ Diagonale' },
                            { value: 'to-b', label: '↓ Bas' },
                            { value: 'to-bl', label: '↙ Diagonale inverse' },
                        ]}
                    />
                </>
            )}

            {/* IMAGE */}
            {bgType === 'image' && (
                <>
                    <div>
                        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>URL Image</label>
                        <UrlInputWithPicker
                            value={bg.imageUrl || ''}
                            onChange={(url) => updateBg({ imageUrl: url })}
                            placeholder="https://..."
                            tenantId={tenantId}
                            type="image"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Opacité ({Math.round((bg.imageOpacity ?? 1) * 100)}%)</label>
                        <input type="range" min="0" max="1" step="0.05" value={bg.imageOpacity ?? 1} onChange={(e) => updateBg({ imageOpacity: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Flou ({bg.blur ?? 0}px)</label>
                        <input type="range" min="0" max="20" step="1" value={bg.blur ?? 0} onChange={(e) => updateBg({ blur: parseInt(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                    </div>
                    <StyledToggle
                        label="Effet parallax"
                        checked={bg.parallax || false}
                        onChange={(checked) => updateBg({ parallax: checked })}
                    />
                </>
            )}

            {/* VIDEO */}
            {bgType === 'video' && (
                <>
                    <div>
                        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>URL Vidéo (MP4/WebM)</label>
                        <UrlInputWithPicker
                            value={bg.videoUrl || ''}
                            onChange={(url) => updateBg({ videoUrl: url })}
                            placeholder="https://example.com/video.mp4"
                            tenantId={tenantId}
                            type="video"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Vitesse ({bg.videoPlaybackRate || 1}x)</label>
                        <input type="range" min="0.25" max="2" step="0.25" value={bg.videoPlaybackRate || 1} onChange={(e) => updateBg({ videoPlaybackRate: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                    </div>
                </>
            )}

            {/* SLIDESHOW */}
            {bgType === 'slideshow' && (
                <>
                    <div>
                        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Images ({bg.slides?.length || 0})</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(bg.slides || []).map((slide: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <UrlInputWithPicker
                                            value={slide.imageUrl || ''}
                                            onChange={(url) => {
                                                const slides = [...(bg.slides || [])];
                                                slides[idx] = { ...slides[idx], imageUrl: url };
                                                updateBg({ slides });
                                            }}
                                            tenantId={tenantId}
                                            type="image"
                                            placeholder="URL image"
                                        />
                                    </div>
                                    <button onClick={() => {
                                        const slides = (bg.slides || []).filter((_: any, i: number) => i !== idx);
                                        updateBg({ slides });
                                    }} style={{ ...miniButtonStyle, color: '#ef4444' }}><Trash2 size={12} /></button>
                                </div>
                            ))}
                            <button onClick={() => {
                                const slides = [...(bg.slides || []), { imageUrl: '', duration: 5000 }];
                                updateBg({ slides });
                            }} style={{ ...miniButtonStyle, width: '100%', padding: '0.5rem' }}><Plus size={14} /> Ajouter</button>
                        </div>
                    </div>
                    <StyledSelect
                        label="Transition"
                        value={bg.slideTransition || 'fade'}
                        onChange={(e) => updateBg({ slideTransition: e.target.value })}
                        options={[
                            { value: 'fade', label: 'Fondu' },
                            { value: 'slide', label: 'Glisser' },
                            { value: 'zoom', label: 'Zoom' },
                            { value: 'kenBurns', label: 'Ken Burns' },
                        ]}
                    />
                </>
            )}


            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <StyledToggle
                    label="✨ Glassmorphism (Effet de verre)"
                    checked={config.design?.glassmorphism || false}
                    onChange={(checked) => onUpdate({ design: { ...config.design, glassmorphism: checked } })}
                />
                {config.design?.glassmorphism && (
                    <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Opacité du verre ({config.design?.glassOpacity || 0.2})</label>
                        <input
                            type="range"
                            min="0.05"
                            max="0.95"
                            step="0.05"
                            value={config.design?.glassOpacity || 0.2}
                            onChange={(e) => onUpdate({ design: { ...config.design, glassOpacity: parseFloat(e.target.value) } })}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />

                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Flou (Blur: {config.design?.glassBlur || 12}px)</label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={config.design?.glassBlur || 12}
                                onChange={(e) => onUpdate({ design: { ...config.design, glassBlur: parseInt(e.target.value) } })}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Couleur du verre</label>
                            {/* Simple Color Picker for Glass Tint */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['#ffffff', '#000000', '#22d3ee', '#ef4444'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => onUpdate({ design: { ...config.design, glassColor: c } })}
                                        style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: c, border: config.design?.glassColor === c ? '2px solid white' : '1px solid #333',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={config.design?.glassColor || '#ffffff'}
                                    onChange={(e) => onUpdate({ design: { ...config.design, glassColor: e.target.value } })}
                                    style={{ background: 'transparent', border: 'none', width: '24px', height: '24px', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TYPOGRAPHY (Global V4) - Moved Up */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#fff' }}>Typographie Avancée (V4)</label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <StyledSelect
                        label="Police Titre"
                        value={config.design?.typography?.headlineFont || 'Inter'}
                        onChange={(e) => onUpdate({ design: { ...config.design, typography: { ...config.design?.typography, headlineFont: e.target.value } } })}
                        options={[
                            { value: 'Inter', label: 'Inter (Défaut)' },
                            { value: 'Roboto', label: 'Roboto' },
                            { value: 'Montserrat', label: 'Montserrat' },
                            { value: 'Playfair Display', label: 'Playfair Display' },
                            { value: 'Oswald', label: 'Oswald' },
                            { value: 'Poppins', label: 'Poppins' },
                            { value: 'Outfit', label: 'Outfit' },
                            { value: 'Space Grotesk', label: 'Space Grotesk' },
                        ]}
                    />
                    <StyledSelect
                        label="Graisse"
                        value={config.design?.typography?.headlineWeight || '700'}
                        onChange={(e) => onUpdate({ design: { ...config.design, typography: { ...config.design?.typography, headlineWeight: e.target.value as any } } })}
                        options={[
                            { value: '300', label: 'Léger (300)' },
                            { value: '400', label: 'Normal (400)' },
                            { value: '500', label: 'Moyen (500)' },
                            { value: '600', label: 'Semi-Bold (600)' },
                            { value: '700', label: 'Bold (700)' },
                            { value: '800', label: 'Extra-Bold (800)' },
                        ]}
                    />
                </div>
            </div>

            {/* DIVIDERS (Global V4) */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#fff' }}>Séparateurs de Forme (V4)</label>

                <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Haut</label>
                    <DividerControls
                        divider={config.design?.dividers?.top || { shape: 'wave', height: 50, color: '#0a0a0f' }}
                        onChange={(d: any) => onUpdate({ design: { ...config.design, dividers: { ...config.design?.dividers, top: d } } })}
                    />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Bas</label>
                    <DividerControls
                        divider={config.design?.dividers?.bottom || { shape: 'wave', height: 50, color: '#0a0a0f' }}
                        onChange={(d: any) => onUpdate({ design: { ...config.design, dividers: { ...config.design?.dividers, bottom: d } } })}
                    />
                </div>
            </div>

        </div>
    );
}


// ----------------------------------------------------
// V4 GLOBAL FEATURES: Dividers & Typography
// ----------------------------------------------------

function DividerControls({
    divider,
    onChange
}: {
    divider: any,
    onChange: (d: any) => void
}) {
    if (!divider) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <StyledSelect
                label=""
                value={divider.shape || 'wave'}
                onChange={(e) => onChange({ ...divider, shape: e.target.value })}
                options={[
                    { value: 'none', label: 'Aucun' },
                    { value: 'wave', label: 'Vague' },
                    { value: 'curve', label: 'Courbe' },
                    { value: 'triangle', label: 'Triangle' },
                    { value: 'slant', label: 'Biais' },
                    { value: 'arrow', label: 'Flèche' },
                ]}
            />
            <StyledInput
                label=""
                type="number"
                placeholder="Hauteur (px)"
                value={divider.height || 100}
                onChange={(e) => onChange({ ...divider, height: parseInt(e.target.value) })}
            />
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                <StyledToggle
                    label="Flip Horizontal"
                    checked={divider.flip || false}
                    onChange={(checked) => onChange({ ...divider, flip: checked })}
                />
                <StyledToggle
                    label="Inversé"
                    checked={divider.invert || false}
                    onChange={(checked) => onChange({ ...divider, invert: checked })}
                />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
                <StyledColorPicker
                    label="Couleur"
                    value={divider.color || '#ffffff'}
                    onChange={(color) => onChange({ ...divider, color: color })}
                />
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: '#fff',
    fontSize: '0.875rem',
};
