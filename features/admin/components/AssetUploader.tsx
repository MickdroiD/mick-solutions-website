// ============================================
// ASSET UPLOADER - Factory V5
// Zone drag & drop avec upload
// ============================================

'use client';

import { useState, useRef, CSSProperties, DragEvent } from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AssetUploaderProps {
    // tenantId is now automatically derived from session on the server
    onUploadComplete: (asset: { id: string; url: string; filename: string }) => void;
}

interface UploadState {
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
    message?: string;
    preview?: string;
}

export default function AssetUploader({ onUploadComplete }: AssetUploaderProps) {
    const [uploadState, setUploadState] = useState<UploadState>({
        status: 'idle',
        progress: 0,
    });
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        // Validation côté client
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

        if (!allowedTypes.includes(file.type)) {
            setUploadState({
                status: 'error',
                progress: 0,
                message: 'Type non autorisé. Images: JPG, PNG, WebP, SVG, GIF. Vidéos: MP4, WebM',
            });
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setUploadState({
                status: 'error',
                progress: 0,
                message: 'Fichier trop volumineux (max 10MB)',
            });
            return;
        }

        // Créer preview
        const preview = URL.createObjectURL(file);

        setUploadState({
            status: 'uploading',
            progress: 10,
            preview,
        });

        try {
            const formData = new FormData();
            formData.append('file', file);
            // tenantId is now automatically derived from session on the server

            // Simuler la progression (le fetch ne donne pas de progress natif)
            const progressInterval = setInterval(() => {
                setUploadState(prev => ({
                    ...prev,
                    progress: Math.min(prev.progress + 15, 90),
                }));
            }, 200);

            const res = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Erreur upload');
            }

            const data = await res.json();

            setUploadState({
                status: 'success',
                progress: 100,
                message: 'Upload réussi !',
                preview,
            });

            onUploadComplete(data.asset);

            // Reset après délai
            setTimeout(() => {
                setUploadState({ status: 'idle', progress: 0 });
                URL.revokeObjectURL(preview);
            }, 2000);

        } catch (error) {
            setUploadState({
                status: 'error',
                progress: 0,
                message: error instanceof Error ? error.message : 'Erreur inconnue',
                preview,
            });
        }
    };

    const reset = () => {
        if (uploadState.preview) {
            URL.revokeObjectURL(uploadState.preview);
        }
        setUploadState({ status: 'idle', progress: 0 });
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div style={containerStyle}>
            {/* Zone de drop */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    ...dropZoneStyle,
                    borderColor: isDragging
                        ? '#22d3ee'
                        : uploadState.status === 'error'
                            ? '#ef4444'
                            : uploadState.status === 'success'
                                ? '#22c55e'
                                : 'rgba(255,255,255,0.2)',
                    background: isDragging
                        ? 'rgba(34,211,238,0.1)'
                        : uploadState.preview
                            ? `url(${uploadState.preview}) center/cover`
                            : 'rgba(0,0,0,0.2)',
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,video/mp4,video/webm"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                {/* Overlay pour preview */}
                {uploadState.preview && (
                    <div style={overlayStyle}>
                        {uploadState.status === 'uploading' && (
                            <>
                                <div style={progressBarContainerStyle}>
                                    <div
                                        style={{
                                            ...progressBarStyle,
                                            width: `${uploadState.progress}%`,
                                        }}
                                    />
                                </div>
                                <span style={{ color: '#fff', fontSize: '0.875rem' }}>
                                    {uploadState.progress}%
                                </span>
                            </>
                        )}
                        {uploadState.status === 'success' && (
                            <CheckCircle size={32} color="#22c55e" />
                        )}
                        {uploadState.status === 'error' && (
                            <>
                                <AlertCircle size={32} color="#ef4444" />
                                <span style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'center' }}>
                                    {uploadState.message}
                                </span>
                                <button onClick={() => reset()} style={resetButtonStyle}>
                                    <X size={14} /> Réessayer
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* État initial */}
                {!uploadState.preview && (
                    <div style={placeholderStyle}>
                        <Upload size={32} strokeWidth={1.5} />
                        <span>Glissez une image ici</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                            ou cliquez pour sélectionner
                        </span>
                    </div>
                )}
            </div>

            {/* Infos */}
            <p style={infoTextStyle}>
                Images: JPG, PNG, WebP, SVG, GIF • Vidéos: MP4, WebM • Max 10MB
            </p>
        </div>
    );
}

// Styles
const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
};

const dropZoneStyle: CSSProperties = {
    position: 'relative',
    minHeight: '150px',
    border: '2px dashed',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
};

const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
};

const placeholderStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
};

const progressBarContainerStyle: CSSProperties = {
    width: '80%',
    height: '4px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
};

const progressBarStyle: CSSProperties = {
    height: '100%',
    background: 'linear-gradient(to right, #22d3ee, #a855f7)',
    transition: 'width 0.2s ease',
};

const resetButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
};

const infoTextStyle: CSSProperties = {
    fontSize: '0.7rem',
    color: '#6b7280',
    textAlign: 'center',
    margin: 0,
};
