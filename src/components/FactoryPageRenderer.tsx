'use client';

import React from 'react';
import { SectionRenderer } from '@/components/ModuleRenderer';

// Legacy Components
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import GallerySection from '@/components/GallerySection';
import FAQSection from '@/components/FAQSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BlogSection, { type BlogPost } from '@/components/BlogSection';
import InfiniteZoomSection from '@/components/InfiniteZoomSection';
import { NavbarModule, FooterModule } from '@/components/modules';
import type { FactoryPage } from '@/lib/schemas/factory';

// Types
import { type FactoryData } from '@/lib/factory-client';
import { type GlobalSettingsComplete } from '@/lib/types/global-settings';
import { type Section } from '@/lib/schemas/factory';
import { extractSectionEffects } from '@/lib/types/section-props';

// Props Interface
export interface SectionProps {
    config: GlobalSettingsComplete;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    services: any[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects: any[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    advantages: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trustPoints: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    galleryItems: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    faqItems: any[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviews: any[] | null;
    blogPosts: BlogPost[] | null;
}

interface FactorySectionProps {
    section: Section;
    globalConfig: FactoryData['global'];
    legacyProps: SectionProps;
}

function FactorySection({
    section,
    globalConfig,
    legacyProps
}: FactorySectionProps) {
    // For Hero, use the new SectionRenderer
    if (section.type === 'hero') {
        return <SectionRenderer section={section} globalConfig={globalConfig} />;
    }

    // ⚡ FACTORY V2: Toutes les sections utilisent section.content
    switch (section.type) {
        case 'advantages': {
            const advSection = section as import('@/lib/schemas/factory').AdvantagesSection;
            const { effects, textSettings } = extractSectionEffects(section);
            // Factory V2 utilise "avantages" ou "items"
            const rawContent = advSection.content as Record<string, unknown>;
            const v2Items = (rawContent.avantages || rawContent.items || []) as Array<{
                id?: string;
                titre: string;
                description: string;
                icone?: string;
                badge?: string;
            }>;
            // Adapter les items V2 au format Advantage
            const adaptedAdvantages = v2Items.map((item, idx) => ({
                id: idx + 1,
                Titre: item.titre,
                Description: item.description,
                Icone: item.icone || 'star',
                Badge: item.badge || '',
                Ordre: String(idx + 1),
            }));
            // Récupérer les options de design
            const variant = advSection.design?.variant as 'Grid' | 'List' | 'Cards' | 'Compact' | undefined;
            const cardStyle = advSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
            const hoverEffect = advSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake' | undefined;
            return (
                <AdvantagesSection
                    advantages={adaptedAdvantages.length > 0 ? adaptedAdvantages : legacyProps.advantages}
                    variant={variant}
                    cardStyle={cardStyle}
                    hoverEffect={hoverEffect}
                    title={advSection.content.titre}
                    subtitle={advSection.content.sousTitre || undefined}
                    effects={effects}
                    textSettings={textSettings}
                />
            );
        }

        case 'services': {
            const servSection = section as import('@/lib/schemas/factory').ServicesSection;
            const { effects, textSettings } = extractSectionEffects(section);
            // Factory V2 utilise "services" ou "items" selon le schéma
            const rawContent = servSection.content as Record<string, unknown>;
            const v2Items = (rawContent.services || rawContent.items || []) as Array<{
                id?: string;
                titre: string;
                description: string;
                icone?: string;
                tagline?: string;
                pointsCles?: string[];
                tarif?: string;
            }>;
            // Adapter les items V2 au format Service
            const adaptedServices = v2Items.map((item, idx) => ({
                id: idx + 1,
                Titre: item.titre,
                Description: item.description,
                Icone: item.icone || 'settings',
                Ordre: String(idx + 1),
                Tagline: item.tagline || null,
                tags: [],
                points_cle: item.pointsCles?.join('\n') || null,
                type: null,
                tarif: item.tarif || null,
            }));
            // Récupérer les options de design
            const variant = servSection.design?.variant as 'Grid' | 'Accordion' | 'Cards' | 'Showcase' | undefined;
            const cardStyle = servSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
            const hoverEffect = servSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake' | undefined;
            // Extraire le titre et sous-titre depuis Baserow
            const titre = servSection.content.titre || 'Nos Services';
            const titreParts = titre.split(' ');
            const sectionTitle = titreParts.slice(0, -1).join(' ') || 'Nos';
            const sectionTitleHighlight = titreParts.slice(-1)[0] || 'Services';

            return (
                <ServicesSection
                    services={adaptedServices.length > 0 ? adaptedServices : []}
                    variant={variant}
                    cardStyle={cardStyle}
                    hoverEffect={hoverEffect}
                    labels={{
                        sectionTitle,
                        sectionTitleHighlight,
                        sectionSubtitle: servSection.content.sousTitre || '',
                    }}
                    effects={effects}
                    textSettings={textSettings}
                />
            );
        }

        case 'portfolio': {
            const portSection = section as import('@/lib/schemas/factory').PortfolioSection;
            const { effects, textSettings } = extractSectionEffects(section);
            // Factory V2 utilise "projets" 
            const rawContent = portSection.content as Record<string, unknown>;
            const v2Items = (rawContent.projets || []) as Array<{
                id?: string;
                titre?: string;
                nom?: string;
                description?: string;
                descriptionCourte?: string;
                imageUrl?: string;
                slug?: string;
                tags?: string[];
                lien?: string;
                lienSite?: string;
            }>;
            // Adapter les items V2 au format Project
            const adaptedProjects = v2Items.map((item, idx) => ({
                id: idx + 1,
                Nom: item.nom || item.titre || `Projet ${idx + 1}`,
                Slug: item.slug || `projet-${idx + 1}`,
                Tags: (item.tags || []).map((tag, tagIdx) => ({ id: tagIdx + 1, value: tag, color: 'blue' })),
                DescriptionCourte: item.descriptionCourte || item.description || '',
                ImageCouverture: item.imageUrl ? [{ url: item.imageUrl, name: item.nom || item.titre || 'Projet' }] : [],
                LienSite: item.lienSite || item.lien || '',
                Statut: { id: 1, value: 'Publié', color: 'green' },
                Ordre: String(idx + 1),
            }));
            // Récupérer les options de design
            const variant = portSection.design?.variant as 'Electric' | 'Minimal' | 'Corporate' | 'Bold' | undefined;
            const cardStyle = portSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
            const hoverEffect = portSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined;
            const layout = portSection.design?.layout as 'Grid' | 'Masonry' | 'Carousel' | undefined;
            return (
                <PortfolioSection
                    projects={adaptedProjects}
                    variant={variant}
                    cardStyle={cardStyle}
                    hoverEffect={hoverEffect}
                    layout={layout}
                    title={portSection.content.titre}
                    subtitle={portSection.content.sousTitre || undefined}
                    effects={effects}
                    textSettings={textSettings}
                />
            );
        }

        case 'trust': {
            const trustSection = section as import('@/lib/schemas/factory').TrustSection;
            const { effects, textSettings } = extractSectionEffects(section);
            // Factory V2 utilise "trustPoints" ou "items"
            const rawContent = trustSection.content as Record<string, unknown>;
            const v2Items = (rawContent.trustPoints || rawContent.items || []) as Array<{
                id?: string;
                titre: string;
                description: string;
                icone?: string;
                badge?: string;
            }>;
            // Adapter les items V2 au format TrustPoint
            const adaptedTrust = v2Items.map((item, idx) => ({
                id: idx + 1,
                Titre: item.titre,
                Description: item.description,
                Icone: item.icone || 'shield',
                Badge: item.badge || '',
                Ordre: String(idx + 1),
            }));
            // Récupérer les options de design
            const variant = trustSection.design?.variant as 'Electric' | 'Minimal' | 'Corporate' | 'Bold' | undefined;
            const cardStyle = trustSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
            const hoverEffect = trustSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined;
            return (
                <TrustSection
                    trustPoints={adaptedTrust.length > 0 ? adaptedTrust : legacyProps.trustPoints}
                    variant={variant}
                    cardStyle={cardStyle}
                    hoverEffect={hoverEffect}
                    title={trustSection.content.titre}
                    subtitle={trustSection.content.sousTitre || undefined}
                    effects={effects}
                    textSettings={textSettings}
                />
            );
        }

        case 'gallery': {
            // ⚡ FACTORY V2: Utiliser strictement section.content.items
            const gallerySection = section as import('@/lib/schemas/factory').GallerySection;
            const { effects, textSettings } = extractSectionEffects(section);
            const v2Items = gallerySection.content.items || [];

            // Si pas d'items V2, afficher un message vide (pas de fallback V1)
            if (v2Items.length === 0) {
                return (
                    <section id="galerie" className="py-24 sm:py-32">
                        <div className="max-w-7xl mx-auto px-4 text-center">
                            <p className="text-slate-500">Aucune image dans la galerie</p>
                        </div>
                    </section>
                );
            }

            // Adapter les items V2 au format attendu par GallerySection
            const adaptedItems = v2Items.map(item => ({
                id: parseInt(item.id) || Math.random(),
                Image: [{ url: item.imageUrl, name: item.titre || 'Image' }],
                Titre: item.titre || '',
                TypeAffichage: item.type as 'Slider' | 'Grille' | 'Zoom',
                Ordre: null,
            }));

            return (
                <GallerySection
                    galleryItems={adaptedItems}
                    variant={gallerySection.design.variant as 'Grid' | 'Slider' | 'Masonry' | 'AI' | undefined}
                    columns={gallerySection.design.columns as '2' | '3' | '4' | 'Auto' | undefined}
                    animation={gallerySection.design.animation as 'None' | 'Fade' | 'Slide' | 'Zoom' | 'Flip' | undefined}
                    imageStyle={gallerySection.design.imageStyle as 'Square' | 'Rounded' | 'Circle' | 'Custom' | undefined}
                    imageFilter={gallerySection.design.imageFilter as 'None' | 'Grayscale' | 'Sepia' | 'Contrast' | 'Blur' | undefined}
                    aspectRatio={gallerySection.design.aspectRatio as '1:1' | '4:3' | '16:9' | '3:4' | 'auto' | undefined}
                    title={gallerySection.content.titre || 'Notre Galerie'}
                    subtitle={gallerySection.content.sousTitre || 'Découvrez nos réalisations.'}
                    effects={effects}
                    textSettings={textSettings}
                />
            );
        }

        case 'testimonials': {
            const testSection = section as import('@/lib/schemas/factory').TestimonialsSection;
            const { effects, textSettings } = extractSectionEffects(section);
            // Factory V2 utilise "temoignages" ou "items"
            const rawContent = testSection.content as Record<string, unknown>;
            const v2Items = (rawContent.temoignages || rawContent.items || []) as Array<{
                id?: string;
                nom?: string;
                auteur?: string;
                poste?: string;
                message: string;
                note?: number;
                photoUrl?: string;
            }>;
            // Adapter les items V2 au format Review
            const adaptedReviews = v2Items.map((item, idx) => ({
                id: idx + 1,
                NomClient: item.nom || item.auteur || `Client ${idx + 1}`,
                PosteEntreprise: item.poste || '',
                Photo: item.photoUrl ? [{ url: item.photoUrl, name: item.nom || item.auteur || 'Client' }] : [],
                Message: item.message,
                Note: String(item.note || 5),
                Afficher: true,
            }));
            // Récupérer les options de design
            const cardStyle = testSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined;
            const hoverEffect = testSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined;
            return adaptedReviews.length > 0 ? (
                <TestimonialsSection
                    testimonials={adaptedReviews}
                    variant={testSection.design.variant as 'Minimal' | 'Carousel' | 'Cards' | 'Video' | 'AI' | undefined}
                    cardStyle={cardStyle}
                    hoverEffect={hoverEffect}
                    title={testSection.content.titre}
                    subtitle={testSection.content.sousTitre || undefined}
                    effects={effects}
                    textSettings={textSettings}
                />
            ) : null;
        }

        case 'faq': {
            const faqSection = section as import('@/lib/schemas/factory').FAQSection;
            const { effects, textSettings } = extractSectionEffects(section);
            // Factory V2 utilise "questions" ou "items"
            const rawContent = faqSection.content as Record<string, unknown>;
            const v2Items = (rawContent.questions || rawContent.items || []) as Array<{
                id?: string;
                question: string;
                reponse: string;
            }>;
            // Adapter les items V2 au format FAQ
            const adaptedFaq = v2Items.map((item, idx) => ({
                id: idx + 1,
                Question: item.question,
                Reponse: item.reponse,
                Ordre: String(idx + 1),
            }));
            return adaptedFaq.length > 0 ? (
                <FAQSection
                    faqItems={adaptedFaq}
                    variant={faqSection.design.variant as 'Minimal' | 'Accordion' | 'Tabs' | 'Search' | 'AI' | undefined}
                    cardStyle={faqSection.design.cardStyle as 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism' | undefined}
                    hoverEffect={faqSection.design.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined}
                    title={faqSection.content.titre}
                    subtitle={faqSection.content.sousTitre || undefined}
                    effects={effects}
                    textSettings={textSettings}
                />
            ) : null;
        }

        case 'blog': {
            const blogSection = section as import('@/lib/schemas/factory').BlogSection;
            const { effects, textSettings } = extractSectionEffects(section);
            return (
                <BlogSection
                    posts={legacyProps.blogPosts}
                    isDevMode={process.env.NODE_ENV === 'development'}
                    title={blogSection.content.titre}
                    subtitle={blogSection.content.sousTitre || undefined}
                    variant={blogSection.design?.variant as 'Electric' | 'Minimal' | 'Corporate' | 'Bold' | undefined}
                    cardStyle={blogSection.design?.cardStyle as 'Flat' | 'Shadow' | 'Outlined' | 'Glass' | undefined}
                    hoverEffect={blogSection.design?.hoverEffect as 'None' | 'Scale' | 'Glow' | 'Lift' | undefined}
                    effects={effects}
                    textSettings={textSettings}
                />
            );
        }

        case 'contact': {
            const contactSection = section as import('@/lib/schemas/factory').ContactSection;
            const { effects, textSettings } = extractSectionEffects(section);
            return (
                <ContactForm
                    title={contactSection.content.titre}
                    subtitle={contactSection.content.sousTitre || undefined}
                    submitText={contactSection.content.submitText || undefined}
                    successMessage={contactSection.content.successMessage || undefined}
                    effects={effects}
                    textSettings={textSettings}
                />
            );
        }

        case 'infinite-zoom': {
            const zoomSection = section as import('@/lib/schemas/factory').InfiniteZoomSection;
            return (
                <InfiniteZoomSection
                    layers={zoomSection.content.layers.map(layer => ({
                        id: layer.id,
                        imageUrl: layer.imageUrl,
                        title: layer.title || undefined,
                        description: layer.description || undefined,
                        focalPointX: layer.focalPointX,
                        focalPointY: layer.focalPointY,
                    }))}
                    // 🔧 FIX: Utiliser explicitement le titre (parfois nommé 'titre' parfois 'title' dans les données)
                    title={zoomSection.content.titre || 'Explorez'}
                    subtitle={zoomSection.content.sousTitre || undefined}
                    instructionText={zoomSection.content.instructionText}
                    variant={zoomSection.design.variant}
                    transitionDuration={zoomSection.design.transitionDuration}
                    zoomIntensity={zoomSection.design.zoomIntensity}
                    enableSound={zoomSection.design.enableSound}
                    showIndicators={zoomSection.design.showIndicators}
                    showProgress={zoomSection.design.showProgress}
                />
            );
        }

        default:
            // For unrecognized types, use the generic SectionRenderer
            return <SectionRenderer section={section} globalConfig={globalConfig} />;
    }
}

interface FactoryPageRendererProps {
    globalConfig: FactoryData['global'];
    page: FactoryPage;
    sections: Section[];
    legacyProps: SectionProps;
}

export function FactoryPageRenderer({
    globalConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    page,
    sections,
    legacyProps
}: FactoryPageRendererProps) {
    return (
        <main className="relative min-h-screen bg-background">
            <NavbarModule config={legacyProps.config} />

            {sections.length > 0 ? (
                sections.map((section, index) => (
                    <FactorySection
                        key={section.id || `section-${index}`}
                        section={section}
                        globalConfig={globalConfig}
                        legacyProps={legacyProps}
                    />
                ))
            ) : (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <p className="text-slate-500">Cette page est vide.</p>
                </div>
            )}

            <FooterModule config={legacyProps.config} legalDocs={[]} />
        </main>
    );
}
