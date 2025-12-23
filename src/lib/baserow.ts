// ============================================
// BASEROW API CLIENT - Mick Solutions Website
// ============================================

const BASEROW_BASE_URL = 'https://baserow.mick-solutions.ch/api/database/rows/table';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;

// Debug en production : log si le token est défini (sans révéler le token)
if (typeof window === 'undefined') {
  console.log(`[Baserow] Token status: ${BASEROW_TOKEN ? '✅ Configured' : '❌ MISSING - Set BASEROW_API_TOKEN env var'}`);
}

// Table IDs
const TABLE_IDS = {
  SERVICES: 748,
  PORTFOLIO: 749,
  REVIEWS: 750,
  GLOBAL: 751,
  FAQ: 752,
  LEGAL_DOCS: 753,
} as const;

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

export interface GlobalSettings {
  id: number;
  email: string;
  telephone: string;
  lienLinkedin: string;
  titreHero: string;
  sousTitreHero: string;
  lienBoutonAppel: string;
}

export interface FAQ {
  id: number;
  Question: string;
  Reponse: string;
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

interface BaserowGlobalRow {
  id: number;
  Email: string;
  'Téléphone': string;
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
    telephone: row['Téléphone'],
    lienLinkedin: row['Lien Linkedin'],
    titreHero: row['Titre Hero'],
    sousTitreHero: row['Sous-titre Hero'],
    lienBoutonAppel: row['Lien Bouton Appel'],
  };
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

