'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/shared/lib/db';

export async function createPage(name: string, slug: string, tenantId: string = 'demo-tenant') {
    try {
        const page = await prisma.page.create({
            data: {
                name,
                slug,
                tenantId,
                isPublished: true,
                order: 0, // Should find max order + 1 ideally
            },
        });
        revalidatePath('/admin');
        revalidatePath(`/${slug}`);
        return { success: true, page };
    } catch (error) {
        console.error('Failed to create page:', error);
        return { error: 'Failed to create page' };
    }
}

export async function deletePage(pageId: string) {
    try {
        await prisma.page.delete({
            where: { id: pageId },
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete page:', error);
        return { error: 'Failed to delete page' };
    }
}
