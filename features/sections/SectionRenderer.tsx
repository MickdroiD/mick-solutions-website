// ============================================
// SECTION RENDERER - Factory V5
// ============================================

'use client';

import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import HeaderSection from './components/HeaderSection';
import FooterSection from './components/FooterSection';
import UniversalSection from './components/UniversalSection';
import InfiniteZoomSection from './components/InfiniteZoomSection';
import type { PrismaSection } from './types';
import type { HeroContent, HeroDesign, EffectSettings, TextSettings } from './types';
import type { UniversalSectionConfig } from './types-universal';

interface SectionRendererProps {
    section: PrismaSection;
    isEditable?: boolean;
    onUpdate?: (newConfig: any) => void;
}

export default function SectionRenderer({ section, isEditable = false, onUpdate }: SectionRendererProps) {
    // LIVE PREVIEW LOGIC
    // Allows the section to update via window.postMessage from the Admin Editor
    const [overrideConfig, setOverrideConfig] = useState<UniversalSectionConfig | null>(null);

    useEffect(() => {
        // Reset override when section changes (e.g. navigation)
        setOverrideConfig(null);

        const handleMessage = (event: MessageEvent) => {
            if (!event.data) return;
            const { type, sectionId, content } = event.data;
            if (type === 'PREVIEW_UPDATE' && sectionId === section.id && content) {
                setOverrideConfig(content as UniversalSectionConfig);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [section.id]);

    if (!section.isActive) return null;

    // Use override config if available, otherwise fallback to section props
    // Note: UniversalSectionConfig matches the structure of section.content for Universal sections
    const activeConfig = overrideConfig || (section.content as unknown as UniversalSectionConfig);

    // Common props for sections that support editing
    const commonProps = {
        id: section.id,
        isEditable,
        onUpdate: (newConfig: any) => {
            // Update local override immediately for responsiveness
            setOverrideConfig(newConfig);
            // Bubbling up
            if (onUpdate) onUpdate(newConfig);
        }
    };

    // Map section type to component
    switch (section.type) {
        case 'HERO':
            return (
                <HeroSection
                    id={section.id}
                    content={section.content as unknown as HeroContent}
                    design={section.design as unknown as HeroDesign}
                    effects={section.effects as unknown as EffectSettings | null}
                    textSettings={section.textSettings as unknown as TextSettings | null}
                />
            );

        case 'INFINITE_ZOOM':
            const zoomContent = (activeConfig as unknown) as any;
            return (
                <InfiniteZoomSection
                    layers={zoomContent.layers || []}
                    transitionDuration={zoomContent.transitionDuration}
                    zoomIntensity={zoomContent.zoomIntensity}
                    variant={zoomContent.variant}
                    showIndicators={zoomContent.showIndicators}
                />
            );

        case 'CUSTOM':
        case 'HEADER':
            // HeaderSection wraps UniversalSection logic mostly but here strictly handled
            return <HeaderSection section={{ ...section, content: (activeConfig as any), design: (activeConfig.design as any) }} />;
        case 'FOOTER':
            return <FooterSection section={{ ...section, content: (activeConfig as any), design: (activeConfig.design as any) }} />;

        // Universal Section Cases
        default:
            return (
                <UniversalSection
                    id={section.id}
                    config={activeConfig}
                    isEditable={isEditable}
                    onUpdate={commonProps.onUpdate}
                />
            );
    }
}

