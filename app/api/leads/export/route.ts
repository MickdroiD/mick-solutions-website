// ============================================
// LEADS EXPORT API - Factory V5
// GET /api/leads/export - Export CSV
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/shared/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'tenantId requis' }, { status: 400 });
        }

        // Récupérer tous les leads
        const leads = await prisma.lead.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });

        // Générer le CSV
        const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Message', 'Source', 'Status', 'Notes', 'Créé le', 'Converti le'];
        const rows = leads.map((lead) => [
            lead.id,
            lead.name || '',
            lead.email,
            lead.phone || '',
            (lead.message || '').replace(/"/g, '""').replace(/\n/g, ' '),
            lead.source || '',
            lead.status,
            (lead.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
            lead.createdAt.toISOString(),
            lead.convertedAt?.toISOString() || '',
        ]);

        // Construire le CSV avec échappement
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        // Retourner comme fichier téléchargeable
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="leads-${tenantId}-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Erreur export leads:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
