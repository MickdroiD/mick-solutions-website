// ============================================
// API GLOBAL SECTIONS - Factory V5
// Returns all HEADER and FOOTER sections for a tenant
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/shared/lib/db';
import { SectionType } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const tenantId = request.nextUrl.searchParams.get('tenantId') || 'demo-tenant';

        // Find all HEADER and FOOTER sections for this tenant (active only)
        const sections = await prisma.section.findMany({
            where: {
                tenantId,
                type: {
                    in: [SectionType.HEADER, SectionType.FOOTER]
                },
                isActive: true,
            },
            orderBy: {
                order: 'asc',
            },
        });

        return NextResponse.json(sections);
    } catch (error) {
        console.error('Failed to fetch global sections:', error);
        return NextResponse.json([], { status: 200 }); // Return empty array on error
    }
}
