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

// ============================================
// ANCIEN SYSTÈME DÉSACTIVÉ - Factory V2 uniquement
// ============================================
// Les anciennes tables sont désactivées pour éviter les interférences.
// Toutes les données viennent maintenant de Factory V2 ou des valeurs par défaut.
const TABLE_IDS = {
  // SERVICES: 748,    // DÉSACTIVÉ - utilise defaultServices
  // PORTFOLIO: 749,   // DÉSACTIVÉ
  // REVIEWS: 750,     // DÉSACTIVÉ
  // FAQ: 752,         // DÉSACTIVÉ
  LEGAL_DOCS: 753,     // Gardé pour les pages légales
  // ADVANTAGES: 757,  // DÉSACTIVÉ - utilise DEFAULT_ADVANTAGES
  // TRUST_POINTS: 758,// DÉSACTIVÉ - utilise DEFAULT_TRUST_POINTS
  // GALLERY: 781,     // DÉSACTIVÉ
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

// DÉSACTIVÉ - Retourne null pour utiliser les defaultServices du composant
export async function getServices(): Promise<Service[] | null> {
  // Ancien système désactivé - les données viennent de Factory V2
  // ou des defaultServices dans ServicesSection.tsx
  return null;
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

// DÉSACTIVÉ - Ancien système
export async function getProjects(): Promise<Project[] | null> {
  return null;
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

// DÉSACTIVÉ - Les témoignages viennent de Factory V2
export async function getReviews(): Promise<Review[] | null> {
  return null;
}

// DÉSACTIVÉ - Les FAQ viennent de Factory V2
export async function getFAQ(): Promise<FAQ[] | null> {
  return null;
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
// Thème "Nouveau Client" - Contenu pédagogique
export const DEFAULT_ADVANTAGES: Advantage[] = [
  { id: 1, Titre: "Premier Avantage", Description: "Décrivez ici un avantage clé de votre offre pour le client.", Icone: "star", Badge: "Ex: +30%", Ordre: "1" },
  { id: 2, Titre: "Deuxième Avantage", Description: "Un autre bénéfice important que vous apportez à vos clients.", Icone: "check", Badge: "Ex: 24h", Ordre: "2" },
  { id: 3, Titre: "Troisième Avantage", Description: "Un point fort qui vous différencie de la concurrence.", Icone: "award", Badge: "Ex: 100%", Ordre: "3" },
  { id: 4, Titre: "Quatrième Avantage", Description: "Un dernier argument de vente convaincant.", Icone: "shield", Badge: "Ex: Garanti", Ordre: "4" },
];

// Thème "Nouveau Client" - Contenu pédagogique
export const DEFAULT_TRUST_POINTS: TrustPoint[] = [
  { id: 1, Titre: "Point de Confiance 1", Description: "Expliquez pourquoi les clients peuvent vous faire confiance.", Icone: "shield", Badge: "Ex: Certifié", Ordre: "1" },
  { id: 2, Titre: "Point de Confiance 2", Description: "Un engagement de sécurité ou de qualité.", Icone: "lock", Badge: "Ex: Sécurisé", Ordre: "2" },
  { id: 3, Titre: "Point de Confiance 3", Description: "Une garantie ou une politique transparente.", Icone: "check-circle", Badge: "Ex: Garanti", Ordre: "3" },
  { id: 4, Titre: "Point de Confiance 4", Description: "Un dernier élément de réassurance.", Icone: "award", Badge: "Ex: N°1", Ordre: "4" },
];

// Retourne directement les valeurs pédagogiques par défaut
export async function getAdvantages(): Promise<Advantage[]> {
  return DEFAULT_ADVANTAGES;
}

// Retourne directement les valeurs pédagogiques par défaut
export async function getTrustPoints(): Promise<TrustPoint[]> {
  return DEFAULT_TRUST_POINTS;
}

interface BaserowGalleryRow {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
  Ordre: string | null;
  'Type Affichage'?: BaserowSelectOption | null;
}

// DÉSACTIVÉ - Ancien système
export async function getGalleryItems(): Promise<GalleryItem[]> {
  return [];
}

