// ============================================
// AUTH - White Label Factory V2 (2025)
// ============================================
// Authentification simplifiée via Variable d'Environnement
// Plus de dépendance Baserow pour l'auth!

export interface AuthUser {
  id: number;
  name: string;
  role: 'admin' | 'client';
  siteId: string | null;
}

export interface AuthResult {
  isAuthenticated: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Vérifie un PIN utilisateur contre ADMIN_PASSWORD (env var)
 * 
 * Accepte:
 * - PIN à 6 chiffres (ex: "123456")
 * - Mot de passe custom (si ADMIN_PASSWORD n'est pas numérique)
 */
export async function verifyUserPin(pin: string): Promise<AuthResult> {
  // Validation basique
  if (!pin || pin.trim().length === 0) {
    return { isAuthenticated: false, error: 'PIN/Password requis' };
  }

  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN;

  // ========================================
  // VÉRIFICATION #1: Env var configurée?
  // ========================================
  if (!adminPassword) {
    console.error('[AUTH] ❌ ADMIN_PASSWORD non configuré dans les variables d\'environnement');
    return { 
      isAuthenticated: false, 
      error: 'Erreur de configuration serveur (ADMIN_PASSWORD manquant)' 
    };
  }

  // ========================================
  // VÉRIFICATION #2: Comparaison du PIN
  // ========================================
  const inputPinTrimmed = String(pin).trim();
  const adminPasswordTrimmed = String(adminPassword).trim();

  if (inputPinTrimmed !== adminPasswordTrimmed) {
    console.log('[AUTH] ❌ PIN incorrect');
    return { isAuthenticated: false, error: 'PIN incorrect' };
  }

  // ========================================
  // SUCCÈS - Admin authentifié
  // ========================================
  console.log('[AUTH] ✅ Authentification réussie (Admin)');

  // Récupérer le nom du site depuis les env vars si disponible
  const siteName = process.env.SITE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || 'Admin';

  return {
    isAuthenticated: true,
    user: {
      id: 1, // ID fixe pour l'admin
      name: siteName,
      role: 'admin',
      siteId: null, // Admin a accès à tout
    },
  };
}

/**
 * Génère un PIN unique à 6 chiffres
 * Utilisé par le script de provisioning
 */
export function generateUniquePin(): string {
  // Générer un PIN aléatoire entre 100000 et 999999
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Clé API IA par défaut pour les nouveaux clients
 */
export const DEFAULT_AI_CONFIG = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: process.env.DEFAULT_AI_API_KEY || '',
  maxTokens: 2000,
  temperature: 0.7,
  systemPrompt: 'Tu es un assistant professionnel qui aide les visiteurs du site. Réponds de manière concise et utile.',
};
