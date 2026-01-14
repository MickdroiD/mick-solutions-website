'use client';

import FooterElectric from './variants/FooterElectric';
import UniversalSection from './UniversalSection';
import type { FooterSectionProps } from '../types';
import type { PrismaSection } from '../types';
import type { UniversalSectionConfig } from '../types-universal';

interface FooterSectionWrapperProps {
    section: PrismaSection;
}

export default function FooterSection({ section }: FooterSectionWrapperProps) {
    // Determine variant
    const design = section.design as any;
    const variant = design?.variant || 'default';

    // If Electric variant
    if (variant === 'electric' || design?.footerStyle === 'electric') {
        return (
            <FooterElectric
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
