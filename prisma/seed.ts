// ============================================
// SEED DEMO TENANT - Factory V5
// ============================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding demo tenant...');

    // Create demo tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'demo-tenant' },
        update: {},
        create: {
            id: 'demo-tenant',
            name: 'Demo Site',
            slug: 'demo',
            plan: 'STARTER',
            status: 'ACTIVE',
        },
    });

    console.log('✅ Tenant created:', tenant.name);

    // Create home page
    const page = await prisma.page.upsert({
        where: { id: 'demo-home-page' },
        update: {},
        create: {
            id: 'demo-home-page',
            tenantId: tenant.id,
            slug: 'home',
            name: 'Home',
            isPublished: true,
        },
    });

    console.log('✅ Page created:', page.name);

    // Create default Hero section with Universal blocks
    // Note: UniversalSection stores full config in 'content' field
    const heroSection = await prisma.section.upsert({
        where: { id: 'demo-hero-section' },
        update: {},
        create: {
            id: 'demo-hero-section',
            tenantId: tenant.id,
            pageId: page.id,
            name: 'Bienvenue',
            type: 'CUSTOM',
            order: 0,
            isActive: true,
            // Full UniversalSectionConfig in content
            content: {
                blocks: [
                    {
                        id: 'welcome-heading',
                        type: 'heading',
                        order: 0,
                        content: { text: 'Bienvenue sur votre site', level: 1 },
                        style: { gradient: true },
                    },
                    {
                        id: 'welcome-text',
                        type: 'text',
                        order: 1,
                        content: { text: 'Éditez cette page depuis le panneau d\'administration.' },
                    },
                    {
                        id: 'welcome-button',
                        type: 'button',
                        order: 2,
                        content: { text: 'Panneau admin' },
                        style: { variant: 'gradient', size: 'lg', shape: 'pill' },
                        link: { type: 'page', target: '/admin' },
                    },
                ],
                layout: { type: 'single-column', alignment: 'center', verticalAlign: 'center', gap: 'lg' },
                sizing: { height: 'fullscreen', maxWidth: 'md', paddingX: 'lg', paddingY: 'xl' },
                design: {
                    background: {
                        type: 'gradient',
                        gradientFrom: '#0a0a0f',
                        gradientTo: '#1a1a2e',
                        gradientDirection: 'to-br',
                    },
                },
            },
            // Prisma requires these fields even if empty
            design: {},
        },
    });

    console.log('✅ Section created:', heroSection.name);

    // Create test user with PIN: 123456
    const pinHash = '$2b$10$vbJrbWDC.35W0QcCt9TbZ.F8objwsqpJ4HW0URXMhsIVe0ZgMaWua';

    const user = await prisma.tenantUser.upsert({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: 'admin@demo.ch'
            }
        },
        update: {},
        create: {
            tenantId: tenant.id,
            email: 'admin@demo.ch',
            pinHash: pinHash,
            role: 'ADMIN',
        },
    });

    console.log('✅ User created:', user.email, '(PIN: 123456)');

    // ============================================
    // PORTFOLIO SECTION
    // ============================================
    const portfolioSection = await prisma.section.upsert({
        where: { id: 'demo-portfolio-section' },
        update: {},
        create: {
            id: 'demo-portfolio-section',
            tenantId: tenant.id,
            pageId: page.id,
            name: 'Portfolio',
            type: 'CUSTOM',
            order: 1,
            isActive: true,
            content: {
                blocks: [
                    {
                        id: 'portfolio-heading',
                        type: 'heading',
                        order: 0,
                        content: { text: 'Nos Projets', level: 2 },
                        style: { fontSize: '2.5rem', gradient: true, gradientFrom: '#22d3ee', gradientTo: '#a855f7' },
                    },
                    {
                        id: 'portfolio-text',
                        type: 'text',
                        order: 1,
                        content: { text: 'Découvrez nos réalisations les plus innovantes.' },
                        style: { color: '#9ca3af' },
                    },
                    {
                        id: 'portfolio-gallery',
                        type: 'gallery',
                        order: 2,
                        content: {
                            images: [
                                { id: 'p1', url: 'https://placehold.co/600x400/1a1a2e/22d3ee?text=Immersiv+Project', caption: 'Immersiv Project', link: '/immersiv-project' },
                                { id: 'p2', url: 'https://placehold.co/600x400/1a1a2e/a855f7?text=Projet+2', caption: 'Projet créatif' },
                                { id: 'p3', url: 'https://placehold.co/600x400/1a1a2e/ec4899?text=Projet+3', caption: 'Design moderne' },
                            ],
                        },
                        style: { columns: 3, gap: 'md', hoverEffect: 'zoom' },
                    },
                ],
                layout: { type: 'single-column', alignment: 'center', gap: 'lg' },
                sizing: { height: 'auto', maxWidth: 'xl', paddingX: 'lg', paddingY: 'xl' },
                design: {
                    background: { type: 'solid', color: '#0a0a0f' },
                },
            },
            design: {},
        },
    });

    console.log('✅ Portfolio section created:', portfolioSection.name);

    // ============================================
    // IMMERSIV PROJECT PAGE
    // ============================================
    const immersivPage = await prisma.page.upsert({
        where: { id: 'immersiv-project-page' },
        update: {},
        create: {
            id: 'immersiv-project-page',
            tenantId: tenant.id,
            slug: 'immersiv-project',
            name: 'Immersiv Project',
            isPublished: true,
            seoTitle: 'Immersiv Project - Expérience Immersive',
            seoDescription: 'Découvrez notre projet immersif avec une galerie en zoom infini.',
        },
    });

    console.log('✅ Immersiv Project page created:', immersivPage.name);

    // Infinite Zoom Section for Immersiv Project
    const immersivSection = await prisma.section.upsert({
        where: { id: 'immersiv-zoom-section' },
        update: {},
        create: {
            id: 'immersiv-zoom-section',
            tenantId: tenant.id,
            pageId: immersivPage.id,
            name: 'Galerie Immersive',
            type: 'CUSTOM',
            order: 0,
            isActive: true,
            content: {
                blocks: [
                    {
                        id: 'immersiv-heading',
                        type: 'heading',
                        order: 0,
                        content: { text: 'Immersiv Project', level: 1 },
                        style: { fontSize: '4rem', gradient: true, gradientFrom: '#22d3ee', gradientTo: '#ec4899' },
                        animation: { type: 'fade-up', delay: 0 },
                    },
                    {
                        id: 'immersiv-text',
                        type: 'text',
                        order: 1,
                        content: { text: 'Une expérience visuelle unique avec effet de zoom infini.' },
                        style: { color: '#d1d5db', fontSize: '1.25rem' },
                        animation: { type: 'fade-up', delay: 0.2 },
                    },
                    {
                        id: 'immersiv-zoom',
                        type: 'infinite-zoom',
                        order: 2,
                        content: {
                            layers: [
                                { id: 'layer1', imageUrl: 'https://placehold.co/1920x1080/0a0a0f/22d3ee?text=Layer+1', title: 'Niveau 1' },
                                { id: 'layer2', imageUrl: 'https://placehold.co/1920x1080/1a1a2e/a855f7?text=Layer+2', title: 'Niveau 2' },
                                { id: 'layer3', imageUrl: 'https://placehold.co/1920x1080/2a2a3e/ec4899?text=Layer+3', title: 'Niveau 3' },
                                { id: 'layer4', imageUrl: 'https://placehold.co/1920x1080/3a3a4e/fbbf24?text=Layer+4', title: 'Niveau 4' },
                            ],
                        },
                        style: { variant: 'fullscreen', transitionDuration: 2, zoomIntensity: 1.5, showIndicators: true },
                    },
                ],
                layout: { type: 'single-column', alignment: 'center', gap: 'md' },
                sizing: { height: 'fullscreen', maxWidth: 'full', paddingX: 'none', paddingY: 'none' },
                design: {
                    background: { type: 'solid', color: '#0a0a0f' },
                },
            },
            design: {},
        },
    });

    console.log('✅ Immersiv Zoom section created:', immersivSection.name);

    // ============================================
    // SITE CONFIG (Branding)
    // ============================================
    await prisma.siteConfig.upsert({
        where: { tenantId: tenant.id },
        update: {},
        create: {
            tenantId: tenant.id,
            nomSite: 'Demo Site',
            initialesLogo: '', // No default MS logo
            theme: 'ELECTRIC',
            couleurBackground: '#0a0a0f',
            couleurText: '#ffffff',
        },
    });
    console.log('✅ SiteConfig seeded (Clean branding).');

    console.log('🎉 Seed complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
    });
