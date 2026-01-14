// ============================================
// PAGES [ID] API - Factory V5
// PATCH/DELETE/GET pour pages individuelles
// Secured with tenant validation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/shared/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

// Helper to get tenant from session
async function getTenantId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.tenantId || null;
}

// GET - Récupérer une page par ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tenantId = await getTenantId();

        if (!tenantId) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const page = await prisma.page.findFirst({
            where: { id, tenantId },
            include: {
                sections: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!page) {
            return NextResponse.json(
                { error: 'Page non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json(page);
    } catch (error) {
        console.error('Erreur get page:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
}

// PATCH - Mettre à jour une page
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, slug, seoTitle, seoDescription, isPublished, order } = body;
        const tenantId = await getTenantId();

        if (!tenantId) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que la page existe ET appartient au tenant
        const existingPage = await prisma.page.findFirst({
            where: { id, tenantId },
        });

        if (!existingPage) {
            return NextResponse.json(
                { error: 'Page non trouvée' },
                { status: 404 }
            );
        }

        // Si slug change, vérifier unicité
        if (slug && slug !== existingPage.slug) {
            const slugConflict = await prisma.page.findFirst({
                where: {
                    tenantId,
                    slug,
                    id: { not: id },
                },
            });

            if (slugConflict) {
                return NextResponse.json(
                    { error: `Le slug "${slug}" est déjà utilisé` },
                    { status: 409 }
                );
            }
        }

        // Mettre à jour
        const updatedPage = await prisma.page.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(seoTitle !== undefined && { seoTitle }),
                ...(seoDescription !== undefined && { seoDescription }),
                ...(isPublished !== undefined && { isPublished }),
                ...(order !== undefined && { order }),
            },
        });

        return NextResponse.json(updatedPage);
    } catch (error) {
        console.error('Erreur update page:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer une page
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tenantId = await getTenantId();

        if (!tenantId) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que la page existe ET appartient au tenant
        const page = await prisma.page.findFirst({
            where: { id, tenantId },
            include: { sections: true },
        });

        if (!page) {
            return NextResponse.json(
                { error: 'Page non trouvée' },
                { status: 404 }
            );
        }

        // Supprimer d'abord les sections liées
        if (page.sections.length > 0) {
            await prisma.section.deleteMany({
                where: { pageId: id },
            });
        }

        // Supprimer la page
        await prisma.page.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur delete page:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}
