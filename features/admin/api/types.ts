export interface SectionResponse {
    id: string;
    tenantId: string;
    pageId?: string | null;
    type: 'HEADER' | 'FOOTER' | 'HERO' | 'SERVICES' | 'ADVANTAGES' | 'GALLERY' | 'PORTFOLIO' | 'TESTIMONIALS' | 'TRUST' | 'FAQ' | 'CONTACT' | 'BLOG' | 'AI_ASSISTANT' | 'INFINITE_ZOOM' | 'CUSTOM';
    name?: string | null;
    order: number;
    isActive: boolean;
    content: Record<string, any>; // Using flexible JSON type for now
    design: Record<string, any>;
    effects?: Record<string, any> | null;
    textSettings?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
}
