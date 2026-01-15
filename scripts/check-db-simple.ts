
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DB CHECK ---');
    const tenants = await prisma.tenant.findMany();
    console.log('Tenants in DB:', tenants.map(t => ({ id: t.id, slug: t.slug, domain: t.domain })));

    const sarah = tenants.find(t => t.slug === 'portfolio-sarah');
    if (sarah) {
        console.log('FOUND sarah tenant:', sarah.id);
        const pages = await prisma.page.findMany({ where: { tenantId: sarah.id } });
        console.log('Sarah Pages:', pages.map(p => ({ slug: p.slug, published: p.isPublished })));
    } else {
        console.log('MISSING sarah tenant');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
