// ============================================
// VIDEO BLOCK - Factory V5
// Support YouTube, Vimeo, et vidéos hébergées
// ============================================

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface VideoBlockProps {
    content: {
        url: string;
        title?: string;
    };
    style?: {
        aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
        autoplay?: boolean;
        muted?: boolean;
        loop?: boolean;
        controls?: boolean;
        borderRadius?: string;
    };
}

// Détecte le type de vidéo et extrait l'ID
function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'hosted'; id?: string; src: string } {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        return { type: 'youtube', id: youtubeMatch[1], src: url };
    }

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
        return { type: 'vimeo', id: vimeoMatch[1], src: url };
    }

    // Vidéo hébergée
    return { type: 'hosted', src: url };
}

const ASPECT_RATIO_MAP: Record<string, string> = {
    '16:9': '56.25%',
    '4:3': '75%',
    '1:1': '100%',
    '21:9': '42.86%',
};

export default function VideoBlock({ content, style }: VideoBlockProps) {
    const videoInfo = useMemo(() => parseVideoUrl(content.url), [content.url]);

    const aspectRatio = style?.aspectRatio || '16:9';
    const borderRadius = style?.borderRadius || '0.5rem';

    // Construire les params pour YouTube/Vimeo
    const embedParams = useMemo(() => {
        const params = new URLSearchParams();
        if (style?.autoplay) params.set('autoplay', '1');
        if (style?.muted) params.set('mute', '1');
        if (style?.loop) params.set('loop', '1');
        if (style?.controls === false) params.set('controls', '0');
        return params.toString();
    }, [style]);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        paddingBottom: ASPECT_RATIO_MAP[aspectRatio] || '56.25%',
        overflow: 'hidden',
        borderRadius,
        backgroundColor: '#000',
    };

    const mediaStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={containerStyle}
        >
            {videoInfo.type === 'youtube' && (
                <iframe
                    src={`https://www.youtube.com/embed/${videoInfo.id}?${embedParams}`}
                    title={content.title || 'Video'}
                    style={mediaStyle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            )}

            {videoInfo.type === 'vimeo' && (
                <iframe
                    src={`https://player.vimeo.com/video/${videoInfo.id}?${embedParams}`}
                    title={content.title || 'Video'}
                    style={mediaStyle}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                />
            )}

            {videoInfo.type === 'hosted' && (
                <video
                    src={videoInfo.src}
                    style={mediaStyle}
                    autoPlay={style?.autoplay}
                    muted={style?.muted}
                    loop={style?.loop}
                    controls={style?.controls !== false}
                    playsInline
                >
                    <track kind="captions" />
                </video>
            )}
        </motion.div>
    );
}
