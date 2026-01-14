// ============================================
// PAGE DUPLICATION SERVICE - Factory V5
// ============================================

import prisma from '../../shared/lib/db';
import type { Prisma } from '@prisma/client';

export interface PageCreationFromSection {
    sourceSectionId: string;
    newPageSlug: string;
    newPageName: string;
    tenantId: string;
    inheritConfig: {
        design: boolean;
        effects: boolean;
        textSettings: boolean;
        content: boolean;
    };
}

/**
 * Crée une nouvelle page en dupliquant une section existante
 * avec héritage sélectif de la configuration
 */
export async function createPageFromSection(params: PageCreationFromSection) {
    const { sourceSectionId, newPageSlug, newPageName, tenantId, inheritConfig } = params;

    // Utilise une transaction Prisma pour garantir l'atomicité
    return await prisma.$transaction(async (tx) => {
        // 1. Récupérer la section source
        const sourceSection = await tx.section.findUnique({
            where: { id: sourceSectionId },
        });

        if (!sourceSection) {
            throw new Error(`Section source ${sourceSectionId} introuvable`);
        }

        // 2. Créer la nouvelle page
        const newPage = await tx.page.create({
            data: {
                tenantId,
                name: newPageName,
                slug: newPageSlug,
                seoTitle: newPageName,
                seoDescription: '',
                isPublished: true,
                order: 999,
            },
        });

        // 3. Deep clone de la configuration avec héritage sélectif
        const design = inheritConfig.design
            ? deepClone(sourceSection.design)
            : {};

        const effects = inheritConfig.effects && sourceSection.effects
            ? deepClone(sourceSection.effects)
            : undefined;

        const textSettings = inheritConfig.textSettings && sourceSection.textSettings
            ? deepClone(sourceSection.textSettings)
            : undefined;

        const content = inheritConfig.content
            ? deepClone(sourceSection.content)
            : { titre: '', sousTitre: '', ctaPrincipal: null };

        // 4. Créer la nouvelle section liée à la page
        const newSection = await tx.section.create({
            data: {
                tenantId,
                pageId: newPage.id,
                type: sourceSection.type,
                name: `Section ${newPageName}`,
                order: 0,
                isActive: true,
                content: content as Prisma.InputJsonValue,
                design: design as Prisma.InputJsonValue,
                effects,
                textSettings,
            },
        });

        return {
            page: newPage,
            section: newSection,
        };
    });
}

/**
 * Deep clone pour objets JSON (évite références partagées)
 */
function deepClone<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Duplique une page existante avec toutes ses sections
 */
export async function duplicatePage(sourcePageId: string, newSlug: string, newName: string, tenantId: string) {
    return await prisma.$transaction(async (tx) => {
        // 1. Récupérer la page source avec ses sections
        const sourcePage = await tx.page.findUnique({
            where: { id: sourcePageId },
            include: { sections: { orderBy: { order: 'asc' } } },
        });

        if (!sourcePage) {
            throw new Error(`Page source ${sourcePageId} introuvable`);
        }

        // 2. Créer la nouvelle page
        const newPage = await tx.page.create({
            data: {
                tenantId,
                name: newName,
                slug: newSlug,
                seoTitle: sourcePage.seoTitle || newName,
                seoDescription: sourcePage.seoDescription || '',
                isPublished: true,
                order: 999,
            },
        });

        // 3. Dupliquer toutes les sections
        const newSections = await Promise.all(
            sourcePage.sections.map((section) =>
                tx.section.create({
                    data: {
                        tenantId,
                        pageId: newPage.id,
                        type: section.type,
                        name: section.name,
                        order: section.order,
                        isActive: section.isActive,
                        content: deepClone(section.content) as Prisma.InputJsonValue,
                        design: deepClone(section.design) as Prisma.InputJsonValue,
                        effects: section.effects ? deepClone(section.effects) : undefined,
                        textSettings: section.textSettings ? deepClone(section.textSettings) : undefined,
                    },
                })
            )
        );

        return {
            page: newPage,
            sections: newSections,
        };
    });
}
