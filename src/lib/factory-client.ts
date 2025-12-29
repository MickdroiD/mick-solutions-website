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
  type GlobalConfig,
  type Section,
  type SectionType,
} from './schemas/factory';

// ============================================
// CONFIGURATION
// ============================================

const BASEROW_API_URL =
  process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;

// Table IDs from env (set by setup script)
const CONFIG_GLOBAL_TABLE_ID = process.env.BASEROW_FACTORY_GLOBAL_ID || '';
const SECTIONS_TABLE_ID = process.env.BASEROW_FACTORY_SECTIONS_ID || '';

// ============================================
// TYPES
// ============================================

interface BaserowSelectOption {
  id: number;
  value: string;
  color: string;
}

interface BaserowConfigRow {
  id: number;
  Name?: string;
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

interface BaserowSectionRow {
  id: number;
  Type?: BaserowSelectOption | string;
  Is_Active?: boolean;
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

  // Parse each JSON column with Zod validation
  const identityRaw = safeJsonParse<Record<string, unknown>>(row.Name, {}, 'Identity');
  const seoRaw = safeJsonParse<Record<string, unknown>>(row.SEO_Metadata, {}, 'SEO_Metadata');
  const brandingRaw = safeJsonParse<Record<string, unknown>>(row.Branding, {}, 'Branding');
  const contactRaw = safeJsonParse<Record<string, unknown>>(row.Contact, {}, 'Contact');
  const integrationsRaw = safeJsonParse<Record<string, unknown>>(row.Integrations, {}, 'Integrations');
  const assetsRaw = safeJsonParse<Record<string, unknown>>(row.Assets, {}, 'Assets');
  const aiRaw = safeJsonParse<Record<string, unknown>>(row.AI_Config, {}, 'AI_Config');
  const animationsRaw = safeJsonParse<Record<string, unknown>>(row.Animations, {}, 'Animations');
  const premiumRaw = safeJsonParse<Record<string, unknown>>(row.Premium, {}, 'Premium');
  const footerRaw = safeJsonParse<Record<string, unknown>>(row.Footer, {}, 'Footer');

  // Validate with Zod (safeParse for graceful degradation)
  const identity = IdentitySchema.safeParse({
    nomSite: row.Name || identityRaw['nomSite'],
    ...identityRaw,
  });
  const seo = SEOSchema.safeParse(seoRaw);
  const branding = BrandingSchema.safeParse(brandingRaw);
  const contact = ContactInfoSchema.safeParse(contactRaw);
  const integrations = IntegrationsSchema.safeParse(integrationsRaw);
  const assets = AssetsSchema.safeParse(assetsRaw);
  const ai = AIConfigSchema.safeParse(aiRaw);
  const animations = AnimationsConfigSchema.safeParse(animationsRaw);
  const premium = PremiumSchema.safeParse(premiumRaw);
  const footer = FooterConfigSchema.safeParse(footerRaw);

  // Log validation errors but don't crash
  if (!identity.success) logWarn('Identity validation failed', identity.error.issues);
  if (!seo.success) logWarn('SEO validation failed', seo.error.issues);
  if (!branding.success) logWarn('Branding validation failed', branding.error.issues);
  if (!contact.success) logWarn('Contact validation failed', contact.error.issues);
  if (!integrations.success) logWarn('Integrations validation failed', integrations.error.issues);
  if (!assets.success) logWarn('Assets validation failed', assets.error.issues);
  if (!ai.success) logWarn('AI validation failed', ai.error.issues);
  if (!animations.success) logWarn('Animations validation failed', animations.error.issues);
  if (!premium.success) logWarn('Premium validation failed', premium.error.issues);
  if (!footer.success) logWarn('Footer validation failed', footer.error.issues);

  // Build config with fallbacks
  const config: GlobalConfig = {
    id: row.id,
    identity: identity.success ? identity.data : DEFAULT_GLOBAL_CONFIG.identity,
    seo: seo.success ? seo.data : DEFAULT_GLOBAL_CONFIG.seo,
    branding: branding.success ? branding.data : DEFAULT_GLOBAL_CONFIG.branding,
    contact: contact.success ? contact.data : DEFAULT_GLOBAL_CONFIG.contact,
    integrations: integrations.success ? integrations.data : DEFAULT_GLOBAL_CONFIG.integrations,
    assets: assets.success ? assets.data : DEFAULT_GLOBAL_CONFIG.assets,
    ai: ai.success ? ai.data : DEFAULT_GLOBAL_CONFIG.ai,
    animations: animations.success ? animations.data : DEFAULT_GLOBAL_CONFIG.animations,
    premium: premium.success ? premium.data : DEFAULT_GLOBAL_CONFIG.premium,
    footer: footer.success ? footer.data : DEFAULT_GLOBAL_CONFIG.footer,
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
    logWarn('No sections found, using defaults', error);
    return [DEFAULT_HERO_SECTION];
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
    const content = safeJsonParse(row.Content, {}, `Section ${row.id} Content`);
    const design = safeJsonParse(row.Design, {}, `Section ${row.id} Design`);

    // Build section object
    const sectionData = {
      type: sectionType,
      isActive: row.Is_Active ?? true,
      order: typeof row.Order === 'string' ? parseInt(row.Order, 10) : (row.Order ?? 0),
      page: row.Page || 'home',
      content,
      design,
    };

    // Validate with discriminated union
    const validation = SectionSchema.safeParse(sectionData);

    if (validation.success) {
      sections.push(validation.data);
      logInfo(`✅ Section "${sectionType}" (ID: ${row.id}) loaded`);
    } else {
      logWarn(`Section ${row.id} (${sectionType}) validation failed`, validation.error.issues);
      // Try to include with raw data anyway (graceful degradation)
      try {
        sections.push(sectionData as Section);
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
    const content = safeJsonParse(row.Content, {}, `Section ${row.id} Content`);
    const design = safeJsonParse(row.Design, {}, `Section ${row.id} Design`);

    const sectionData = {
      id: row.id, // Include row ID for updates
      type: sectionType,
      isActive: row.Is_Active ?? true,
      order: typeof row.Order === 'string' ? parseInt(row.Order, 10) : (row.Order ?? 0),
      page: row.Page || 'home',
      content,
      design,
    };

    const validation = SectionSchema.safeParse(sectionData);
    if (validation.success) {
      // Add rowId for admin operations
      sections.push({ ...validation.data, _rowId: row.id } as Section & { _rowId: number });
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

  // First, get the current config to find the row ID
  const { data: rows } = await fetchBaserowTable<BaserowConfigRow>(
    CONFIG_GLOBAL_TABLE_ID,
    { size: 1 }
  );

  if (!rows || rows.length === 0) {
    return { success: false, error: 'Aucune ligne de config trouvée' };
  }

  const rowId = rows[0].id;

  // Build update payload
  const updateData: Record<string, unknown> = {};

  if (partialConfig.identity) {
    // Name is a special field (not JSON)
    if (partialConfig.identity.nomSite) {
      updateData['Name'] = partialConfig.identity.nomSite;
    }
    // Rest goes to JSON... but Identity is spread across Name + Identity JSON
    // For simplicity, we store full identity in Name field as JSON isn't separate
  }

  if (partialConfig.seo) {
    updateData['SEO_Metadata'] = JSON.stringify(partialConfig.seo);
  }

  if (partialConfig.branding) {
    updateData['Branding'] = JSON.stringify(partialConfig.branding);
  }

  if (partialConfig.contact) {
    updateData['Contact'] = JSON.stringify(partialConfig.contact);
  }

  if (partialConfig.integrations) {
    updateData['Integrations'] = JSON.stringify(partialConfig.integrations);
  }

  if (partialConfig.assets) {
    updateData['Assets'] = JSON.stringify(partialConfig.assets);
  }

  if (partialConfig.ai) {
    updateData['AI_Config'] = JSON.stringify(partialConfig.ai);
  }

  if (partialConfig.animations) {
    updateData['Animations'] = JSON.stringify(partialConfig.animations);
  }

  if (partialConfig.premium) {
    updateData['Premium'] = JSON.stringify(partialConfig.premium);
  }

  if (partialConfig.footer) {
    updateData['Footer'] = JSON.stringify(partialConfig.footer);
  }

  logInfo(`Updating config row ${rowId} with ${Object.keys(updateData).length} fields`);

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
    updateData['Is_Active'] = updates.isActive;
  }

  if (updates.order !== undefined) {
    updateData['Order'] = updates.order;
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

  logInfo(`Updating section row ${rowId} with ${Object.keys(updateData).length} fields`);

  const { error } = await updateBaserowRow(SECTIONS_TABLE_ID, rowId, updateData);

  if (error) {
    return { success: false, error };
  }

  logInfo(`✅ Section ${rowId} updated successfully`);
  return { success: true };
}

// ============================================
// CREATE SECTION
// ============================================

export async function createSection(
  section: Omit<Section, 'id'>
): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!validateConfig() || !BASEROW_TOKEN) {
    return { success: false, error: 'Configuration manquante' };
  }

  const createData: Record<string, unknown> = {
    Type: section.type,
    Is_Active: section.isActive,
    Order: section.order,
    Content: JSON.stringify(section.content),
    Design: JSON.stringify(section.design),
    Page: section.page || 'home',
  };

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

export function isFactoryV2Configured(): boolean {
  return !!(
    BASEROW_TOKEN &&
    CONFIG_GLOBAL_TABLE_ID &&
    SECTIONS_TABLE_ID &&
    CONFIG_GLOBAL_TABLE_ID !== '' &&
    SECTIONS_TABLE_ID !== ''
  );
}

