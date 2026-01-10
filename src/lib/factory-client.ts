// ============================================
// FACTORY CLIENT - Data Access Layer V2
// ============================================
// Bridge entre l'API Baserow et les Zod Schemas.
// Architecture Block-Based Factory.
//
// Tables:
// - CONFIG_GLOBAL (ID: env.BASEROW_FACTORY_GLOBAL_ID)
// - SECTIONS (ID: env.BASEROW_FACTORY_SECTIONS_ID)

import {
  GlobalConfigSchema,
  SectionSchema,
  SectionTypeEnum,
  IdentitySchema,
  SEOSchema,
  BrandingSchema,
  ContactInfoSchema,
  IntegrationsSchema,
  AssetsSchema,
  AIConfigSchema,
  AnimationsConfigSchema,
  PremiumSchema,
  FooterConfigSchema,
  DEFAULT_GLOBAL_CONFIG,
  DEFAULT_HERO_SECTION,
  // 🔧 Nouveaux imports pour JSON auto-parsing
  DEFAULT_SEO,
  DEFAULT_BRANDING,
  DEFAULT_CONTACT,
  DEFAULT_INTEGRATIONS,
  DEFAULT_ASSETS,
  DEFAULT_AI_CONFIG,
  DEFAULT_ANIMATIONS,
  DEFAULT_PREMIUM,
  DEFAULT_FOOTER,
  safeJsonParseWithSchema,
  type GlobalConfig,
  type Section,
  type SectionType,
} from './schemas/factory';

// ============================================
// CONFIGURATION (via lib/config.ts centralisé)
// ============================================

import {
  BASEROW_API_URL,
  BASEROW_TOKEN,
  TABLE_IDS,
  isFactoryV2Configured as checkFactoryV2Config,
} from './config';

// Aliases pour compatibilité interne
const CONFIG_GLOBAL_TABLE_ID = TABLE_IDS.CONFIG_GLOBAL;
const SECTIONS_TABLE_ID = TABLE_IDS.SECTIONS;

// ============================================
// TYPES
// ============================================

interface BaserowSelectOption {
  id: number;
  value: string;
  color: string;
}

// 🔧 FIX: Aligné avec structure Baserow réelle (Audit 29/12/2025)
interface BaserowConfigRow {
  id: number;
  Nom?: string;  // Nom du site (champ DB réel)
  Notes?: string | null;  // Notes optionnelles
  Actif?: boolean;  // Statut actif/inactif
  Identity?: string;  // 🆕 Champ JSON pour identity complet
  SEO_Metadata?: string;
  Branding?: string;
  Contact?: string;
  Integrations?: string;
  Assets?: string;
  AI_Config?: string;
  Animations?: string;
  Premium?: string;
  Footer?: string;
}

// 🔧 FIX: Aligné avec structure Baserow réelle (Audit 29/12/2025)
interface BaserowSectionRow {
  id: number;
  Nom?: string | null;  // Nom de la section
  Notes?: string | null;  // Notes optionnelles
  Actif?: boolean;  // Champ DB réel
  /** @deprecated Utiliser Actif - gardé pour compatibilité */
  Is_Active?: boolean;
  Type?: BaserowSelectOption | string;
  Order?: number | string;
  Content?: string;
  Design?: string;
  Page?: string;
}

interface FetchResult<T> {
  data: T | null;
  error: string | null;
}

// ============================================
// LOGGING
// ============================================

const LOG_PREFIX = '[FactoryClient]';

function logInfo(msg: string, data?: unknown) {
  console.log(`${LOG_PREFIX} ℹ️ ${msg}`, data ?? '');
}

function logError(msg: string, error?: unknown) {
  console.error(`${LOG_PREFIX} ❌ ${msg}`, error ?? '');
}

function logWarn(msg: string, data?: unknown) {
  console.warn(`${LOG_PREFIX} ⚠️ ${msg}`, data ?? '');
}

// ============================================
// VALIDATION CHECK
// ============================================

function validateConfig(): boolean {
  if (!BASEROW_TOKEN) {
    logError('BASEROW_API_TOKEN non défini');
    return false;
  }
  if (!CONFIG_GLOBAL_TABLE_ID) {
    logError('BASEROW_FACTORY_GLOBAL_ID non défini. Exécutez: npm run db:setup');
    return false;
  }
  if (!SECTIONS_TABLE_ID) {
    logError('BASEROW_FACTORY_SECTIONS_ID non défini. Exécutez: npm run db:setup');
    return false;
  }
  return true;
}

// ============================================
// SAFE JSON PARSE
// ============================================

function safeJsonParse<T>(
  jsonString: string | null | undefined,
  fallback: T,
  fieldName: string
): T {
  if (!jsonString || jsonString.trim() === '') {
    return fallback;
  }

  try {
    // Clean potential escape characters
    let cleaned = jsonString.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    cleaned = cleaned.replace(/\\"/g, '"');

    const parsed = JSON.parse(cleaned);
    return parsed as T;
  } catch (e) {
    logWarn(`JSON parse error for ${fieldName}`, e);
    return fallback;
  }
}

// ============================================
// GENERIC BASEROW FETCH
// ============================================

async function fetchBaserowTable<T>(
  tableId: string,
  options?: {
    rowId?: number;
    orderBy?: string;
    filters?: string;
    size?: number;
  }
): Promise<FetchResult<T[]>> {
  if (!BASEROW_TOKEN) {
    return { data: null, error: 'Token manquant' };
  }

  try {
    const params = new URLSearchParams({ user_field_names: 'true' });
    if (options?.orderBy) params.append('order_by', options.orderBy);
    if (options?.filters) params.append('filters', options.filters);
    if (options?.size) params.append('size', options.size.toString());

    let url: string;
    if (options?.rowId) {
      url = `${BASEROW_API_URL}/database/rows/table/${tableId}/${options.rowId}/?${params}`;
    } else {
      url = `${BASEROW_API_URL}/database/rows/table/${tableId}/?${params}`;
    }

    const response = await fetch(url, {
      headers: { Authorization: `Token ${BASEROW_TOKEN}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError(`Baserow fetch error (${response.status})`, errorText);
      return { data: null, error: `HTTP ${response.status}: ${errorText}` };
    }

    const json = await response.json();

    // Single row or list
    if (options?.rowId) {
      return { data: [json] as T[], error: null };
    }
    return { data: (json.results || []) as T[], error: null };
  } catch (error) {
    logError('Fetch exception', error);
    return { data: null, error: String(error) };
  }
}

async function updateBaserowRow(
  tableId: string,
  rowId: number,
  data: Record<string, unknown>
): Promise<FetchResult<{ id: number }>> {
  if (!BASEROW_TOKEN) {
    return { data: null, error: 'Token manquant' };
  }

  try {
    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${tableId}/${rowId}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError(`Baserow update error (${response.status})`, errorText);
      return { data: null, error: `HTTP ${response.status}: ${errorText}` };
    }

    const json = await response.json();
    return { data: { id: json.id }, error: null };
  } catch (error) {
    logError('Update exception', error);
    return { data: null, error: String(error) };
  }
}

// ============================================
// GET GLOBAL CONFIG
// ============================================

export async function getGlobalConfig(): Promise<GlobalConfig> {
  if (!validateConfig()) {
    logWarn('Using default config due to missing env vars');
    return DEFAULT_GLOBAL_CONFIG;
  }

  const { data: rows, error } = await fetchBaserowTable<BaserowConfigRow>(
    CONFIG_GLOBAL_TABLE_ID,
    { size: 1 }
  );

  if (error || !rows || rows.length === 0) {
    logWarn('No config found, using defaults', error);
    return DEFAULT_GLOBAL_CONFIG;
  }

  const row = rows[0];
  logInfo(`Fetched config row ID: ${row.id}`);

  // 🔧 FIX: Lire Identity depuis le champ JSON dédié avec fallback sur Nom
  const identityJson = safeJsonParse<{ nomSite?: string; slogan?: string; initialesLogo?: string }>(
    row.Identity,
    {},
    'Identity'
  );
  const identity = IdentitySchema.safeParse({
    nomSite: identityJson?.nomSite || row.Nom || 'Mon Site',
    slogan: identityJson?.slogan || '',
    initialesLogo: identityJson?.initialesLogo || row.Nom?.substring(0, 2).toUpperCase() || 'MS',
  });

  // Chaque champ JSON est parsé et validé en une seule opération avec fallback sur les defaults
  const seo = safeJsonParseWithSchema(row.SEO_Metadata, SEOSchema, DEFAULT_SEO, 'SEO_Metadata');
  const branding = safeJsonParseWithSchema(row.Branding, BrandingSchema, DEFAULT_BRANDING, 'Branding');
  const contact = safeJsonParseWithSchema(row.Contact, ContactInfoSchema, DEFAULT_CONTACT, 'Contact');
  const integrations = safeJsonParseWithSchema(row.Integrations, IntegrationsSchema, DEFAULT_INTEGRATIONS, 'Integrations');
  const assets = safeJsonParseWithSchema(row.Assets, AssetsSchema, DEFAULT_ASSETS, 'Assets');
  const ai = safeJsonParseWithSchema(row.AI_Config, AIConfigSchema, DEFAULT_AI_CONFIG, 'AI_Config');
  const animations = safeJsonParseWithSchema(row.Animations, AnimationsConfigSchema, DEFAULT_ANIMATIONS, 'Animations');
  const premium = safeJsonParseWithSchema(row.Premium, PremiumSchema, DEFAULT_PREMIUM, 'Premium');
  const footer = safeJsonParseWithSchema(row.Footer, FooterConfigSchema, DEFAULT_FOOTER, 'Footer');

  // Identity validation log (seul champ qui reste un safeParse)
  if (!identity.success) logWarn('Identity validation failed', identity.error.issues);

  // 🔧 Build config - les champs JSON sont déjà parsés avec fallback par safeJsonParseWithSchema
  const config: GlobalConfig = {
    id: row.id,
    identity: identity.success ? identity.data : DEFAULT_GLOBAL_CONFIG.identity,
    // Valeurs directes (déjà parsées et validées avec fallback automatique)
    seo,
    branding,
    contact,
    integrations,
    assets,
    ai,
    animations,
    premium,
    footer,
  };

  // Final validation of complete config
  const finalValidation = GlobalConfigSchema.safeParse(config);
  if (!finalValidation.success) {
    logWarn('Final GlobalConfig validation failed', finalValidation.error.issues);
  }

  return config;
}

// ============================================
// GET SECTIONS
// ============================================

export async function getSections(page: string = 'home'): Promise<Section[]> {
  if (!validateConfig()) {
    logWarn('Using default sections due to missing env vars');
    return [DEFAULT_HERO_SECTION];
  }

  const { data: rows, error } = await fetchBaserowTable<BaserowSectionRow>(
    SECTIONS_TABLE_ID,
    { orderBy: 'Order' }
  );

  if (error || !rows) {
    // 🔧 FIX: Returning empty array allows showing "Empty State" instead of forced Hero
    logWarn('No sections found or fetch error', error);
    return [];
  }

  logInfo(`Fetched ${rows.length} section rows`);

  const sections: Section[] = [];

  for (const row of rows) {
    // Filter by page if needed
    if (page && row.Page && row.Page !== page) {
      continue;
    }

    // Extract type from select or string
    let typeValue: string;
    if (typeof row.Type === 'object' && row.Type?.value) {
      typeValue = row.Type.value;
    } else if (typeof row.Type === 'string') {
      typeValue = row.Type;
    } else {
      logWarn(`Section ${row.id} has invalid Type`, row.Type);
      continue;
    }

    // Validate type against enum
    const typeValidation = SectionTypeEnum.safeParse(typeValue);
    if (!typeValidation.success) {
      logWarn(`Section ${row.id} has unknown type: ${typeValue}`);
      continue;
    }

    const sectionType = typeValidation.data as SectionType;

    // Parse JSON content and design
    const contentRaw = safeJsonParse(row.Content, {}, `Section ${row.id} Content`);
    const design = safeJsonParse(row.Design, {}, `Section ${row.id} Design`);

    // ⭐ FIX CRITIQUE: Extraire effects et textSettings du content
    // Ils sont stockés DANS le JSON content mais doivent être des champs séparés de la section
    const { effects, textSettings, ...content } = contentRaw as {
      effects?: Record<string, unknown>;
      textSettings?: Record<string, unknown>;
      [key: string]: unknown;
    };

    // Build section object
    // 🔧 FIX: Robust isActive parsing (Secure by default)
    // Baserow can return "false" (string), null, undefined, or boolean.
    let isActive = false; // Default to false
    const rawActif = row.Actif as unknown;
    const rawIsActive = row.Is_Active as unknown;

    if (typeof rawActif === 'boolean') isActive = rawActif;
    else if (typeof rawActif === 'string') isActive = rawActif.toLowerCase() === 'true';
    else if (typeof rawIsActive === 'boolean') isActive = rawIsActive;
    else if (typeof rawIsActive === 'string') isActive = rawIsActive.toLowerCase() === 'true';
    else {
      // Fallback: Si aucune valeur n'est présente, on désactive par sécurité
      // Sauf pour le cas legacy où on veut peut-être être permissif (mais ici on debug)
      isActive = false;
    }

    if (process.env.NODE_ENV === 'development') {
      // console.log(`[Factory] Section ${row.id} (${sectionType}): Actif=${rawActif}, Is_Active=${rawIsActive} -> isActive=${isActive}`);
    }

    const sectionData = {
      type: sectionType,
      isActive,
      order: typeof row.Order === 'string' ? parseInt(row.Order, 10) : (row.Order ?? 0),
      page: row.Page || 'home',
      content,
      design,
      effects,      // ⭐ Maintenant extrait du content !
      textSettings, // ⭐ Maintenant extrait du content !
    };

    // Validate with discriminated union
    const validation = SectionSchema.safeParse(sectionData);

    if (validation.success) {
      sections.push({ ...validation.data, _rowId: row.id } as Section & { _rowId: number });
      logInfo(`✅ Section "${sectionType}" (ID: ${row.id}) loaded`);
    } else {
      logWarn(`Section ${row.id} (${sectionType}) validation failed`, validation.error.issues);
      // Try to include with raw data anyway (graceful degradation)
      try {
        sections.push({ ...sectionData, _rowId: row.id } as unknown as Section & { _rowId: number });
      } catch {
        logError(`Could not include section ${row.id}`);
      }
    }
  }

  // Sort by order
  sections.sort((a, b) => a.order - b.order);

  // Filter only active sections
  const activeSections = sections.filter(s => s.isActive);

  logInfo(`Returning ${activeSections.length} active sections`);
  return activeSections;
}

// ============================================
// GET ALL SECTIONS (including inactive)
// ============================================

export async function getAllSections(): Promise<Section[]> {
  if (!validateConfig()) {
    return [DEFAULT_HERO_SECTION];
  }

  const { data: rows, error } = await fetchBaserowTable<BaserowSectionRow>(
    SECTIONS_TABLE_ID,
    { orderBy: 'Order' }
  );

  if (error || !rows) {
    return [DEFAULT_HERO_SECTION];
  }

  const sections: Section[] = [];

  for (const row of rows) {
    let typeValue: string;
    if (typeof row.Type === 'object' && row.Type?.value) {
      typeValue = row.Type.value;
    } else if (typeof row.Type === 'string') {
      typeValue = row.Type;
    } else {
      continue;
    }

    const typeValidation = SectionTypeEnum.safeParse(typeValue);
    if (!typeValidation.success) continue;

    const sectionType = typeValidation.data as SectionType;
    const contentRaw = safeJsonParse(row.Content, {}, `Section ${row.id} Content`);
    const design = safeJsonParse(row.Design, {}, `Section ${row.id} Design`);

    // ⭐ NOUVEAU: Extraire effects et textSettings du content
    const { effects, textSettings, ...content } = contentRaw as {
      effects?: Record<string, unknown>;
      textSettings?: Record<string, unknown>;
      [key: string]: unknown;
    };


    // 🔧 FIX: Priorité Actif (DB) > Is_Active (legacy) > false (secure default)
    let isActive = false; // Secure default
    const rawActif = row.Actif as unknown;
    const rawIsActive = row.Is_Active as unknown;

    if (typeof rawActif === 'boolean') isActive = rawActif;
    else if (typeof rawActif === 'string') isActive = rawActif.toLowerCase() === 'true';
    else if (typeof rawIsActive === 'boolean') isActive = rawIsActive;
    else if (typeof rawIsActive === 'string') isActive = rawIsActive.toLowerCase() === 'true';

    const sectionData = {
      id: row.id, // Include row ID for updates
      type: sectionType,
      isActive,
      order: typeof row.Order === 'string' ? parseInt(row.Order, 10) : (row.Order ?? 0),
      page: row.Page || 'home',
      content,
      design,
      effects,
      textSettings,
    };

    const validation = SectionSchema.safeParse(sectionData);
    if (validation.success) {
      // Add rowId for admin operations
      sections.push({ ...validation.data, _rowId: row.id } as Section & { _rowId: number });
    } else {
      // Log validation errors
      logWarn(`Section ${row.id} (${sectionType}) validation failed`, validation.error.issues);
      // 🔧 FIX: Graceful degradation for getAllSections too (so we can fix them in Admin)
      try {
        sections.push({ ...sectionData, _rowId: row.id } as unknown as Section & { _rowId: number });
      } catch {
        logError(`Could not include section ${row.id}`);
      }
    }
  }

  sections.sort((a, b) => a.order - b.order);
  return sections;
}

// ============================================
// UPDATE GLOBAL CONFIG
// ============================================

export async function updateGlobalConfig(
  partialConfig: Partial<GlobalConfig>
): Promise<{ success: boolean; error?: string }> {
  if (!validateConfig()) {
    return { success: false, error: 'Configuration manquante' };
  }

  // First, get the current config to find the row ID AND existing data for merge
  const { data: rows } = await fetchBaserowTable<BaserowConfigRow>(
    CONFIG_GLOBAL_TABLE_ID,
    { size: 1 }
  );

  if (!rows || rows.length === 0) {
    return { success: false, error: 'Aucune ligne de config trouvée' };
  }

  const rowId = rows[0].id;
  const existingRow = rows[0];

  // 🔧 Helper to safely parse existing JSON and merge with new data
  const mergeWithExisting = (fieldName: string, newData: Record<string, unknown>): string => {
    try {
      const existing = existingRow[fieldName as keyof BaserowConfigRow];
      if (typeof existing === 'string' && existing.trim()) {
        const parsed = JSON.parse(existing);
        if (typeof parsed === 'object' && parsed !== null) {
          // Deep merge: existing + newData
          return JSON.stringify({ ...parsed, ...newData });
        }
      }
    } catch {
      logWarn(`Failed to parse existing ${fieldName} for merge, using new data only`);
    }
    return JSON.stringify(newData);
  };

  // Build update payload with MERGE
  const updateData: Record<string, unknown> = {};

  if (partialConfig.identity) {
    // 🔧 FIX: MERGE with existing Identity
    updateData['Identity'] = mergeWithExisting('Identity', partialConfig.identity as Record<string, unknown>);
    if (partialConfig.identity.nomSite) {
      updateData['Nom'] = partialConfig.identity.nomSite;
    }
  }

  if (partialConfig.seo) {
    updateData['SEO_Metadata'] = mergeWithExisting('SEO_Metadata', partialConfig.seo as Record<string, unknown>);
  }

  if (partialConfig.branding) {
    // 🔧 FIX: MERGE with existing Branding - critical for headerMenuLinks etc.
    updateData['Branding'] = mergeWithExisting('Branding', partialConfig.branding as Record<string, unknown>);
  }

  if (partialConfig.contact) {
    updateData['Contact'] = mergeWithExisting('Contact', partialConfig.contact as Record<string, unknown>);
  }

  if (partialConfig.integrations) {
    updateData['Integrations'] = mergeWithExisting('Integrations', partialConfig.integrations as Record<string, unknown>);
  }

  if (partialConfig.assets) {
    updateData['Assets'] = mergeWithExisting('Assets', partialConfig.assets as Record<string, unknown>);
  }

  if (partialConfig.ai) {
    updateData['AI_Config'] = mergeWithExisting('AI_Config', partialConfig.ai as Record<string, unknown>);
  }

  if (partialConfig.animations) {
    updateData['Animations'] = mergeWithExisting('Animations', partialConfig.animations as Record<string, unknown>);
  }

  if (partialConfig.premium) {
    updateData['Premium'] = mergeWithExisting('Premium', partialConfig.premium as Record<string, unknown>);
  }

  if (partialConfig.footer) {
    updateData['Footer'] = mergeWithExisting('Footer', partialConfig.footer as Record<string, unknown>);
  }

  logInfo(`Updating config row ${rowId} with ${Object.keys(updateData).length} fields (merged)`);

  const { error } = await updateBaserowRow(CONFIG_GLOBAL_TABLE_ID, rowId, updateData);

  if (error) {
    return { success: false, error };
  }

  logInfo('✅ Global config updated successfully');
  return { success: true };
}

// ============================================
// UPDATE SECTION
// ============================================

export async function updateSection(
  rowId: number,
  updates: {
    isActive?: boolean;
    order?: number;
    content?: Record<string, unknown>;
    design?: Record<string, unknown>;
    page?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!validateConfig()) {
    return { success: false, error: 'Configuration manquante' };
  }

  const updateData: Record<string, unknown> = {};

  if (updates.isActive !== undefined) {
    // 🔧 FIX: Écrire dans les DEUX champs pour compatibilité (Actif = champ principal DB)
    updateData['Actif'] = updates.isActive;
    updateData['Is_Active'] = updates.isActive; // Legacy fallback
  }

  if (updates.order !== undefined) {
    // 🔧 FIX: Order est un champ string dans Baserow (decimal), le convertir
    updateData['Order'] = String(updates.order);
  }

  if (updates.content) {
    updateData['Content'] = JSON.stringify(updates.content);
  }

  if (updates.design) {
    updateData['Design'] = JSON.stringify(updates.design);
  }

  if (updates.page) {
    updateData['Page'] = updates.page;
  }

  // Log détaillé pour debug
  logInfo(`Updating section row ${rowId} with fields: ${Object.keys(updateData).join(', ')}`);
  if (updates.content) {
    logInfo(`Content keys: ${Object.keys(updates.content).join(', ')}`);
  }

  const { error } = await updateBaserowRow(SECTIONS_TABLE_ID, rowId, updateData);

  if (error) {
    logError(`Failed to update section ${rowId}`, error);
    return { success: false, error };
  }

  logInfo(`✅ Section ${rowId} updated successfully`);
  return { success: true };
}

// ============================================
// CREATE SECTION
// ============================================

// 🔧 FIX: IDs par défaut (fallback si API échoue)
// Ces IDs correspondent au template FACTORY_V2 original
const FALLBACK_SECTION_TYPE_IDS: Record<string, number> = {
  'hero': 3413,
  'services': 3414,
  'advantages': 3415,
  'gallery': 3416,
  'portfolio': 3417,
  'testimonials': 3418,
  'trust': 3419,
  'faq': 3420,
  'contact': 3421,
  'blog': 3422,
  'ai-assistant': 3423,
  'custom': 3424,
  'infinite-zoom': 3494,
};

// 🔧 FIX: Cache pour les IDs dynamiques (évite appels répétés)
let cachedSectionTypeIds: Record<string, number> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère dynamiquement les IDs des types de sections depuis Baserow.
 * Utilise un cache avec TTL pour éviter les appels répétés.
 * Fallback sur les valeurs hardcodées en cas d'erreur.
 */
async function getSectionTypeIds(): Promise<Record<string, number>> {
  // Vérifier le cache
  const now = Date.now();
  if (cachedSectionTypeIds && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedSectionTypeIds;
  }

  if (!BASEROW_TOKEN || !SECTIONS_TABLE_ID) {
    logWarn('No token or table ID, using fallback section type IDs');
    return FALLBACK_SECTION_TYPE_IDS;
  }

  try {
    // Récupérer les champs de la table SECTIONS
    const response = await fetch(
      `${BASEROW_API_URL}/database/fields/table/${SECTIONS_TABLE_ID}/`,
      {
        headers: { Authorization: `Token ${BASEROW_TOKEN}` },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      logWarn(`Failed to fetch field info (${response.status}), using fallback`);
      return FALLBACK_SECTION_TYPE_IDS;
    }

    const fields = await response.json();

    // Trouver le champ "Type" (single_select)
    const typeField = fields.find(
      (f: { name: string; type: string }) => f.name === 'Type' && f.type === 'single_select'
    );

    if (!typeField || !typeField.select_options) {
      logWarn('Type field or select_options not found, using fallback');
      return FALLBACK_SECTION_TYPE_IDS;
    }

    // Construire le mapping value → id
    const dynamicIds: Record<string, number> = {};
    for (const option of typeField.select_options) {
      dynamicIds[option.value.toLowerCase()] = option.id;
    }

    // Vérifier que tous les types requis sont présents
    const requiredTypes = Object.keys(FALLBACK_SECTION_TYPE_IDS);
    const missingTypes = requiredTypes.filter(t => !dynamicIds[t]);

    if (missingTypes.length > 0) {
      logWarn(`Missing type IDs for: ${missingTypes.join(', ')}. Merging with fallback.`);
      // Fusionner avec fallback pour les types manquants
      for (const type of missingTypes) {
        dynamicIds[type] = FALLBACK_SECTION_TYPE_IDS[type];
      }
    }

    // Mettre en cache
    cachedSectionTypeIds = dynamicIds;
    cacheTimestamp = now;
    logInfo(`✅ Section type IDs loaded dynamically: ${Object.keys(dynamicIds).length} types`);

    return dynamicIds;
  } catch (error) {
    logError('Error fetching section type IDs', error);
    return FALLBACK_SECTION_TYPE_IDS;
  }
}

export async function createSection(
  section: Omit<Section, 'id'>
): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!validateConfig() || !BASEROW_TOKEN) {
    return { success: false, error: 'Configuration manquante' };
  }

  // 🔧 FIX: Récupérer les IDs dynamiquement (avec cache + fallback)
  const sectionTypeIds = await getSectionTypeIds();
  const typeId = sectionTypeIds[section.type];

  if (!typeId) {
    logError(`Unknown section type: ${section.type}`);
    return { success: false, error: `Type de section inconnu: ${section.type}` };
  }

  const createData: Record<string, unknown> = {
    Type: typeId, // ID dynamique récupéré depuis Baserow
    Actif: section.isActive,
    Order: String(section.order),
    Content: JSON.stringify(section.content),
    Design: JSON.stringify(section.design),
    Page: section.page || 'home',
    Nom: section.type.toUpperCase(),
  };

  logInfo(`Creating section type=${section.type} (ID: ${typeId})`);

  try {
    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${SECTIONS_TABLE_ID}/?user_field_names=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError('Create section failed', errorText);
      return { success: false, error: errorText };
    }

    const json = await response.json();
    logInfo(`✅ Section created with ID: ${json.id}`);
    return { success: true, id: json.id };
  } catch (error) {
    logError('Create section exception', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// DELETE SECTION
// ============================================

export async function deleteSection(
  rowId: number
): Promise<{ success: boolean; error?: string }> {
  if (!validateConfig() || !BASEROW_TOKEN) {
    return { success: false, error: 'Configuration manquante' };
  }

  try {
    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${SECTIONS_TABLE_ID}/${rowId}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      // 🔧 FIX: Si la section n'existe pas (404), on considère la suppression comme réussie (Zombie section)
      if (response.status === 404) {
        logWarn(`Section ${rowId} introuvable (404), suppression considérée comme réussie`);
        return { success: true };
      }
      const errorText = await response.text();
      logError('Delete section failed', errorText);
      return { success: false, error: errorText };
    }

    logInfo(`✅ Section ${rowId} deleted`);
    return { success: true };
  } catch (error) {
    logError('Delete section exception', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// COMBINED FETCH FOR API
// ============================================

export interface FactoryData {
  global: GlobalConfig;
  sections: Section[];
}

export async function getFactoryData(page: string = 'home'): Promise<FactoryData> {
  const [global, sections] = await Promise.all([
    getGlobalConfig(),
    getSections(page),
  ]);

  return { global, sections };
}

export async function getFactoryDataForAdmin(): Promise<FactoryData & { allSections: Section[] }> {
  const [global, sections, allSections] = await Promise.all([
    getGlobalConfig(),
    getSections('home'),
    getAllSections(),
  ]);

  return { global, sections, allSections };
}

// ============================================
// CHECK IF FACTORY V2 IS CONFIGURED
// ============================================

// Re-export depuis config.ts pour compatibilité
export { checkFactoryV2Config as isFactoryV2Configured };

