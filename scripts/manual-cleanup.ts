import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

const TO_DELETE = ['test-validation', 'demo'];

async function removeN8N(slug: string) {
    const containerName = `n8n-${slug}`;
    const volumeName = `n8n_data_${slug}`;
    try {
        console.log(`[${slug}] Removing n8n container ${containerName}...`);
        await execAsync(`docker rm -f ${containerName}`).catch(() => { });
        console.log(`[${slug}] Removing n8n volume ${volumeName}...`);
        await execAsync(`docker volume rm ${volumeName}`).catch(() => { });
    } catch (e: any) {
        console.error(`[${slug}] n8n cleanup error: ${e.message}`);
    }
}

async function run() {
    console.log("🚀 STARTING MANUAL CLEANUP...");

    for (const slug of TO_DELETE) {
        console.log(`\nProcessing: ${slug}`);
        const tenant = await prisma.tenant.findUnique({ where: { slug } });

        if (!tenant) {
            console.log(`[${slug}] Tenant not found in DB. Skipping DB delete.`);
            // Still try to clean n8n just in case
            await removeN8N(slug);
            continue;
        }

        // 1. Remove N8N
        await removeN8N(slug);

        // 2. Remove DB Record
        console.log(`[${slug}] Deleting from DB...`);
        await prisma.tenant.delete({ where: { id: tenant.id } });
        console.log(`[${slug}] ✔ Deleted successfully.`);
    }

    console.log("\n✅ Cleanup Complete");
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
