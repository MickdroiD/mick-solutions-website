'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/shared/lib/db';

export async function getLeads(tenantId: string) {
    if (!tenantId) return { error: 'Unauthorized' };

    try {
        const leads = await prisma.lead.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.lead.count({ where: { tenantId } });

        const stats = await prisma.lead.groupBy({
            by: ['status'],
            where: { tenantId },
            _count: true,
        });

        // Format stats object
        const statsMap: Record<string, number> = {};
        stats.forEach(s => {
            statsMap[s.status] = s._count;
        });

        return { success: true, leads, total, stats: statsMap };
    } catch (error) {
        console.error('Failed to fetch leads:', error);
        return { error: 'Failed to fetch leads' };
    }
}

export async function updateLeadStatus(id: string, status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST') {
    try {
        await prisma.lead.update({
            where: { id },
            data: { status },
        });
        revalidatePath('/admin/leads');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update status' };
    }
}

export async function updateLeadNotes(id: string, notes: string) {
    try {
        await prisma.lead.update({
            where: { id },
            data: { notes },
        });
        revalidatePath('/admin/leads');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update notes' };
    }
}

export async function deleteLead(id: string) {
    try {
        await prisma.lead.delete({
            where: { id },
        });
        revalidatePath('/admin/leads');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete lead' };
    }
}
