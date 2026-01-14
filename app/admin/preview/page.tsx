'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SectionRenderer from '@/features/sections/SectionRenderer';
import { UniversalSectionConfig } from '@/features/sections/types-universal';

// Dummy section to initialize the renderer
const DUMMY_PREVIEW_SECTION = {
    id: 'preview-section',
    type: 'CUSTOM',
    isActive: true,
    order: 0,
    pageId: 'preview',
    content: {}, // Will be overridden
    design: {},
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
};

function PreviewContent() {
    const searchParams = useSearchParams();
    const [sections, setSections] = useState<any[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data) return;
            const { type, sections: incomingSections, sectionId, content } = event.data;

            if (type === 'PREVIEW_LOAD_PAGE' && Array.isArray(incomingSections)) {
                console.log("Loading full page preview", incomingSections.length);
                setSections(incomingSections);
            }

            // Optional: Update list state if needed (though SectionRenderer handles local updates usually)
            if (type === 'PREVIEW_UPDATE_LIST' && Array.isArray(incomingSections)) {
                setSections(incomingSections);
            }
        };

        window.addEventListener('message', handleMessage);

        // Notify parent we are ready immediately
        if (window.parent) {
            window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
        }

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div id="preview-root" style={{ minHeight: '100vh', background: '#0a0a0f' }}>
            {sections.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
                    Chargement de la page...
                </div>
            )}

            {sections.map(section => (
                <div
                    key={section.id}
                    id={`section-${section.id}`}
                    style={{ position: 'relative' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Send focus request to parent
                        window.parent.postMessage({ type: 'PREVIEW_FOCUS', sectionId: section.id }, '*');
                    }}
                >
                    <SectionRenderer
                        section={section}
                        isEditable={true}
                        onUpdate={(newConfig) => {
                            // Send update back to parent Admin
                            window.parent.postMessage({
                                type: 'PREVIEW_UPDATE_CONTENT',
                                sectionId: section.id,
                                content: newConfig
                            }, '*');
                        }}
                    />

                    {/* Hover/Focus Indicator - simplified for now */}
                    <style jsx>{`
                        #section-${section.id}:hover {
                            outline: 2px solid #22d3ee;
                            z-index: 10;
                        }
                    `}</style>
                </div>
            ))}
        </div>
    );
}

export default function AdminPreviewPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Chargement de l'aperçu...</div>}>
            <PreviewContent />
        </Suspense>
    );
}
