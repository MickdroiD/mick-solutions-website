'use client';

import { ChevronDown, Check } from 'lucide-react';
import React from 'react';

// ============================================
// V4 "GLASS/NEON" DESIGN SYSTEM
// ============================================

const GLASS_STYLE = {
    background: 'rgba(15, 23, 42, 0.6)', // slate-900/60
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
};

const LABEL_STYLE = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#94a3b8', // slate-400
    marginBottom: '0.375rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
};

// ============================================
// STYLED INPUT
// ============================================

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function StyledInput({ label, style, ...props }: StyledInputProps) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            {label && <label style={LABEL_STYLE}>{label}</label>}
            <input
                {...props}
                style={{
                    ...GLASS_STYLE,
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    outline: 'none',
                    ...style,
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)'; // cyan-400
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(34, 211, 238, 0.3)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
        </div>
    );
}

// ============================================
// STYLED TEXTAREA
// ============================================

interface StyledTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export function StyledTextarea({ label, style, rows = 3, ...props }: StyledTextareaProps) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            {label && <label style={LABEL_STYLE}>{label}</label>}
            <textarea
                {...props}
                rows={rows}
                style={{
                    ...GLASS_STYLE,
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    ...style,
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(34, 211, 238, 0.3)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
        </div>
    );
}

// ============================================
// STYLED SELECT
// ============================================

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string | number; label: string }[];
}

export function StyledSelect({ label, options, style, ...props }: StyledSelectProps) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            {label && <label style={LABEL_STYLE}>{label}</label>}
            <div style={{ position: 'relative' }}>
                <select
                    {...props}
                    style={{
                        ...GLASS_STYLE,
                        width: '100%',
                        padding: '0.625rem 2.5rem 0.625rem 0.875rem',
                        appearance: 'none',
                        cursor: 'pointer',
                        ...style,
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ background: '#0f172a', color: 'white' }}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={16}
                    style={{
                        position: 'absolute',
                        right: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none',
                    }}
                />
            </div>
        </div>
    );
}

// ============================================
// STYLED TOGGLE
// ============================================

interface StyledToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function StyledToggle({ label, checked, onChange }: StyledToggleProps) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                padding: '0.5rem 0',
            }}
        >
            <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                style={{
                    width: '2.75rem',
                    height: '1.5rem',
                    borderRadius: '9999px',
                    background: checked ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: checked ? '1px solid rgba(34, 211, 238, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                <div
                    style={{
                        width: '1.125rem',
                        height: '1.125rem',
                        borderRadius: '50%',
                        background: checked ? '#22d3ee' : '#94a3b8',
                        position: 'absolute',
                        top: '50%',
                        left: checked ? 'calc(100% - 1.25rem)' : '0.125rem',
                        transform: 'translateY(-50%)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                />
            </button>
        </div>
    );
}

// ============================================
// STYLED COLOR PICKER
// ============================================

interface StyledColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export function StyledColorPicker({ label, value, onChange }: StyledColorPickerProps) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL_STYLE}>{label}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div
                    style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        background: value,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                            opacity: 0,
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                        }}
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        ...GLASS_STYLE,
                        flex: 1,
                        padding: '0.625rem 0.875rem',
                        outline: 'none',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                />
            </div>
        </div>
    );
}
