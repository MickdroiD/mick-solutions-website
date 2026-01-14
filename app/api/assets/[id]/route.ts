// ============================================
// ASSET DELETE API - Factory V5
// DELETE/GET /api/assets/[id]
// Secured with tenant validation via session
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import prisma from '@/shared/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper to get tenant from session
async function getTenantId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.tenantId || null;
}

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

        // Récupérer l'asset et vérifier appartenance tenant
        const asset = await prisma.asset.findFirst({
            where: { id, tenantId },
        });

        if (!asset) {
            return NextResponse.json(
                { error: 'Asset non trouvé' },
                { status: 404 }
            );
        }

        // Supprimer le fichier physique
        const filePath = path.join(UPLOAD_DIR, asset.tenantId, asset.filename);
        if (existsSync(filePath)) {
            await unlink(filePath);
        }

        // Supprimer l'entrée en base
        await prisma.asset.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur suppression asset:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}

// GET - Récupérer un asset spécifique
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

        const asset = await prisma.asset.findFirst({
            where: { id, tenantId },
        });

        if (!asset) {
            return NextResponse.json(
                { error: 'Asset non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json(asset);
    } catch (error) {
        console.error('Erreur récupération asset:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
}
