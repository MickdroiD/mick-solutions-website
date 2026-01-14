// ============================================
// API TYPES - Factory V5
// ============================================

import type { SectionType } from '@prisma/client';

export interface CreateSectionRequest {
    tenantId: string;
    pageId?: string;
    type: SectionType;
    name?: string;
    order: number;
    isActive: boolean;
    content: unknown;
    design: unknown;
    effects?: unknown;
    textSettings?: unknown;
}

export interface UpdateSectionRequest {
    name?: string;
    type?: SectionType;
    order?: number;
    isActive?: boolean;
    content?: unknown;
    design?: unknown;
    effects?: unknown;
    textSettings?: unknown;
}

export interface SectionResponse {
    id: string;
    tenantId: string;
    pageId: string | null;
    type: string;
    name: string | null;
    order: number;
    isActive: boolean;
    content: unknown;
    design: unknown;
    effects: unknown;
    textSettings: unknown;
    createdAt: string;
    updatedAt: string;
}
