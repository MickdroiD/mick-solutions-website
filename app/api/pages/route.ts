// ============================================
// PAGES API - Factory V5
// CRUD pour les pages multi-tenants
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/shared/lib/db';

// GET - Liste des pages d'un tenant
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId requis' },
                { status: 400 }
            );
        }

        const pages = await prisma.page.findMany({
            where: { tenantId },
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { sections: true } },
                sections: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        isActive: true,
                        order: true,
                    },
                },
            },
        });

        return NextResponse.json(pages);
    } catch (error) {
        console.error('Erreur liste pages:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des pages' },
            { status: 500 }
        );
    }
}

// POST - Créer une nouvelle page
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tenantId, name, slug, seoTitle, seoDescription, isPublished = true } = body;

        // Validation
        if (!tenantId || !name || !slug) {
            return NextResponse.json(
                { error: 'tenantId, name et slug sont requis' },
                { status: 400 }
            );
        }

        // Vérifier unicité du slug pour ce tenant
        const existingPage = await prisma.page.findFirst({
            where: { tenantId, slug },
        });

        if (existingPage) {
            return NextResponse.json(
                { error: `Une page avec le slug "${slug}" existe déjà` },
                { status: 409 }
            );
        }

        // Calculer order
        const lastPage = await prisma.page.findFirst({
            where: { tenantId },
            orderBy: { order: 'desc' },
        });
        const order = (lastPage?.order ?? -1) + 1;

        // Créer la page
        const page = await prisma.page.create({
            data: {
                tenantId,
                name,
                slug,
                seoTitle: seoTitle || name,
                seoDescription: seoDescription || null,
                isPublished,
                order,
            },
        });

        return NextResponse.json(page, { status: 201 });
    } catch (error) {
        console.error('Erreur création page:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la page' },
            { status: 500 }
        );
    }
}
