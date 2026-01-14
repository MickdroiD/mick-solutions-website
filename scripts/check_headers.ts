
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking for HEADER sections ---');
    const headers = await prisma.section.findMany({
        where: {
            type: 'HEADER',
        },
        include: {
            tenant: true,
        }
    });

    if (headers.length === 0) {
        console.log('No HEADER sections found.');
    } else {
        console.log(`Found ${headers.length} HEADER sections:`);
        headers.forEach(h => {
            console.log(`- ID: ${h.id} (Tenant: ${h.tenant.name})`);
            console.log(`  Content: ${JSON.stringify(h.content).substring(0, 100)}...`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
