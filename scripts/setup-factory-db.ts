#!/usr/bin/env npx ts-node
/**
 * ============================================
 * FACTORY V2 - DATABASE SETUP SCRIPT
 * ============================================
 * 
 * Script de migration vers l'architecture Block-Based Factory.
 * Crée la structure relationnelle dans Baserow:
 * - Database: FACTORY_V2
 * - Table: CONFIG_GLOBAL (settings globaux)
 * - Table: SECTIONS (blocs de contenu ordonnés)
 * 
 * Usage:
 *   npx tsx scripts/setup-factory-db.ts <email> <password>
 *   npx tsx scripts/setup-factory-db.ts  # Utilise BASEROW_EMAIL et BASEROW_PASSWORD
 * 
 * Requis:
 *   - Credentials admin Baserow (email/password)
 *   - Accès admin à l'instance Baserow
 * 
 * @author White Label Factory
 * @version 2.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ============================================
// CONFIGURATION
// ============================================

const BASEROW_URL = 'https://baserow.mick-solutions.ch';
const DATABASE_NAME = 'FACTORY_V2';

// Charger .env.local ou .env si présent
function loadEnv(): void {
  const envPaths = ['.env.local', '.env'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      });
      console.log(`📁 Loaded env from ${envPath}`);
      break;
    }
  }
}

loadEnv();

// Credentials depuis args ou env
const args = process.argv.slice(2);
let BASEROW_EMAIL = args[0] || process.env.BASEROW_EMAIL || '';
let BASEROW_PASSWORD = args[1] || process.env.BASEROW_PASSWORD || '';

// ============================================
// COLORS & LOGGING
// ============================================

const Colors = {
  GREEN: '\x1b[92m',
  YELLOW: '\x1b[93m',
  RED: '\x1b[91m',
  CYAN: '\x1b[96m',
  MAGENTA: '\x1b[95m',
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
};

// ============================================
// TYPES
// ============================================

interface BaserowDatabase {
  id: number;
  name: string;
  order: number;
  type?: string;
  group: { id: number; name: string };
  tables: BaserowTable[];
}

interface BaserowTable {
  id: number;
  name: string;
  order: number;
  database_id: number;
}

interface BaserowField {
  id: number;
  name: string;
  type: string;
  table_id: number;
}

interface BaserowSelectOption {
  value: string;
  color: string;
}

interface FieldDefinition {
  name: string;
  type: string;
  options?: BaserowSelectOption[];
  config?: Record<string, unknown>;
}

// ============================================
// API CLIENT (JWT Authentication)
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

  async listWorkspaces(): Promise<{ id: number; name: string }[]> {
    return this.request<{ id: number; name: string }[]>('GET', '/api/workspaces/');
  }

  // ========== DATABASE ==========

  async listDatabases(workspaceId: number): Promise<BaserowDatabase[]> {
    const result = await this.request<{ applications: BaserowDatabase[] }>(
      'GET',
      `/api/applications/workspace/${workspaceId}/`
    );
    return result.applications?.filter((app) => app.type === 'database') || [];
  }

  async createDatabase(workspaceId: number, name: string): Promise<BaserowDatabase> {
    return this.request<BaserowDatabase>('POST', `/api/applications/workspace/${workspaceId}/`, {
      name,
      type: 'database',
    });
  }

  async getDatabase(databaseId: number): Promise<BaserowDatabase> {
    return this.request<BaserowDatabase>('GET', `/api/applications/${databaseId}/`);
  }

  // ========== TABLE ==========

  async listTables(databaseId: number): Promise<BaserowTable[]> {
    const db = await this.getDatabase(databaseId);
    return db.tables || [];
  }

  async createTable(databaseId: number, name: string): Promise<BaserowTable> {
    return this.request<BaserowTable>('POST', `/api/database/tables/database/${databaseId}/`, {
      name,
    });
  }

  // ========== FIELDS ==========

  async listFields(tableId: number): Promise<BaserowField[]> {
    return this.request<BaserowField[]>('GET', `/api/database/fields/table/${tableId}/`);
  }

  async createField(tableId: number, field: FieldDefinition): Promise<BaserowField> {
    const payload: Record<string, unknown> = {
      name: field.name,
      type: field.type,
    };

    // Configuration spécifique par type
    if (field.type === 'single_select' && field.options) {
      payload.select_options = field.options;
    } else if (field.type === 'multiple_select' && field.options) {
      payload.select_options = field.options;
    } else if (field.type === 'number') {
      payload.number_decimal_places = field.config?.decimal_places ?? 0;
      payload.number_negative = field.config?.allow_negative ?? false;
    } else if (field.type === 'long_text') {
      payload.long_text_enable_rich_text = field.config?.rich_text ?? false;
    }

    // Merge config supplémentaire
    if (field.config) {
      Object.assign(payload, field.config);
    }

    return this.request<BaserowField>('POST', `/api/database/fields/table/${tableId}/`, payload);
  }

  // ========== ROWS ==========

  async createRow(tableId: number, data: Record<string, unknown>): Promise<{ id: number }> {
    return this.request<{ id: number }>(
      'POST',
      `/api/database/rows/table/${tableId}/?user_field_names=true`,
      data
    );
  }

  async listRows(tableId: number): Promise<{ results: Record<string, unknown>[] }> {
    return this.request<{ results: Record<string, unknown>[] }>(
      'GET',
      `/api/database/rows/table/${tableId}/?user_field_names=true`
    );
  }
}

// ============================================
// FIELD DEFINITIONS
// ============================================

const SECTION_TYPES: BaserowSelectOption[] = [
  { value: 'hero', color: 'red' },
  { value: 'services', color: 'blue' },
  { value: 'advantages', color: 'green' },
  { value: 'gallery', color: 'purple' },
  { value: 'portfolio', color: 'orange' },
  { value: 'testimonials', color: 'yellow' },
  { value: 'trust', color: 'cyan' },
  { value: 'faq', color: 'light-green' },
  { value: 'contact', color: 'pink' },
  { value: 'blog', color: 'dark-blue' },
  { value: 'ai-assistant', color: 'light-purple' },
  { value: 'custom', color: 'gray' },
];

const CONFIG_GLOBAL_FIELDS: FieldDefinition[] = [
  // Le champ "Name" existe par défaut, on l'utilisera comme Nom_Site
  { name: 'SEO_Metadata', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Branding', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Contact', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Integrations', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Assets', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'AI_Config', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Animations', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Premium', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Footer', type: 'long_text', config: { long_text_enable_rich_text: false } },
];

const SECTIONS_FIELDS: FieldDefinition[] = [
  { name: 'Type', type: 'single_select', options: SECTION_TYPES },
  { name: 'Is_Active', type: 'boolean' },
  { name: 'Order', type: 'number', config: { number_decimal_places: 0 } },
  { name: 'Content', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Design', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Page', type: 'text' },
];

// ============================================
// LEADS TABLE (CRM Lite)
// ============================================

const LEAD_STATUS_OPTIONS: BaserowSelectOption[] = [
  { value: 'New', color: 'green' },
  { value: 'Contacted', color: 'yellow' },
  { value: 'Qualified', color: 'blue' },
  { value: 'Closed', color: 'gray' },
  { value: 'Lost', color: 'red' },
];

const LEADS_FIELDS: FieldDefinition[] = [
  { name: 'Name', type: 'text' },
  { name: 'Email', type: 'email' },
  { name: 'Phone', type: 'text' },
  { name: 'Message', type: 'long_text', config: { long_text_enable_rich_text: false } },
  { name: 'Status', type: 'single_select', options: LEAD_STATUS_OPTIONS },
  { name: 'Source', type: 'text' },
  { name: 'Created_At', type: 'created_on' },
];

// ============================================
// DEFAULT DATA
// ============================================

const DEFAULT_SEO = {
  metaTitre: 'Mon Site - Titre SEO',
  metaDescription: 'Description SEO par défaut',
  siteUrl: 'https://example.com',
  motsCles: '',
  langue: 'fr',
  locale: 'fr_CH',
  robotsIndex: true,
  sitemapPriority: 0.8,
};

const DEFAULT_BRANDING = {
  couleurPrimaire: '#06b6d4',
  couleurAccent: '#a855f7',
  couleurBackground: '#0a0a0f',
  couleurText: '#ffffff',
  fontPrimary: 'Inter',
  fontHeading: 'Inter',
  fontCustomUrl: null,
  borderRadius: 'Medium',
  patternBackground: 'Grid',
  themeGlobal: 'Electric',
};

const DEFAULT_CONTACT = {
  email: 'contact@example.com',
  telephone: null,
  adresse: 'Adresse, Pays',
  adresseCourte: null,
  lienLinkedin: null,
  lienInstagram: null,
  lienTwitter: null,
  lienYoutube: null,
  lienGithub: null,
  lienCalendly: null,
  lienWhatsapp: null,
  lienBoutonAppel: null,
  n8nWebhookUrl: null,
};

const DEFAULT_INTEGRATIONS = {
  umamiSiteId: null,
  umamiScriptUrl: null,
  gaMeasurementId: null,
  gtmContainerId: null,
  hotjarSiteId: null,
  facebookPixelId: null,
  n8nWebhookContact: null,
  n8nWebhookNewsletter: null,
  stripePublicKey: null,
  mailchimpListId: null,
  sendgridApiKey: null,
  notionDatabaseId: null,
  airtableBaseId: null,
};

const DEFAULT_ASSETS = {
  logoUrl: null,
  logoDarkUrl: null,
  logoSvgCode: null,
  faviconUrl: null,
  ogImageUrl: null,
};

const DEFAULT_AI_CONFIG = {
  aiMode: 'Disabled',
  aiProvider: 'OpenAI',
  aiApiKey: null,
  aiModel: 'gpt-4o',
  aiSystemPrompt: null,
  aiWebhookUrl: null,
  aiImageWebhook: null,
  aiMaxTokens: 1000,
  aiTemperature: 0.7,
  aiTone: 'Professional',
  aiIndustry: 'Services',
  aiTargetAudience: null,
  aiKeywords: null,
};

const DEFAULT_ANIMATIONS = {
  enableAnimations: true,
  animationStyle: 'mick-electric',
  animationSpeed: 'Normal',
  scrollEffect: 'Fade',
  hoverEffect: 'Scale',
  loadingStyle: 'Skeleton',
  textAnimation: 'Gradient',
};

const DEFAULT_PREMIUM = {
  isPremium: false,
  premiumUntil: null,
  customDomain: null,
  customCss: null,
  customJs: null,
  featureFlags: [],
  rateLimitApi: 1000,
  maintenanceMode: false,
};

const DEFAULT_FOOTER = {
  copyrightTexte: '© Mon Site. Tous droits réservés.',
  paysHebergement: 'Hébergé en Suisse',
  showLegalLinks: true,
  customFooterText: null,
  footerCtaText: null,
  footerCtaUrl: null,
  footerLogoSize: 40,
  footerLogoAnimation: 'none',
  footerVariant: 'Electric',
};

const DEFAULT_HERO_CONTENT = {
  titre: 'Titre Principal',
  sousTitre: 'Sous-titre descriptif de votre activité.',
  badge: 'Badge',
  ctaPrincipal: { text: 'Action Principale', url: '#contact' },
  ctaSecondaire: { text: 'En savoir plus', url: '#services' },
  trustStats: [
    { value: '100%', label: 'Satisfaction' },
    { value: '24/7', label: 'Support' },
  ],
  backgroundUrl: null,
  videoUrl: null,
  aiPrompt: null,
};

const DEFAULT_HERO_DESIGN = {
  variant: 'Electric',
  height: 'Tall',
  logoAnimation: 'electric',
  logoSize: 280,
  logoFrameStyle: 'Square',
  textAnimation: 'Gradient',
};

// ============================================
// MAIN SETUP FUNCTION
// ============================================

// Prompt pour credentials si non fournis
async function promptCredentials(): Promise<{ email: string; password: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  let email = BASEROW_EMAIL;
  let password = BASEROW_PASSWORD;

  if (!email) {
    email = await question('📧 Email Baserow: ');
  }
  if (!password) {
    password = await question('🔑 Password Baserow: ');
  }

  rl.close();
  return { email, password };
}

async function setupFactoryDatabase(): Promise<void> {
  console.log(`
${Colors.CYAN}${Colors.BOLD}
╔══════════════════════════════════════════════════════════╗
║     🏭 FACTORY V2 - DATABASE SETUP                       ║
║     Block-Based Architecture Migration                   ║
╚══════════════════════════════════════════════════════════╝
${Colors.RESET}`);

  // ========== 1. VALIDATION ==========
  log.category('1. VALIDATION');

  // Obtenir les credentials
  const { email, password } = await promptCredentials();

  if (!email || !password) {
    log.error('Email et password requis!');
    log.info('Usage: npx tsx scripts/setup-factory-db.ts <email> <password>');
    log.info('Ou définissez BASEROW_EMAIL et BASEROW_PASSWORD dans .env');
    process.exit(1);
  }
  log.success(`Credentials: ${email}`);

  const client = new BaserowClient(BASEROW_URL, email, password);

  // Authentification
  const authSuccess = await client.authenticate();
  if (!authSuccess) {
    log.error('Échec de l\'authentification. Vérifiez vos credentials.');
    process.exit(1);
  }

  // ========== 2. WORKSPACE DETECTION ==========
  log.category('2. WORKSPACE');

  let workspaces: { id: number; name: string }[];
  try {
    workspaces = await client.listWorkspaces();
    log.success(`${workspaces.length} workspace(s) trouvé(s)`);
  } catch (err) {
    log.error(`Impossible de lister les workspaces: ${err}`);
    process.exit(1);
  }

  if (workspaces.length === 0) {
    log.error('Aucun workspace trouvé. Créez-en un dans Baserow.');
    process.exit(1);
  }

  const workspace = workspaces[0];
  log.info(`Utilisation du workspace: "${workspace.name}" (ID: ${workspace.id})`);

  // ========== 3. DATABASE CHECK/CREATE ==========
  log.category('3. DATABASE');

  let databases: BaserowDatabase[];
  try {
    databases = await client.listDatabases(workspace.id);
    log.success(`${databases.length} database(s) existante(s)`);
  } catch (err) {
    log.error(`Erreur listing databases: ${err}`);
    process.exit(1);
  }

  let database = databases.find(db => db.name === DATABASE_NAME);

  if (database) {
    log.warning(`Database "${DATABASE_NAME}" existe déjà (ID: ${database.id})`);
    log.info('Les tables existantes seront conservées.');
  } else {
    log.step(`Création de la database "${DATABASE_NAME}"...`);
    try {
      database = await client.createDatabase(workspace.id, DATABASE_NAME);
      log.success(`Database créée avec ID: ${database.id}`);
    } catch (err) {
      log.error(`Erreur création database: ${err}`);
      process.exit(1);
    }
  }

  // ========== 4. TABLE: CONFIG_GLOBAL ==========
  log.category('4. TABLE: CONFIG_GLOBAL');

  let tables: BaserowTable[];
  try {
    tables = await client.listTables(database.id);
  } catch (err) {
    log.error(`Erreur listing tables: ${err}`);
    process.exit(1);
  }

  let configTable = tables.find(t => t.name === 'CONFIG_GLOBAL');

  if (configTable) {
    log.warning(`Table CONFIG_GLOBAL existe (ID: ${configTable.id})`);
  } else {
    log.step('Création de la table CONFIG_GLOBAL...');
    try {
      configTable = await client.createTable(database.id, 'CONFIG_GLOBAL');
      log.success(`Table créée avec ID: ${configTable.id}`);

      // Créer les champs
      log.step('Création des champs...');
      for (const field of CONFIG_GLOBAL_FIELDS) {
        try {
          await client.createField(configTable.id, field);
          log.dim(`+ ${field.name} (${field.type})`);
          await sleep(100); // Rate limiting
        } catch (err) {
          log.warning(`Champ ${field.name}: ${err}`);
        }
      }
      log.success('Champs CONFIG_GLOBAL créés');
    } catch (err) {
      log.error(`Erreur création table: ${err}`);
    }
  }

  // ========== 5. TABLE: SECTIONS ==========
  log.category('5. TABLE: SECTIONS');

  let sectionsTable = tables.find(t => t.name === 'SECTIONS');

  if (sectionsTable) {
    log.warning(`Table SECTIONS existe (ID: ${sectionsTable.id})`);
  } else {
    log.step('Création de la table SECTIONS...');
    try {
      sectionsTable = await client.createTable(database.id, 'SECTIONS');
      log.success(`Table créée avec ID: ${sectionsTable.id}`);

      // Créer les champs
      log.step('Création des champs...');
      for (const field of SECTIONS_FIELDS) {
        try {
          await client.createField(sectionsTable.id, field);
          log.dim(`+ ${field.name} (${field.type})`);
          await sleep(100);
        } catch (err) {
          log.warning(`Champ ${field.name}: ${err}`);
        }
      }
      log.success('Champs SECTIONS créés');
    } catch (err) {
      log.error(`Erreur création table: ${err}`);
    }
  }

  // ========== 6. TABLE: LEADS (CRM Lite) ==========
  log.category('6. TABLE: LEADS');

  let leadsTable = tables.find(t => t.name === 'LEADS');

  if (leadsTable) {
    log.warning(`Table LEADS existe (ID: ${leadsTable.id})`);
  } else {
    log.step('Création de la table LEADS...');
    try {
      leadsTable = await client.createTable(database.id, 'LEADS');
      log.success(`Table créée avec ID: ${leadsTable.id}`);

      // Créer les champs
      log.step('Création des champs...');
      for (const field of LEADS_FIELDS) {
        try {
          await client.createField(leadsTable.id, field);
          log.dim(`+ ${field.name} (${field.type})`);
          await sleep(100);
        } catch (err) {
          log.warning(`Champ ${field.name}: ${err}`);
        }
      }
      log.success('Champs LEADS créés');
    } catch (err) {
      log.error(`Erreur création table: ${err}`);
    }
  }

  // ========== 7. POPULATE DEFAULT DATA ==========
  log.category('7. DONNÉES PAR DÉFAUT');

  if (configTable) {
    try {
      const existingRows = await client.listRows(configTable.id);
      if (existingRows.results.length === 0) {
        log.step('Insertion des settings par défaut...');
        const defaultConfig = {
          Name: 'Mon Site', // Champ par défaut de Baserow
          SEO_Metadata: JSON.stringify(DEFAULT_SEO),
          Branding: JSON.stringify(DEFAULT_BRANDING),
          Contact: JSON.stringify(DEFAULT_CONTACT),
          Integrations: JSON.stringify(DEFAULT_INTEGRATIONS),
          Assets: JSON.stringify(DEFAULT_ASSETS),
          AI_Config: JSON.stringify(DEFAULT_AI_CONFIG),
          Animations: JSON.stringify(DEFAULT_ANIMATIONS),
          Premium: JSON.stringify(DEFAULT_PREMIUM),
          Footer: JSON.stringify(DEFAULT_FOOTER),
        };
        await client.createRow(configTable.id, defaultConfig);
        log.success('Config par défaut insérée');
      } else {
        log.info(`CONFIG_GLOBAL contient déjà ${existingRows.results.length} ligne(s)`);
      }
    } catch (err) {
      log.warning(`Erreur insertion config: ${err}`);
    }
  }

  if (sectionsTable) {
    try {
      const existingRows = await client.listRows(sectionsTable.id);
      if (existingRows.results.length === 0) {
        log.step('Insertion de la section Hero par défaut...');
        const defaultHero = {
          Type: 'hero',
          Is_Active: true,
          Order: 0,
          Content: JSON.stringify(DEFAULT_HERO_CONTENT),
          Design: JSON.stringify(DEFAULT_HERO_DESIGN),
          Page: 'home',
        };
        await client.createRow(sectionsTable.id, defaultHero);
        log.success('Section Hero créée');
      } else {
        log.info(`SECTIONS contient déjà ${existingRows.results.length} ligne(s)`);
      }
    } catch (err) {
      log.warning(`Erreur insertion section: ${err}`);
    }
  }

  // ========== 8. SAVE TO .ENV.LOCAL ==========
  log.category('8. SAUVEGARDE DES IDs');

  if (configTable?.id && sectionsTable?.id) {
    const envPath = path.resolve(process.cwd(), '.env.local');
    let envContent = '';
    
    // Lire le contenu existant
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }
    
    // Ajouter ou mettre à jour les variables
    const newVars: Record<string, string> = {
      BASEROW_FACTORY_GLOBAL_ID: String(configTable.id),
      BASEROW_FACTORY_SECTIONS_ID: String(sectionsTable.id),
      ...(leadsTable?.id ? { BASEROW_FACTORY_LEADS_ID: String(leadsTable.id) } : {}),
    };
    
    for (const [key, value] of Object.entries(newVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
    
    // Nettoyer les lignes vides multiples
    envContent = envContent.replace(/\n{3,}/g, '\n\n').trim() + '\n';
    
    fs.writeFileSync(envPath, envContent, 'utf-8');
    log.success('Variables ajoutées à .env.local:');
    log.dim(`BASEROW_FACTORY_GLOBAL_ID=${configTable.id}`);
    log.dim(`BASEROW_FACTORY_SECTIONS_ID=${sectionsTable.id}`);
    if (leadsTable?.id) {
      log.dim(`BASEROW_FACTORY_LEADS_ID=${leadsTable.id}`);
    }
  }

  // ========== 9. SUMMARY ==========
  log.category('9. RÉSUMÉ');

  console.log(`
${Colors.GREEN}${Colors.BOLD}
┌──────────────────────────────────────────────────────────┐
│  ✅ FACTORY V2 - SETUP TERMINÉ                          │
├──────────────────────────────────────────────────────────┤
│  Database: ${DATABASE_NAME.padEnd(40)}      │
│  CONFIG_GLOBAL ID: ${String(configTable?.id || 'N/A').padEnd(35)}│
│  SECTIONS ID: ${String(sectionsTable?.id || 'N/A').padEnd(40)}│
│  LEADS ID: ${String(leadsTable?.id || 'N/A').padEnd(44)}│
└──────────────────────────────────────────────────────────┘
${Colors.RESET}`);

  log.info('Prochaines étapes:');
  log.dim('1. Les IDs sont dans .env.local');
  log.dim('2. Créer les fonctions de fetch dans src/lib/baserow-v2.ts');
  log.dim('3. Migrer les composants pour utiliser SectionSchema');
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// RUN
// ============================================

setupFactoryDatabase().catch(err => {
  log.error(`Erreur fatale: ${err}`);
  process.exit(1);
});

