// ============================================
// LEADS API - Factory V5
// GET/POST /api/leads
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/shared/lib/db';

// GET - Récupérer les leads d'un tenant
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const status = searchParams.get('status');
        const source = searchParams.get('source');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!tenantId) {
            return NextResponse.json({ error: 'tenantId requis' }, { status: 400 });
        }

        // Construire le filtre
        const where: any = { tenantId };
        if (status) where.status = status;
        if (source) where.source = source;

        // Récupérer les leads avec pagination
        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.lead.count({ where }),
        ]);

        // Stats rapides
        const stats = await prisma.lead.groupBy({
            by: ['status'],
            where: { tenantId },
            _count: true,
        });

        return NextResponse.json({
            leads,
            total,
            limit,
            offset,
            stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
        });
    } catch (error) {
        console.error('Erreur GET leads:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Créer un nouveau lead (depuis formulaire)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tenantId, name, email, phone, message, source } = body;

        if (!tenantId || !email) {
            return NextResponse.json(
                { error: 'tenantId et email requis' },
                { status: 400 }
            );
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email invalide' },
                { status: 400 }
            );
        }

        const lead = await prisma.lead.create({
            data: {
                tenantId,
                name: name || null,
                email,
                phone: phone || null,
                message: message || null,
                source: source || 'contact-form',
                status: 'NEW',
            },
        });

        return NextResponse.json({
            success: true,
            lead: {
                id: lead.id,
                email: lead.email,
                name: lead.name,
                createdAt: lead.createdAt,
            },
        });
    } catch (error) {
        console.error('Erreur POST lead:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
