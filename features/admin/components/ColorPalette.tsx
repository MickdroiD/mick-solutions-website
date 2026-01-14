// ============================================
// COLOR PALETTE - Factory V5
// Global color palette for consistent theming
// ============================================

'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Check, Palette, ChevronDown } from 'lucide-react';

interface ColorPaletteProps {
    colors: string[];
    onColorsChange: (colors: string[]) => void;
    onColorSelect?: (color: string) => void;
    maxColors?: number;
}

// Default brand palettes
export const PRESET_PALETTES = {
    'Cyan & Purple': ['#22d3ee', '#a855f7', '#ec4899', '#0a0a0f', '#ffffff'],
    'Ocean': ['#0ea5e9', '#06b6d4', '#14b8a6', '#0f172a', '#f8fafc'],
    'Sunset': ['#f97316', '#fb923c', '#fbbf24', '#1a1a2e', '#ffffff'],
    'Forest': ['#22c55e', '#16a34a', '#84cc16', '#14532d', '#f0fdf4'],
    'Royal': ['#8b5cf6', '#7c3aed', '#6366f1', '#1e1b4b', '#faf5ff'],
    'Coral': ['#f43f5e', '#fb7185', '#fda4af', '#1f2937', '#fff1f2'],
    'Midnight': ['#3b82f6', '#1d4ed8', '#60a5fa', '#0f172a', '#eff6ff'],
    'Neon': ['#00ffff', '#ff00ff', '#ffff00', '#000000', '#ffffff'],
};

export default function ColorPalette({
    colors,
    onColorsChange,
    onColorSelect,
    maxColors = 5
}: ColorPaletteProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showPresets, setShowPresets] = useState(false);

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...colors];
        newColors[index] = color;
        onColorsChange(newColors);
    };

    const handleAddColor = () => {
        if (colors.length < maxColors) {
            onColorsChange([...colors, '#888888']);
        }
    };

    const handleRemoveColor = (index: number) => {
        if (colors.length > 2) {
            const newColors = colors.filter((_, i) => i !== index);
            onColorsChange(newColors);
        }
    };

    const applyPreset = (paletteName: string) => {
        const palette = PRESET_PALETTES[paletteName as keyof typeof PRESET_PALETTES];
        if (palette) {
            onColorsChange([...palette]);
            setShowPresets(false);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header with Presets */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={18} style={{ color: '#22d3ee' }} />
                    <span style={{ color: '#fff', fontWeight: 600 }}>Palette de couleurs</span>
                </div>

                <button
                    onClick={() => setShowPresets(!showPresets)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                    }}
                >
                    Presets
                    <ChevronDown size={14} style={{ transform: showPresets ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
            </div>

            {/* Preset Palettes Dropdown */}
            {showPresets && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '0.5rem',
                }}>
                    {Object.entries(PRESET_PALETTES).map(([name, palette]) => (
                        <button
                            key={name}
                            onClick={() => applyPreset(name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.5rem',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {palette.map((color, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            background: color,
                                            borderRadius: i === 0 ? '4px 0 0 4px' : i === palette.length - 1 ? '0 4px 4px 0' : '0',
                                        }}
                                    />
                                ))}
                            </div>
                            <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Color Swatches */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {colors.map((color, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                if (onColorSelect) {
                                    onColorSelect(color);
                                } else {
                                    setEditingIndex(editingIndex === index ? null : index);
                                }
                            }}
                            style={{
                                width: '48px',
                                height: '48px',
                                background: color,
                                border: editingIndex === index ? '2px solid #22d3ee' : '2px solid transparent',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                        />

                        {/* Color picker popup */}
                        {editingIndex === index && !onColorSelect && (
                            <div style={{
                                position: 'absolute',
                                top: '56px',
                                left: 0,
                                zIndex: 100,
                                background: '#1a1a2e',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            }}>
                                <HexColorPicker
                                    color={color}
                                    onChange={(newColor) => handleColorChange(index, newColor)}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => handleColorChange(index, e.target.value)}
                                        style={{
                                            width: '80px',
                                            padding: '0.25rem 0.5rem',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0.25rem',
                                            color: '#fff',
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                    <button
                                        onClick={() => handleRemoveColor(index)}
                                        disabled={colors.length <= 2}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            background: colors.length > 2 ? '#ef4444' : '#666',
                                            border: 'none',
                                            borderRadius: '0.25rem',
                                            color: '#fff',
                                            fontSize: '0.75rem',
                                            cursor: colors.length > 2 ? 'pointer' : 'not-allowed',
                                        }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Color Button */}
                {colors.length < maxColors && (
                    <button
                        onClick={handleAddColor}
                        style={{
                            width: '48px',
                            height: '48px',
                            background: 'transparent',
                            border: '2px dashed rgba(255,255,255,0.2)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        +
                    </button>
                )}
            </div>

            {/* Color Labels */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Primary', 'Secondary', 'Accent', 'Background', 'Text'].slice(0, colors.length).map((label, i) => (
                    <div
                        key={i}
                        style={{
                            width: '48px',
                            textAlign: 'center',
                            fontSize: '0.625rem',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Quick color picker for inline use
export function QuickColorPicker({
    value,
    onChange,
    palette
}: {
    value: string;
    onChange: (color: string) => void;
    palette: string[];
}) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setShowPicker(!showPicker)}
                style={{
                    width: '32px',
                    height: '32px',
                    background: value,
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                }}
            />

            {showPicker && (
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: 0,
                    background: '#1a1a2e',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    display: 'flex',
                    gap: '0.25rem',
                    flexWrap: 'wrap',
                    maxWidth: '200px',
                }}>
                    {palette.map((color, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                onChange(color);
                                setShowPicker(false);
                            }}
                            style={{
                                width: '28px',
                                height: '28px',
                                background: color,
                                border: value === color ? '2px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {value === color && <Check size={14} style={{ color: '#fff' }} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
