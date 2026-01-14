// ============================================
// UNIVERSAL SECTION - Factory V5
// TypeScript Interfaces
// ============================================

/**
 * CONTENT BLOCKS - Les briques de construction
 */

export type BlockType =
    | 'heading'
    | 'text'
    | 'image'
    | 'video'
    | 'button'
    | 'icon'
    | 'spacer'
    | 'divider'
    | 'form'
    | 'infinite-zoom'
    | 'carousel'
    | 'gallery'
    | 'logo-cloud'
    | 'testimonial'
    | 'faq'
    | 'stats-counter'
    | 'pricing'
    | 'timeline'
    | 'team'
    | 'marquee'
    | 'feature-grid'
    | 'cta-section'
    | 'countdown'
    | 'newsletter'
    | 'whatsapp-button'
    | 'bento-grid'
    | 'before-after';

export interface BaseBlock {
    id: string;
    type: BlockType;
    order: number;
    // Scroll reveal animation
    // Scroll reveal animation
    animation?: {
        type?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out' | 'flip' | 'rotate' | 'bounce' | 'slide-up' | 'blur-in' | 'none';
        delay?: number;
        duration?: number;
    };
    // Advanced Positioning
    positioning?: {
        mode: 'relative' | 'absolute';
        top?: string;
        left?: string;
        right?: string;
        bottom?: string;
        zIndex?: number;
        rotation?: number;
    };
    // V4 Global Animations
    scrollReveal?: boolean;
    revealDelay?: number;
}

// Heading Block
export interface HeadingBlock extends BaseBlock {
    type: 'heading';
    content: {
        text: string;
        level: 1 | 2 | 3 | 4 | 5 | 6;
    };
    style?: {
        fontSize?: string;
        fontWeight?: string;
        fontFamily?: string;
        color?: string;
        gradient?: boolean;
        gradientFrom?: string;
        gradientTo?: string;
        align?: 'left' | 'center' | 'right';
        textAlign?: 'left' | 'center' | 'right'; // Added for compatibility
        textEffect?: 'none' | 'glow' | 'neon' | 'shadow' | 'outline' | '3d';
        glowColor?: string; // Couleur personnalisée pour effets lumineux
        alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';
    };
}

// Text Block
export interface TextBlock extends BaseBlock {
    type: 'text';
    content: {
        text: string;
        html?: string; // Pour rich text futur
    };
    style?: {
        fontSize?: string;
        lineHeight?: string;
        color?: string;
        align?: 'left' | 'center' | 'right' | 'justify';
        textAlign?: 'left' | 'center' | 'right' | 'justify';
        alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';
    };
}

// Image Block
export interface ImageBlock extends BaseBlock {
    type: 'image';
    content: {
        url: string;
        alt?: string;
    };
    style?: {
        aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
        objectFit?: 'cover' | 'contain' | 'fill';
        borderRadius?: string;
        filter?: 'none' | 'grayscale' | 'sepia' | 'contrast' | 'blur';
        width?: string; // e.g. "50%", "200px"
        maxWidth?: string;
        alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';
    };
    link?: LinkConfig;
}

// Button Block
export interface ButtonBlock extends BaseBlock {
    type: 'button';
    content: {
        text: string;
        icon?: string; // Lucide icon name
    };
    style?: {
        variant?: 'solid' | 'gradient' | 'outline' | 'ghost' | 'gloss' | 'neon' | 'glass';
        size?: 'sm' | 'md' | 'lg' | 'xl';
        shape?: 'rounded' | 'pill' | 'square';
        color?: string;
        hoverEffect?: 'scale' | 'glow' | 'lift' | 'shadow';
        alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';
    };
    link: LinkConfig;
}

// Spacer Block
export interface SpacerBlock extends BaseBlock {
    type: 'spacer';
    content: {
        height: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
    };
    style?: {
        // Universal spacing
        marginTop?: string;
        marginBottom?: string;
        paddingTop?: string;
        paddingBottom?: string;
    };
}

// Divider Block
export interface DividerBlock extends BaseBlock {
    type: 'divider';
    style?: {
        width?: string;
        thickness?: string;
        color?: string;
        style?: 'solid' | 'dashed' | 'dotted';
    };
}

// Video Block
export interface VideoBlock extends BaseBlock {
    type: 'video';
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

// Icon Block
export interface IconBlock extends BaseBlock {
    type: 'icon';
    content: {
        name: string; // Lucide icon name
        label?: string;
    };
    style?: {
        size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        color?: string;
        backgroundColor?: string;
        shape?: 'none' | 'circle' | 'square' | 'rounded';
        animation?: 'none' | 'pulse' | 'bounce' | 'spin';
    };
}

// Form Field
export interface FormField {
    id: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
}

// Form Block
export interface FormBlock extends BaseBlock {
    type: 'form';
    content: {
        title?: string;
        description?: string;
        submitText?: string;
        successMessage?: string;
        fields: FormField[];
        webhookUrl?: string;
    };
    style?: {
        variant?: 'minimal' | 'bordered' | 'filled';
        buttonVariant?: 'solid' | 'gradient' | 'outline';
        primaryColor?: string;
    };
}

// Zoom Layer
export interface ZoomLayer {
    id: string;
    imageUrl: string;
    title?: string;
    focalPointX?: number;
    focalPointY?: number;
}

// Infinite Zoom Block
export interface InfiniteZoomBlock extends BaseBlock {
    type: 'infinite-zoom';
    content: {
        layers: ZoomLayer[];
    };
    style?: {
        variant?: 'fullscreen' | 'contained' | 'hero';
        transitionDuration?: number;
        zoomIntensity?: number;
        showIndicators?: boolean;
        height?: string;
    };
}

// Link Configuration
export interface LinkConfig {
    type: 'url' | 'page' | 'section' | 'email' | 'phone';
    target: string;
    openInNewTab?: boolean;
}

// Union Type pour tous les blocks
export type ContentBlock =
    | HeadingBlock
    | TextBlock
    | ImageBlock
    | ButtonBlock
    | SpacerBlock
    | DividerBlock
    | VideoBlock
    | IconBlock
    | FormBlock
    | InfiniteZoomBlock
    | CarouselBlock
    | GalleryBlock
    | LogoCloudBlock
    | TestimonialBlock
    | FAQBlock
    | StatsCounterBlock
    | PricingBlock
    | TimelineBlock
    | TeamBlock
    | MarqueeBlock
    | FeatureGridBlock
    | CTASectionBlock
    | CountdownBlock
    | NewsletterBlock
    | WhatsAppButtonBlock
    | BentoGridBlock
    | BeforeAfterBlock;

// Carousel Block
export interface CarouselBlock extends BaseBlock {
    type: 'carousel';
    content: {
        images: { url: string; alt?: string; caption?: string }[];
        autoplay?: boolean;
        autoplayInterval?: number;
    };
    style?: {
        aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
        showArrows?: boolean;
        showDots?: boolean;
        borderRadius?: string;
        transition?: 'slide' | 'fade';
    };
}

// Gallery Block
export interface GalleryBlock extends BaseBlock {
    type: 'gallery';
    content: {
        images: { url: string; alt?: string; title?: string }[];
    };
    style?: {
        mode?: 'grid' | 'masonry' | 'slider';
        columns?: 2 | 3 | 4 | 5;
        gap?: 'sm' | 'md' | 'lg';
        aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
        borderRadius?: string;
        hoverEffect?: 'zoom' | 'lift' | 'glow' | 'none';
        // Slider specific
        showArrows?: boolean;
        showDots?: boolean;
        autoplay?: boolean;
    };
}

// Logo Cloud Block
export interface LogoCloudBlock extends BaseBlock {
    type: 'logo-cloud';
    content: {
        logos: { url: string; alt?: string; link?: string }[];
        title?: string;
    };
    style?: {
        columns?: 3 | 4 | 5 | 6;
        grayscale?: boolean;
        gap?: 'sm' | 'md' | 'lg';
        logoHeight?: string;
        animate?: 'none' | 'fadeIn' | 'marquee';
    };
}

// Testimonial Item Interface
export interface TestimonialItem {
    id: string;
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatarUrl?: string;
    rating?: 1 | 2 | 3 | 4 | 5;
}

// Testimonial Block
export interface TestimonialBlock extends BaseBlock {
    type: 'testimonial';
    content: {
        // Legacy single mode fields (optional for migration)
        quote?: string;
        author?: string;
        role?: string;
        company?: string;
        avatarUrl?: string;
        rating?: 1 | 2 | 3 | 4 | 5;

        // New List Mode
        items?: TestimonialItem[];
        title?: string;
        subtitle?: string;
    };
    style?: {
        variant?: 'card' | 'minimal' | 'quote' | 'bubble';
        mode?: 'single' | 'grid' | 'carousel'; // New mode
        columns?: 1 | 2 | 3; // For grid
        avatarSize?: 'sm' | 'md' | 'lg';
        avatarShape?: 'circle' | 'rounded' | 'square';
        showQuoteIcon?: boolean;
        showRating?: boolean;
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        accentColor?: string;
        glassEffect?: boolean;
    };
}

// FAQ Block (Accordéon)
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export interface FAQBlock extends BaseBlock {
    type: 'faq';
    content: {
        title?: string;
        items: FAQItem[];
    };
    style?: {
        variant?: 'simple' | 'bordered' | 'card' | 'minimal';
        allowMultiple?: boolean;
        iconPosition?: 'left' | 'right';
        enableSearch?: boolean; // New V4 Feature
        searchPlaceholder?: string;
        accentColor?: string;
        questionColor?: string;
        answerColor?: string;
    };
}

// Stats Counter Block
export interface StatItem {
    id: string;
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
}

export interface StatsCounterBlock extends BaseBlock {
    type: 'stats-counter';
    content: {
        stats: StatItem[];
    };
    style?: {
        variant?: 'grid' | 'inline' | 'cards';
        columns?: 2 | 3 | 4;
        animate?: boolean;
        duration?: number;
        valueColor?: string;
        labelColor?: string;
        valueSize?: 'md' | 'lg' | 'xl' | '2xl';
    };
}

// Pricing Block
export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    highlighted?: boolean;
    ctaText?: string;
    ctaUrl?: string;
    // New V4 Options
    priceYearly?: string; // For toggle
    periodYearly?: string;
}

export interface PricingBlock extends BaseBlock {
    type: 'pricing';
    content: {
        title?: string;
        subtitle?: string;
        plans: PricingPlan[];
    };
    style?: {
        variant?: 'cards' | 'minimal' | 'comparison';
        columns?: 2 | 3 | 4;
        highlightColor?: string;
        showBadge?: boolean;
        badgeText?: string;
        // New V4 Options
        enableToggle?: boolean; // Monthly/Yearly
        toggleColor?: string;
        cardStyle?: 'glass' | 'solid' | 'outline';
    };
}

// Timeline Block
export interface TimelineItem {
    id: string;
    date: string;
    title: string;
    description?: string;
    icon?: string;
}

export interface TimelineBlock extends BaseBlock {
    type: 'timeline';
    content: {
        title?: string;
        items: TimelineItem[];
    };
    style?: {
        variant?: 'vertical' | 'horizontal' | 'alternating';
        lineColor?: string;
        dotColor?: string;
        // New V4 Options
        connectorStyle?: 'solid' | 'dashed' | 'dotted';
        markerStyle?: 'dot' | 'icon' | 'number';
        cardEffect?: 'none' | 'shadow' | 'glass';
    };
}

// Team Block
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    bio?: string;

    // Social Links (V4)
    socials?: {
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        email?: string;
        website?: string;
    };
    email?: string;
}

export interface TeamBlock extends BaseBlock {
    type: 'team';
    content: {
        title?: string;
        members: TeamMember[];
    };
    style?: {
        variant?: 'grid' | 'cards' | 'list' | 'carousel'; // Added carousel
        columns?: 2 | 3 | 4 | 5;
        showSocial?: boolean;
        imageShape?: 'circle' | 'rounded' | 'square';
        // New V4 Options
        hoverEffect?: 'zoom' | 'grayscale' | 'lift' | 'none';
        textAlign?: 'center' | 'left';
    };
}

// Marquee Block
export interface MarqueeBlock extends BaseBlock {
    type: 'marquee';
    content: {
        items: { text?: string; imageUrl?: string }[];
    };
    style?: {
        speed?: 'slow' | 'normal' | 'fast';
        direction?: 'left' | 'right';
        pauseOnHover?: boolean;
        gap?: string;
        textColor?: string;
        fontSize?: string;
    };
}

// Feature Grid Block
export interface FeatureItem {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface FeatureGridBlock extends BaseBlock {
    type: 'feature-grid';
    content: {
        title?: string;
        subtitle?: string;
        features: FeatureItem[];
    };
    style?: {
        variant?: 'cards' | 'minimal' | 'icons-left';
        columns?: 2 | 3 | 4;
        iconColor?: string;
        iconSize?: 'sm' | 'md' | 'lg';
    };
}

// CTA Section Block
export interface CTASectionBlock extends BaseBlock {
    type: 'cta-section';
    content: {
        headline: string;
        subheadline?: string;
        primaryButtonText?: string;
        primaryButtonUrl?: string;
        secondaryButtonText?: string;
        secondaryButtonUrl?: string;
    };
    style?: {
        variant?: 'centered' | 'split' | 'banner';
        gradientFrom?: string;
        gradientTo?: string;
        textColor?: string;
    };
}

// Countdown Block
export interface CountdownBlock extends BaseBlock {
    type: 'countdown';
    content: {
        targetDate: string; // ISO date string
        title?: string;
        expiredMessage?: string;
    };
    style?: {
        variant?: 'boxes' | 'inline' | 'minimal';
        accentColor?: string;
        showLabels?: boolean;
        labels?: {
            days?: string;
            hours?: string;
            minutes?: string;
            seconds?: string;
        };
    };
}

// Newsletter Block
export interface NewsletterBlock extends BaseBlock {
    type: 'newsletter';
    content: {
        title?: string;
        subtitle?: string;
        placeholder?: string;
        buttonText?: string;
        successMessage?: string;
    };
    style?: {
        variant?: 'inline' | 'stacked' | 'minimal';
        accentColor?: string;
    };
}

// WhatsApp Button Block
export interface WhatsAppButtonBlock extends BaseBlock {
    type: 'whatsapp-button';
    content: {
        phoneNumber: string;
        message?: string;
        buttonText?: string;
    };
    style?: {
        variant?: 'floating' | 'inline' | 'icon-only';
        position?: 'bottom-right' | 'bottom-left';
        size?: 'sm' | 'md' | 'lg';
    };
}

// Bento Grid Block
export interface BentoGridItem {
    id: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    icon?: string;
    span?: 'sm' | 'md' | 'lg' | 'xl'; // Grid span size
    bgColor?: string;
    url?: string;
}

export interface BentoGridBlock extends BaseBlock {
    type: 'bento-grid';
    content: {
        items: BentoGridItem[];
    };
    style?: {
        gap?: 'sm' | 'md' | 'lg';
        rounded?: 'sm' | 'md' | 'lg' | 'xl';
        showHoverEffect?: boolean;
    };
}

// Before/After Block
export interface BeforeAfterBlock extends BaseBlock {
    type: 'before-after';
    content: {
        beforeImage: string;
        afterImage: string;
        beforeLabel?: string;
        afterLabel?: string;
    };
    style?: {
        variant?: 'slider' | 'hover' | 'side-by-side';
        sliderPosition?: number; // 0-100
        aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2';
        borderRadius?: string;
    };
}

/**
 * UNIVERSAL SECTION CONFIGURATION
 */

export interface UniversalSectionConfig {
    // Layout & Structure
    layout: {
        type: 'grid' | 'flex' | 'single-column' | 'split';
        columns?: number; // Pour grid
        gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        alignment?: 'left' | 'center' | 'right';
        verticalAlign?: 'top' | 'center' | 'bottom' | 'stretch';
        // Flex/Grid Precision
        alignItems?: 'start' | 'center' | 'end' | 'stretch';
        justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
        containerWidth?: 'default' | 'narrow' | 'wide' | 'full';
    };

    // Size & Spacing
    sizing: {
        height?: 'auto' | 'short' | 'medium' | 'tall' | 'fullscreen' | string;
        paddingX?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
        maxHeight?: string; // New V5 Feature
    };

    // Content Blocks
    blocks: ContentBlock[];

    // Visual Design
    design: {
        background: BackgroundConfig;
        borders?: BorderConfig;
        glassmorphism?: boolean;
        // New V4 Global Features
        dividers?: {
            top?: ShapeDividerConfig;
            bottom?: ShapeDividerConfig;
        };
        typography?: TypographyConfig;

        glassOpacity?: number;
        glassColor?: string; // Couleur de fond du verre
        glassBlur?: number; // Flou de fond (backdrop-filter)

        // Animations & Effects (Phase 2)
        effects?: {
            entrance?: string; // Animation registry key
            scroll?: string;
            electricEffects?: {
                enabled: boolean;
                intensity?: 'subtle' | 'normal' | 'strong' | 'intense';
                primaryColor?: string;
                secondaryColor?: string;
            };
        };

    };
}

export interface ShapeDividerConfig {
    shape: 'none' | 'wave' | 'curve' | 'triangle' | 'slant' | 'arrow';
    height?: number;
    color?: string;
    flip?: boolean;
    invert?: boolean;
}

export interface TypographyConfig {
    headlineFont?: string; // Google Font Name
    bodyFont?: string;
    headlineWeight?: '300' | '400' | '500' | '600' | '700' | '800';
    textColor?: string;
    headingColor?: string;
    textShadow?: string;

}





export interface BackgroundConfig {
    type: 'solid' | 'gradient' | 'image' | 'video' | 'slideshow' | 'animatedGradient';

    // Solid
    color?: string;

    // Gradient
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: 'to-r' | 'to-br' | 'to-b' | 'to-bl';

    // Animated Gradient
    gradientColors?: string[]; // Pour animatedGradient
    gradientSpeed?: number; // Durée d'animation en secondes
    gradientAngle?: number;

    // Image
    imageUrl?: string;
    imageOpacity?: number;

    // Parallax (pour image)
    parallax?: boolean;
    parallaxSpeed?: number; // 0.1 à 1

    // Video
    videoUrl?: string;
    videoPoster?: string;
    videoPlaybackRate?: number;

    // Slideshow
    slides?: {
        imageUrl: string;
        duration?: number; // ms par slide
    }[];
    slideTransition?: 'fade' | 'slide' | 'zoom' | 'kenBurns';
    slideTransitionDuration?: number; // ms

    // Common effects
    blur?: number;
    overlay?: {
        color: string;
        opacity: number;
    };
}

export interface BorderConfig {
    width?: string;
    color?: string;
    radius?: string;
    style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * MAPPED VALUES - Conversion config → CSS
 */

export const SPACING_MAP = {
    none: '0',
    sm: '1rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
    '2xl': '6rem',
} as const;

export const HEIGHT_MAP = {
    auto: 'auto',
    short: '40vh',
    medium: '60vh',
    tall: '80vh',
    fullscreen: '100vh',
} as const;

export const MAX_WIDTH_MAP = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
} as const;

export const GAP_MAP = {
    none: '0',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
} as const;

/**
 * DEFAULT CONFIGS - Valeurs par défaut propres
 */

export const DEFAULT_UNIVERSAL_CONFIG: UniversalSectionConfig = {
    layout: {
        type: 'single-column',
        alignment: 'center',
        verticalAlign: 'center',
        gap: 'md',
    },
    sizing: {
        height: 'medium',
        paddingX: 'lg',
        paddingY: 'lg',
        maxWidth: 'xl',
    },
    blocks: [],
    design: {
        background: {
            type: 'solid',
            color: '#0a0a0f',
        },
    },
};

export const DEFAULT_HEADING_BLOCK: Omit<HeadingBlock, 'id' | 'order'> = {
    type: 'heading',
    content: {
        text: 'Nouveau titre',
        level: 2,
    },
    style: {
        fontSize: '3rem',
        fontWeight: '700',
        color: '#ffffff',
        align: 'center',
    },
};

export const DEFAULT_TEXT_BLOCK: Omit<TextBlock, 'id' | 'order'> = {
    type: 'text',
    content: {
        text: 'Nouveau paragraphe de texte.',
    },
    style: {
        fontSize: '1.125rem',
        lineHeight: '1.75',
        color: '#d1d5db',
        align: 'center',
    },
};

export const DEFAULT_BUTTON_BLOCK: Omit<ButtonBlock, 'id' | 'order'> = {
    type: 'button',
    content: {
        text: 'Cliquez ici',
    },
    style: {
        variant: 'gradient',
        size: 'lg',
        shape: 'rounded',
        hoverEffect: 'scale',
    },
    link: {
        type: 'url',
        target: '#',
    },
};
