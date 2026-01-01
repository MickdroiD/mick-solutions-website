#!/usr/bin/env npx tsx
/**
 * ============================================
 * FACTORY V2 - CLIENT PROVISIONING SCRIPT
 * ============================================
 * 
 * Script de création de nouveaux clients.
 * Duplique la base de données template FACTORY_V2 pour chaque nouveau client.
 * 
 * Usage:
 *   npm run client:new "Nom du Client"
 *   npx tsx scripts/create-client.ts "Boulangerie Patate"
 * 
 * Variables d'environnement:
 *   BASEROW_EMAIL, BASEROW_PASSWORD - Credentials admin Baserow
 *   BASEROW_TEMPLATE_DB_ID - (Optionnel) ID de la database template
 * 
 * @author White Label Factory
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ============================================
// CONFIGURATION
// ============================================

const BASEROW_URL = 'https://baserow.mick-solutions.ch';
const TEMPLATE_DATABASE_NAME = 'FACTORY_V2';

// ============================================
// LOAD ENV
// ============================================

function loadEnv(): void {
  const envPaths = ['.env.local', '.env'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      break;
    }
  }
}

loadEnv();

// ============================================
// COLORS & LOGGING
// ============================================

const Colors = {
  GREEN: '\x1b[92m',
  YELLOW: '\x1b[93m',
  RED: '\x1b[91m',
  CYAN: '\x1b[96m',
  MAGENTA: '\x1b[95m',
  BLUE: '\x1b[94m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
};

const log = {
  success: (msg: string) => console.log(`${Colors.GREEN}✅ ${msg}${Colors.RESET}`),
  warning: (msg: string) => console.log(`${Colors.YELLOW}⚠️  ${msg}${Colors.RESET}`),
  error: (msg: string) => console.log(`${Colors.RED}❌ ${msg}${Colors.RESET}`),
  info: (msg: string) => console.log(`${Colors.CYAN}ℹ️  ${msg}${Colors.RESET}`),
  step: (msg: string) => console.log(`${Colors.MAGENTA}➤ ${msg}${Colors.RESET}`),
  category: (msg: string) => console.log(`\n${Colors.CYAN}${Colors.BOLD}═══ ${msg} ═══${Colors.RESET}`),
  dim: (msg: string) => console.log(`${Colors.DIM}   ${msg}${Colors.RESET}`),
  box: (lines: string[]) => {
    const maxLen = Math.max(...lines.map(l => l.length));
    console.log(`${Colors.GREEN}┌${'─'.repeat(maxLen + 2)}┐${Colors.RESET}`);
    lines.forEach(line => {
      console.log(`${Colors.GREEN}│${Colors.RESET} ${line.padEnd(maxLen)} ${Colors.GREEN}│${Colors.RESET}`);
    });
    console.log(`${Colors.GREEN}└${'─'.repeat(maxLen + 2)}┘${Colors.RESET}`);
  },
};

// ============================================
// TYPES
// ============================================

interface BaserowWorkspace {
  id: number;
  name: string;
}

interface BaserowDatabase {
  id: number;
  name: string;
  order: number;
  workspace?: { id: number; name: string };
  group?: { id: number; name: string };
  tables: BaserowTable[];
  type?: string;
}

interface BaserowTable {
  id: number;
  name: string;
  order: number;
  database_id: number;
}

interface DuplicateResponse {
  original_application: BaserowDatabase;
  duplicated_application: BaserowDatabase;
}

// ============================================
// API CLIENT
// ============================================

class BaserowClient {
  private baseUrl: string;
  private jwtToken: string = '';
  private email: string;
  private password: string;

  constructor(baseUrl: string, email: string, password: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.password = password;
  }

  async authenticate(): Promise<boolean> {
    log.step(`Authentification avec ${this.email}...`);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/user/token-auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error(`Erreur d'authentification: ${errorText}`);
        return false;
      }

      const data = await response.json();
      this.jwtToken = data.access_token || data.token;
      log.success('Authentification réussie!');
      return true;
    } catch (err) {
      log.error(`Erreur d'authentification: ${err}`);
      return false;
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `JWT ${this.jwtToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // ========== WORKSPACE / GROUP ==========

  async listWorkspaces(): Promise<BaserowWorkspace[]> {
    return this.request<BaserowWorkspace[]>('GET', '/api/workspaces/');
  }

  // ========== DATABASE ==========

  async listDatabases(workspaceId: number): Promise<BaserowDatabase[]> {
    const result = await this.request<{ applications: BaserowDatabase[] }>(
      'GET',
      `/api/applications/workspace/${workspaceId}/`
    );
    return result.applications?.filter((app) => app.type === 'database') || [];
  }

  async getDatabase(databaseId: number): Promise<BaserowDatabase> {
    return this.request<BaserowDatabase>('GET', `/api/applications/${databaseId}/`);
  }

  async duplicateDatabase(databaseId: number, newName: string): Promise<DuplicateResponse> {
    return this.request<DuplicateResponse>(
      'POST',
      `/api/applications/${databaseId}/duplicate/async/`,
      { name: newName }
    );
  }

  async getDuplicateJob(jobId: number): Promise<{
    id: number;
    state: string;
    progress_percentage: number;
    duplicated_application?: BaserowDatabase;
  }> {
    return this.request('GET', `/api/jobs/${jobId}/`);
  }

  // ========== SYNC DUPLICATE (polling) ==========

  async duplicateDatabaseSync(
    databaseId: number,
    newName: string,
    maxWaitMs: number = 60000
  ): Promise<BaserowDatabase> {
    log.step(`Duplication de la base de données...`);

    // Lancer la duplication asynchrone
    const dupResponse = await this.duplicateDatabase(databaseId, newName);
    
    // Si la réponse contient déjà la DB dupliquée (API sync)
    if (dupResponse.duplicated_application) {
      return dupResponse.duplicated_application;
    }

    // Sinon, polling sur le job (API async)
    const jobId = (dupResponse as unknown as { id: number }).id;
    if (!jobId) {
      throw new Error('Impossible de récupérer le job ID de duplication');
    }

    const startTime = Date.now();
    let lastProgress = 0;

    while (Date.now() - startTime < maxWaitMs) {
      await sleep(1000);
      
      try {
        const job = await this.getDuplicateJob(jobId);
        
        if (job.progress_percentage !== lastProgress) {
          process.stdout.write(`\r   ⏳ Progression: ${job.progress_percentage}%`);
          lastProgress = job.progress_percentage;
        }

        if (job.state === 'finished' && job.duplicated_application) {
          console.log(''); // Nouvelle ligne après la progression
          return job.duplicated_application;
        }

        if (job.state === 'failed') {
          throw new Error('Le job de duplication a échoué');
        }
      } catch (err) {
        // Ignorer les erreurs de polling temporaires
      }
    }

    throw new Error(`Timeout: la duplication n'a pas terminé en ${maxWaitMs / 1000}s`);
  }

  // ========== TABLE ==========

  async listTables(databaseId: number): Promise<BaserowTable[]> {
    const db = await this.getDatabase(databaseId);
    return db.tables || [];
  }

  // ========== ROWS ==========

  async updateRow(
    tableId: number,
    rowId: number,
    data: Record<string, unknown>
  ): Promise<void> {
    await this.request(
      'PATCH',
      `/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`,
      data
    );
  }

  async listRows(tableId: number): Promise<{ results: Array<Record<string, unknown> & { id: number }> }> {
    return this.request(
      'GET',
      `/api/database/rows/table/${tableId}/?user_field_names=true`
    );
  }
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Génère un PIN aléatoire à 6 chiffres
 */
function generateRandomPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function confirm(question: string): Promise<boolean> {
  const answer = await prompt(`${question} (o/N): `);
  return answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// ============================================
// MAIN SCRIPT
// ============================================

async function createClient(): Promise<void> {
  console.log(`
${Colors.CYAN}${Colors.BOLD}
╔══════════════════════════════════════════════════════════╗
║     🏭 FACTORY V2 - CLIENT PROVISIONING                  ║
║     Create a new client from template                    ║
╚══════════════════════════════════════════════════════════╝
${Colors.RESET}`);

  // ========== 1. GET CLIENT NAME ==========
  log.category('1. NOM DU CLIENT');

  let clientName = process.argv[2];

  if (!clientName) {
    clientName = await prompt('📝 Nom du client: ');
  }

  if (!clientName || clientName.trim().length < 2) {
    log.error('Le nom du client doit contenir au moins 2 caractères.');
    process.exit(1);
  }

  clientName = clientName.trim();
  const databaseName = `CLIENT - ${clientName}`;
  const clientSlug = slugify(clientName);

  log.success(`Client: "${clientName}"`);
  log.dim(`Database: ${databaseName}`);
  log.dim(`Slug: ${clientSlug}`);

  // ========== 2. GET CREDENTIALS ==========
  log.category('2. AUTHENTIFICATION');

  let email = process.env.BASEROW_EMAIL || '';
  let password = process.env.BASEROW_PASSWORD || '';

  if (!email) {
    email = await prompt('📧 Email Baserow: ');
  }
  if (!password) {
    password = await prompt('🔑 Password Baserow: ');
  }

  if (!email || !password) {
    log.error('Email et password requis!');
    process.exit(1);
  }

  const client = new BaserowClient(BASEROW_URL, email, password);

  const authSuccess = await client.authenticate();
  if (!authSuccess) {
    log.error('Échec de l\'authentification. Vérifiez vos credentials.');
    process.exit(1);
  }

  // ========== 3. FIND TEMPLATE DATABASE ==========
  log.category('3. TEMPLATE DATABASE');

  // Récupérer les workspaces
  let workspaces: BaserowWorkspace[];
  try {
    workspaces = await client.listWorkspaces();
    log.success(`${workspaces.length} workspace(s) trouvé(s)`);
  } catch (err) {
    log.error(`Impossible de lister les workspaces: ${err}`);
    process.exit(1);
  }

  if (workspaces.length === 0) {
    log.error('Aucun workspace trouvé.');
    process.exit(1);
  }

  // Chercher la database template
  let templateDb: BaserowDatabase | null = null;
  let workspaceId: number | null = null;
  const templateDbId = process.env.BASEROW_TEMPLATE_DB_ID
    ? parseInt(process.env.BASEROW_TEMPLATE_DB_ID, 10)
    : null;

  if (templateDbId) {
    // ID fourni via env
    log.step(`Recherche de la database template (ID: ${templateDbId})...`);
    try {
      templateDb = await client.getDatabase(templateDbId);
      workspaceId = templateDb.workspace?.id || templateDb.group?.id || null;
      log.success(`Template trouvé: "${templateDb.name}"`);
    } catch (err) {
      log.error(`Template non trouvé avec ID ${templateDbId}: ${err}`);
      process.exit(1);
    }
  } else {
    // Rechercher par nom
    log.step(`Recherche de la database "${TEMPLATE_DATABASE_NAME}"...`);
    
    for (const ws of workspaces) {
      try {
        const databases = await client.listDatabases(ws.id);
        const found = databases.find(db => db.name === TEMPLATE_DATABASE_NAME);
        if (found) {
          templateDb = found;
          workspaceId = ws.id;
          break;
        }
      } catch {
        // Ignorer les erreurs de workspace
      }
    }

    if (!templateDb || !workspaceId) {
      log.error(`Database template "${TEMPLATE_DATABASE_NAME}" non trouvée.`);
      log.info('Conseil: Définissez BASEROW_TEMPLATE_DB_ID dans votre .env');
      process.exit(1);
    }

    log.success(`Template trouvé: "${templateDb.name}" (ID: ${templateDb.id})`);
  }

  // Vérifier les tables du template
  log.step('Vérification des tables du template...');
  let templateTables: BaserowTable[];
  try {
    templateTables = await client.listTables(templateDb.id);
    log.success(`${templateTables.length} table(s) dans le template:`);
    templateTables.forEach(t => log.dim(`- ${t.name} (ID: ${t.id})`));
  } catch (err) {
    log.error(`Erreur lecture tables: ${err}`);
    process.exit(1);
  }

  const hasConfigGlobal = templateTables.some(t => t.name === 'CONFIG_GLOBAL');
  const hasSections = templateTables.some(t => t.name === 'SECTIONS');

  if (!hasConfigGlobal || !hasSections) {
    log.error('Le template doit contenir les tables CONFIG_GLOBAL et SECTIONS.');
    process.exit(1);
  }

  // ========== 4. CHECK IF CLIENT EXISTS ==========
  log.category('4. VÉRIFICATION');

  log.step('Vérification si le client existe déjà...');
  
  const existingDatabases = await client.listDatabases(workspaceId!);
  const existingClient = existingDatabases.find(db => db.name === databaseName);

  if (existingClient) {
    log.warning(`Un client avec ce nom existe déjà (ID: ${existingClient.id})`);
    const proceed = await confirm('Voulez-vous continuer et créer un doublon?');
    if (!proceed) {
      log.info('Opération annulée.');
      process.exit(0);
    }
  } else {
    log.success('Aucun client existant avec ce nom.');
  }

  // ========== 5. DUPLICATE DATABASE ==========
  log.category('5. DUPLICATION');

  let newDatabase: BaserowDatabase;
  try {
    newDatabase = await client.duplicateDatabaseSync(templateDb.id, databaseName);
    log.success(`Base de données dupliquée avec succès!`);
    log.dim(`Nouvelle database ID: ${newDatabase.id}`);
  } catch (err) {
    log.error(`Erreur lors de la duplication: ${err}`);
    process.exit(1);
  }

  // ========== 6. EXTRACT TABLE IDs ==========
  log.category('6. EXTRACTION DES IDs');

  let newTables: BaserowTable[];
  try {
    // Attendre un peu pour que Baserow finisse la création
    await sleep(2000);
    newTables = await client.listTables(newDatabase.id);
    log.success(`${newTables.length} table(s) créée(s):`);
    newTables.forEach(t => log.dim(`- ${t.name} (ID: ${t.id})`));
  } catch (err) {
    log.error(`Erreur lecture nouvelles tables: ${err}`);
    process.exit(1);
  }

  const configGlobalTable = newTables.find(t => t.name === 'CONFIG_GLOBAL');
  const sectionsTable = newTables.find(t => t.name === 'SECTIONS');
  const leadsTable = newTables.find(t => t.name === 'LEADS');

  if (!configGlobalTable || !sectionsTable) {
    log.error('Tables CONFIG_GLOBAL ou SECTIONS non trouvées dans la nouvelle database.');
    process.exit(1);
  }

  if (leadsTable) {
    log.dim(`- LEADS trouvée (ID: ${leadsTable.id})`);
  } else {
    log.warning('Table LEADS non trouvée (optionnelle)');
  }

  // ========== 7. CUSTOMIZE CLIENT DATA (Optional) ==========
  log.category('7. PERSONNALISATION');

  log.step('Mise à jour du nom du site...');
  try {
    // Récupérer la première ligne de CONFIG_GLOBAL
    const rows = await client.listRows(configGlobalTable.id);
    if (rows.results.length > 0) {
      const firstRow = rows.results[0];
      
      // Mettre à jour le nom du site (champ "Nom", pas "Name")
      await client.updateRow(configGlobalTable.id, firstRow.id, {
        Nom: clientName,
      });
      log.dim('→ Nom du site mis à jour');
      
      // Mettre à jour le SEO avec le nom du client
      if (firstRow.SEO_Metadata) {
        try {
          const seo = JSON.parse(firstRow.SEO_Metadata as string);
          seo.metaTitre = `${clientName} - Site Officiel`;
          seo.metaDescription = `Bienvenue sur le site de ${clientName}. Découvrez nos services et contactez-nous.`;
          seo.siteUrl = `https://${clientSlug}.ch`;
          await client.updateRow(configGlobalTable.id, firstRow.id, {
            SEO_Metadata: JSON.stringify(seo),
          });
          log.dim('→ SEO Metadata personnalisé');
        } catch {
          // Ignorer les erreurs de parsing JSON
        }
      }
      
      // Mettre à jour le Contact
      const clientEmail = `contact@${clientSlug}.ch`;
      if (firstRow.Contact) {
        try {
          const contact = JSON.parse(firstRow.Contact as string);
          contact.email = clientEmail;
          await client.updateRow(configGlobalTable.id, firstRow.id, {
            Contact: JSON.stringify(contact),
          });
          log.dim('→ Contact personnalisé');
        } catch {
          // Ignorer les erreurs de parsing JSON
        }
      }
      
      // Mettre à jour le Footer (copyright avec le nom du client)
      if (firstRow.Footer) {
        try {
          const footer = JSON.parse(firstRow.Footer as string);
          footer.copyrightTexte = `© ${new Date().getFullYear()} ${clientName}. Tous droits réservés.`;
          await client.updateRow(configGlobalTable.id, firstRow.id, {
            Footer: JSON.stringify(footer),
          });
          log.dim('→ Footer personnalisé');
        } catch {
          // Ignorer les erreurs de parsing JSON
        }
      }
      
      log.success('CONFIG_GLOBAL personnalisée');
    }
  } catch (err) {
    log.warning(`Personnalisation CONFIG_GLOBAL partielle: ${err}`);
  }

  // ========== 7b. PERSONNALISER LA SECTION CONTACT ==========
  log.step('Mise à jour de la section Contact...');
  try {
    const sectionsRows = await client.listRows(sectionsTable.id);
    const contactSection = sectionsRows.results.find(
      (row) => (row.Nom as string)?.toUpperCase() === 'CONTACT' || (row.Type as number) === 3421
    );
    
    if (contactSection) {
      const contentStr = contactSection.Content as string;
      if (contentStr) {
        try {
          const content = JSON.parse(contentStr);
          content.emailContact = `contact@${clientSlug}.ch`;
          await client.updateRow(sectionsTable.id, contactSection.id as number, {
            Content: JSON.stringify(content),
          });
          log.dim('→ Section CONTACT personnalisée');
        } catch {
          // Ignorer les erreurs de parsing JSON
        }
      }
    }
    log.success('SECTIONS personnalisées');
  } catch (err) {
    log.warning(`Personnalisation SECTIONS partielle: ${err}`);
  }

  // ========== 8. OUTPUT CONFIGURATION ==========
  log.category('8. CONFIGURATION FINALE');

  const token = process.env.BASEROW_API_TOKEN || 'VOTRE_TOKEN_BASEROW';
  const adminPin = generateRandomPin();

  const leadsIdStr = leadsTable ? String(leadsTable.id) : 'N/A';

  console.log(`
${Colors.GREEN}${Colors.BOLD}
┌────────────────────────────────────────────────────────────┐
│  ✅ CLIENT "${clientName}" CRÉÉ AVEC SUCCÈS!              
├────────────────────────────────────────────────────────────┤
│  Database ID: ${String(newDatabase.id).padEnd(43)}│
│  CONFIG_GLOBAL ID: ${String(configGlobalTable.id).padEnd(39)}│
│  SECTIONS ID: ${String(sectionsTable.id).padEnd(44)}│
│  LEADS ID: ${leadsIdStr.padEnd(47)}│
│  ADMIN PIN: ${String(adminPin).padEnd(46)}│
└────────────────────────────────────────────────────────────┘
${Colors.RESET}`);

  console.log(`
${Colors.CYAN}🚀 CONFIGURATION POUR DOCKER:${Colors.RESET}
${Colors.DIM}───────────────────────────────────────${Colors.RESET}
${Colors.YELLOW}BASEROW_API_TOKEN=${token}
BASEROW_FACTORY_DATABASE_ID=${newDatabase.id}
BASEROW_FACTORY_GLOBAL_ID=${configGlobalTable.id}
BASEROW_FACTORY_SECTIONS_ID=${sectionsTable.id}${leadsTable ? `
BASEROW_FACTORY_LEADS_ID=${leadsTable.id}` : ''}
ADMIN_PASSWORD=${adminPin}${Colors.RESET}
${Colors.DIM}───────────────────────────────────────${Colors.RESET}
`);

  // Proposer de sauvegarder dans un fichier
  const saveToFile = await confirm('💾 Sauvegarder la config dans un fichier .env.client?');
  
  if (saveToFile) {
    const envContent = `# ============================================
# Configuration pour: ${clientName}
# ============================================
# Créé le: ${new Date().toISOString()}
# Database ID: ${newDatabase.id}
# Slug: ${clientSlug}

# === FACTORY V2 - BASEROW CONFIG ===
BASEROW_API_TOKEN=${token}
BASEROW_FACTORY_DATABASE_ID=${newDatabase.id}
BASEROW_FACTORY_GLOBAL_ID=${configGlobalTable.id}
BASEROW_FACTORY_SECTIONS_ID=${sectionsTable.id}
${leadsTable ? `BASEROW_FACTORY_LEADS_ID=${leadsTable.id}` : '# BASEROW_FACTORY_LEADS_ID= # Table LEADS non présente'}

# === ADMIN AUTH ===
ADMIN_PASSWORD=${adminPin}

# === SITE CONFIG ===
SITE_NAME=${clientName}
NEXT_PUBLIC_SITE_URL=https://${clientSlug}.ch

# === EMAIL CONFIG (à personnaliser) ===
# CONTACT_EMAIL=contact@${clientSlug}.ch
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASSWORD=
`;

    const filename = `.env.client-${clientSlug}`;
    fs.writeFileSync(path.resolve(process.cwd(), filename), envContent);
    log.success(`Configuration sauvegardée dans ${filename}`);
  }

  // ========== 9. DOCKER DEPLOYMENT FILES ==========
  log.category('9. FICHIERS DOCKER (Optionnel)');

  const createDockerFiles = await confirm('🐳 Voulez-vous générer les fichiers Docker pour ce client?');
  
  if (createDockerFiles) {
    // Demander le type de domaine
    console.log(`
${Colors.CYAN}Type de domaine:${Colors.RESET}
  1) Sous-domaine .mick-solutions.ch (ex: ${clientSlug}.mick-solutions.ch)
  2) Domaine externe du client (ex: ${clientSlug}.ch)
`);
    const domainType = await prompt('Choix (1 ou 2): ');
    
    let domain: string;
    const routerName = clientSlug.replace(/-/g, '');
    
    if (domainType === '2') {
      domain = await prompt(`Domaine du client (ex: ${clientSlug}.ch): `);
      if (!domain) domain = `${clientSlug}.ch`;
    } else {
      domain = `${clientSlug}.mick-solutions.ch`;
    }
    
    // Créer le dossier client
    const clientDir = `/home/mickadmin/docker/clients/${clientSlug}`;
    
    try {
      let shouldGenerate = true;
      
      // Vérifier si le dossier existe déjà
      if (fs.existsSync(clientDir)) {
        const overwrite = await confirm(`⚠️ Le dossier ${clientDir} existe déjà. Écraser?`);
        if (!overwrite) {
          log.info('Génération Docker annulée.');
          shouldGenerate = false;
        }
      } else {
        fs.mkdirSync(clientDir, { recursive: true });
      }
      
      if (shouldGenerate) {
        // Fichier .env
        const envContent = `# ============================================
# Configuration pour: ${clientName}
# ============================================
# Créé le: ${new Date().toISOString()}
# Database ID: ${newDatabase.id}
# Slug: ${clientSlug}

# === BASEROW CONFIG ===
BASEROW_API_URL=https://baserow.mick-solutions.ch/api
BASEROW_API_TOKEN=${token}
BASEROW_FACTORY_GLOBAL_ID=${configGlobalTable.id}
BASEROW_FACTORY_SECTIONS_ID=${sectionsTable.id}
${leadsTable ? `BASEROW_FACTORY_LEADS_ID=${leadsTable.id}` : '# BASEROW_FACTORY_LEADS_ID= # Table LEADS non présente'}

# === ADMIN AUTH ===
ADMIN_PASSWORD=${adminPin}

# === SITE CONFIG ===
NODE_ENV=production
SITE_NAME=${clientName}
NEXT_PUBLIC_SITE_URL=https://${domain}
`;

        // docker-compose.yml
        const dockerComposeContent = domainType === '2' 
          ? `# Docker Compose pour: ${clientName}
# Domaine externe: ${domain}
services:
  website:
    image: website-website:latest
    container_name: client-${clientSlug}-web
    restart: unless-stopped
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      # Domaine principal + www
      - "traefik.http.routers.${routerName}.rule=Host(\`${domain}\`) || Host(\`www.${domain}\`)"
      - "traefik.http.routers.${routerName}.entrypoints=websecure"
      - "traefik.http.routers.${routerName}.tls.certresolver=myresolver"
      - "traefik.http.services.${routerName}.loadbalancer.server.port=3000"

networks:
  proxy:
    external: true
`
          : `# Docker Compose pour: ${clientName}
# Sous-domaine: ${domain}
services:
  website:
    image: website-website:latest
    container_name: client-${clientSlug}-web
    restart: unless-stopped
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${routerName}.rule=Host(\`${domain}\`)"
      - "traefik.http.routers.${routerName}.entrypoints=websecure"
      - "traefik.http.routers.${routerName}.tls.certresolver=myresolver"
      - "traefik.http.services.${routerName}.loadbalancer.server.port=3000"

networks:
  proxy:
    external: true
`;

        // Écrire les fichiers
        fs.writeFileSync(path.join(clientDir, '.env'), envContent);
        fs.writeFileSync(path.join(clientDir, 'docker-compose.yml'), dockerComposeContent);
        
        log.success(`Fichiers Docker créés dans ${clientDir}`);
        log.dim(`→ .env`);
        log.dim(`→ docker-compose.yml`);

        // Instructions pour le domaine externe
        if (domainType === '2') {
          console.log(`
${Colors.YELLOW}⚠️  CONFIGURATION DNS REQUISE:${Colors.RESET}
${Colors.DIM}Le client doit configurer ses DNS:
  Type    Nom     Valeur
  ────────────────────────────────
  A       @       83.228.218.6
  A       www     83.228.218.6${Colors.RESET}
`);
        }

        // Proposer de démarrer le conteneur
        console.log(`
${Colors.CYAN}🚀 Pour démarrer le site:${Colors.RESET}
${Colors.DIM}  cd ${clientDir}
  docker compose up -d${Colors.RESET}
`);
      }
    } catch (err) {
      log.error(`Erreur lors de la création des fichiers Docker: ${err}`);
    }
  }

  // ========== 10. NEXT STEPS ==========
  console.log(`
${Colors.MAGENTA}📋 PROCHAINES ÉTAPES:${Colors.RESET}
${Colors.DIM}1. ${createDockerFiles ? 'Les fichiers Docker ont été générés' : 'Copiez les variables d\'environnement ci-dessus'}
2. ${createDockerFiles ? 'Lancez "docker compose up -d" dans le dossier client' : 'Déployez une nouvelle instance du site avec ces variables'}
3. Accédez à /admin/v2 pour personnaliser le contenu
4. Configurez le domaine personnalisé si nécessaire${Colors.RESET}
`);

  log.success('Script terminé avec succès!');
}

// ============================================
// RUN
// ============================================

createClient().catch(err => {
  log.error(`Erreur fatale: ${err}`);
  process.exit(1);
});

