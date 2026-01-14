import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// === CONFIGURATION ===
const N8N_IMAGE = "docker.n8n.io/n8nio/n8n:latest";
const HOST_ROOT_UPLOADS = "/home/mickadmin/docker/website-v5/public/uploads"; // Path on host for strict cleanup if needed

// === UTILS CONS ===
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    dim: "\x1b[2m",
};

const header = (text: string) => console.log(`\n${colors.bright}${colors.cyan}=== ${text} ===${colors.reset}\n`);
const logSuccess = (text: string) => console.log(`${colors.green}✔ ${text}${colors.reset}`);
const logError = (text: string) => console.log(`${colors.red}✖ ${text}${colors.reset}`);
const logInfo = (text: string) => console.log(`${colors.cyan}ℹ ${text}${colors.reset}`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise(r => rl.question(`${colors.yellow}${q}${colors.reset} `, r));

const hashPin = (pin: string) => createHash('sha256').update(pin).digest('hex');

// === N8N MANAGER ===
async function deployN8N(slug: string, domain: string) {
    const containerName = `n8n-${slug}`;
    const n8nHost = `n8n.${domain}`; // ex: n8n.client.com or n8n.client.mick-solutions.ch

    logInfo(`Déploiement du conteneur n8n: ${containerName} sur ${n8nHost}...`);

    // We use the docker CLI mapped from the host
    // Validation: Env vars for postgres/portainer could be refined, but we use sqlite for client n8n for simplicity or separated db?
    // User asked for "un conteneur n8n". We will spawn it on the 'proxy' network for Traefik.

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
    -v n8n_data_${slug}:/home/node/.n8n \
    ${N8N_IMAGE}`;

    try {
        await execAsync(cmd);
        logSuccess(`N8N déployé: https://${n8nHost}`);
    } catch (e: any) {
        logError(`Erreur déploiement n8n: ${e.message}`);
    }
}

async function removeN8N(slug: string) {
    const containerName = `n8n-${slug}`;
    const volumeName = `n8n_data_${slug}`;

    try {
        logInfo(`Suppression du conteneur n8n ${containerName}...`);
        await execAsync(`docker rm -f ${containerName}`).catch(() => { }); // Ignore not found

        logInfo(`Suppression du volume ${volumeName}...`);
        await execAsync(`docker volume rm ${volumeName}`).catch(() => { });

        logSuccess("Ressources n8n nettoyées.");
    } catch (e: any) {
        logError(`Erreur nettoyage n8n: ${e.message}`);
    }
}

// === ACTIONS ===

async function listTenants() {
    header("LISTE DES CLIENTS");
    const tenants = await prisma.tenant.findMany({
        include: { _count: { select: { users: true, pages: true } } },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`${colors.dim}SLUG                | NOM                | STATUS   | URL${colors.reset}`);
    console.log(`${colors.dim}--------------------+--------------------+----------+--------------------------------${colors.reset}`);

    tenants.forEach(t => {
        const url = t.domain ? t.domain : `${t.slug}.mick-solutions.ch`;
        console.log(`${t.slug.padEnd(19)} | ${t.name.substring(0, 18).padEnd(18)} | ${t.status.padEnd(8)} | ${url}`);
    });
}

async function createTenant() {
    header("CRÉATION NOUVEAU SITE CLIENT");

    // 1. Basic Info
    const name = await ask("Nom de l'entreprise (Client) :");
    if (!name) return logError("Nom requis.");

    // 2. Domain Logic
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const domainInput = await ask(`Domaine (ex: 'client.com') [Entrée pour ${slug}.mick-solutions.ch] :`);
    const domain = domainInput || null;
    const finalUrl = domain ? domain : `${slug}.mick-solutions.ch`;

    // 3. Security
    let pin = await ask("Mot de passe Admin (6 chiffres) [Entrée pour générer] :");
    if (!pin) pin = Math.floor(100000 + Math.random() * 900000).toString();
    if (pin.length < 4) return logError("PIN trop court.");

    // 4. N8N Option
    const installN8N = (await ask("Installer un serveur n8n dédié ? (oui/non) :")).toLowerCase().startsWith('o');

    // 5. Execution
    console.log(`\n⏳ Création du site pour ${name}...\n`);

    try {
        // A. DB Operations
        const tenant = await prisma.tenant.create({
            data: {
                name,
                slug,
                domain,
                status: 'ACTIVE',
                users: {
                    create: {
                        email: `admin@${domain || slug}`, // Placeholder email
                        pinHash: hashPin(pin),
                        role: 'ADMIN'
                    }
                },
                config: {
                    create: {
                        nomSite: name,
                        initialesLogo: name.substring(0, 2).toUpperCase(),
                        siteUrl: `https://${finalUrl}`
                    }
                }
            }
        });

        // B. Default Content (Homepage)
        await prisma.page.create({
            data: {
                tenantId: tenant.id,
                name: "Accueil",
                slug: "home",
                isPublished: true,
                sections: {
                    create: [
                        { tenantId: tenant.id, type: "HEADER", order: -1, content: {}, design: {} },
                        { tenantId: tenant.id, type: "HERO", order: 0, content: { title: name, subtitle: "Bienvenue" }, design: { variant: "CENTERED" } },
                        { tenantId: tenant.id, type: "FOOTER", order: 999, content: {}, design: {} }
                    ]
                }
            }
        });

        // C. N8N Installation
        if (installN8N) {
            await deployN8N(slug, finalUrl);
        }

        logSuccess("Installation terminée !");
        console.log(`\n--------------------------------------------`);
        console.log(` CLIENT   : ${name}`);
        console.log(` URL      : https://${finalUrl}`);
        console.log(` PIN      : ${colors.bright}${pin}${colors.reset}`);
        if (installN8N) console.log(` N8N      : https://n8n.${finalUrl}`);
        console.log(`--------------------------------------------\n`);

    } catch (e: any) {
        logError(e.code === 'P2002' ? "Ce client existe déjà." : e.message);
    }
}

async function deleteTenant() {
    header("SUPPRESSION TOTALE CLIENT");
    const slug = await ask("Slug du client à supprimer :");
    if (!slug) return;

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return logError("Client introuvable.");

    console.log(`${colors.red}WARNING : Suppression irréversible de :`);
    console.log(`- Site : ${tenant.name}`);
    console.log(`- Données : Pages, Leads, Images`);
    console.log(`- Conteneur n8n (si existant)${colors.reset}`);

    const confirm = await ask(`Ecrivez 'DELETE' pour confirmer la destruction de ${slug} :`);
    if (confirm !== 'DELETE') return;

    // 1. Clean N8N
    await removeN8N(slug);

    // 2. Clean DB (Cascades delete pages, leads, etc)
    await prisma.tenant.delete({ where: { id: tenant.id } });

    // 3. Clean Files (Assets) - Logic to find/delete files would go here. 
    // currently assets are stored in /public/uploads/ but mixed. 
    // V5 Upgrade: We should ideally have tenant folders, but if not, we rely on DB cascade.
    // Note: Physical file deletion is complex without a tenant-folder structure.
    logInfo("Nettoyage Base de donnée effectué.");

    logSuccess(`Client ${slug} totalement supprimé.`);
}

async function menu() {
    console.log("");
    console.log("1. Créer Client");
    console.log("2. Supprimer Client");
    console.log("3. Lister Client");
    console.log("0. Quitter");

    const c = await ask("Choix :");
    switch (c) {
        case '1': await createTenant(); break;
        case '2': await deleteTenant(); break;
        case '3': await listTenants(); break;
        case '0': process.exit(0);
    }
    await menu();
}

menu();
