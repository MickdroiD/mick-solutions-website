// ============================================
// NEWSLETTER BLOCK - Factory V5
// Email capture form
// ============================================

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react';

interface NewsletterStyle {
    variant?: 'inline' | 'stacked' | 'minimal';
    accentColor?: string;
}

interface NewsletterBlockProps {
    content: {
        title?: string;
        subtitle?: string;
        placeholder?: string;
        buttonText?: string;
        successMessage?: string;
    };
    style?: NewsletterStyle;
}

export default function NewsletterBlock({ content, style = {} }: NewsletterBlockProps) {
    const {
        variant = 'inline',
        accentColor = '#22d3ee',
    } = style;

    const {
        title = 'Restez informé',
        subtitle = 'Recevez nos dernières actualités',
        placeholder = 'Votre email',
        buttonText = "S'inscrire",
        successMessage = 'Merci pour votre inscription !',
    } = content;

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus('success');
        setEmail('');
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: `${accentColor}15`,
                    borderRadius: '1rem',
                    border: `1px solid ${accentColor}30`,
                }}
            >
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                }}>
                    <Check size={24} style={{ color: '#fff' }} />
                </div>
                <p style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600 }}>{successMessage}</p>
            </motion.div>
        );
    }

    return (
        <div style={{ textAlign: variant === 'stacked' ? 'center' : 'left', maxWidth: '600px', margin: '0 auto' }}>
            {variant !== 'minimal' && title && (
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {title}
                </h3>
            )}
            {variant !== 'minimal' && subtitle && (
                <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>{subtitle}</p>
            )}

            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: variant === 'stacked' ? 'column' : 'row',
                gap: '0.75rem',
            }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    padding: '0 1rem',
                }}>
                    <Mail size={20} style={{ color: '#6b7280' }} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={placeholder}
                        required
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            padding: '1rem 0',
                            fontSize: '1rem',
                            outline: 'none',
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem 1.5rem',
                        background: accentColor,
                        color: '#000',
                        fontWeight: 600,
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: status === 'loading' ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {status === 'loading' ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            {buttonText}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
