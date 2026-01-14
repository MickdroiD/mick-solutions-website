// ============================================
// FAQ BLOCK - Factory V5
// Animated accordion with Search Filter (V4 Fusion)
// ============================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus, Search } from 'lucide-react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

interface FAQStyle {
    variant?: 'simple' | 'bordered' | 'card' | 'minimal';
    allowMultiple?: boolean;
    iconPosition?: 'left' | 'right';
    enableSearch?: boolean; // New V4 Feature
    searchPlaceholder?: string;
    accentColor?: string;
    questionColor?: string;
    answerColor?: string;
}

interface FAQBlockProps {
    content: {
        title?: string;
        items: FAQItem[];
    };
    style?: FAQStyle;
}

export default function FAQBlock({ content, style = {} }: FAQBlockProps) {
    const {
        variant = 'bordered',
        allowMultiple = false,
        iconPosition = 'right',
        enableSearch = false,
        searchPlaceholder = 'Rechercher une réponse...',
        accentColor = '#22d3ee',
        questionColor = '#ffffff',
        answerColor = '#9ca3af',
    } = style;

    const { title, items = [] } = content;
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (id: string) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        } else {
            setOpenItems(prev => prev.includes(id) ? [] : [id]);
        }
    };

    const isOpen = (id: string) => openItems.includes(id);

    // Filter Items
    const filteredItems = items.filter(item => {
        if (!enableSearch || !searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    });

    // Variant styles
    const getItemStyles = (): React.CSSProperties => {
        switch (variant) {
            case 'simple':
                return {
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                };
            case 'bordered':
                return {
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem',
                };
            case 'card':
                return {
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.75rem',
                    marginBottom: '0.75rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                };
            case 'minimal':
                return {
                    marginBottom: '0.25rem',
                };
            default:
                return {};
        }
    };

    const Icon = variant === 'card' ? (isOpen: boolean) => isOpen ? <Minus size={18} /> : <Plus size={18} /> : (isOpen: boolean) => (
        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
        >
            <ChevronDown size={18} />
        </motion.div>
    );

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            {title && (
                <h3 style={{
                    color: questionColor,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                }}>
                    {title}
                </h3>
            )}

            {/* SEARCH BAR (V4 Fusion) */}
            {enableSearch && (
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <Search
                        size={20}
                        color={answerColor}
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2rem',
                            color: questionColor,
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = accentColor}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                </div>
            )}

            <div>
                {filteredItems.length > 0 ? filteredItems.map((item) => (
                    <div key={item.id} style={getItemStyles()}>
                        <button
                            onClick={() => toggleItem(item.id)}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexDirection: iconPosition === 'left' ? 'row-reverse' : 'row',
                                gap: '1rem',
                            }}
                        >
                            <span style={{
                                color: isOpen(item.id) ? accentColor : questionColor,
                                fontSize: '1rem',
                                fontWeight: 500,
                                textAlign: 'left',
                                flex: 1,
                                transition: 'color 0.2s',
                            }}>
                                {item.question}
                            </span>
                            <span style={{ color: accentColor, flexShrink: 0 }}>
                                {Icon(isOpen(item.id))}
                            </span>
                        </button>

                        <AnimatePresence>
                            {isOpen(item.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{
                                        padding: '0 1.25rem 1.25rem',
                                        color: answerColor,
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.7,
                                    }}>
                                        {item.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', color: answerColor, fontStyle: 'italic', padding: '2rem' }}>
                        Aucune question trouvée.
                    </div>
                )}
            </div>
        </div>
    );
}
