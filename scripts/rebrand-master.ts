#!/usr/bin/env npx tsx
/**
 * ============================================
 * FACTORY V2 - REBRAND MASTER DATABASE
 * ============================================
 * 
 * Script de rebranding COMPLET du template maître FACTORY_V2.
 * Remplace TOUT le contenu par le thème "Nouveau Client" professionnel
 * avec du contenu pédagogique pour guider les nouveaux clients.
 * 
 * Usage:
 *   npx tsx scripts/rebrand-master.ts
 * 
 * Tables ciblées (MASTER DATABASE):
 *   - CONFIG_GLOBAL (808) : Configuration globale du site
 *   - SECTIONS (809) : Sections de la page d'accueil
 * 
 * @author MICK-SOLUTIONS
 * @version 2.0.0 - Corporate Light Blue Theme
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// CONFIGURATION - MASTER DATABASE IDs
// ============================================

const BASEROW_URL = 'https://baserow.mick-solutions.ch';

// IDs FIXES de la Master Database Factory V2
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
  BLUE: '\x1b[94m',
  WHITE: '\x1b[97m',
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
  category: (msg: string) => console.log(`\n${Colors.BLUE}${Colors.BOLD}═══ ${msg} ═══${Colors.RESET}`),
  dim: (msg: string) => console.log(`${Colors.DIM}   ${msg}${Colors.RESET}`),
  brand: (msg: string) => console.log(`${Colors.WHITE}${Colors.BOLD}   🎨 ${msg}${Colors.RESET}`),
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
}

// ============================================
// NOUVEAU THÈME: "NOUVEAU CLIENT" - CORPORATE LIGHT BLUE
// ============================================

// Images Unsplash professionnelles neutres
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
  office: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
  team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  contact: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&q=80',
};

// ========== SEO Metadata ==========
const NEW_SEO_METADATA = {
  metaTitre: 'Bienvenue sur votre nouveau site',
  metaDescription: 'Remplacez cette description par une présentation de votre activité. Elle apparaîtra sur Google (160 caractères max recommandés).',
  siteUrl: 'https://votre-domaine.com',
  motsCles: 'mot-clé-1, mot-clé-2, votre-secteur',
  langue: 'fr',
  locale: 'fr_CH',
  robotsIndex: true,
  sitemapPriority: 0.8,
};

// ========== Branding - Corporate Light Blue ==========
const NEW_BRANDING = {
  couleurPrimaire: '#2563EB',     // Professional Blue
  couleurAccent: '#0EA5E9',       // Sky Blue (accent)
  couleurBackground: '#EFF6FF',   // Blue-50 (fond bleu très clair)
  couleurText: '#1E3A5F',         // Dark Blue Navy
  fontPrimary: 'Inter',
  fontHeading: 'Inter',
  fontCustomUrl: null,
  borderRadius: 'Medium',         // Enum: None, Small, Medium, Large, Full
  patternBackground: 'None',      // Enum: None, Grid, Dots, etc.
  themeGlobal: 'Corporate',       // Enum: Minimal, Corporate, Electric, Bold, AI
};

// ========== Contact ==========
const NEW_CONTACT = {
  email: 'contact@votre-domaine.com',
  telephone: '+41 XX XXX XX XX',
  adresse: 'Votre adresse complète, Code Postal Ville',
  adresseCourte: 'Ville, Suisse',
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

// ========== Assets ==========
const NEW_ASSETS = {
  logoUrl: null,
  logoDarkUrl: null,
  logoSvgCode: null,
  faviconUrl: null,
  ogImageUrl: null,
};

// ========== Premium ==========
const NEW_PREMIUM = {
  isPremium: false,
  premiumUntil: null,
  customDomain: null,
  customCss: null,
  customJs: null,
  featureFlags: [],
  rateLimitApi: 1000,
  maintenanceMode: false,
};

// ========== Footer ==========
const NEW_FOOTER = {
  copyrightTexte: '© Votre Entreprise. Tous droits réservés.',
  paysHebergement: 'Hébergé en Suisse 🇨🇭',
  showLegalLinks: true,
  customFooterText: null,
  footerCtaText: 'Contactez-nous',
  footerCtaUrl: '#contact',
  footerLogoSize: 36,
  footerLogoAnimation: 'none',
  footerVariant: 'Minimal',       // Enum: Minimal, Corporate, Electric, etc.
};

// ========== Animations ==========
const NEW_ANIMATIONS = {
  enableAnimations: true,
  animationSpeed: 'Normal',       // Enum: Slow, Normal, Fast
  scrollEffect: 'Fade',           // Enum: None, Fade, Slide, Scale
  hoverEffect: 'Scale',           // Enum: None, Scale, Lift, Glow
};

// ========== AI Config ==========
const NEW_AI_CONFIG = {
  aiMode: 'Disabled',             // Enum: Disabled, Chat, Assistant
  aiProvider: null,
  aiModel: null,
  aiSystemPrompt: null,
  aiWelcomeMessage: 'Bonjour ! Comment puis-je vous aider ?',
};

// ========== Integrations ==========
const NEW_INTEGRATIONS = {
  umamiSiteId: null,
  umamiScriptUrl: null,
  gaMeasurementId: null,
  gtmContainerId: null,
  hotjarSiteId: null,
  facebookPixelId: null,
};

// ============================================
// CONTENU PÉDAGOGIQUE DES SECTIONS
// ============================================

interface SectionUpdate {
  Content: string;
  Design: string;
}

function getSectionContent(sectionType: string): SectionUpdate {
  switch (sectionType) {
    // ========== HERO ==========
    case 'hero':
      return {
        Content: JSON.stringify({
          // Utilise les noms de champs du schéma HeroContentSchema
          titre: 'Votre Proposition de Valeur. En Une Phrase.',
          sousTitre: 'Décrivez ici ce que vous faites et pourquoi vos clients devraient vous choisir. Cette phrase est la première chose que vos visiteurs liront.',
          badge: '✨ Bienvenue !',
          ctaPrincipal: {
            text: 'Découvrir nos services',
            url: '#services',
          },
          ctaSecondaire: {
            text: 'Nous contacter',
            url: '#contact',
          },
          backgroundUrl: IMAGES.hero,
          videoUrl: null,
          aiPrompt: null,
          trustStats: [
            { value: '10+', label: 'Années d\'expérience' },
            { value: '100%', label: 'Satisfaction client' },
            { value: '24h', label: 'Délai de réponse' },
          ],
        }),
        Design: JSON.stringify({
          variant: 'Corporate',
          height: 'Tall',
          logoAnimation: 'none',
          logoSize: 280,
          logoFrameStyle: 'Square',
          textAnimation: 'None',
        }),
      };

    // ========== SERVICES ==========
    case 'services':
      return {
        Content: JSON.stringify({
          titre: 'Nos Services',
          sousTitre: 'Découvrez ce que nous pouvons faire pour vous. Chaque service ci-dessous est entièrement personnalisable.',
          services: [
            {
              id: 'service-1',
              titre: 'Service Principal',
              description: 'Décrivez ici votre service phare. Expliquez clairement ce que vous proposez et les bénéfices pour le client.',
              icone: 'Briefcase',
              pointsCles: ['Avantage clé 1', 'Avantage clé 2', 'Avantage clé 3'],
              tarif: 'Sur devis',
              type: null,
            },
            {
              id: 'service-2',
              titre: 'Service Secondaire',
              description: 'Un autre service important que vous proposez. Soyez précis et orienté bénéfice client.',
              icone: 'Settings',
              pointsCles: ['Point fort 1', 'Point fort 2'],
              tarif: null,
              type: null,
            },
            {
              id: 'service-3',
              titre: 'Service Complémentaire',
              description: 'Un service additionnel ou une option qui vous différencie de la concurrence.',
              icone: 'Star',
              pointsCles: ['Atout 1', 'Atout 2'],
              tarif: null,
              type: null,
            },
          ],
        }),
        Design: JSON.stringify({
          variant: 'Cards',
          cardStyle: 'Shadow',
          hoverEffect: 'Scale',
        }),
      };

    // ========== TESTIMONIALS ==========
    case 'testimonials':
      return {
        Content: JSON.stringify({
          titre: 'Ce que disent nos clients',
          sousTitre: 'Les témoignages rassurent vos futurs clients. Demandez l\'autorisation avant d\'afficher un avis.',
          temoignages: [
            {
              id: 'temoignage-1',
              nom: 'Marie Dupont',
              poste: 'Directrice Générale',
              entreprise: 'Entreprise ABC',
              avis: 'Remplacez ce texte par un vrai témoignage client. Un avis authentique est plus convaincant qu\'un texte générique.',
              note: 5,
              photoUrl: null,
            },
            {
              id: 'temoignage-2',
              nom: 'Jean Martin',
              poste: 'Fondateur',
              entreprise: 'Startup XYZ',
              avis: 'Ajoutez ici un deuxième témoignage. Variez les profils pour montrer la diversité de votre clientèle.',
              note: 5,
              photoUrl: null,
            },
            {
              id: 'temoignage-3',
              nom: 'Sophie Bernard',
              poste: 'Responsable Projet',
              entreprise: 'Grande Entreprise',
              avis: 'Un troisième avis renforce votre crédibilité. Privilégiez des témoignages spécifiques plutôt que vagues.',
              note: 5,
              photoUrl: null,
            },
          ],
        }),
        Design: JSON.stringify({
          variant: 'Cards',
          showStars: true,
          showPhotos: true,
        }),
      };

    // ========== FAQ ==========
    case 'faq':
      return {
        Content: JSON.stringify({
          titre: 'Questions Fréquentes',
          sousTitre: 'Retrouvez ici les réponses aux questions les plus courantes. Cette section réduit les demandes de support.',
          questions: [
            {
              id: 'faq-1',
              question: 'Comment puis-je modifier ce contenu ?',
              reponse: 'Connectez-vous au panneau d\'administration (/admin/v2), sélectionnez la section FAQ et modifiez les champs. Les changements sont visibles immédiatement.',
            },
            {
              id: 'faq-2',
              question: 'Puis-je ajouter d\'autres questions ?',
              reponse: 'Oui ! Dans l\'interface d\'administration, cliquez sur le bouton "+" pour ajouter autant de questions que nécessaire.',
            },
            {
              id: 'faq-3',
              question: 'Comment désactiver une section ?',
              reponse: 'Chaque section peut être masquée en cliquant sur l\'icône "œil" dans l\'admin. La section reste configurable mais invisible sur le site.',
            },
            {
              id: 'faq-4',
              question: 'Les modifications sont-elles immédiates ?',
              reponse: 'Oui, toutes les modifications sont appliquées en temps réel. Aucune action technique n\'est requise de votre part.',
            },
          ],
        }),
        Design: JSON.stringify({
          variant: 'Accordion',
          defaultOpen: 0,
        }),
      };

    // ========== CONTACT ==========
    case 'contact':
      return {
        Content: JSON.stringify({
          titre: 'Contactez-nous',
          sousTitre: 'Une question, un projet ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.',
          email: 'contact@votre-domaine.com',
          telephone: '+41 XX XXX XX XX',
          adresse: 'Votre adresse, Code Postal Ville, Suisse',
          horaireOuverture: 'Lun-Ven: 9h-18h',
          showMap: false,
          showPhone: true,
          showEmail: true,
          showHoraires: true,
          formFields: {
            showCompany: true,
            showPhone: true,
            showSubject: true,
            requiredFields: ['name', 'email', 'message'],
          },
        }),
        Design: JSON.stringify({
          variant: 'Form',
          layout: 'split',
          showImage: true,
          backgroundUrl: IMAGES.contact,
        }),
      };

    // ========== ADVANTAGES ==========
    case 'advantages':
      return {
        Content: JSON.stringify({
          titre: 'Pourquoi nous choisir ?',
          sousTitre: 'Découvrez les avantages qui nous différencient de la concurrence.',
          avantages: [
            {
              id: 'avantage-1',
              titre: 'Expertise Reconnue',
              description: 'Décrivez votre premier avantage concurrentiel.',
              icone: 'Award',
            },
            {
              id: 'avantage-2',
              titre: 'Accompagnement Personnalisé',
              description: 'Expliquez comment vous accompagnez vos clients.',
              icone: 'Users',
            },
            {
              id: 'avantage-3',
              titre: 'Résultats Garantis',
              description: 'Mettez en avant vos garanties ou résultats.',
              icone: 'CheckCircle',
            },
          ],
        }),
        Design: JSON.stringify({
          variant: 'Cards',
          cardStyle: 'Shadow',
        }),
      };

    // ========== GALLERY ==========
    case 'gallery':
      return {
        Content: JSON.stringify({
          titre: 'Notre Galerie',
          sousTitre: 'Découvrez nos réalisations, notre équipe et notre environnement de travail.',
          images: [
            { id: 'img-1', url: IMAGES.office, alt: 'Bureau', caption: 'Notre espace de travail' },
            { id: 'img-2', url: IMAGES.team, alt: 'Équipe', caption: 'Notre équipe' },
          ],
        }),
        Design: JSON.stringify({
          variant: 'Grid',
          columns: 2,
          showCaptions: true,
          lightbox: true,
        }),
      };

    // ========== PORTFOLIO ==========
    case 'portfolio':
      return {
        Content: JSON.stringify({
          titre: 'Nos Réalisations',
          sousTitre: 'Découvrez quelques exemples de projets que nous avons réalisés pour nos clients.',
          projets: [
            {
              id: 'projet-1',
              titre: 'Projet Client A',
              description: 'Description courte du projet, du défi relevé et des résultats obtenus.',
              imageUrl: IMAGES.office,
              categorie: 'Catégorie 1',
              client: 'Nom du Client',
              annee: '2024',
              lien: null,
            },
            {
              id: 'projet-2',
              titre: 'Projet Client B',
              description: 'Un autre exemple de réalisation. Les visuels sont importants.',
              imageUrl: IMAGES.team,
              categorie: 'Catégorie 2',
              client: 'Autre Client',
              annee: '2024',
              lien: null,
            },
          ],
        }),
        Design: JSON.stringify({
          variant: 'Grid',
          columns: 2,
          showFilters: true,
          showDetails: true,
        }),
      };

    // ========== TRUST ==========
    case 'trust':
      return {
        Content: JSON.stringify({
          titre: 'Ils nous font confiance',
          sousTitre: 'Nos partenaires et clients de référence.',
          logos: [],
          stats: [
            { value: '50+', label: 'Clients accompagnés' },
            { value: '98%', label: 'Taux de satisfaction' },
            { value: '10+', label: 'Années d\'expérience' },
          ],
          certifications: [],
        }),
        Design: JSON.stringify({
          variant: 'Stats',
          showLogos: true,
          showStats: true,
          grayscale: true,
        }),
      };

    // ========== BLOG ==========
    case 'blog':
      return {
        Content: JSON.stringify({
          titre: 'Actualités & Conseils',
          sousTitre: 'Retrouvez nos derniers articles et conseils d\'experts.',
          articles: [],
          showExcerpt: true,
          showDate: true,
          showAuthor: true,
          postsPerPage: 6,
        }),
        Design: JSON.stringify({
          variant: 'Grid',
          columns: 3,
          showImages: true,
          cardStyle: 'Shadow',
        }),
      };

    // ========== AI-ASSISTANT ==========
    case 'ai-assistant':
      return {
        Content: JSON.stringify({
          titre: 'Assistant Virtuel',
          sousTitre: 'Posez vos questions, notre assistant IA est là pour vous aider.',
          welcomeMessage: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
          placeholderText: 'Écrivez votre question ici...',
          suggestedQuestions: [
            'Quels services proposez-vous ?',
            'Comment vous contacter ?',
            'Quels sont vos tarifs ?',
          ],
        }),
        Design: JSON.stringify({
          variant: 'Chat',
          position: 'bottom-right',
          showSuggestions: true,
        }),
      };

    // ========== CUSTOM / DEFAULT ==========
    case 'custom':
    default:
      return {
        Content: JSON.stringify({
          titre: 'Section Personnalisée',
          sousTitre: 'Cette section est entièrement personnalisable selon vos besoins.',
          contenuHtml: '<p>Ajoutez ici votre contenu personnalisé. Vous pouvez utiliser du HTML.</p>',
        }),
        Design: JSON.stringify({
          variant: 'Default',
          padding: 'normal',
          fullWidth: false,
        }),
      };
  }
}

// ============================================
// MAIN REBRAND FUNCTION
// ============================================

async function rebrandMasterDatabase(): Promise<void> {
  console.log(`
${Colors.BLUE}${Colors.BOLD}
╔══════════════════════════════════════════════════════════════════╗
║    🎨 FACTORY V2 - REBRAND MASTER DATABASE                       ║
║    Thème: "Nouveau Client" - Corporate Light Blue                ║
╚══════════════════════════════════════════════════════════════════╝
${Colors.RESET}`);

  log.info(`Table CONFIG_GLOBAL: ${TABLE_CONFIG_GLOBAL_ID}`);
  log.info(`Table SECTIONS: ${TABLE_SECTIONS_ID}`);

  const client = new BaserowClient(BASEROW_URL, BASEROW_TOKEN!);

  // ========== 1. CONFIG_GLOBAL ==========
  log.category('1. MISE À JOUR CONFIG_GLOBAL');

  try {
    log.step('Récupération de la configuration existante...');
    const configRows = await client.listRows(TABLE_CONFIG_GLOBAL_ID);

    if (configRows.results.length === 0) {
      throw new Error('Aucune ligne trouvée dans CONFIG_GLOBAL');
    }

    const existingRow = configRows.results[0];
    const rowId = existingRow.id as number;

    log.step(`Mise à jour complète (Row ID: ${rowId})...`);

    const configData = {
      Nom: 'Mon Nouveau Site Web',
      Actif: true,
      SEO_Metadata: JSON.stringify(NEW_SEO_METADATA),
      Branding: JSON.stringify(NEW_BRANDING),
      Contact: JSON.stringify(NEW_CONTACT),
      Assets: JSON.stringify(NEW_ASSETS),
      Premium: JSON.stringify(NEW_PREMIUM),
      Footer: JSON.stringify(NEW_FOOTER),
      Animations: JSON.stringify(NEW_ANIMATIONS),
      AI_Config: JSON.stringify(NEW_AI_CONFIG),
      Integrations: JSON.stringify(NEW_INTEGRATIONS),
    };

    await client.updateRow(TABLE_CONFIG_GLOBAL_ID, rowId, configData);
    log.success('Configuration globale mise à jour');

    console.log('');
    log.brand('Nouveau thème "Nouveau Client" appliqué:');
    log.dim(`→ Couleur primaire: ${NEW_BRANDING.couleurPrimaire} (Professional Blue)`);
    log.dim(`→ Couleur accent: ${NEW_BRANDING.couleurAccent} (Sky Blue)`);
    log.dim(`→ Background: ${NEW_BRANDING.couleurBackground} (Light Blue)`);
    log.dim(`→ Texte: ${NEW_BRANDING.couleurText} (Dark Navy)`);
    log.dim(`→ Police: ${NEW_BRANDING.fontPrimary}`);
    log.dim(`→ Thème: ${NEW_BRANDING.themeGlobal}`);

  } catch (err) {
    log.error(`Erreur Config Global: ${err}`);
    throw err;
  }

  // ========== 2. SECTIONS ==========
  log.category('2. MISE À JOUR DES SECTIONS');

  try {
    log.step('Récupération des sections existantes...');
    const sectionsRows = await client.listRows(TABLE_SECTIONS_ID);

    if (sectionsRows.results.length === 0) {
      log.warning('Aucune section trouvée.');
    } else {
      log.info(`${sectionsRows.results.length} section(s) trouvée(s)`);

      for (const row of sectionsRows.results) {
        const rowId = row.id as number;
        const sectionName = row.Nom as string || 'Sans nom';
        
        // Récupérer le type de section
        let sectionType = 'custom';
        const typeField = row.Type as { id: number; value: string } | string | null;
        
        if (typeField) {
          if (typeof typeField === 'object' && typeField.value) {
            sectionType = typeField.value.toLowerCase();
          } else if (typeof typeField === 'string') {
            sectionType = typeField.toLowerCase();
          }
        }

        log.step(`Mise à jour: ${sectionName} (Type: ${sectionType}, ID: ${rowId})`);

        // Obtenir le contenu pédagogique pour ce type
        const sectionUpdate = getSectionContent(sectionType);

        await client.updateRow(TABLE_SECTIONS_ID, rowId, sectionUpdate as unknown as Record<string, unknown>);
        log.success(`Section "${sectionName}" → contenu pédagogique appliqué`);

        await sleep(150); // Rate limiting
      }
    }

  } catch (err) {
    log.error(`Erreur Sections: ${err}`);
    throw err;
  }

  // ========== 3. RÉSUMÉ ==========
  log.category('3. RÉSUMÉ DU REBRANDING');

  console.log(`
${Colors.GREEN}${Colors.BOLD}
┌────────────────────────────────────────────────────────────────────┐
│  ✅ REBRANDING TERMINÉ AVEC SUCCÈS                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  🎨 THÈME: "Nouveau Client" - Corporate Light Blue                 │
│     → Background: ${NEW_BRANDING.couleurBackground} (Bleu très clair)                    │
│     → Primary: ${NEW_BRANDING.couleurPrimaire} (Bleu professionnel)                    │
│     → Accent: ${NEW_BRANDING.couleurAccent} (Bleu ciel)                            │
│     → Text: ${NEW_BRANDING.couleurText} (Bleu marine foncé)                       │
│                                                                    │
│  📝 CONTENU: 100% Pédagogique                                      │
│     → Chaque champ explique son rôle                               │
│     → Textes prêts à être personnalisés                            │
│     → Tous les champs sont remplis                                 │
│                                                                    │
│  🚀 PRÊT À DUPLIQUER                                               │
│     → Template complet pour nouveaux clients                       │
│     → Aucun contenu "Lorem Ipsum" ou ancien                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
${Colors.RESET}`);

  log.info('La Master Database est maintenant prête !');
  log.dim('→ Thème Corporate Light Blue');
  log.dim('→ Contenu pédagogique complet');
  log.dim('→ Tous les champs remplis');
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

rebrandMasterDatabase().catch(err => {
  log.error(`Erreur fatale: ${err}`);
  process.exit(1);
});
