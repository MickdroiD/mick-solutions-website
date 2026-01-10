#!/usr/bin/env npx tsx
/**
 * ============================================
 * FACTORY V2 - SEED CONTENT SCRIPT
 * ============================================
 * 
 * Script de peuplement du template maître FACTORY_V2.
 * Initialise les tables avec du contenu pédagogique prêt à être dupliqué.
 * 
 * Usage:
 *   npx tsx scripts/seed-factory-content.ts
 * 
 * Tables ciblées:
 *   - CONFIG_GLOBAL (808) : Configuration globale du site
 *   - SECTIONS (809) : Sections de la page d'accueil
 * 
 * @author MICK-SOLUTIONS
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// CONFIGURATION
// ============================================

const BASEROW_URL = 'https://baserow.mick-solutions.ch';
const TABLE_CONFIG_GLOBAL_ID = 808;
const TABLE_SECTIONS_ID = 809;

// Charger les variables d'environnement
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
      console.log(`📁 Chargement de ${envPath}`);
      break;
    }
  }
}

loadEnv();

const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;

if (!BASEROW_TOKEN) {
  console.error('❌ BASEROW_API_TOKEN non défini dans .env ou .env.local');
  process.exit(1);
}

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
// API CLIENT (Token Authentication)
// ============================================

class BaserowClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Token ${this.token}`,
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

  async listRows(tableId: number): Promise<{ results: Record<string, unknown>[] }> {
    return this.request<{ results: Record<string, unknown>[] }>(
      'GET',
      `/api/database/rows/table/${tableId}/?user_field_names=true`
    );
  }

  async updateRow(tableId: number, rowId: number, data: Record<string, unknown>): Promise<{ id: number }> {
    return this.request<{ id: number }>(
      'PATCH',
      `/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`,
      data
    );
  }

  async createRow(tableId: number, data: Record<string, unknown>): Promise<{ id: number }> {
    return this.request<{ id: number }>(
      'POST',
      `/api/database/rows/table/${tableId}/?user_field_names=true`,
      data
    );
  }

  async deleteRow(tableId: number, rowId: number): Promise<void> {
    const url = `${this.baseUrl}/api/database/rows/table/${tableId}/${rowId}/`;
    const headers: Record<string, string> = {
      'Authorization': `Token ${this.token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, { method: 'DELETE', headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    // DELETE ne retourne pas de body, pas de JSON.parse
  }
}

// ============================================
// SEED DATA - CONFIG_GLOBAL (Table 808)
// ============================================

const SEED_SEO_METADATA = {
  metaTitre: 'Bienvenue sur votre nouveau site',
  metaDescription: "Ceci est la description qui apparaîtra sur Google. Modifiez-la dans l'admin pour attirer vos visiteurs.",
  siteUrl: 'https://votre-domaine.com',
  motsCles: '',
  langue: 'fr',
  locale: 'fr_CH',
  robotsIndex: true,
  sitemapPriority: 0.8,
};

const SEED_BRANDING = {
  couleurPrimaire: '#3B82F6', // Bleu Roi
  couleurAccent: '#10B981',   // Vert Émeraude
  couleurBackground: '#0a0a0f',
  couleurText: '#ffffff',
  fontPrimary: 'Inter',
  fontHeading: 'Inter',
  fontCustomUrl: null,
  borderRadius: 'rounded-full', // Style boutons
  patternBackground: 'Grid',
  themeGlobal: 'Electric',
};

const SEED_CONTACT = {
  email: 'contact@votre-domaine.com',
  telephone: '+41 00 000 00 00',
  adresse: 'Genève, Suisse',
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

const SEED_ASSETS = {
  logoUrl: null,
  logoDarkUrl: null,
  logoSvgCode: null,
  faviconUrl: null,
  ogImageUrl: null,
};

const SEED_PREMIUM = {
  isPremium: false,
  premiumUntil: null,
  customDomain: null,
  customCss: null,
  customJs: null,
  featureFlags: [],
  rateLimitApi: 1000,
  maintenanceMode: false,
};

const SEED_FOOTER = {
  copyrightTexte: '© Votre Site Web. Tous droits réservés.',
  paysHebergement: 'Hébergé en Suisse',
  showLegalLinks: true,
  customFooterText: null,
  footerCtaText: null,
  footerCtaUrl: null,
  footerLogoSize: 40,
  footerLogoAnimation: 'none',
  footerVariant: 'Electric',
};

// ============================================
// SEED DATA - SECTIONS (Table 809)
// ============================================

// Types de sections (IDs des options single_select)
const SECTION_TYPE_IDS = {
  hero: 3413,
  services: 3414,
  advantages: 3415,
  gallery: 3416,
  portfolio: 3417,
  testimonials: 3418,
  trust: 3419,
  faq: 3420,
  contact: 3421,
  blog: 3422,
  'ai-assistant': 3423,
  custom: 3424,
};

// HERO
const SEED_HERO_CONTENT = {
  titreHero: 'Hey ! Bienvenue chez Vous 🚀',
  sousTitreHero: "Ceci est bien plus qu'un template. C'est votre nouvelle vitrine magique. Modifiez-moi pour raconter votre histoire.",
  badgeHero: '👋 Votre aventure commence ici',
  ctaPrincipal: 'Démarrer le projet',
  ctaPrincipalUrl: '#contact',
  ctaSecondaire: 'Découvrir mes services',
  ctaSecondaireUrl: '#services',
  trustStat1Value: '100%',
  trustStat1Label: 'Satisfaction',
  trustStat2Value: '24/7',
  trustStat2Label: 'Support Client',
};

const SEED_HERO_DESIGN = {
  style: 'electric',
  min_height: 'screen',
};

// SERVICES
const SEED_SERVICES_CONTENT = {
  titreSection: 'Ce que je déchire 🎸',
  sousTitreSection: 'Voici mes super-pouvoirs. À vous de définir les vôtres !',
  services: [
    {
      titre: 'Expertise Technique',
      description: 'Je transforme le café en code propre et performant. (Texte à remplacer par votre vraie expertise !)',
      icon: 'Zap',
    },
    {
      titre: 'Design Immersif',
      description: 'Vos utilisateurs vont adorer scroller sur votre site. L\'expérience avant tout.',
      icon: 'Palette',
    },
    {
      titre: 'Support Réactif',
      description: 'Un problème ? Je suis là plus vite que votre ombre. La tranquillité d\'esprit incluse.',
      icon: 'LifeBuoy',
    },
  ],
};

// TESTIMONIALS
const SEED_TESTIMONIALS_CONTENT = {
  titreSection: 'Ils m\'adorent ❤️',
  temoignages: [
    {
      nom: 'Elon M.',
      poste: 'CEO de l\'Espace',
      avis: "Incroyable ! Ce site est parti sur Mars avant mes fusées. Un travail d'orfèvre.",
      note: 5,
    },
    {
      nom: 'Sophie T.',
      poste: 'Entrepreneuse Heureuse',
      avis: "Depuis que j'ai ce site, mon téléphone ne s'arrête plus de sonner. Merci pour tout !",
      note: 5,
    },
  ],
};

// FAQ
const SEED_FAQ_CONTENT = {
  titreSection: 'Questions ? Réponses ! 💡',
  questions: [
    {
      question: 'Puis-je modifier ces textes facilement ?',
      reponse: "Oui ! C'est aussi simple que d'envoyer un SMS. Tout se passe dans votre espace admin.",
    },
    {
      question: 'Est-ce que le site est rapide ?',
      reponse: "Plus rapide que l'éclair ⚡️. Google va adorer, et vos visiteurs aussi.",
    },
    {
      question: 'Et si je veux ajouter des photos ?',
      reponse: "Glissez, déposez, c'est en ligne. On a pensé à tout pour vous simplifier la vie.",
    },
  ],
};

// CONTACT
const SEED_CONTACT_CONTENT = {
  titreSection: 'On lance le projet ? ☕️',
  sousTitreSection: 'Remplissez ce formulaire et je reçois tout illico sur mon email pro.',
  emailContact: 'hello@votre-domaine.com',
  telephoneContact: '+41 79 123 45 67',
  adresseContact: 'Genève, Suisse',
};

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedFactoryContent(): Promise<void> {
  console.log(`
${Colors.CYAN}${Colors.BOLD}
╔══════════════════════════════════════════════════════════╗
║     🌱 FACTORY V2 - SEED CONTENT                         ║
║     Initialisation du Template Maître                    ║
╚══════════════════════════════════════════════════════════╝
${Colors.RESET}`);

  const client = new BaserowClient(BASEROW_URL, BASEROW_TOKEN!);

  // ========== 1. CONFIG_GLOBAL ==========
  log.category('1. CONFIG_GLOBAL (Table 808)');

  try {
    log.step('Récupération des lignes existantes...');
    const configRows = await client.listRows(TABLE_CONFIG_GLOBAL_ID);

    const configData = {
      Nom: 'Votre Site Web',
      SEO_Metadata: JSON.stringify(SEED_SEO_METADATA),
      Branding: JSON.stringify(SEED_BRANDING),
      Contact: JSON.stringify(SEED_CONTACT),
      Assets: JSON.stringify(SEED_ASSETS),
      Premium: JSON.stringify(SEED_PREMIUM),
      Footer: JSON.stringify(SEED_FOOTER),
      Actif: true,
    };

    if (configRows.results.length > 0) {
      const existingRow = configRows.results[0];
      const rowId = existingRow.id as number;
      log.step(`Mise à jour de la ligne existante (ID: ${rowId})...`);
      await client.updateRow(TABLE_CONFIG_GLOBAL_ID, rowId, configData);
      log.success('Configuration globale mise à jour');
    } else {
      log.step('Création d\'une nouvelle ligne...');
      await client.createRow(TABLE_CONFIG_GLOBAL_ID, configData);
      log.success('Configuration globale créée');
    }

    log.dim('→ Nom: "Votre Site Web"');
    log.dim('→ Couleur primaire: #3B82F6 (Bleu Roi)');
    log.dim('→ Couleur accent: #10B981 (Vert Émeraude)');
    log.dim('→ Police: Inter');
  } catch (err) {
    log.error(`Erreur Config Global: ${err}`);
  }

  // ========== 2. SECTIONS ==========
  log.category('2. SECTIONS (Table 809)');

  try {
    log.step('Récupération des sections existantes...');
    const sectionsRows = await client.listRows(TABLE_SECTIONS_ID);

    // Supprimer les sections existantes
    if (sectionsRows.results.length > 0) {
      log.step(`Suppression de ${sectionsRows.results.length} section(s) existante(s)...`);
      for (const row of sectionsRows.results) {
        await client.deleteRow(TABLE_SECTIONS_ID, row.id as number);
        await sleep(100); // Rate limiting
      }
      log.success('Sections supprimées');
    }

    // Créer les nouvelles sections
    const sections = [
      {
        name: 'HERO',
        type: SECTION_TYPE_IDS.hero,
        order: 1,
        content: SEED_HERO_CONTENT,
        design: SEED_HERO_DESIGN,
      },
      {
        name: 'SERVICES',
        type: SECTION_TYPE_IDS.services,
        order: 2,
        content: SEED_SERVICES_CONTENT,
        design: {},
      },
      {
        name: 'TESTIMONIALS',
        type: SECTION_TYPE_IDS.testimonials,
        order: 3,
        content: SEED_TESTIMONIALS_CONTENT,
        design: {},
      },
      {
        name: 'FAQ',
        type: SECTION_TYPE_IDS.faq,
        order: 4,
        content: SEED_FAQ_CONTENT,
        design: {},
      },
      {
        name: 'CONTACT',
        type: SECTION_TYPE_IDS.contact,
        order: 5,
        content: SEED_CONTACT_CONTENT,
        design: {},
      },
      {
        name: 'ZOOM',
        type: 3482, // ID récupéré dynamiquement: 3482
        order: 6,
        content: {
          titre: 'Exploration Infinie',
          sousTitre: 'Plongez dans les détails comme jamais auparavant.',
          instructionText: 'Scrollez pour zoomer',
          layers: [
            {
              id: 'layer_1',
              imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Space
              title: 'Cosmos',
              description: 'Le début du voyage',
              focalPointX: 50,
              focalPointY: 50
            },
            {
              id: 'layer_2',
              imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop', // Earth
              title: 'Orbite',
              description: 'Notre point bleu pâle',
              focalPointX: 30,
              focalPointY: 40
            },
            {
              id: 'layer_3',
              imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2068&auto=format&fit=crop', // Canyon
              title: 'Terre',
              description: 'Retour à la nature',
              focalPointX: 50,
              focalPointY: 50
            }
          ],
          design: {
            variant: 'contained',
            transitionDuration: 800,
            zoomIntensity: 2.5,
            showIndicators: true,
            showProgress: true,
            enableSound: false
          }
        },
        design: {},
      },
    ];

    for (const section of sections) {
      log.step(`Création de la section ${section.name}...`);

      const sectionData = {
        Nom: section.name,
        Type: section.type,
        Is_Active: true,
        Order: String(section.order),
        Content: JSON.stringify(section.content),
        Design: JSON.stringify(section.design),
        Page: 'home',
        Actif: true,
      };

      await client.createRow(TABLE_SECTIONS_ID, sectionData);
      log.success(`Section ${section.name} créée (Order: ${section.order})`);
      await sleep(150); // Rate limiting
    }
  } catch (err) {
    log.error(`Erreur Sections: ${err}`);
  }

  // ========== 3. RÉSUMÉ ==========
  log.category('3. RÉSUMÉ');

  console.log(`
${Colors.GREEN}${Colors.BOLD}
┌──────────────────────────────────────────────────────────┐
│  ✅ SEEDING TERMINÉ AVEC SUCCÈS                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📋 CONFIG_GLOBAL (Table 808)                            │
│     → Nom: "Votre Site Web"                              │
│     → Meta: "Bienvenue sur votre nouveau site"           │
│     → Couleurs: Bleu Roi (#3B82F6) + Émeraude (#10B981)  │
│                                                          │
│  📦 SECTIONS (Table 809)                                 │
│     1. HERO       - Titre principal + CTA                │
│     2. SERVICES   - 3 services exemples                  │
│     3. TESTIMONIALS - 2 témoignages exemples             │
│     4. FAQ        - 3 questions/réponses                 │
│     5. CONTACT    - Formulaire de contact                │
│                                                          │
└──────────────────────────────────────────────────────────┘
${Colors.RESET}`);

  log.info('Le template FACTORY_V2 est maintenant prêt à être dupliqué !');
  log.dim('→ Chaque texte est pédagogique et guide le client');
  log.dim('→ Le contenu peut être modifié depuis l\'admin Baserow');
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

seedFactoryContent().catch(err => {
  log.error(`Erreur fatale: ${err}`);
  process.exit(1);
});

