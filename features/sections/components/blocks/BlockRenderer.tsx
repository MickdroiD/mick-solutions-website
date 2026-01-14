// ============================================
// BLOCK RENDERER - Factory V5
// Dispatcher universel pour tous les blocks
// ============================================

'use client';

import type { ContentBlock } from '../../types-universal';
import HeadingBlock from './HeadingBlock';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import ButtonBlock from './ButtonBlock';
import SpacerBlock from './SpacerBlock';
import DividerBlock from './DividerBlock';
import VideoBlock from './VideoBlock';
import IconBlock from './IconBlock';
import FormBlock from './FormBlock';
import InfiniteZoomBlock from './InfiniteZoomBlock';
import CarouselBlock from './CarouselBlock';
import GalleryBlock from './GalleryBlock';
import LogoCloudBlock from './LogoCloudBlock';
import TestimonialBlock from './TestimonialBlock';
import FAQBlock from './FAQBlock';
import StatsCounterBlock from './StatsCounterBlock';
import PricingBlock from './PricingBlock';
import TimelineBlock from './TimelineBlock';
import TeamBlock from './TeamBlock';
import MarqueeBlock from './MarqueeBlock';
import FeatureGridBlock from './FeatureGridBlock';
import CTASectionBlock from './CTASectionBlock';
import CountdownBlock from './CountdownBlock';
import NewsletterBlock from './NewsletterBlock';
import WhatsAppButtonBlock from './WhatsAppButtonBlock';
import BentoGridBlock from './BentoGridBlock';
import BeforeAfterBlock from './BeforeAfterBlock';

interface BlockRendererProps {
    block: ContentBlock;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
    switch (block.type) {
        case 'heading':
            return <HeadingBlock {...block} />;

        case 'text':
            return <TextBlock {...block} />;

        case 'image':
            return <ImageBlock {...block} />;

        case 'button':
            return <ButtonBlock {...block} />;

        case 'spacer':
            return <SpacerBlock {...block} />;

        case 'divider':
            return <DividerBlock {...block} />;

        case 'video':
            return <VideoBlock content={(block as any).content} style={(block as any).style} />;

        case 'icon':
            return <IconBlock content={(block as any).content} style={(block as any).style} />;

        case 'form':
            return <FormBlock content={(block as any).content} style={(block as any).style} />;

        case 'infinite-zoom':
            return <InfiniteZoomBlock content={(block as any).content} style={(block as any).style} />;

        case 'carousel':
            return <CarouselBlock content={(block as any).content} style={(block as any).style} />;

        case 'gallery':
            return <GalleryBlock content={(block as any).content} style={(block as any).style} />;

        case 'logo-cloud':
            return <LogoCloudBlock content={(block as any).content} style={(block as any).style} />;

        case 'testimonial':
            return <TestimonialBlock content={(block as any).content} style={(block as any).style} />;

        case 'faq':
            return <FAQBlock content={(block as any).content} style={(block as any).style} />;

        case 'stats-counter':
            return <StatsCounterBlock content={(block as any).content} style={(block as any).style} />;

        case 'pricing':
            return <PricingBlock content={(block as any).content} style={(block as any).style} />;

        case 'timeline':
            return <TimelineBlock content={(block as any).content} style={(block as any).style} />;

        case 'team':
            return <TeamBlock content={(block as any).content} style={(block as any).style} />;

        case 'marquee':
            return <MarqueeBlock content={(block as any).content} style={(block as any).style} />;

        case 'feature-grid':
            return <FeatureGridBlock content={(block as any).content} style={(block as any).style} />;

        case 'cta-section':
            return <CTASectionBlock content={(block as any).content} style={(block as any).style} />;

        case 'countdown':
            return <CountdownBlock content={(block as any).content} style={(block as any).style} />;

        case 'newsletter':
            return <NewsletterBlock content={(block as any).content} style={(block as any).style} />;

        case 'whatsapp-button':
            return <WhatsAppButtonBlock content={(block as any).content} style={(block as any).style} />;

        case 'bento-grid':
            return <BentoGridBlock content={(block as any).content} style={(block as any).style} />;

        case 'before-after':
            return <BeforeAfterBlock content={(block as any).content} style={(block as any).style} />;

        default:
            console.warn(`Type de block non supporté : ${(block as { type: string }).type}`);
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    Block type: {(block as { type: string }).type} - Non reconnu
                </div>
            );
    }
}

