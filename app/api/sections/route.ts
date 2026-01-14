// ============================================
// SECTIONS API - Factory V5
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../shared/lib/db';
import type { CreateSectionRequest } from '../types';

// GET /api/sections?tenantId=xxx&pageId=xxx (optional)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const tenantId = searchParams.get('tenantId');
        const pageId = searchParams.get('pageId');

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId is required' },
                { status: 400 }
            );
        }

        // Build where clause with optional pageId filter
        // Build where clause: Page Sections OR Global Sections (Header/Footer)
        const where: any = {
            tenantId,
            OR: [
                { pageId: pageId },
                { pageId: null, type: { in: ['HEADER', 'FOOTER'] } }
            ]
        };

        const sections = await prisma.section.findMany({
            where,
            orderBy: { order: 'asc' },
        });

        return NextResponse.json(sections);
    } catch (error) {
        console.error('GET /api/sections error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sections' },
            { status: 500 }
        );
    }
}

// POST /api/sections
export async function POST(request: NextRequest) {
    try {
        const body: CreateSectionRequest = await request.json();

        // Basic validation
        if (!body.tenantId || !body.type) {
            return NextResponse.json(
                { error: 'tenantId and type are required' },
                { status: 400 }
            );
        }

        const section = await prisma.section.create({
            data: {
                tenantId: body.tenantId,
                pageId: body.pageId || null,
                type: body.type,
                name: body.name || null,
                order: body.order || 0,
                isActive: body.isActive ?? true,
                content: body.content || {},
                design: body.design || {},
                effects: body.effects || undefined,
                textSettings: body.textSettings || undefined,
            },
        });

        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        console.error('POST /api/sections error:', error);
        return NextResponse.json(
            { error: 'Failed to create section' },
            { status: 500 }
        );
    }
}
