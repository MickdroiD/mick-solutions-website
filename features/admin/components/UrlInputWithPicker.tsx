'use client';

import { useState } from 'react';
import { Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import AssetPicker from './AssetPicker';

interface UrlInputWithPickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    tenantId: string;
    type?: 'image' | 'video' | 'any';
}

export default function UrlInputWithPicker({
    value,
    onChange,
    label,
    placeholder = 'https://...',
    tenantId,
    type = 'image',
}: UrlInputWithPickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        paddingRight: '2.5rem', // Space for icon
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.5rem',
        color: '#fff',
        fontSize: '0.875rem',
    };

    const labelStyle = {
        display: 'block',
        color: '#9ca3af',
        fontSize: '0.75rem',
        marginBottom: '0.25rem',
    };

    const buttonStyle = {
        position: 'absolute' as const,
        right: '0.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: 'none',
        color: '#22d3ee',
        cursor: 'pointer',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div style={{ marginBottom: label ? '0.5rem' : 0 }}>
            {label && <label style={labelStyle}>{label}</label>}
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={inputStyle}
                />
                <button
                    onClick={() => setShowPicker(true)}
                    style={buttonStyle}
                    title="Choisir un fichier"
                >
                    <ImageIcon size={16} />
                </button>
            </div>

            <AssetPicker
                tenantId={tenantId}
                isOpen={showPicker}
                currentUrl={value}
                onSelect={(url) => {
                    onChange(url);
                    setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
            />
        </div>
    );
}
