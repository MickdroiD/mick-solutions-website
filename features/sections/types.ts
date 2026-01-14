// ============================================
// SECTION TYPES - Factory V5
// ============================================

import type { Prisma } from '@prisma/client';
import { UniversalSectionConfig } from "./types-universal";

// ============================================
// SECTION CONTENT TYPES
// ============================================

export interface HeroContent {
    titre: string;
    sousTitre?: string;
    ctaPrincipal?: {
        texte: string;
        url: string;
        style?: 'primary' | 'secondary' | 'outline';
    };
    ctaSecondaire?: {
        texte: string;
        url: string;
    };
    backgroundImageUrl?: string;
    backgroundVideoUrl?: string;

    // V4 Legacy Props Support
    badgeHero?: string;
    trustStat1Value?: string;
    trustStat1Label?: string;
    trustStat2Value?: string;
    trustStat2Label?: string;
    trustStat3Value?: string;
    trustStat3Label?: string;
    logoUrl?: string;
    heroBlocks?: any[];
}

export interface SectionContent {
    titre?: string;
    sousTitre?: string;
    description?: string;
    items?: unknown[];
    [key: string]: unknown;
}

// ============================================
// SECTION DESIGN TYPES
// ============================================

export interface HeroDesign {
    layout: 'text-left' | 'text-right' | 'centered' | 'split';
    height: 'short' | 'medium' | 'tall' | 'fullscreen';
    backgroundType?: 'color' | 'image' | 'video' | 'gradient';
    backgroundColor?: string;
    overlayOpacity?: number;
    showScrollIndicator?: boolean;
    variant?: 'default' | 'electric';
}

export interface SectionDesign {
    variant?: string;
    backgroundColor?: string;
    textColor?: string;
    spacing?: 'compact' | 'normal' | 'spacious';
    headerStyle?: string;
    footerStyle?: string;
    [key: string]: unknown;
}

// ============================================
// EFFECTS & TEXT SETTINGS
// ============================================

export interface EffectSettings {
    logoDirectEffect?: string;
    logoIndirectEffect?: string;
    effectPrimaryColor?: string;
    effectSecondaryColor?: string;
    animationSpeed?: 'slow' | 'normal' | 'fast';
    animationIntensity?: 'subtle' | 'normal' | 'strong' | 'intense';
    frameShape?: 'circle' | 'square' | 'rounded' | 'none';
    frameAnimation?: 'none' | 'color-flow' | 'glow-pulse' | 'spin-border';
    // Extended properties
    logoFrameShape?: string;
    logoFrameAnimation?: string;
    logoFrameColor?: string;
    logoFrameThickness?: number;
    [key: string]: any;
}

export interface TextSettings {
    titleFontSize?: string;
    titleFontWeight?: string;
    titleFontFamily?: string;
    titleColor?: string;
    subtitleFontSize?: string;
    subtitleFontFamily?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: string;
    bodyFontFamily?: string;
    bodyFontSize?: string;
    // Extended properties
    [key: string]: any;
}

// ============================================
// SECTION PROPS (Component Props)
// ============================================

export interface SectionProps {
    id: string;
    type: string;
    content: SectionContent;
    design: SectionDesign;
    effects?: EffectSettings | null;
    textSettings?: TextSettings | null;
    isActive: boolean;
}

export interface HeroSectionProps {
    id: string;
    content: HeroContent;
    design: HeroDesign;
    effects?: EffectSettings | null;
    textSettings?: TextSettings | null;
}

export interface HeaderSectionProps {
    id: string;
    content: any;
    design: SectionDesign;
    effects?: EffectSettings | null;
    textSettings?: TextSettings | null;
}

export interface FooterSectionProps {
    id: string;
    content: any;
    design: SectionDesign;
    effects?: EffectSettings | null;
    textSettings?: TextSettings | null;
}

// ============================================
// PRISMA SECTION TYPE (from DB)
// ============================================

export type PrismaSection = {
    id: string;
    type: string;
    content: Prisma.JsonValue;
    design: Prisma.JsonValue;
    effects: Prisma.JsonValue | null;
    textSettings: Prisma.JsonValue | null;
    isActive: boolean;
    order: number;
    name: string | null;
};

// ============================================
// TYPE GUARDS
// ============================================

export function isHeroContent(content: unknown): content is HeroContent {
    return typeof content === 'object' && content !== null && 'titre' in content;
}

export function isHeroDesign(design: unknown): design is HeroDesign {
    return typeof design === 'object' && design !== null && 'layout' in design;
}

export type { UniversalSectionConfig };
