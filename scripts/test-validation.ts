import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

const CLIENT_NAME = "Test Validation Corp";
const CLIENT_SLUG = "test-validation";
const CLIENT_DOMAIN = "test-validation.mick-solutions.ch";
// A simple PIN for testing
const PIN = "000000";
const PIN_HASH = createHash('sha256').update(PIN).digest('hex');
const N8N_IMAGE = "docker.n8n.io/n8nio/n8n:latest";

async function cleanup() {
    console.log("🧹 Cleaning up previous test artifacts...");
    try {
        await prisma.tenant.delete({ where: { slug: CLIENT_SLUG } });
        console.log("✔ DB Tenant deleted");
    } catch (e) { }

    try {
        await execAsync(`docker rm -f n8n-${CLIENT_SLUG}`);
        console.log("✔ n8n container removed");
    } catch (e) { }

    try {
        await execAsync(`docker volume rm n8n_data_${CLIENT_SLUG}`);
        console.log("✔ n8n volume removed");
    } catch (e) { }
}

async function runTest() {
    console.log("🚀 STARTING AUTOMATED VALIDATION...");

    // 1. Clean start
    await cleanup();

    // 2. Create Tenant (Simulating tenant-manager.ts)
    console.log(`\n📝 Creating Client: ${CLIENT_NAME}...`);

    const tenant = await prisma.tenant.create({
        data: {
            name: CLIENT_NAME,
            slug: CLIENT_SLUG,
            domain: null, // Subdomain mode
            status: 'ACTIVE',
            users: {
                create: {
                    email: "test@validation.local",
                    pinHash: PIN_HASH,
                    role: 'ADMIN'
                }
            },
            config: {
                create: {
                    nomSite: CLIENT_NAME,
                    initialesLogo: "TV",
                    siteUrl: `https://${CLIENT_DOMAIN}`
                }
            }
        }
    });

    // 3. Create Home Page
    await prisma.page.create({
        data: {
            tenantId: tenant.id,
            name: "Accueil",
            slug: "home",
            isPublished: true,
            sections: {
                create: [
                    { tenantId: tenant.id, type: "HEADER", order: -1, content: {}, design: {} },
                    { tenantId: tenant.id, type: "HERO", order: 0, content: { title: "Test Success", subtitle: "Automated Validation" }, design: { variant: "ELECTRIC" } },
                    { tenantId: tenant.id, type: "FOOTER", order: 999, content: {}, design: {} }
                ]
            }
        }
    });
    console.log("✔ Database Records Created");

    // 4. Deploy n8n (Simulating tenant-manager.ts logic)
    const n8nHost = `n8n.${CLIENT_DOMAIN}`;
    const containerName = `n8n-${CLIENT_SLUG}`;
    console.log(`\n🐳 Spawning n8n Container: ${containerName}...`);

    const cmd = `docker run -d \
    --name ${containerName} \
    --restart unless-stopped \
    --network proxy \
    -e N8N_HOST=${n8nHost} \
    -e N8N_PORT=5678 \
    -e N8N_PROTOCOL=https \
    -e WEBHOOK_URL=https://${n8nHost}/ \
    -l "traefik.enable=true" \
    -l "traefik.http.routers.${containerName}.rule=Host(\`${n8nHost}\`)" \
    -l "traefik.http.routers.${containerName}.entrypoints=websecure" \
    -l "traefik.http.routers.${containerName}.tls.certresolver=myresolver" \
    -v n8n_data_${CLIENT_SLUG}:/home/node/.n8n \
    ${N8N_IMAGE}`;

    await execAsync(cmd);
    console.log("✔ Docker Container Spawned");

    // 5. Verification
    console.log("\n🔍 VERIFYING...");

    // Check DB
    const checkTenant = await prisma.tenant.findUnique({ where: { slug: CLIENT_SLUG } });
    if (!checkTenant) throw new Error("Tenant lookup failed");
    console.log("✔ Tenant exists in DB");

    // Check Docker
    const { stdout } = await execAsync(`docker ps --filter "name=${containerName}" --format "{{.Status}}"`);
    if (!stdout.includes("Up")) throw new Error("n8n Container is not running");
    console.log("✔ n8n Container is Up & Running");

    console.log(`\n✅ VALIDATION SUCCESSFUL!`);
    console.log(`Client: https://${CLIENT_DOMAIN}`);
    console.log(`n8n:    https://${n8nHost}`);
    console.log(`PIN:    ${PIN}`);
}

runTest()
    .catch(e => {
        console.error("\n❌ TEST FAILED:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
