// ============================================
// 🔧 CONFIGURATION CENTRALISÉE - Factory V2
// ============================================
// Toutes les URLs et configurations externes sont centralisées ici.
// AUCUNE URL ne doit être hardcodée ailleurs dans le code.
//
// Variables d'environnement requises:
// - BASEROW_API_TOKEN: Token d'authentification Baserow
// - BASEROW_API_URL: URL de l'API Baserow (optionnel, défaut via BASEROW_BASE_URL)
// - BASEROW_FACTORY_GLOBAL_ID: ID de la table CONFIG_GLOBAL
// - BASEROW_FACTORY_SECTIONS_ID: ID de la table SECTIONS
// - BASEROW_FACTORY_LEADS_ID: ID de la table LEADS (optionnel)

// ============================================
// BASEROW CONFIGURATION
// ============================================

/**
 * URL de base de l'instance Baserow (sans /api)
 * Doit être configuré via BASEROW_BASE_URL ou BASEROW_API_URL
 */
export const BASEROW_BASE_URL = (() => {
  // Priorité: BASEROW_API_URL (sans /api) > BASEROW_BASE_URL > erreur
  const apiUrl = process.env.BASEROW_API_URL;
  if (apiUrl) {
    // Si l'URL termine par /api, on l'enlève pour avoir la base
    return apiUrl.replace(/\/api\/?$/, '');
  }
  
  const baseUrl = process.env.BASEROW_BASE_URL;
  if (baseUrl) {
    return baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // 🔴 ERREUR si non configuré
  console.error('[Config] ⚠️ BASEROW_BASE_URL ou BASEROW_API_URL non configuré!');
  return '';
})();

/**
 * URL de l'API Baserow (avec /api)
 */
export const BASEROW_API_URL = BASEROW_BASE_URL ? `${BASEROW_BASE_URL}/api` : '';

/**
 * Token d'authentification Baserow
 */
export const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN || '';

/**
 * IDs des tables Factory V2
 */
export const TABLE_IDS = {
  CONFIG_GLOBAL: process.env.BASEROW_FACTORY_GLOBAL_ID || '',
  SECTIONS: process.env.BASEROW_FACTORY_SECTIONS_ID || '',
  LEADS: process.env.BASEROW_FACTORY_LEADS_ID || '',
  // Table utilisateurs pour crédits IA et comptes
  USERS: process.env.BASEROW_USERS_TABLE_ID || '',
  // Legacy (pour compatibilité) - nombre pour fetchBaserow
  LEGAL_DOCS: 753,
} as const;

// ============================================
// N8N / WEBHOOKS CONFIGURATION
// ============================================

/**
 * URL de base n8n - À configurer via CONFIG_GLOBAL.contact.n8nWebhookUrl
 * ou via variable d'environnement N8N_WEBHOOK_BASE_URL
 */
export const N8N_WEBHOOK_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || '';

/**
 * Récupère l'URL du webhook contact depuis la config globale ou les variables d'env
 * @param globalConfig - Configuration globale (optionnel)
 */
export function getContactWebhookUrl(globalConfig?: { contact?: { n8nWebhookUrl?: string | null } }): string {
  // Priorité 1: Config globale Baserow
  if (globalConfig?.contact?.n8nWebhookUrl) {
    return globalConfig.contact.n8nWebhookUrl;
  }
  
  // Priorité 2: Variable d'environnement spécifique
  const envWebhook = process.env.N8N_CONTACT_WEBHOOK_URL;
  if (envWebhook) {
    return envWebhook;
  }
  
  // Priorité 3: Construction depuis la base URL
  if (N8N_WEBHOOK_BASE_URL) {
    return `${N8N_WEBHOOK_BASE_URL}/webhook/Contact`;
  }

  // Pas de webhook configuré
  return '';
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Vérifie que la configuration Baserow est complète
 */
export function isBaserowConfigured(): boolean {
  return !!(BASEROW_TOKEN && BASEROW_BASE_URL);
}

/**
 * Vérifie que Factory V2 est complètement configuré
 */
export function isFactoryV2Configured(): boolean {
  return !!(
    BASEROW_TOKEN &&
    BASEROW_BASE_URL &&
    TABLE_IDS.CONFIG_GLOBAL &&
    TABLE_IDS.SECTIONS
  );
}

/**
 * Log les problèmes de configuration (à appeler au démarrage)
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!BASEROW_TOKEN) {
    errors.push('BASEROW_API_TOKEN non défini');
  }
  
  if (!BASEROW_BASE_URL) {
    errors.push('BASEROW_BASE_URL ou BASEROW_API_URL non défini');
  }
  
  if (!TABLE_IDS.CONFIG_GLOBAL) {
    errors.push('BASEROW_FACTORY_GLOBAL_ID non défini');
  }
  
  if (!TABLE_IDS.SECTIONS) {
    errors.push('BASEROW_FACTORY_SECTIONS_ID non défini');
  }

  if (errors.length > 0) {
    console.warn('[Config] ⚠️ Configuration incomplète:', errors.join(', '));
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// EXPORTS POUR COMPATIBILITÉ
// ============================================

// Alias pour les imports existants
export const CONFIG_GLOBAL_TABLE_ID = TABLE_IDS.CONFIG_GLOBAL;
export const SECTIONS_TABLE_ID = TABLE_IDS.SECTIONS;
export const LEADS_TABLE_ID = TABLE_IDS.LEADS;
export const USERS_TABLE_ID = TABLE_IDS.USERS;

