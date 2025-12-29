// ============================================
// BASEROW COMPATIBILITY LAYER - Factory V2 (2025)
// ============================================
// Ce fichier maintient la compatibilité avec les imports existants
// tout en redirigeant vers le nouveau système Factory V2.
//
// ⚠️ DEPRECATED: Préférez importer directement depuis:
// - @/lib/factory-client (données)
// - @/lib/adapters/legacy-adapter (conversion)
// - @/lib/types/global-settings (types)

import {
  getFactoryData,
  isFactoryV2Configured,
} from './factory-client';

import {
  createLegacyConfigFromFactory,
} from './adapters/legacy-adapter';

import type { GlobalSettingsComplete } from './types/global-settings';
export { DEFAULT_SETTINGS, isCompleteSettings } from './types/global-settings';
export type { GlobalSettingsComplete };

// ============================================
// TYPES (pour compatibilité composants)
// ============================================

export interface BaserowTag {
  id: number;
  value: string;
  color: string;
}

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
  Tags: BaserowTag[];
  DescriptionCourte: string;
  ImageCouverture: { url: string; name: string }[];
  LienSite: string;
  Statut: BaserowSelectOption;
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
  Badge: string;
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

export type GalleryDisplayType = 'Slider' | 'Grille' | 'Zoom';

export interface GalleryItem {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
  Ordre: string | null;
  TypeAffichage: GalleryDisplayType | null;
}

// ============================================
// BASEROW CONFIG
// ============================================

const BASEROW_BASE_URL = 'https://baserow.mick-solutions.ch/api/database/rows/table';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;

// Table IDs pour les données de sections (pas de config globale)
const TABLE_IDS = {
  SERVICES: 748,
  PORTFOLIO: 749,
  REVIEWS: 750,
  FAQ: 752,
  LEGAL_DOCS: 753,
  ADVANTAGES: 757,
  TRUST_POINTS: 758,
  GALLERY: 781,
} as const;

// ============================================
// GENERIC FETCH
// ============================================

async function fetchBaserow<T>(
  tableId: number,
  options?: { filters?: string; orderBy?: string; size?: number }
): Promise<T[] | null> {
  if (!BASEROW_TOKEN) {
    console.error('❌ [Baserow] BASEROW_API_TOKEN manquant');
    return null;
  }

  try {
    const params = new URLSearchParams({ user_field_names: 'true' });
    if (options?.filters) params.append('filters', options.filters);
    if (options?.orderBy) params.append('order_by', options.orderBy);
    if (options?.size) params.append('size', options.size.toString());

    const response = await fetch(`${BASEROW_BASE_URL}/${tableId}/?${params}`, {
      headers: { 'Authorization': `Token ${BASEROW_TOKEN}` },
      next: { revalidate: 0 },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.results as T[];
  } catch (error) {
    console.error(`❌ [Baserow] Table ${tableId}:`, error);
    return null;
  }
}

// ============================================
// GLOBAL SETTINGS (via Factory V2)
// ============================================

/**
 * Récupère la configuration globale.
 * Utilise Factory V2 si configuré, sinon retourne les defaults.
 */
export async function getGlobalSettingsComplete(): Promise<GlobalSettingsComplete> {
  if (!isFactoryV2Configured()) {
    console.warn('[Baserow] Factory V2 non configuré. Utilisez les variables BASEROW_FACTORY_GLOBAL_ID et BASEROW_FACTORY_SECTIONS_ID.');
    // Return minimal defaults
    const { DEFAULT_SETTINGS } = await import('./types/global-settings');
    return DEFAULT_SETTINGS;
  }

  const factoryData = await getFactoryData('home');
  return createLegacyConfigFromFactory(factoryData.global, factoryData.sections);
}

// ============================================
// SECTION DATA FETCHERS
// ============================================

interface BaserowServiceRow {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Ordre: string | null;
  Tagline?: string;
  tags?: BaserowTag[];
  'Points Clés'?: string;
  'Type:'?: BaserowSelectOption;
  'Tarif (indicatif):'?: string;
}

export async function getServices(): Promise<Service[] | null> {
  const rows = await fetchBaserow<BaserowServiceRow>(TABLE_IDS.SERVICES, { orderBy: 'Ordre' });
  if (!rows) return null;
  return rows.map(r => ({
    id: r.id,
    Titre: r.Titre,
    Description: r.Description,
    Icone: r.Icone,
    Ordre: r.Ordre,
    Tagline: r.Tagline || null,
    tags: r.tags || [],
    points_cle: r['Points Clés'] || null,
    type: r['Type:'] || null,
    tarif: r['Tarif (indicatif):'] || null,
  }));
}

interface BaserowProjectRow {
  id: number;
  Nom: string;
  Slug: string;
  Tags: BaserowTag[];
  'Description courte': string;
  'Image de couverture': { url: string; name: string }[];
  'Lien du site': string;
  Statut: BaserowSelectOption;
  Ordre: string | null;
}

export async function getProjects(): Promise<Project[] | null> {
  const rows = await fetchBaserow<BaserowProjectRow>(TABLE_IDS.PORTFOLIO, {
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [{ type: 'single_select_equal', field: 'Statut', value: '3068' }],
    }),
    orderBy: 'Ordre',
  });
  if (!rows) return null;
  return rows.map(r => ({
    id: r.id,
    Nom: r.Nom,
    Slug: r.Slug,
    Tags: r.Tags,
    DescriptionCourte: r['Description courte'],
    ImageCouverture: r['Image de couverture'],
    LienSite: r['Lien du site'],
    Statut: r.Statut,
    Ordre: r.Ordre,
  }));
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

export async function getReviews(): Promise<Review[] | null> {
  const rows = await fetchBaserow<BaserowReviewRow>(TABLE_IDS.REVIEWS, {
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [{ type: 'boolean', field: 'Afficher', value: 'true' }],
    }),
  });
  if (!rows) return null;
  return rows.map(r => ({
    id: r.id,
    NomClient: r['Nom du client'],
    PosteEntreprise: r['Poste / Entreprise'],
    Photo: r.Photo,
    Message: r.Message,
    Note: r.Note,
    Afficher: r.Afficher,
  }));
}

export async function getFAQ(): Promise<FAQ[] | null> {
  return fetchBaserow<FAQ>(TABLE_IDS.FAQ, { orderBy: 'Ordre' });
}

interface BaserowLegalDocRow {
  id: number;
  Titre: string;
  Slug: string;
  Contenu: string;
  Date_Mise_a_jour: string | null;
  Is_Active: boolean;
}

export async function getAllLegalDocs(): Promise<LegalDoc[] | null> {
  const rows = await fetchBaserow<BaserowLegalDocRow>(TABLE_IDS.LEGAL_DOCS);
  if (!rows) return null;
  return rows.filter(r => r.Is_Active).map(r => ({
    id: r.id,
    Titre: r.Titre,
    Slug: r.Slug,
    Contenu: r.Contenu,
    DateMiseAJour: r.Date_Mise_a_jour,
    IsActive: r.Is_Active,
  }));
}

export async function getLegalDocBySlug(slug: string): Promise<LegalDoc | null> {
  const docs = await getAllLegalDocs();
  return docs?.find(d => d.Slug === slug) || null;
}

// Default values
export const DEFAULT_ADVANTAGES: Advantage[] = [
  { id: 1, Titre: "Récupérez vos heures", Description: "Les tâches répétitives automatisées.", Icone: "clock", Badge: "10h+ économisées/semaine", Ordre: "1" },
  { id: 2, Titre: "Réduisez vos coûts", Description: "Un investissement unique pour des économies durables.", Icone: "trending-down", Badge: "Jusqu'à 70% d'économies", Ordre: "2" },
  { id: 3, Titre: "Zéro complexité", Description: "On s'occupe de tout, vous profitez des résultats.", Icone: "target", Badge: "Clé en main", Ordre: "3" },
  { id: 4, Titre: "Résultats immédiats", Description: "Vos processus tournent dès le premier jour.", Icone: "zap", Badge: "Opérationnel en 48h", Ordre: "4" },
];

export const DEFAULT_TRUST_POINTS: TrustPoint[] = [
  { id: 1, Titre: "100% hébergé en Suisse", Description: "Vos données ne quittent jamais le territoire suisse.", Icone: "map-pin", Badge: "Genève, CH", Ordre: "1" },
  { id: 2, Titre: "Sécurité bancaire", Description: "Chiffrement de bout en bout, sauvegardes quotidiennes.", Icone: "shield", Badge: "Certifié", Ordre: "2" },
  { id: 3, Titre: "Transparence totale", Description: "Accès complet aux logs et rapports en temps réel.", Icone: "eye", Badge: "Open Book", Ordre: "3" },
  { id: 4, Titre: "Pas de coûts cachés", Description: "Un prix fixe, tout compris.", Icone: "banknote", Badge: "Prix fixe", Ordre: "4" },
];

export async function getAdvantages(): Promise<Advantage[]> {
  const rows = await fetchBaserow<Advantage>(TABLE_IDS.ADVANTAGES, { orderBy: 'Ordre' });
  return rows && rows.length > 0 ? rows : DEFAULT_ADVANTAGES;
}

export async function getTrustPoints(): Promise<TrustPoint[]> {
  const rows = await fetchBaserow<TrustPoint>(TABLE_IDS.TRUST_POINTS, { orderBy: 'Ordre' });
  return rows && rows.length > 0 ? rows : DEFAULT_TRUST_POINTS;
}

interface BaserowGalleryRow {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
  Ordre: string | null;
  'Type Affichage'?: BaserowSelectOption | null;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const rows = await fetchBaserow<BaserowGalleryRow>(TABLE_IDS.GALLERY, { orderBy: 'Ordre' });
  if (!rows) return [];
  return rows.filter(r => r.Image?.length > 0).map(r => ({
    id: r.id,
    Titre: r.Titre,
    Image: r.Image,
    Ordre: r.Ordre,
    TypeAffichage: (r['Type Affichage']?.value || null) as GalleryDisplayType | null,
  }));
}

