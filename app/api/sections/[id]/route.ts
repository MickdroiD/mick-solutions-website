// ============================================
// SECTION BY ID API - Factory V5
// Secured with tenant validation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import prisma from '../../../../shared/lib/db';
import type { UpdateSectionRequest } from '../../types';
import { authOptions } from '../../auth/[...nextauth]/route';

// Helper to get tenant from session with debug logging
async function getTenantId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    console.log('getTenantId - session:', JSON.stringify(session, null, 2));

    // Log cookies for debugging
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('getTenantId - cookies:', allCookies.map(c => c.name).join(', '));

    return (session?.user as any)?.tenantId || null;
}

// GET /api/sections/[id]
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

        const section = await prisma.section.findFirst({
            where: { id, tenantId },
        });

        if (!section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('GET /api/sections/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch section' },
            { status: 500 }
        );
    }
}

// PATCH /api/sections/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body: UpdateSectionRequest = await request.json();
        const { id } = await params;
        const tenantId = await getTenantId();

        console.log('PATCH /api/sections/[id] - tenantId:', tenantId, 'sectionId:', id);

        if (!tenantId) {
            console.log('PATCH /api/sections/[id] - NO TENANT ID - returning 401');
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Verify section belongs to tenant
        const existing = await prisma.section.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // Build update data object
        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.order !== undefined) updateData.order = body.order;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.content !== undefined) updateData.content = body.content;
        if (body.design !== undefined) updateData.design = body.design;
        if (body.effects !== undefined) updateData.effects = body.effects;
        if (body.textSettings !== undefined) updateData.textSettings = body.textSettings;

        const section = await prisma.section.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error('PATCH /api/sections/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to update section' },
            { status: 500 }
        );
    }
}

// DELETE /api/sections/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('DELETE /api/sections/[id] - Starting delete for id:', id);

        const tenantId = await getTenantId();

        if (!tenantId) {
            console.log('DELETE - No tenantId, returning 401');
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Verify section belongs to tenant
        const existing = await prisma.section.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            console.log('DELETE - Section not found for id:', id, 'tenant:', tenantId);
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        console.log('DELETE - Deleting section:', id);
        await prisma.section.delete({
            where: { id },
        });
        console.log('DELETE - Section deleted successfully:', id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/sections/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to delete section' },
            { status: 500 }
        );
    }
}
