// ============================================
// BASEROW API CLIENT - Mick Solutions Website
// ============================================
// Client API pour récupérer les données dynamiques.
// Supporte le mode White Label avec GlobalSettingsComplete.

import { 
  GlobalSettingsComplete, 
  GlobalSettingsLegacy,
  DEFAULT_SETTINGS,
  AnimationStyleType,
  ANIMATION_STYLES
} from './types/global-settings';

const BASEROW_BASE_URL = 'https://baserow.mick-solutions.ch/api/database/rows/table';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const DATABASE_ID = process.env.NEXT_PUBLIC_BASEROW_DATABASE_ID || '52';

// Debug en production : log si le token est défini (sans révéler le token)
if (typeof window === 'undefined') {
  console.log(`[Baserow] Token status: ${BASEROW_TOKEN ? '✅ Configured' : '❌ MISSING - Set BASEROW_API_TOKEN env var'}`);
  console.log(`[Baserow] Database ID: ${DATABASE_ID}`);
}

// ============================================
// TABLE IDS PAR DATABASE (Multi-tenant / White Label)
// ============================================
// Mapping des IDs de tables pour chaque database client.
// Ajouter une nouvelle entrée pour chaque nouveau client.

type TableIds = {
  SERVICES: number;
  PORTFOLIO: number;
  REVIEWS: number;
  GLOBAL: number;
  FAQ: number;
  LEGAL_DOCS: number;
  ADVANTAGES: number;
  TRUST_POINTS: number;
  GALLERY: number;
};

const DATABASE_TABLE_IDS: Record<string, TableIds> = {
  // Database 52 - Mick Solutions (principal)
  '52': {
    SERVICES: 748,
    PORTFOLIO: 749,
    REVIEWS: 750,
    GLOBAL: 751,
    FAQ: 752,
    LEGAL_DOCS: 753,
    ADVANTAGES: 757,
    TRUST_POINTS: 758,
    GALLERY: 781,
  },
  // Database 199 - Client S-VF (Sécurité Voie Ferrée)
  '199': {
    SERVICES: 785,
    PORTFOLIO: 786,
    REVIEWS: 787,
    GLOBAL: 788,
    FAQ: 789,
    LEGAL_DOCS: 790,
    ADVANTAGES: 792,
    TRUST_POINTS: 793,
    GALLERY: 794,
  },
  // Database 200 - Template pour nouveaux clients
  '200': {
    SERVICES: 795,
    PORTFOLIO: 796,
    REVIEWS: 797,
    GLOBAL: 798,
    FAQ: 799,
    LEGAL_DOCS: 800,
    ADVANTAGES: 802,
    TRUST_POINTS: 803,
    GALLERY: 804,
  },
};

// Sélectionner les bons TABLE_IDs selon la database configurée
const TABLE_IDS: TableIds = DATABASE_TABLE_IDS[DATABASE_ID] || DATABASE_TABLE_IDS['52'];

if (typeof window === 'undefined' && !DATABASE_TABLE_IDS[DATABASE_ID]) {
  console.warn(`[Baserow] ⚠️ Database ID "${DATABASE_ID}" non configurée, fallback sur DB 52 (Mick Solutions)`);
}

// ============================================
// INTERFACES
// ============================================

// Tag Baserow (format renvoyé par l'API pour les select multiple)
export interface BaserowTag {
  id: number;
  value: string;
  color: string;
}

// Type Baserow (format renvoyé par l'API pour les select simple)
export interface BaserowSelectOption {
  id: number;
  value: string;
  color: string;
}

export interface Service {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Ordre: string | null;
  // Nouveaux champs
  Tagline: string | null;
  tags: BaserowTag[];
  points_cle: string | null;
  type: BaserowSelectOption | null;
  tarif: string | null;
}

export interface Project {
  id: number;
  Nom: string;
  Slug: string;
  Tags: { id: number; value: string; color: string }[];
  DescriptionCourte: string;
  ImageCouverture: { url: string; name: string }[];
  LienSite: string;
  Statut: { id: number; value: string; color: string };
  Ordre: string | null;
}

export interface Review {
  id: number;
  NomClient: string;
  PosteEntreprise: string;
  Photo: { url: string; name: string }[];
  Message: string;
  Note: string;
  Afficher: boolean;
}

// Réexporter les types depuis le fichier dédié
export type { GlobalSettingsComplete, GlobalSettingsLegacy } from './types/global-settings';
export { DEFAULT_SETTINGS, isCompleteSettings } from './types/global-settings';

// Alias pour rétro-compatibilité
export type GlobalSettings = GlobalSettingsLegacy;

export interface FAQ {
  id: number;
  Question: string;
  Reponse: string;
  Ordre: string | null;
}

export interface Advantage {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Highlight: string;
  Ordre: string | null;
}

export interface TrustPoint {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Badge: string;
  Ordre: string | null;
}

export interface LegalDoc {
  id: number;
  Titre: string;
  Slug: string;
  Contenu: string;
  DateMiseAJour: string | null;
  IsActive: boolean;
}

// Types d'affichage pour la galerie
export type GalleryDisplayType = 'Slider' | 'Grille' | 'Zoom';

export interface GalleryItem {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
  Ordre: string | null;
  TypeAffichage: GalleryDisplayType | null;
}

// ============================================
// RAW BASEROW RESPONSE TYPES (snake_case)
// ============================================

interface BaserowProjectRow {
  id: number;
  Nom: string;
  Slug: string;
  Tags: { id: number; value: string; color: string }[];
  'Description courte': string;
  'Image de couverture': { url: string; name: string }[];
  'Lien du site': string;
  Statut: { id: number; value: string; color: string };
  Ordre: string | null;
}

interface BaserowReviewRow {
  id: number;
  'Nom du client': string;
  'Poste / Entreprise': string;
  Photo: { url: string; name: string }[];
  Message: string;
  Note: string;
  Afficher: boolean;
}

/**
 * Interface Baserow complète pour le mode White Label.
 * Correspond exactement aux champs de la table 751 (SITEWEB Global_Infos).
 */
interface BaserowGlobalRowComplete {
  id: number;
  
  // === Champs de base ===
  Email: string;
  'Lien Linkedin': string;
  'Titre Hero': string;
  'Sous-titre Hero': string;
  'Lien Bouton Appel': string;
  
  // === Identité ===
  'Nom Site'?: string;
  'Slogan'?: string;
  'Initiales Logo'?: string;
  
  // === Assets ===
  'Logo URL'?: string;
  'Logo Dark URL'?: string;
  'Favicon URL'?: string;
  'OG Image URL'?: string;
  
  // === SEO ===
  'Meta Titre'?: string;
  'Meta Description'?: string;
  'Site URL'?: string;
  'Mots Cles'?: string;
  'Langue'?: string;
  'Locale'?: string;  // Champ à créer dans Baserow
  
  // === Branding ===
  'Couleur Primaire'?: string;
  'Couleur Accent'?: string;
  
  // === Contact ===
  'Adresse'?: string;
  'Telephone'?: string;  // Champ à créer dans Baserow
  
  // === Hero ===
  'Badge Hero'?: string;
  'CTA Principal'?: string;
  'CTA Secondaire'?: string;
  
  // === Trust Stats ===
  'Trust Stat 1 Value'?: string;
  'Trust Stat 1 Label'?: string;
  'Trust Stat 2 Value'?: string;  // Champ à créer dans Baserow
  'Trust Stat 2 Label'?: string;  // Champ à créer dans Baserow
  'Trust Stat 3 Value'?: string;  // Champ à créer dans Baserow
  'Trust Stat 3 Label'?: string;  // Champ à créer dans Baserow
  
  // === Analytics ===
  'Umami Site ID'?: string;       // Champ à créer dans Baserow
  'Umami Script URL'?: string;    // Champ à créer dans Baserow
  
  // === Footer ===
  'Copyright Texte'?: string;
  'Pays Hebergement'?: string;

  // === Animation & Branding dynamique ===
  'Animation Style'?: { id: number; value: string; color: string } | null;
  'Logo SVG Code'?: string;
}

// Alias pour rétro-compatibilité
interface BaserowGlobalRow {
  id: number;
  Email: string;
  'Lien Linkedin': string;
  'Titre Hero': string;
  'Sous-titre Hero': string;
  'Lien Bouton Appel': string;
}

interface BaserowLegalDocRow {
  id: number;
  Titre: string;
  Slug: string;
  Contenu: string;
  Date_Mise_a_jour: string | null;
  Is_Active: boolean;
}

interface BaserowGalleryRow {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
  Ordre: string | null;
  'Type Affichage': { id: number; value: string; color: string } | null;
}

// ============================================
// GENERIC FETCH FUNCTION
// ============================================

async function fetchBaserow<T>(
  tableId: number,
  options?: {
    filters?: string;
    orderBy?: string;
    size?: number;
  }
): Promise<T[] | null> {
  if (!BASEROW_TOKEN) {
    console.error('❌ [Baserow] BASEROW_API_TOKEN non défini dans les variables d\'environnement');
    console.error('   → Sur Vercel: Settings > Environment Variables > Ajouter BASEROW_API_TOKEN');
    return null;
  }

  try {
    const params = new URLSearchParams({ user_field_names: 'true' });
    
    if (options?.filters) {
      params.append('filters', options.filters);
    }
    if (options?.orderBy) {
      params.append('order_by', options.orderBy);
    }
    if (options?.size) {
      params.append('size', options.size.toString());
    }

    const url = `${BASEROW_BASE_URL}/${tableId}/?${params.toString()}`;
    
    console.log(`[Baserow] Fetching table ${tableId}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${BASEROW_TOKEN}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }, // Cache 1 minute (réduit pour rafraîchir plus souvent)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Baserow] Erreur table ${tableId}: HTTP ${response.status}`);
      console.error(`   → Response: ${errorText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ [Baserow] Table ${tableId}: ${data.results?.length ?? 0} rows fetched`);
    return data.results as T[];
  } catch (error) {
    console.error(`❌ [Baserow] Exception table ${tableId}:`, error);
    return null;
  }
}

// ============================================
// API FUNCTIONS
// ============================================

// ============================================
// RAW BASEROW SERVICE ROW TYPE
// ============================================

interface BaserowServiceRow {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Ordre: string | null;
  Tagline: string | null;
  tags: BaserowTag[];
  points_cle: string | null;
  type: BaserowSelectOption | null;
  tarif: string | null;
}

/**
 * Récupère les services depuis Baserow
 */
export async function getServices(): Promise<Service[] | null> {
  const rawServices = await fetchBaserow<BaserowServiceRow>(TABLE_IDS.SERVICES, {
    orderBy: 'Ordre',
  });

  if (!rawServices) return null;

  // Mapper les champs avec des valeurs par défaut pour les nouveaux champs
  return rawServices.map((row) => ({
    id: row.id,
    Titre: row.Titre,
    Description: row.Description,
    Icone: row.Icone,
    Ordre: row.Ordre,
    Tagline: row.Tagline || null,
    tags: row.tags || [],
    points_cle: row.points_cle || null,
    type: row.type || null,
    tarif: row.tarif || null,
  }));
}

/**
 * Récupère les projets publiés, triés par ordre
 * Filtre: Statut = "Publié" (id: 3068)
 */
export async function getProjects(): Promise<Project[] | null> {
  const rawProjects = await fetchBaserow<BaserowProjectRow>(TABLE_IDS.PORTFOLIO, {
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [
        {
          type: 'single_select_equal',
          field: 'Statut',
          value: '3068', // ID de "Publié"
        },
      ],
    }),
    orderBy: 'Ordre',
  });

  if (!rawProjects) return null;

  // Mapper les noms de champs Baserow vers notre interface
  return rawProjects.map((row) => ({
    id: row.id,
    Nom: row.Nom,
    Slug: row.Slug,
    Tags: row.Tags,
    DescriptionCourte: row['Description courte'],
    ImageCouverture: row['Image de couverture'],
    LienSite: row['Lien du site'],
    Statut: row.Statut,
    Ordre: row.Ordre,
  }));
}

/**
 * Récupère les témoignages à afficher
 * Filtre: Afficher = true
 */
export async function getReviews(): Promise<Review[] | null> {
  const rawReviews = await fetchBaserow<BaserowReviewRow>(TABLE_IDS.REVIEWS, {
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [
        {
          type: 'boolean',
          field: 'Afficher',
          value: 'true',
        },
      ],
    }),
  });

  if (!rawReviews) return null;

  // Mapper les noms de champs Baserow vers notre interface
  return rawReviews.map((row) => ({
    id: row.id,
    NomClient: row['Nom du client'],
    PosteEntreprise: row['Poste / Entreprise'],
    Photo: row.Photo,
    Message: row.Message,
    Note: row.Note,
    Afficher: row.Afficher,
  }));
}

/**
 * Récupère les paramètres globaux (première ligne de la table)
 * @deprecated Utiliser getGlobalSettingsComplete() pour le mode White Label
 */
export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  const rawSettings = await fetchBaserow<BaserowGlobalRow>(TABLE_IDS.GLOBAL, {
    size: 1,
  });

  if (!rawSettings || rawSettings.length === 0) return null;

  const row = rawSettings[0];
  return {
    id: row.id,
    email: row.Email,
    telephone: '',  // Champ legacy, utiliser getGlobalSettingsComplete()
    lienLinkedin: row['Lien Linkedin'],
    titreHero: row['Titre Hero'],
    sousTitreHero: row['Sous-titre Hero'],
    lienBoutonAppel: row['Lien Bouton Appel'],
  };
}

/**
 * Récupère les paramètres globaux complets pour le mode White Label.
 * Fusionne les données Baserow avec les valeurs par défaut.
 * Utilise un cache de 60 secondes pour les performances.
 */
export async function getGlobalSettingsComplete(): Promise<GlobalSettingsComplete> {
  const rawSettings = await fetchBaserow<BaserowGlobalRowComplete>(TABLE_IDS.GLOBAL, {
    size: 1,
  });

  // Si pas de données, retourner les valeurs par défaut
  if (!rawSettings || rawSettings.length === 0) {
    console.warn('[Baserow] Aucune donnée Global_Infos trouvée, utilisation des valeurs par défaut');
    return DEFAULT_SETTINGS;
  }

  const row = rawSettings[0];
  
  // Fusionner avec les valeurs par défaut (fallback)
  const settings: GlobalSettingsComplete = {
    id: row.id,
    
    // Identité
    nomSite: row['Nom Site'] || DEFAULT_SETTINGS.nomSite,
    slogan: row['Slogan'] || DEFAULT_SETTINGS.slogan,
    initialesLogo: row['Initiales Logo'] || DEFAULT_SETTINGS.initialesLogo,
    
    // Assets
    logoUrl: row['Logo URL'] || DEFAULT_SETTINGS.logoUrl,
    logoDarkUrl: row['Logo Dark URL'] || null,
    faviconUrl: row['Favicon URL'] || null,
    ogImageUrl: row['OG Image URL'] || null,
    
    // SEO
    metaTitre: row['Meta Titre'] || DEFAULT_SETTINGS.metaTitre,
    metaDescription: row['Meta Description'] || DEFAULT_SETTINGS.metaDescription,
    siteUrl: row['Site URL'] || DEFAULT_SETTINGS.siteUrl,
    motsCles: row['Mots Cles'] || DEFAULT_SETTINGS.motsCles,
    langue: row['Langue'] || DEFAULT_SETTINGS.langue,
    locale: row['Locale'] || DEFAULT_SETTINGS.locale,
    
    // Branding
    couleurPrimaire: row['Couleur Primaire'] || DEFAULT_SETTINGS.couleurPrimaire,
    couleurAccent: row['Couleur Accent'] || DEFAULT_SETTINGS.couleurAccent,
    
    // Contact
    email: row.Email || DEFAULT_SETTINGS.email,
    telephone: row['Telephone'] || DEFAULT_SETTINGS.telephone,
    adresse: row['Adresse'] || DEFAULT_SETTINGS.adresse,
    lienLinkedin: row['Lien Linkedin'] || DEFAULT_SETTINGS.lienLinkedin,
    lienBoutonAppel: row['Lien Bouton Appel'] || DEFAULT_SETTINGS.lienBoutonAppel,
    
    // Hero
    titreHero: row['Titre Hero'] || DEFAULT_SETTINGS.titreHero,
    sousTitreHero: row['Sous-titre Hero'] || DEFAULT_SETTINGS.sousTitreHero,
    badgeHero: row['Badge Hero'] || DEFAULT_SETTINGS.badgeHero,
    ctaPrincipal: row['CTA Principal'] || DEFAULT_SETTINGS.ctaPrincipal,
    ctaSecondaire: row['CTA Secondaire'] || DEFAULT_SETTINGS.ctaSecondaire,
    
    // Trust Stats
    trustStat1Value: row['Trust Stat 1 Value'] || DEFAULT_SETTINGS.trustStat1Value,
    trustStat1Label: row['Trust Stat 1 Label'] || DEFAULT_SETTINGS.trustStat1Label,
    trustStat2Value: row['Trust Stat 2 Value'] || DEFAULT_SETTINGS.trustStat2Value,
    trustStat2Label: row['Trust Stat 2 Label'] || DEFAULT_SETTINGS.trustStat2Label,
    trustStat3Value: row['Trust Stat 3 Value'] || DEFAULT_SETTINGS.trustStat3Value,
    trustStat3Label: row['Trust Stat 3 Label'] || DEFAULT_SETTINGS.trustStat3Label,
    
    // Analytics
    umamiSiteId: row['Umami Site ID'] || null,
    umamiScriptUrl: row['Umami Script URL'] || null,
    
    // Footer
    copyrightTexte: row['Copyright Texte'] || DEFAULT_SETTINGS.copyrightTexte,
    paysHebergement: row['Pays Hebergement'] || DEFAULT_SETTINGS.paysHebergement,

    // Animation & Branding dynamique
    animationStyle: parseAnimationStyle(row['Animation Style']?.value),
    logoSvgCode: row['Logo SVG Code'] || null,
  };

  return settings;
}

/**
 * Parse et valide le style d'animation depuis Baserow.
 * Retourne 'Mick Electric' si la valeur n'est pas valide.
 */
function parseAnimationStyle(value: string | undefined): AnimationStyleType {
  if (!value) return DEFAULT_SETTINGS.animationStyle;
  
  // Vérifier si la valeur est un style valide
  if (ANIMATION_STYLES.includes(value as AnimationStyleType)) {
    return value as AnimationStyleType;
  }
  
  return DEFAULT_SETTINGS.animationStyle;
}

/**
 * Récupère les FAQ triées par ordre
 */
export async function getFAQ(): Promise<FAQ[] | null> {
  return fetchBaserow<FAQ>(TABLE_IDS.FAQ, {
    orderBy: 'Ordre',
  });
}

/**
 * Récupère tous les documents légaux actifs (pour menus/liens)
 * Filtre: Is_Active = true
 */
export async function getAllLegalDocs(): Promise<LegalDoc[] | null> {
  try {
    const rawDocs = await fetchBaserow<BaserowLegalDocRow>(TABLE_IDS.LEGAL_DOCS);

    if (!rawDocs) return null;

    // Filtrer les documents actifs côté serveur
    return rawDocs
      .filter((row) => row.Is_Active === true)
      .map((row) => ({
        id: row.id,
        Titre: row.Titre,
        Slug: row.Slug,
        Contenu: row.Contenu,
        DateMiseAJour: row.Date_Mise_a_jour,
        IsActive: row.Is_Active,
      }));
  } catch (error) {
    console.error('❌ Erreur getAllLegalDocs:', error);
    return null;
  }
}

/**
 * Récupère un document légal spécifique par son slug
 */
export async function getLegalDocBySlug(slug: string): Promise<LegalDoc | null> {
  try {
    const rawDocs = await fetchBaserow<BaserowLegalDocRow>(TABLE_IDS.LEGAL_DOCS);

    if (!rawDocs) return null;

    // Trouver le document par slug et vérifiant qu'il est actif
    const row = rawDocs.find((doc) => doc.Slug === slug && doc.Is_Active === true);
    
    if (!row) return null;

    return {
      id: row.id,
      Titre: row.Titre,
      Slug: row.Slug,
      Contenu: row.Contenu,
      DateMiseAJour: row.Date_Mise_a_jour,
      IsActive: row.Is_Active,
    };
  } catch (error) {
    console.error(`❌ Erreur getLegalDocBySlug (${slug}):`, error);
    return null;
  }
}

// ============================================
// ADVANTAGES & TRUST POINTS (pour sections dynamiques)
// ============================================

/**
 * Valeurs par défaut pour les Avantages.
 * Utilisées si la table Baserow n'existe pas ou est vide.
 */
export const DEFAULT_ADVANTAGES: Advantage[] = [
  {
    id: 1,
    Titre: "Récupérez vos heures",
    Description: "Les tâches répétitives qui vous volent 10h/semaine ? Automatisées. Concentrez-vous sur ce qui fait grandir votre entreprise.",
    Icone: "clock",
    Highlight: "10h+ économisées/semaine",
    Ordre: "1",
  },
  {
    id: 2,
    Titre: "Réduisez vos coûts",
    Description: "Pas de salaire à payer, pas de congés, pas d'erreurs humaines. Un investissement unique pour des économies durables.",
    Icone: "trending-down",
    Highlight: "Jusqu'à 70% d'économies",
    Ordre: "2",
  },
  {
    id: 3,
    Titre: "Zéro complexité",
    Description: "Pas de jargon technique, pas de formation interminable. On s'occupe de tout, vous profitez des résultats.",
    Icone: "target",
    Highlight: "Clé en main",
    Ordre: "3",
  },
  {
    id: 4,
    Titre: "Résultats immédiats",
    Description: "Dès le premier jour, vos processus tournent tout seuls. Facturation, emails, relances — tout est géré automatiquement.",
    Icone: "zap",
    Highlight: "Opérationnel en 48h",
    Ordre: "4",
  },
];

/**
 * Valeurs par défaut pour les Points de Confiance.
 * Utilisées si la table Baserow n'existe pas ou est vide.
 */
export const DEFAULT_TRUST_POINTS: TrustPoint[] = [
  {
    id: 1,
    Titre: "100% hébergé en Suisse",
    Description: "Vos données ne quittent jamais le territoire suisse. Serveurs à Genève, conformité totale RGPD et LPD.",
    Icone: "map-pin",
    Badge: "Genève, CH",
    Ordre: "1",
  },
  {
    id: 2,
    Titre: "Sécurité bancaire",
    Description: "Chiffrement de bout en bout, sauvegardes quotidiennes, accès sécurisé. Vos informations sont protégées comme dans un coffre.",
    Icone: "shield",
    Badge: "Certifié",
    Ordre: "2",
  },
  {
    id: 3,
    Titre: "Transparence totale",
    Description: "Vous savez exactement ce qui est automatisé et comment. Accès complet aux logs et rapports en temps réel.",
    Icone: "eye",
    Badge: "Open Book",
    Ordre: "3",
  },
  {
    id: 4,
    Titre: "Pas de coûts cachés",
    Description: "Un prix fixe, tout compris. Pas de surprise à la facture, pas d'options payantes déguisées. Ce qui est annoncé est ce que vous payez.",
    Icone: "banknote",
    Badge: "Prix fixe",
    Ordre: "4",
  },
];

/**
 * Récupère les avantages depuis Baserow.
 * Retourne les valeurs par défaut si la table n'existe pas.
 */
export async function getAdvantages(): Promise<Advantage[]> {
  // Si l'ID de table est 0, utiliser les valeurs par défaut
  if (TABLE_IDS.ADVANTAGES === 0) {
    console.log('[Baserow] Table ADVANTAGES non configurée, utilisation des valeurs par défaut');
    return DEFAULT_ADVANTAGES;
  }

  const rawAdvantages = await fetchBaserow<Advantage>(TABLE_IDS.ADVANTAGES, {
    orderBy: 'Ordre',
  });

  if (!rawAdvantages || rawAdvantages.length === 0) {
    console.warn('[Baserow] Aucun avantage trouvé, utilisation des valeurs par défaut');
    return DEFAULT_ADVANTAGES;
  }

  return rawAdvantages;
}

/**
 * Récupère les points de confiance depuis Baserow.
 * Retourne les valeurs par défaut si la table n'existe pas.
 */
export async function getTrustPoints(): Promise<TrustPoint[]> {
  // Si l'ID de table est 0, utiliser les valeurs par défaut
  if (TABLE_IDS.TRUST_POINTS === 0) {
    console.log('[Baserow] Table TRUST_POINTS non configurée, utilisation des valeurs par défaut');
    return DEFAULT_TRUST_POINTS;
  }

  const rawTrustPoints = await fetchBaserow<TrustPoint>(TABLE_IDS.TRUST_POINTS, {
    orderBy: 'Ordre',
  });

  if (!rawTrustPoints || rawTrustPoints.length === 0) {
    console.warn('[Baserow] Aucun point de confiance trouvé, utilisation des valeurs par défaut');
    return DEFAULT_TRUST_POINTS;
  }

  return rawTrustPoints;
}

// ============================================
// GALLERY (Section Galerie dynamique)
// ============================================

/**
 * Récupère les éléments de la galerie depuis Baserow.
 * Filtre les éléments sans image.
 * Retourne un tableau vide si aucune image n'est disponible.
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const rawGallery = await fetchBaserow<BaserowGalleryRow>(TABLE_IDS.GALLERY, {
    orderBy: 'Ordre',
  });

  if (!rawGallery) {
    console.warn('[Baserow] Erreur lors de la récupération de la galerie');
    return [];
  }

  // Filtrer les éléments qui ont au moins une image
  const itemsWithImages = rawGallery.filter(
    (row) => row.Image && row.Image.length > 0
  );

  if (itemsWithImages.length === 0) {
    console.log('[Baserow] Aucune image trouvée dans la galerie');
    return [];
  }

  // Mapper les données Baserow vers notre interface
  return itemsWithImages.map((row) => ({
    id: row.id,
    Titre: row.Titre,
    Image: row.Image,
    Ordre: row.Ordre,
    TypeAffichage: parseGalleryDisplayType(row['Type Affichage']?.value),
  }));
}

/**
 * Parse le type d'affichage depuis Baserow.
 * Retourne 'Grille' par défaut si la valeur n'est pas valide.
 */
function parseGalleryDisplayType(value: string | undefined): GalleryDisplayType {
  if (!value) return 'Grille';
  
  const validTypes: GalleryDisplayType[] = ['Slider', 'Grille', 'Zoom'];
  if (validTypes.includes(value as GalleryDisplayType)) {
    return value as GalleryDisplayType;
  }
  
  return 'Grille';
}

