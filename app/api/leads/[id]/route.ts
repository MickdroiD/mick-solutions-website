// ============================================
// LEAD DETAIL API - Factory V5
// GET/PATCH/DELETE /api/leads/[id]
// Secured with tenant validation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/shared/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Helper to get tenant from session
async function getTenantId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.tenantId || null;
}

// GET - Détail d'un lead
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const tenantId = await getTenantId();

        if (!tenantId) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const lead = await prisma.lead.findFirst({
            where: { id, tenantId },
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 });
        }

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Erreur GET lead:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// PATCH - Modifier un lead (status, notes)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const tenantId = await getTenantId();

        if (!tenantId) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier que le lead existe ET appartient au tenant
        const existing = await prisma.lead.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 });
        }

        // Préparer les données de mise à jour
        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.name !== undefined) updateData.name = body.name;
        if (body.phone !== undefined) updateData.phone = body.phone;

        // Marquer la date de conversion si statut CONVERTED
        if (body.status === 'CONVERTED' && existing.status !== 'CONVERTED') {
            updateData.convertedAt = new Date();
        }

        const updated = await prisma.lead.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erreur PATCH lead:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Supprimer un lead
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const tenantId = await getTenantId();

        if (!tenantId) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier que le lead appartient au tenant
        const existing = await prisma.lead.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 });
        }

        await prisma.lead.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur DELETE lead:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
