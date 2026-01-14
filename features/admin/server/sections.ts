'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/shared/lib/db';

export async function updateSection(sectionId: string, content: any) {
    if (!sectionId) return { error: 'Section ID required' };

    try {
        await prisma.section.update({
            where: { id: sectionId },
            data: { content },
        });

        revalidatePath('/admin');
        revalidatePath('/', 'layout'); // Revalidate everything to be safe

        return { success: true };
    } catch (error) {
        console.error('Failed to update section:', error);
        return { error: 'Failed to update section' };
    }
}

export async function createSection(pageId: string, type: string = 'CUSTOM', tenantId: string = 'demo-tenant') {
    try {
        // Get max order
        const lastSection = await prisma.section.findFirst({
            where: { pageId },
            orderBy: { order: 'desc' },
        });
        const order = (lastSection?.order ?? -1) + 1;

        const section = await prisma.section.create({
            data: {
                pageId,
                type: type as any,
                order,
                content: { blocks: [], layout: {}, sizing: {}, design: {} }, // Default empty config
                design: {},   // <--- Added top-level design
                tenantId,
                isActive: true,
            },
        });

        revalidatePath('/admin');
        revalidatePath('/', 'layout');
        return { success: true, section };
    } catch (error) {
        console.error('Failed to create section:', error);
        return { error: 'Failed to create section' };
    }
}

export async function deleteSection(sectionId: string) {
    try {
        await prisma.section.delete({
            where: { id: sectionId },
        });
        revalidatePath('/admin');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete section:', error);
        return { error: 'Failed to delete section' };
    }
}
