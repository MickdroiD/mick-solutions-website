// ============================================
// GLOBAL SETTINGS - Types pour White Label
// ============================================
// Ces types définissent la structure complète des données
// nécessaires pour personnaliser le site par client.

/**
 * Types d'animation disponibles pour le site.
 * Configurable via Baserow pour le mode White Label.
 */
export type AnimationStyleType = 'Mick Electric' | 'Elegant Fade' | 'Dynamic Slide' | 'Minimal';

/**
 * Liste des styles d'animation valides.
 */
export const ANIMATION_STYLES: AnimationStyleType[] = [
  'Mick Electric',
  'Elegant Fade', 
  'Dynamic Slide',
  'Minimal'
];

/**
 * Interface complète pour les paramètres globaux du site.
 * Tous ces champs viennent de la table Baserow "SITEWEB Global_Infos".
 */
export interface GlobalSettingsComplete {
  id: number;

  // === IDENTITÉ DU SITE ===
  /** Nom du site/entreprise (ex: "Mick Solutions") */
  nomSite: string;
  /** Slogan court (ex: "Automatisation sur-mesure...") */
  slogan: string;
  /** Initiales pour le logo généré (ex: "MS") */
  initialesLogo: string;

  // === ASSETS VISUELS ===
  /** URL du logo principal (SVG recommandé) */
  logoUrl: string;
  /** URL du logo version claire (optionnel) */
  logoDarkUrl: string | null;
  /** URL du favicon personnalisé (optionnel, sinon utilise /favicon.ico) */
  faviconUrl: string | null;
  /** URL de l'image OpenGraph personnalisée (optionnel) */
  ogImageUrl: string | null;

  // === SEO & MÉTA ===
  /** Titre SEO principal (balise <title>) */
  metaTitre: string;
  /** Meta description principale */
  metaDescription: string;
  /** URL canonique du site (ex: "https://www.mick-solutions.ch") */
  siteUrl: string;
  /** Mots-clés SEO séparés par des virgules */
  motsCles: string;
  /** Langue du site (ex: "fr") */
  langue: string;
  /** Locale pour OpenGraph (ex: "fr_CH") */
  locale: string;

  // === BRANDING / COULEURS ===
  /** Couleur primaire en hexadécimal (ex: "#06b6d4") */
  couleurPrimaire: string;
  /** Couleur d'accent en hexadécimal (ex: "#a855f7") */
  couleurAccent: string;

  // === INFORMATIONS DE CONTACT ===
  /** Email de contact principal */
  email: string;
  /** Numéro de téléphone */
  telephone: string;
  /** Adresse affichée (ex: "Genève, Suisse") */
  adresse: string;
  /** URL de la page LinkedIn */
  lienLinkedin: string;
  /** URL du bouton "Réserver un appel" (Calendly, Cal.com, etc.) */
  lienBoutonAppel: string;

  // === SECTION HERO ===
  /** Titre principal du Hero (peut contenir des "." pour le split) */
  titreHero: string;
  /** Sous-titre du Hero */
  sousTitreHero: string;
  /** Badge au-dessus du titre (ex: "Automatisation intelligente") */
  badgeHero: string;
  /** Texte du bouton CTA principal */
  ctaPrincipal: string;
  /** Texte du bouton CTA secondaire */
  ctaSecondaire: string;

  // === TRUST INDICATORS (3 stats) ===
  /** Valeur de la stat 1 (ex: "100%") */
  trustStat1Value: string;
  /** Label de la stat 1 (ex: "Données en Suisse") */
  trustStat1Label: string;
  /** Valeur de la stat 2 (ex: "24/7") */
  trustStat2Value: string;
  /** Label de la stat 2 (ex: "Automatisation") */
  trustStat2Label: string;
  /** Valeur de la stat 3 (ex: "0") */
  trustStat3Value: string;
  /** Label de la stat 3 (ex: "Coûts cachés") */
  trustStat3Label: string;

  // === ANALYTICS ===
  /** ID du site Umami (optionnel) */
  umamiSiteId: string | null;
  /** URL du script Umami (optionnel) */
  umamiScriptUrl: string | null;

  // === FOOTER / LEGAL ===
  /** Texte de copyright (ex: "© 2025 Mick Solutions") */
  copyrightTexte: string;
  /** Badge de localisation (ex: "Hébergé en Suisse") */
  paysHebergement: string;

  // === ANIMATION & BRANDING DYNAMIQUE ===
  /** Style d'animation du site ('Mick Electric' | 'Elegant Fade' | 'Dynamic Slide' | 'Minimal') */
  animationStyle: AnimationStyleType;
  /** Code SVG brut pour un logo animé personnalisé (optionnel) */
  logoSvgCode: string | null;
}

/**
 * Interface legacy pour rétro-compatibilité.
 * À utiliser pendant la migration.
 */
export interface GlobalSettingsLegacy {
  id: number;
  email: string;
  telephone: string;
  lienLinkedin: string;
  titreHero: string;
  sousTitreHero: string;
  lienBoutonAppel: string;
}

/**
 * Type union pour la transition progressive.
 */
export type GlobalSettings = GlobalSettingsComplete | GlobalSettingsLegacy;

/**
 * Type guard pour vérifier si on a les settings complets.
 */
export function isCompleteSettings(
  settings: GlobalSettings | null
): settings is GlobalSettingsComplete {
  if (!settings) return false;
  return 'nomSite' in settings && 'siteUrl' in settings;
}

/**
 * Valeurs par défaut (fallback) pour le mode White Label.
 * Ces valeurs sont utilisées si Baserow ne renvoie pas les données.
 */
export const DEFAULT_SETTINGS: GlobalSettingsComplete = {
  id: 0,
  
  // Identité
  nomSite: 'Mick Solutions',
  slogan: 'Automatisation sur-mesure pour PME',
  initialesLogo: 'MS',
  
  // Assets
  logoUrl: '/logo.svg',
  logoDarkUrl: null,
  faviconUrl: null,
  ogImageUrl: null,
  
  // SEO
  metaTitre: 'Automatisation sur-mesure pour PME Suisses',
  metaDescription: 'Expert DevOps et Automation en Suisse. Gain de temps, Zéro dette technique et Données sécurisées.',
  siteUrl: 'https://www.mick-solutions.ch',
  motsCles: 'DevOps, Automation, n8n, Suisse, Genève, PME',
  langue: 'fr',
  locale: 'fr_CH',
  
  // Branding
  couleurPrimaire: '#06b6d4',
  couleurAccent: '#a855f7',
  
  // Contact
  email: 'contact@mick-solutions.ch',
  telephone: '',
  adresse: 'Genève, Suisse',
  lienLinkedin: 'https://linkedin.com/company/mick-solutions',
  lienBoutonAppel: '',
  
  // Hero
  titreHero: 'Gagnez du temps. Économisez de l\'argent. Restez concentrés.',
  sousTitreHero: 'L\'automatisation sur-mesure pour les PME suisses. Plus efficace qu\'un employé, 100% sécurisé.',
  badgeHero: 'Automatisation intelligente',
  ctaPrincipal: 'Demander un audit gratuit',
  ctaSecondaire: 'Découvrir nos services',
  
  // Trust
  trustStat1Value: '100%',
  trustStat1Label: 'Données en Suisse',
  trustStat2Value: '24/7',
  trustStat2Label: 'Automatisation',
  trustStat3Value: '0',
  trustStat3Label: 'Coûts cachés',
  
  // Analytics
  umamiSiteId: null,
  umamiScriptUrl: null,
  
  // Footer
  copyrightTexte: `© ${new Date().getFullYear()} Mick Solutions. Tous droits réservés.`,
  paysHebergement: 'Hébergé en Suisse',

  // Animation & Branding dynamique
  animationStyle: 'Mick Electric' as AnimationStyleType,
  logoSvgCode: null,
};

