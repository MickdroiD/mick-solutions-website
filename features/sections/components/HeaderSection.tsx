'use client';

import HeaderElectric from './variants/HeaderElectric';
import UniversalSection from './UniversalSection';
import type { HeaderSectionProps } from '../types';
import type { PrismaSection } from '../types';
import type { UniversalSectionConfig } from '../types-universal';

interface HeaderSectionWrapperProps {
    section: PrismaSection;
}

export default function HeaderSection({ section }: HeaderSectionWrapperProps) {
    // Determine variant (from design or defaults)
    const design = section.design as any; // Cast for access
    const variant = design?.variant || 'default';

    // If Electric variant, use specific component
    if (variant === 'electric' || design?.headerStyle === 'electric') {
        return (
            <HeaderElectric
                id={section.id}
                content={section.content}
                design={section.design as any}
                effects={section.effects as any}
                textSettings={section.textSettings as any}
            />
        );
    }

    // Default: Universal Section
    return (
        <UniversalSection
            id={section.id}
            config={section.content as unknown as UniversalSectionConfig}
        />
    );
}
