
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING AUDIT ---');

    // 1. Check for HEADER sections (potential source of "MS" logo)
    const headerSections = await prisma.section.findMany({
        where: { type: { in: ['HEADER'] } }, // Checking HEADER specifically
    });

    console.log(`Found ${headerSections.length} HEADER sections.`);

    if (headerSections.length > 0) {
        console.log('Deleting HEADER sections (Ghost artifacts)...');
        const { count } = await prisma.section.deleteMany({
            where: { type: { in: ['HEADER'] } },
        });
        console.log(`Deleted ${count} headers.`);
    }

    // 2. Check SiteConfig for "MS" defaults
    const configs = await prisma.siteConfig.findMany();
    console.log(`Found ${configs.length} SiteConfig records.`);

    for (const config of configs) {
        let updates: any = {};
        if (config.initialesLogo === 'MS') {
            updates.initialesLogo = ''; // Clear it
        }
        if (config.headerLogoSvgCode?.includes('MS')) {
            updates.headerLogoSvgCode = null;
        }

        // Also check for null/undefined headerLogoUrl if that's an issue, but usually it's fine.

        if (Object.keys(updates).length > 0) {
            console.log(`Updating SiteConfig for tenant ${config.tenantId}:`, updates);
            await prisma.siteConfig.update({
                where: { id: config.id },
                data: updates,
            });
        } else {
            console.log(`SiteConfig for tenant ${config.tenantId} looks clean.`);
        }
    }

    console.log('--- AUDIT COMPLETE ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
