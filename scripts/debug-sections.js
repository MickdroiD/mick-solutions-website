
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listSections() {
    try {
        // Find the 'home' page first (or just list all if unsure)
        const page = await prisma.page.findFirst({
            where: { slug: 'home' } // Assuming 'home' is the slug based on screenshots 'Page: Home'
        });

        if (!page) {
            console.log("Page 'home' not found. Listing all pages:");
            const pages = await prisma.page.findMany();
            console.log(pages);
            return;
        }

        console.log(`Analyzing Sections for Page: ${page.name} (${page.id})`);

        const sections = await prisma.section.findMany({
            where: { pageId: page.id },
            orderBy: { order: 'asc' }
        });

        console.log(`Found ${sections.length} sections.`);

        sections.forEach(s => {
            console.log(`[${s.type}] ID: ${s.id} | Order: ${s.order} | Content: ${JSON.stringify(s.content).substring(0, 50)}...`);
        });

        // Also check for 'Global' sections if V5 uses them?
        // Based on code, we fetch sections by pageId.

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listSections();
