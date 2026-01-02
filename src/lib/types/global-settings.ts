// ============================================
// GLOBAL SETTINGS - White Label Factory 2025
// ============================================
// Types complets pour l'architecture modulaire.
// 140 champs configurables via Baserow.
//
// ⚠️  DEPRECATED - Ce fichier est en cours de migration
// ============================================
// Cette architecture "flat-table" à 140+ colonnes est remplacée par
// l'architecture Block-Based Factory V2 (relationnelle).
//
// NOUVEAU FICHIER: src/lib/schemas/factory.ts
// - GlobalConfigSchema (settings structurés en sous-objets JSON)
// - SectionSchema (union discriminée par type)
//
// Ce fichier reste disponible pour compatibilité ascendante.
// Migration prévue: Q1 2025
// ============================================

// ============================================
// BASEROW FILE TYPE
// ============================================
// Structure d'un fichier uploadé dans Baserow (File field).
// Utilisé pour Logo URL, Favicon, OG Image, etc.

export interface BaserowFile {
  /** URL complète du fichier */
  url: string;
  /** Nom affiché dans l'interface Baserow */
  visible_name: string;
  /** Nom technique du fichier (avec hash) */
  name: string;
  /** Taille du fichier en octets */
  size: number;
  /** Type MIME (ex: image/svg+xml, image/png) */
  mime_type: string;
  /** true si c'est une image reconnue par Baserow */
  is_image: boolean;
  /** Largeur en pixels (si is_image = true) */
  image_width: number | null;
  /** Hauteur en pixels (si is_image = true) */
  image_height: number | null;
  /** Date d'upload ISO 8601 */
  uploaded_at: string;
  /** Miniatures générées (peut être null pour SVG) */
  thumbnails: BaserowThumbnails | null;
}

export interface BaserowThumbnails {
  tiny?: { url: string; width: number; height: number };
  small?: { url: string; width: number; height: number };
  card_cover?: { url: string; width: number; height: number };
}

/**
 * Type helper pour les champs File Baserow
 * Dans les données brutes: BaserowFile[] | null
 * Après transformation: string | null (URL extraite)
 */
export type BaserowFileField = BaserowFile[] | null;

// ============================================
// TYPES DE VARIANTES (4 choix + AI)
// ============================================

export type VariantStyle = 'Minimal' | 'Corporate' | 'Electric' | 'Bold' | 'AI' | 'Custom';
export type AnimationStyleType = 'Mick Electric' | 'Mick-Electrique' | 'Elegant Fade' | 'Dynamic Slide' | 'minimal' | 'Minimal' | null | undefined;
export type AnimationSpeed = 'Slow' | 'Normal' | 'Fast' | 'Instant';
export type ScrollEffect = 'None' | 'Fade' | 'Slide' | 'Zoom' | 'Parallax';
export type HoverEffect = 'None' | 'Scale' | 'Glow' | 'Lift' | 'Shake';
export type LoadingStyle = 'None' | 'Skeleton' | 'Spinner' | 'Progress';
export type ImageStyle = 'Square' | 'Rounded' | 'Circle' | 'Custom';
export type ImageFilter = 'None' | 'Grayscale' | 'Sepia' | 'Contrast' | 'Blur';
export type CardStyle = 'Flat' | 'Shadow' | 'Border' | 'Glassmorphism';
export type BorderRadius = 'None' | 'Small' | 'Medium' | 'Large' | 'Full';
export type FontFamily = 'Inter' | 'Poppins' | 'Space-Grotesk' | 'Outfit' | 'Montserrat' | 'DM-Sans' | 'Custom';
export type PatternBackground = 'None' | 'Grid' | 'Dots' | 'Circuit' | 'Gradient' | 'Custom';
export type LogoSize = 'Small' | 'Medium' | 'Large' | 'XLarge';
export type HeroHeight = 'Short' | 'Medium' | 'Tall' | 'FullScreen';
export type SectionSpacing = 'Compact' | 'Normal' | 'Spacious' | 'Ultra';
export type AIMode = 'Disabled' | 'Placeholder' | 'Live';
export type AIProvider = 'OpenAI' | 'Anthropic' | 'n8n' | 'Custom';
export type AITone = 'Professional' | 'Friendly' | 'Casual' | 'Formal';
export type AIIndustry = 'Tech' | 'Finance' | 'Health' | 'Retail' | 'Services' | 'Other';
export type VoiceLanguage = 'fr-FR' | 'en-US' | 'de-DE' | 'it-IT';
export type GalleryColumns = '2' | '3' | '4' | 'Auto';
export type LogoAnimation =
  | 'none'
  | 'spin'
  | 'pulse'
  | 'bounce'
  | 'electric'
  | 'lightning_circle'
  | 'rotate'
  | 'spin_glow'
  // New direct effects
  | 'float'
  | 'swing'
  | 'flip-3d'
  | 'stretch'
  | 'morph'
  // Legacy values (backward compatibility)
  | 'Spin-Glow'
  | 'Pulse'
  | 'Bounce'
  | 'None';

// New indirect effects (external animations around elements)
export type IndirectEffect =
  | 'none'
  | 'neon-outline'
  | 'particle-orbit'
  | 'ripple'
  | 'lightning-strike'
  | 'aurora';

// Effect intensity levels
export type EffectIntensity = 'subtle' | 'normal' | 'strong' | 'extreme';

// Neon color presets
export type NeonColorPreset =
  | 'cyan'
  | 'purple'
  | 'pink'
  | 'green'
  | 'orange'
  | 'gold'
  | 'red'
  | 'blue'
  | 'white';

// Enhanced frame shapes
export type FrameShape =
  | 'none'
  | 'square'
  | 'rounded-square'
  | 'circle'
  | 'hexagon'
  | 'octagon'
  | 'diamond';

// Frame animations
export type FrameAnimation =
  | 'none'
  | 'rotate'
  | 'pulse'
  | 'color-flow'
  | 'dash-flow'
  | 'glow-pulse';

// Frame color modes
export type FrameColorMode =
  | 'solid'
  | 'gradient'
  | 'moving-gradient'
  | 'rainbow';

export type LogoFrameStyle = 'Square' | 'Circle' | 'ThickCircle' | 'None';
export type TextAnimation = 'Gradient' | 'Typing' | 'Fade' | 'None';
export type GalleryAnimation = 'Fade' | 'Slide' | 'Zoom' | 'Flip' | 'None';

// Variantes spécifiques par module
export type ServicesVariant = 'Grid' | 'Accordion' | 'Cards' | 'Showcase';
export type GalleryVariant = 'Grid' | 'Slider' | 'Masonry' | 'AI';
export type TestimonialsVariant = 'Minimal' | 'Carousel' | 'Cards' | 'Video';
export type FAQVariant = 'Minimal' | 'Accordion' | 'Tabs' | 'Search';
export type ContactVariant = 'Minimal' | 'Form' | 'Calendar' | 'Chat';
export type AIAssistantStyle = 'Chat' | 'Voice' | 'Banner' | 'Hidden';

// ============================================
// SHARED TYPES (EFFECTS & TEXT)
// ============================================

export interface EffectSettings {
  // ========== LAYOUT ==========
  heroLayout?: 'text-left' | 'text-right' | 'centered' | 'split';
  columnGap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // ========== DESIGN (Legacy) ==========
  variant?: 'Minimal' | 'Corporate' | 'Electric' | 'Bold' | 'AI' | 'Custom' | string;
  height?: 'Short' | 'Medium' | 'Tall' | 'FullScreen';
  logoSize?: number;

  // ========== BOUTONS ==========
  buttonShape?: 'rounded' | 'pill' | 'square';
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
  buttonStyle?: 'solid' | 'gradient' | 'outline' | 'ghost';
  showButtonIcon?: boolean;
  buttonHoverScale?: number;

  // ========== LOGO/IMAGE EFFECTS ==========
  logoAnimation?: 'none' | 'spin' | 'pulse' | 'bounce' | 'electric' | 'float' | string;
  logoDirectEffect?: string;
  logoIndirectEffect?: string;
  logoFrameShape?: string;
  logoFrameAnimation?: string;
  logoFrameColor?: string;
  logoFrameThickness?: number;
  effectSecondaryColor?: string;

  // ========== ANIMATIONS ==========
  animationSpeed?: 'slow' | 'normal' | 'fast';
  animationIntensity?: 'subtle' | 'normal' | 'strong' | 'intense';
  effectPrimaryColor?: string;

  // ========== BACKGROUND ==========
  backgroundOpacity?: number;
  backgroundBlur?: number;
  backgroundUrl?: string | null;

  // ========== OVERLAY ==========
  overlayColor?: 'black' | 'white' | 'primary' | 'accent' | 'slate';
  overlayOpacity?: number;

  // ========== BLOBS ==========
  showBlobs?: boolean;
  blobSize?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  blob1Color?: string;
  blob2Color?: string;

  // ========== ADVANCED ==========
  showScrollIndicator?: boolean;
  scrollIndicatorStyle?: 'mouse' | 'arrow' | 'chevron' | 'dot';
  statsLayout?: 'horizontal' | 'vertical' | 'grid-2' | 'grid-3';
}

export interface TextSettings {
  // Title
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  titleAlign?: string;
  titleTransform?: string;

  // Subtitle
  subtitleFontFamily?: string;
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  subtitleColor?: string;

  // Body text
  bodyFontFamily?: string;
  bodyFontSize?: string;
  bodyLineHeight?: string;
  bodyColor?: string;
}

// ============================================
// INTERFACE PRINCIPALE
// ============================================

export interface GlobalSettingsComplete {
  id: number;

  // ========== A. IDENTITÉ DU SITE ==========
  nomSite: string;
  slogan: string;
  initialesLogo: string;

  // ========== B. ASSETS VISUELS ==========
  /** URL du logo principal (null = utiliser initiales) */
  logoUrl: string | null;
  logoDarkUrl: string | null;
  logoSvgCode: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  heroBackgroundUrl: string | null;
  heroVideoUrl: string | null;

  // ========== C. SEO & MÉTA ==========
  metaTitre: string;
  metaDescription: string;
  siteUrl: string;
  motsCles: string;
  langue: string;
  locale: string;
  robotsIndex: boolean;
  sitemapPriority: number | null;

  // ========== D. BRANDING / COULEURS ==========
  couleurPrimaire: string;
  couleurAccent: string;
  couleurBackground: string;
  couleurText: string;
  fontPrimary: FontFamily | null;
  fontHeading: FontFamily | null;
  fontCustomUrl: string | null;
  borderRadius: BorderRadius | null;
  patternBackground: PatternBackground | null;

  // ========== E. CONTACT ==========
  email: string;
  telephone: string | null;
  adresse: string;
  adresseCourte: string | null;
  lienLinkedin: string;
  lienInstagram: string | null;
  lienTwitter: string | null;
  lienYoutube: string | null;
  lienGithub: string | null;
  lienCalendly: string | null;
  lienWhatsapp: string | null;
  lienBoutonAppel: string;
  texteBoutonAppel: string; // Texte affiché sur le bouton appel navbar

  // ========== F. SECTION HERO ==========
  titreHero: string;
  sousTitreHero: string;
  badgeHero: string;
  ctaPrincipal: string;
  ctaPrincipalUrl: string | null;
  ctaSecondaire: string;
  ctaSecondaireUrl: string | null;
  heroAiPrompt: string | null;

  // ========== G. TRUST STATS ==========
  trustStat1Value: string;
  trustStat1Label: string;
  trustStat2Value: string;
  trustStat2Label: string;
  trustStat3Value: string;
  trustStat3Label: string;

  // ========== H. FOOTER ==========
  copyrightTexte: string | null;
  paysHebergement: string | null;
  showLegalLinks: boolean;
  customFooterText: string | null;
  // 🆕 Titres des sections (configurables)
  footerContactTitle: string | null;
  footerLegalTitle: string | null;
  footerNavigationTitle: string | null;
  // 🆕 CTA Footer
  footerCtaText: string | null;
  footerCtaUrl: string | null;
  footerCtaHeading: string | null;
  // 🆕 Powered By (White Label)
  footerPoweredByText: string | null;
  showFooterPoweredBy: boolean;
  // Logo
  footerLogoSize: number | null;
  footerLogoAnimation: LogoAnimation | null;
  footerLogoUrl: string | null;
  footerLogoSvgCode: string | null;
  // 🆕 Style footer personnalisé
  footerBgColor: string | null;
  footerTextColor: string | null;
  footerBorderColor: string | null;

  // 🆕 Effects & Text settings pour le footer
  footerEffects?: EffectSettings;
  footerTextSettings?: TextSettings;

  // ========== I. ANALYTICS ==========
  umamiSiteId: string | null;
  umamiScriptUrl: string | null;
  gaMeasurementId: string | null;
  gtmContainerId: string | null;
  hotjarSiteId: string | null;
  facebookPixelId: string | null;

  // ========== J. MODULES - ACTIVATION ==========
  showNavbar: boolean;
  showHero: boolean;
  showAdvantages: boolean;
  showServices: boolean;
  showGallery: boolean;
  showPortfolio: boolean;
  showTestimonials: boolean;
  showTrust: boolean;
  showFaq: boolean;
  showBlog: boolean;
  showContact: boolean;
  showAiAssistant: boolean;
  showCookieBanner: boolean;
  showAnalytics: boolean;

  // ========== K. MODULES - VARIANTES ==========
  themeGlobal: VariantStyle | null;
  heroVariant: VariantStyle | null;
  navbarVariant: VariantStyle | null;
  servicesVariant: ServicesVariant | null;
  galleryVariant: GalleryVariant | null;
  testimonialsVariant: TestimonialsVariant | null;
  faqVariant: FAQVariant | null;
  contactVariant: ContactVariant | null;
  footerVariant: VariantStyle | null;
  aiAssistantStyle: AIAssistantStyle | null;

  // ========== L. TAILLES & DIMENSIONS ==========
  logoSize: LogoSize | null;
  heroHeight: HeroHeight | null;
  sectionSpacing: SectionSpacing | null;
  cardStyle: CardStyle | null;

  // ========== M. ANIMATIONS & EFFETS ==========
  enableAnimations: boolean;
  animationStyle: AnimationStyleType;
  animationSpeed: AnimationSpeed | null;
  scrollEffect: ScrollEffect | null;
  hoverEffect: HoverEffect | null;
  loadingStyle: LoadingStyle | null;
  logoAnimation: LogoAnimation | null;  // Legacy: fallback général
  logoFrameStyle: LogoFrameStyle | null;
  textAnimation: TextAnimation | null;
  galleryAnimation: GalleryAnimation | null;
  headerLogoSize: number | null;  // Taille logo header en pixels (20-300)
  headerLogoAnimation: LogoAnimation | null;  // Animation logo menu header
  heroLogoAnimation: LogoAnimation | null;  // Animation logo central hero
  heroLogoSize: number | null;  // Taille logo hero en pixels (100-600)
  // 🆕 Logo dédié header (peut être différent du logo principal)
  headerLogoUrl: string | null;
  headerLogoSvgCode: string | null;
  // 🆕 Style header personnalisé
  headerBgColor: string | null;
  headerTextColor: string | null;
  headerBorderColor: string | null;
  showTopBar: boolean;
  headerSiteTitle: string | null;
  headerMenuLinks: string | null;
  headerCtaText: string | null;
  headerCtaUrl: string | null;
  showHeaderCta: boolean;

  // 🆕 Effects & Text settings pour le header
  headerEffects?: EffectSettings;
  headerTextSettings?: TextSettings;

  // ========== M.1. HERO EFFECTS & TEXT SETTINGS (New) ==========
  effects?: EffectSettings;
  textSettings?: TextSettings;
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  titleAlign?: string;
  titleTransform?: string;
  subtitleFontFamily?: string;
  subtitleFontSize?: string;
  subtitleFontWeight?: string;

  // ========== N. PHOTOS & MÉDIAS ==========
  imageStyle: ImageStyle | null;
  imageFilter: ImageFilter | null;
  galleryColumns: GalleryColumns | null;
  galleryTitle: string | null;
  gallerySubtitle: string | null;
  videoAutoplay: boolean;
  lazyLoading: boolean;

  // ========== O. MODULE IA ==========
  aiMode: AIMode | null;
  aiProvider: AIProvider | null;
  aiApiKey: string | null;
  aiModel: string | null;
  aiSystemPrompt: string | null;
  aiWebhookUrl: string | null;
  aiImageWebhook: string | null;
  aiMaxTokens: number | null;
  aiTemperature: number | null;
  chatbotWelcomeMessage: string | null;
  chatbotPlaceholder: string | null;
  chatbotAvatarUrl: string | null;
  voiceEnabled: boolean;
  voiceLanguage: VoiceLanguage | null;

  // ========== P. MODULE IA AVANCÉ ==========
  aiGenerateHero: boolean;
  aiGenerateServices: boolean;
  aiGenerateFaq: boolean;
  aiTone: AITone | null;
  aiIndustry: AIIndustry | null;
  aiTargetAudience: string | null;
  aiKeywords: string | null;
  aiLastGeneration: string | null;

  // ========== Q. INTÉGRATIONS EXTERNES ==========
  n8nWebhookContact: string | null;
  n8nWebhookNewsletter: string | null;
  stripePublicKey: string | null;
  mailchimpListId: string | null;
  sendgridApiKey: string | null;
  notionDatabaseId: string | null;
  airtableBaseId: string | null;

  // ========== R. PREMIUM ==========
  isPremium: boolean;
  premiumUntil: string | null;
  customDomain: string | null;
  customCss: string | null;
  customJs: string | null;
  featureFlags: string[];
  rateLimitApi: number | null;

  // ========== S. LAYOUT & ORDER ==========
  /** Ordre des sections JSON array: ["hero", "services", "portfolio", "contact"] */
  sectionOrder: string[] | null;

  // ... dans GlobalSettingsComplete ...

  // ========== T. GRID BLOCKS ==========
  /** Structure JSON de la grille Hero : [{ id, width, type, content, animation }] */
  heroBlocks: GridBlock[] | null;

  // ========== V2 BRIDGING ==========
  branding?: Record<string, unknown>;
  identity?: Record<string, unknown>;
}

// ============================================
// HERO GRID BLOCK TYPE
// ============================================

export interface GridBlock {
  id: string;
  type: 'image' | 'text' | 'logo' | 'shape';
  width: '25%' | '50%' | '100%';
  content: string;
  animation?: string;
  style?: Record<string, unknown>;
}

// ============================================
// VALEURS PAR DÉFAUT
// ============================================

export const DEFAULT_SETTINGS: GlobalSettingsComplete = {
  id: 0,

  // Identité
  nomSite: 'Mon Site',
  slogan: 'Slogan par défaut',
  initialesLogo: 'MS',

  // New Header & Footer Effects default
  headerEffects: {},
  headerTextSettings: {},
  footerEffects: {},
  footerTextSettings: {},

  // Assets - White Label: pas de logo par défaut
  logoUrl: null,
  logoDarkUrl: null,
  logoSvgCode: null,
  faviconUrl: null,
  ogImageUrl: null,
  heroBackgroundUrl: null,
  heroVideoUrl: null,

  // SEO
  metaTitre: 'Mon Site - Titre SEO',
  metaDescription: 'Description SEO par défaut',
  siteUrl: 'https://example.com',
  motsCles: '',
  langue: 'fr',
  locale: 'fr_CH',
  robotsIndex: true,
  sitemapPriority: 0.8,

  // Branding
  couleurPrimaire: '#06b6d4',
  couleurAccent: '#a855f7',
  couleurBackground: '#0a0a0f',
  couleurText: '#ffffff',
  fontPrimary: 'Inter',
  fontHeading: 'Inter',
  fontCustomUrl: null,
  borderRadius: 'Medium',
  patternBackground: 'Grid',

  // Contact
  email: 'contact@example.com',
  telephone: null,
  adresse: 'Adresse, Pays',
  adresseCourte: null,
  lienLinkedin: '',
  lienInstagram: null,
  lienTwitter: null,
  lienYoutube: null,
  lienGithub: null,
  lienCalendly: null,
  lienWhatsapp: null,
  lienBoutonAppel: '',
  texteBoutonAppel: 'Réserver un appel',

  // Hero
  titreHero: 'Titre Principal. Deuxième ligne. Troisième ligne.',
  sousTitreHero: 'Sous-titre descriptif de votre activité.',
  badgeHero: 'Badge',
  ctaPrincipal: 'Action Principale',
  ctaPrincipalUrl: '#contact',
  ctaSecondaire: 'En savoir plus',
  ctaSecondaireUrl: '#services',
  heroAiPrompt: null,

  // Trust Stats
  trustStat1Value: '100%',
  trustStat1Label: 'Stat 1',
  trustStat2Value: '24/7',
  trustStat2Label: 'Stat 2',
  trustStat3Value: '0',
  trustStat3Label: 'Stat 3',

  // Footer - 🚫 Pas de valeurs par défaut hardcodées
  copyrightTexte: null,
  paysHebergement: null,
  showLegalLinks: true,
  customFooterText: null,
  // 🆕 Titres des sections
  footerContactTitle: null,
  footerLegalTitle: null,
  footerNavigationTitle: null,
  // 🆕 CTA Footer
  footerCtaText: null,
  footerCtaUrl: null,
  footerCtaHeading: null,
  // 🆕 Powered By
  footerPoweredByText: null,
  showFooterPoweredBy: false,
  // Logo
  footerLogoSize: 40,
  footerLogoAnimation: 'none',
  footerLogoUrl: null,
  footerLogoSvgCode: null,
  // 🆕 Style footer personnalisé
  footerBgColor: null,
  footerTextColor: null,
  footerBorderColor: null,

  // Analytics
  umamiSiteId: null,
  umamiScriptUrl: null,
  gaMeasurementId: null,
  gtmContainerId: null,
  hotjarSiteId: null,
  facebookPixelId: null,

  // Modules - Activation
  showNavbar: true,
  showHero: true,
  showAdvantages: true,
  showServices: true,
  showGallery: false,
  showPortfolio: true,
  showTestimonials: true,
  showTrust: true,
  showFaq: false,
  showBlog: false,
  showContact: true,
  showAiAssistant: false,
  showCookieBanner: true,
  showAnalytics: false,

  // Modules - Variantes
  themeGlobal: 'Electric',
  heroVariant: 'Electric',
  navbarVariant: 'Electric',
  servicesVariant: 'Cards',
  galleryVariant: 'Grid',
  testimonialsVariant: 'Cards',
  faqVariant: 'Accordion',
  contactVariant: 'Form',
  footerVariant: 'Electric',
  aiAssistantStyle: 'Chat',

  // Tailles
  logoSize: 'Medium',
  heroHeight: 'Tall',
  sectionSpacing: 'Normal',
  cardStyle: 'Shadow',

  // Animations
  enableAnimations: true,
  animationStyle: 'Mick Electric',
  animationSpeed: 'Normal',
  scrollEffect: 'Fade',
  hoverEffect: 'Scale',
  loadingStyle: 'Skeleton',
  logoAnimation: 'Spin-Glow',  // Legacy fallback
  logoFrameStyle: 'Square',
  textAnimation: 'Gradient',
  galleryAnimation: 'Fade',
  headerLogoSize: 40,
  headerLogoAnimation: 'spin',  // Animation logo header (menu)
  heroLogoAnimation: 'electric',  // Animation logo hero (big center)
  heroLogoSize: 280,  // Taille logo hero en pixels
  // 🆕 Logo dédié header
  headerLogoUrl: null,
  headerLogoSvgCode: null,
  // 🆕 Style header personnalisé
  headerBgColor: null,
  headerTextColor: null,
  headerBorderColor: null,
  showTopBar: false,
  headerSiteTitle: null,
  headerMenuLinks: null,
  headerCtaText: null,
  headerCtaUrl: null,
  showHeaderCta: true,

  // Photos
  imageStyle: 'Rounded',
  imageFilter: 'None',
  galleryColumns: '3',
  galleryTitle: null,
  gallerySubtitle: null,
  videoAutoplay: false,
  lazyLoading: true,

  // IA
  aiMode: 'Disabled',
  aiProvider: 'OpenAI',
  aiApiKey: null,
  aiModel: 'gpt-4o',
  aiSystemPrompt: null,
  aiWebhookUrl: null,
  aiImageWebhook: null,
  aiMaxTokens: 1000,
  aiTemperature: 0.7,
  chatbotWelcomeMessage: 'Bonjour ! Comment puis-je vous aider ?',
  chatbotPlaceholder: 'Posez votre question...',
  chatbotAvatarUrl: null,
  voiceEnabled: false,
  voiceLanguage: 'fr-FR',

  // IA Avancé
  aiGenerateHero: false,
  aiGenerateServices: false,
  aiGenerateFaq: false,
  aiTone: 'Professional',
  aiIndustry: 'Services',
  aiTargetAudience: null,
  aiKeywords: null,
  aiLastGeneration: null,

  // Intégrations
  n8nWebhookContact: null,
  n8nWebhookNewsletter: null,
  stripePublicKey: null,
  mailchimpListId: null,
  sendgridApiKey: null,
  notionDatabaseId: null,
  airtableBaseId: null,

  // Premium
  isPremium: false,
  premiumUntil: null,
  customDomain: null,
  customCss: null,
  customJs: null,
  featureFlags: [],
  rateLimitApi: 1000,

  // Layout
  sectionOrder: null, // null = ordre par défaut défini dans page.tsx

  // Hero Blocks
  heroBlocks: null, // null = pas de blocs de grille
};

// ============================================
// HELPERS
// ============================================

export function isCompleteSettings(
  settings: unknown
): settings is GlobalSettingsComplete {
  if (!settings || typeof settings !== 'object') return false;
  return 'nomSite' in settings && 'showNavbar' in settings;
}

/**
 * Fusionne les settings Baserow avec les valeurs par défaut
 */
export function mergeWithDefaults(
  partial: Partial<GlobalSettingsComplete>
): GlobalSettingsComplete {
  return { ...DEFAULT_SETTINGS, ...partial };
}
