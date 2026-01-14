
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- DEBUG DB ---");

    // Check Tenant
    const tenant = await prisma.tenant.findUnique({
        where: { id: 'demo-tenant' }, // or slug? 
        // Wait, schema says ID is default(cuid()).
        // Does 'demo-tenant' ID exist?
    });
    console.log("Tenant (by ID 'demo-tenant'):", tenant);

    const tenantBySlug = await prisma.tenant.findUnique({
        where: { slug: 'demo-tenant' }
    });
    console.log("Tenant (by Slug 'demo-tenant'):", tenantBySlug);

    // List ALL Tenants
    const allTenants = await prisma.tenant.findMany();
    console.log("All Tenants:", allTenants);

    const tId = 'demo-tenant';
    console.log(`Checking Pages for TenantID: ${tId}`);
    const pages = await prisma.page.findMany({
        where: { tenantId: tId }
    });
    console.log("Pages for demo-tenant:", pages);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
