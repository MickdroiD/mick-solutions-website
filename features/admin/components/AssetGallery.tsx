// ============================================
// ASSET GALLERY - Factory V5
// Grille d'images avec sélection
// ============================================

'use client';

import { useState, useEffect, CSSProperties } from 'react';
import { Trash2, Check, Image as ImageIcon } from 'lucide-react';

interface Asset {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    altText?: string;
    createdAt: string;
}

interface AssetGalleryProps {
    tenantId: string;
    selectedUrl?: string;
    onSelect: (asset: Asset) => void;
    onDelete?: (assetId: string) => void;
    refreshTrigger?: number;
}

export default function AssetGallery({
    tenantId,
    selectedUrl,
    onSelect,
    onDelete,
    refreshTrigger = 0,
}: AssetGalleryProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAssets();
    }, [tenantId, refreshTrigger]);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/assets/upload?tenantId=${tenantId}`);
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (assetId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Supprimer cette image ?')) return;

        setDeletingId(assetId);
        try {
            const res = await fetch(`/api/assets/${assetId}?tenantId=${tenantId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setAssets(prev => prev.filter(a => a.id !== assetId));
                onDelete?.(assetId);
            }
        } catch (error) {
            console.error('Failed to delete asset:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) {
        return (
            <div style={loadingStyle}>
                <div style={spinnerStyle} />
                Chargement...
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div style={emptyStyle}>
                <ImageIcon size={48} strokeWidth={1} />
                <p>Aucune image</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                    Uploadez des images pour les utiliser
                </p>
            </div>
        );
    }

    return (
        <div style={gridStyle}>
            {assets.map((asset) => {
                const isSelected = selectedUrl === asset.url;
                return (
                    <div
                        key={asset.id}
                        onClick={() => onSelect(asset)}
                        style={{
                            ...cardStyle,
                            borderColor: isSelected ? '#22d3ee' : 'rgba(255,255,255,0.1)',
                            background: isSelected ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.05)',
                        }}
                    >
                        {/* Image */}
                        <div style={imageContainerStyle}>
                            <img
                                src={asset.url}
                                alt={asset.altText || asset.filename}
                                style={imageStyle}
                            />
                            {isSelected && (
                                <div style={selectedBadgeStyle}>
                                    <Check size={16} />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div style={infoStyle}>
                            <span style={filenameStyle}>
                                {asset.filename.length > 20
                                    ? asset.filename.slice(0, 17) + '...'
                                    : asset.filename}
                            </span>
                            <span style={sizeStyle}>{formatSize(asset.size)}</span>
                        </div>

                        {/* Delete button */}
                        <button
                            onClick={(e) => handleDelete(asset.id, e)}
                            disabled={deletingId === asset.id}
                            style={deleteButtonStyle}
                            title="Supprimer"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// Styles
const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '0.75rem',
    padding: '0.5rem 0',
};

const cardStyle: CSSProperties = {
    position: 'relative',
    borderRadius: '0.5rem',
    border: '2px solid',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
};

const imageContainerStyle: CSSProperties = {
    position: 'relative',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    background: '#0a0a0f',
};

const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
};

const selectedBadgeStyle: CSSProperties = {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    background: '#22d3ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0a0a0f',
};

const infoStyle: CSSProperties = {
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
};

const filenameStyle: CSSProperties = {
    fontSize: '0.7rem',
    color: '#d1d5db',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

const sizeStyle: CSSProperties = {
    fontSize: '0.65rem',
    color: '#6b7280',
};

const deleteButtonStyle: CSSProperties = {
    position: 'absolute',
    top: '0.5rem',
    left: '0.5rem',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    background: 'rgba(239,68,68,0.8)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.2s',
};

const loadingStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#6b7280',
    gap: '0.5rem',
};

const spinnerStyle: CSSProperties = {
    width: '1.5rem',
    height: '1.5rem',
    border: '2px solid rgba(34,211,238,0.3)',
    borderTopColor: '#22d3ee',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
};

const emptyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#6b7280',
    textAlign: 'center',
    gap: '0.5rem',
};
