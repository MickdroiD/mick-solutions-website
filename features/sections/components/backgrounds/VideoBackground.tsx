// ============================================
// VIDEO BACKGROUND - Factory V5
// Fond vidéo avec autoplay et loop
// ============================================

'use client';

import { useRef, useEffect } from 'react';

export interface VideoBackgroundProps {
    videoUrl: string;
    posterUrl?: string;
    overlay?: {
        color: string;
        opacity: number;
    };
    blur?: number;
    playbackRate?: number; // Vitesse de lecture (0.5 = lent, 1 = normal, 2 = rapide)
}

export default function VideoBackground({
    videoUrl,
    posterUrl,
    overlay,
    blur = 0,
    playbackRate = 1,
}: VideoBackgroundProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                poster={posterUrl}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: '100%',
                    minHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'cover',
                    filter: blur > 0 ? `blur(${blur}px)` : undefined,
                }}
            >
                <source src={videoUrl} type="video/mp4" />
            </video>

            {/* Overlay */}
            {overlay && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: overlay.color,
                        opacity: overlay.opacity,
                    }}
                />
            )}
        </div>
    );
}
