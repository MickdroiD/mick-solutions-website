// ============================================
// FORM BLOCK - Factory V5
// Formulaire de contact configurable
// ============================================

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react';

export interface FormField {
    id: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[]; // Pour select
}

export interface FormBlockProps {
    content: {
        title?: string;
        description?: string;
        submitText?: string;
        successMessage?: string;
        fields: FormField[];
        webhookUrl?: string; // URL webhook n8n ou API
    };
    style?: {
        variant?: 'minimal' | 'bordered' | 'filled';
        buttonVariant?: 'solid' | 'gradient' | 'outline';
        primaryColor?: string;
    };
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function FormBlock({ content, style }: FormBlockProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const fields = content.fields || [];
    const primaryColor = style?.primaryColor || '#22d3ee';
    const variant = style?.variant || 'bordered';
    const buttonVariant = style?.buttonVariant || 'gradient';

    const handleChange = (fieldId: string, value: string) => {
        setFormData((prev) => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            // Extraire les données du formulaire pour le lead
            const leadData = {
                tenantId: (window as any).__TENANT_ID__ || 'demo-tenant',
                name: formData.name || formData.nom || null,
                email: formData.email || formData.mail || '',
                phone: formData.phone || formData.tel || formData.telephone || null,
                message: formData.message || Object.values(formData).join(' ') || null,
                source: 'contact-form',
            };

            // 1. Toujours envoyer à l'API Leads pour tracking
            if (leadData.email) {
                await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData),
                }).catch(() => console.log('Lead API non disponible'));
            }

            // 2. Si webhook configuré, envoyer aussi
            if (content.webhookUrl) {
                const res = await fetch(content.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error('Erreur webhook');
            }

            setStatus('success');
            setFormData({});
        } catch (error) {
            setStatus('error');
            setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
        }
    };

    // Styles des champs selon le variant
    const getInputStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            color: '#fff',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
        };

        switch (variant) {
            case 'minimal':
                return {
                    ...base,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 0,
                };
            case 'filled':
                return {
                    ...base,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid transparent',
                    borderRadius: '0.5rem',
                };
            case 'bordered':
            default:
                return {
                    ...base,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '0.5rem',
                };
        }
    };

    const getButtonStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.875rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '0.5rem',
            cursor: status === 'submitting' ? 'wait' : 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
        };

        switch (buttonVariant) {
            case 'gradient':
                return {
                    ...base,
                    background: `linear-gradient(to right, ${primaryColor}, #a855f7)`,
                    color: '#fff',
                };
            case 'outline':
                return {
                    ...base,
                    background: 'transparent',
                    border: `2px solid ${primaryColor}`,
                    color: primaryColor,
                };
            case 'solid':
            default:
                return {
                    ...base,
                    background: primaryColor,
                    color: '#000',
                };
        }
    };

    // Succès
    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
            >
                <Check size={48} color="#22c55e" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', color: '#22c55e', marginBottom: '0.5rem' }}>
                    Message envoyé !
                </h3>
                <p style={{ color: '#9ca3af' }}>
                    {content.successMessage || 'Merci pour votre message. Nous vous répondrons rapidement.'}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                maxWidth: '600px',
                margin: '0 auto',
            }}
        >
            {content.title && (
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {content.title}
                </h3>
            )}

            {content.description && (
                <p style={{ color: '#9ca3af', margin: 0 }}>{content.description}</p>
            )}

            {fields.map((field) => (
                <div key={field.id}>
                    <label
                        htmlFor={field.id}
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#d1d5db',
                        }}
                    >
                        {field.label}
                        {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>

                    {field.type === 'textarea' ? (
                        <textarea
                            id={field.id}
                            name={field.id}
                            placeholder={field.placeholder}
                            required={field.required}
                            rows={4}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            style={{ ...getInputStyle(), resize: 'vertical' }}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            id={field.id}
                            name={field.id}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            style={getInputStyle()}
                        >
                            <option value="">{field.placeholder || 'Sélectionner...'}</option>
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id={field.id}
                            name={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            style={getInputStyle()}
                        />
                    )}
                </div>
            ))}

            {status === 'error' && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                    }}
                >
                    <AlertCircle size={18} />
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'submitting'}
                style={getButtonStyle()}
            >
                {status === 'submitting' ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Envoi...
                    </>
                ) : (
                    <>
                        <Send size={18} />
                        {content.submitText || 'Envoyer'}
                    </>
                )}
            </button>
        </motion.form>
    );
}
