import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function initMaster() {
    const name = "Mick Solutions";
    const slug = "mick-solutions";
    const domain = "mick-solutions.ch";
    const email = "mick@mick-solutions.ch";

    // Hash for 'admin123' (Change this!) or random
    // For master, let's set a known initial pin or random
    const pin = "123456";
    const pinHash = createHash('sha256').update(pin).digest('hex');

    console.log(`Checking for Master Tenant: ${domain}...`);

    const existing = await prisma.tenant.findFirst({
        where: { OR: [{ slug }, { domain }] }
    });

    if (existing) {
        console.log(`✅ Master tenant already exists (ID: ${existing.id})`);
        return;
    }

    console.log(`Creating Master Tenant...`);

    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
        data: {
            name,
            slug,
            domain,
            status: 'ACTIVE',
            users: {
                create: {
                    email,
                    pinHash,
                    role: 'OWNER'
                }
            },
            config: {
                create: {
                    nomSite: name,
                    initialesLogo: "MS",
                    siteUrl: `https://${domain}`
                }
            }
        }
    });

    // 2. Page
    await prisma.page.create({
        data: {
            tenantId: tenant.id,
            name: "Accueil",
            slug: "home",
            isPublished: true,
            sections: {
                create: [
                    { tenantId: tenant.id, type: "HEADER", order: -1, content: {}, design: {} },
                    { tenantId: tenant.id, type: "HERO", order: 0, content: { title: "Architecture V5", subtitle: "Factory SaaS Master" }, design: { variant: "CENTERED" } },
                    { tenantId: tenant.id, type: "FOOTER", order: 999, content: {}, design: {} }
                ]
            }
        }
    });

    console.log(`✅ Master Tenant Created!`);
    console.log(`Login PIN: ${pin}`);
}

initMaster()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
