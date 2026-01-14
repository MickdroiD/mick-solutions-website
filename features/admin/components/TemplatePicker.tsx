// ============================================
// TEMPLATE PICKER - Factory V5
// Modal to select and apply section templates
// ============================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, LayoutTemplate } from 'lucide-react';
import { SECTION_TEMPLATES, getTemplatesByCategory, CATEGORY_LABELS, SectionTemplate } from '../../sections/templates/section-templates';
import { ContentBlock } from '../../sections/types-universal';

interface TemplatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (blocks: ContentBlock[]) => void;
}

export default function TemplatePicker({ isOpen, onClose, onSelect }: TemplatePickerProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = getTemplatesByCategory();

    const filteredTemplates = searchQuery
        ? SECTION_TEMPLATES.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : selectedCategory
            ? categories[selectedCategory] || []
            : SECTION_TEMPLATES;

    const handleSelect = (template: SectionTemplate) => {
        // Generate unique IDs for each block
        const blocks = template.blocks.map((block, index) => ({
            ...block,
            id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            order: index,
        })) as ContentBlock[];

        onSelect(blocks);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '80vh',
                        background: '#0f0f1a',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <LayoutTemplate size={24} style={{ color: '#22d3ee' }} />
                            <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                                Bibliothèque de Templates
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                color: '#9ca3af',
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        {/* Search */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                        }}>
                            <Search size={18} style={{ color: '#6b7280' }} />
                            <input
                                type="text"
                                placeholder="Rechercher un template..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Categories Sidebar */}
                        <div style={{
                            width: '200px',
                            borderRight: '1px solid rgba(255,255,255,0.05)',
                            padding: '1rem',
                            overflowY: 'auto',
                        }}>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.75rem 1rem',
                                    background: selectedCategory === null ? 'rgba(34,211,238,0.1)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: selectedCategory === null ? '#22d3ee' : '#9ca3af',
                                    fontSize: '0.9375rem',
                                    cursor: 'pointer',
                                    marginBottom: '0.25rem',
                                }}
                            >
                                Tous ({SECTION_TEMPLATES.length})
                            </button>

                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        background: selectedCategory === key ? 'rgba(34,211,238,0.1)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: selectedCategory === key ? '#22d3ee' : '#9ca3af',
                                        fontSize: '0.9375rem',
                                        cursor: 'pointer',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    {label} ({categories[key]?.length || 0})
                                </button>
                            ))}
                        </div>

                        {/* Templates Grid */}
                        <div style={{
                            flex: 1,
                            padding: '1rem',
                            overflowY: 'auto',
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1rem',
                            }}>
                                {filteredTemplates.map((template) => (
                                    <motion.div
                                        key={template.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(template)}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0.75rem',
                                            padding: '1.25rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {/* Preview */}
                                        <div style={{
                                            height: '120px',
                                            background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(168,85,247,0.1))',
                                            borderRadius: '0.5rem',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                        }}>
                                            {CATEGORY_LABELS[template.category]?.split(' ')[0] || '📦'}
                                        </div>

                                        {/* Info */}
                                        <h4 style={{
                                            color: '#fff',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            marginBottom: '0.25rem',
                                        }}>
                                            {template.name}
                                        </h4>
                                        <p style={{
                                            color: '#6b7280',
                                            fontSize: '0.875rem',
                                            marginBottom: '0.5rem',
                                        }}>
                                            {template.description}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                        }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(34,211,238,0.1)',
                                                borderRadius: '0.25rem',
                                                color: '#22d3ee',
                                                fontSize: '0.75rem',
                                            }}>
                                                {template.blocks.length} blocs
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {filteredTemplates.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: '#6b7280',
                                }}>
                                    Aucun template trouvé.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
