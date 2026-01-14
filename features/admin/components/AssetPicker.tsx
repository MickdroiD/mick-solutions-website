// ============================================
// ASSET PICKER - Factory V5
// Modal combinant galerie + upload + URL externe
// ============================================

'use client';

import { useState, CSSProperties } from 'react';
import { X, Image, Upload, Link } from 'lucide-react';
import AssetGallery from './AssetGallery';
import AssetUploader from './AssetUploader';

interface AssetPickerProps {
    tenantId: string;
    isOpen: boolean;
    currentUrl?: string;
    onSelect: (url: string, alt?: string) => void;
    onClose: () => void;
}

type Tab = 'gallery' | 'upload' | 'url';

export default function AssetPicker({
    tenantId,
    isOpen,
    currentUrl,
    onSelect,
    onClose,
}: AssetPickerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('gallery');
    const [externalUrl, setExternalUrl] = useState('');
    const [externalAlt, setExternalAlt] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    if (!isOpen) return null;

    const handleAssetSelect = (asset: { url: string; altText?: string }) => {
        onSelect(asset.url, asset.altText);
        onClose();
    };

    const handleUploadComplete = (asset: { id: string; url: string; filename: string }) => {
        // Rafraîchir la galerie et sélectionner automatiquement
        setRefreshTrigger(prev => prev + 1);
        setActiveTab('gallery');
    };

    const handleExternalSubmit = () => {
        if (externalUrl.trim()) {
            onSelect(externalUrl.trim(), externalAlt.trim() || undefined);
            onClose();
        }
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'gallery', label: 'Bibliothèque', icon: <Image size={16} /> },
        { id: 'upload', label: 'Upload', icon: <Upload size={16} /> },
        { id: 'url', label: 'URL externe', icon: <Link size={16} /> },
    ];

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={headerStyle}>
                    <h3 style={titleStyle}>Choisir une image</h3>
                    <button onClick={onClose} style={closeButtonStyle}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={tabsStyle}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                ...tabStyle,
                                borderColor: activeTab === tab.id ? '#22d3ee' : 'transparent',
                                color: activeTab === tab.id ? '#22d3ee' : '#6b7280',
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={contentStyle}>
                    {activeTab === 'gallery' && (
                        <AssetGallery
                            tenantId={tenantId}
                            selectedUrl={currentUrl}
                            onSelect={handleAssetSelect}
                            refreshTrigger={refreshTrigger}
                        />
                    )}

                    {activeTab === 'upload' && (
                        <div style={{ padding: '1rem 0' }}>
                            <AssetUploader
                                onUploadComplete={handleUploadComplete}
                            />
                        </div>
                    )}

                    {activeTab === 'url' && (
                        <div style={urlFormStyle}>
                            <div>
                                <label style={labelStyle}>URL de l'image</label>
                                <input
                                    type="url"
                                    value={externalUrl}
                                    onChange={e => setExternalUrl(e.target.value)}
                                    placeholder="https://exemple.com/image.jpg"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Texte alternatif (optionnel)</label>
                                <input
                                    type="text"
                                    value={externalAlt}
                                    onChange={e => setExternalAlt(e.target.value)}
                                    placeholder="Description de l'image"
                                    style={inputStyle}
                                />
                            </div>
                            {externalUrl && (
                                <div style={previewContainerStyle}>
                                    <img
                                        src={externalUrl}
                                        alt="Preview"
                                        style={previewImageStyle}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            <button
                                onClick={handleExternalSubmit}
                                disabled={!externalUrl.trim()}
                                style={{
                                    ...submitButtonStyle,
                                    opacity: externalUrl.trim() ? 1 : 0.5,
                                }}
                            >
                                Utiliser cette URL
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Styles
const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
};

const modalStyle: CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    background: '#111118',
    borderRadius: '1rem',
    border: '1px solid rgba(34,211,238,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};

const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
};

const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    background: 'linear-gradient(to right, #22d3ee, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};

const closeButtonStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const tabsStyle: CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
};

const tabStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
};

const contentStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    minHeight: '300px',
};

const urlFormStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '0.5rem 0',
};

const labelStyle: CSSProperties = {
    display: 'block',
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
};

const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#fff',
    fontSize: '0.875rem',
};

const previewContainerStyle: CSSProperties = {
    width: '100%',
    maxHeight: '150px',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    background: 'rgba(0,0,0,0.3)',
};

const previewImageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
};

const submitButtonStyle: CSSProperties = {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(to right, #22d3ee, #a855f7)',
    border: 'none',
    borderRadius: '0.5rem',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
};
