// ============================================
// TYPE-SAFE VALIDATION - Factory V5
// ============================================

import { z } from 'zod';

// ============================================
// CORE SCHEMAS (Never modify - additive only)
// ============================================

export const CoreSectionConfigSchema = z.object({
    type: z.enum(['HERO', 'FAQ', 'CONTACT', 'SERVICES', 'INFINITE_ZOOM']),
    order: z.number().int().min(0),
    isActive: z.boolean(),
});

// ============================================
// V5 EXTENSIONS (Additive-only pattern)
// ============================================

export const SectionConfigV5Schema = CoreSectionConfigSchema.extend({
    // Ajouts Janvier 2026
    logoFrameShape: z.enum(['circle', 'square', 'none']).optional(),
    logoSize: z.number().int().min(50).max(800).optional(),

    // Futurs ajouts ici (toujours optional!)
}).passthrough(); // ✅ CRITIQUE: Accepte champs inconnus

export type SectionConfigV5 = z.infer<typeof SectionConfigV5Schema>;

// ============================================
// DEFAULTS
// ============================================

export const DEFAULT_SECTION_CONFIG: Required<SectionConfigV5> = {
    type: 'HERO',
    order: 0,
    isActive: true,
    logoFrameShape: 'circle',
    logoSize: 280,
};

// ============================================
// MERGE HELPER
// ============================================

export function mergeSectionConfig(
    stored: Partial<SectionConfigV5>
): Required<SectionConfigV5> {
    return {
        ...DEFAULT_SECTION_CONFIG,
        ...stored,
    };
}

// ============================================
// VALIDATION
// ============================================

export function validateSectionConfig(data: unknown): SectionConfigV5 {
    const parsed = SectionConfigV5Schema.parse(data);
    return mergeSectionConfig(parsed);
}
