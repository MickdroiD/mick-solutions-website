// ============================================
// DYNAMIC PAGE [SLUG] - Factory V5
// Rendu des pages multi-tenant par slug
// ============================================

import { notFound } from 'next/navigation';
import prisma from '@/shared/lib/db';
import SectionRenderer from '@/features/sections/SectionRenderer';
import { Header, Footer } from '@/shared/components/Layout';
import type { PrismaSection } from '@/features/sections/types';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

import { getTenantId } from '@/shared/lib/tenant';
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const tenantId = await getTenantId();

    const page = await prisma.page.findFirst({
        where: {
            tenantId,
            slug,
            isPublished: true,
        },
    });

    if (!page) {
        return {
            title: 'Page non trouvée',
        };
    }

    return {
        title: page.seoTitle || page.name,
        description: page.seoDescription || undefined,
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params;
    const tenantId = await getTenantId();

    // Récupérer la config du site pour les couleurs branding
    const siteConfig = await prisma.siteConfig.findUnique({
        where: { tenantId },
    });
    const bgColor = siteConfig?.couleurBackground || '#0a0a0f';
    const textColor = siteConfig?.couleurText || '#ffffff';

    // Récupérer la page avec ses sections
    const page = await prisma.page.findFirst({
        where: {
            tenantId,
            slug,
            isPublished: true,
        },
        include: {
            sections: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    // 404 si page non trouvée
    if (!page) {
        notFound();
    }

    return (
        <main style={{ minHeight: '100vh', background: bgColor, color: textColor }}>
            {/* Header */}
            <Header tenantId={tenantId} />

            {/* Sections dynamiques */}
            {page.sections.length > 0 ? (
                page.sections.map((section) => (
                    <SectionRenderer
                        key={section.id}
                        section={section as unknown as PrismaSection}
                    />
                ))
            ) : (
                <section style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                }}>
                    <p>Cette page n&apos;a pas encore de contenu.</p>
                </section>
            )}

            {/* Footer */}
            <Footer tenantId={tenantId} />
        </main>
    );
}

// Force dynamic rendering (pas de génération statique au build)
export const dynamic = 'force-dynamic';
