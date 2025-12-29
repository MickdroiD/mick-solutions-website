// ============================================
// CONFIG SANITIZER - Deep Health Audit Fix
// ============================================
// Validation Zod stricte + sanitisation automatique
// pour prévenir les crashes si la DB contient des données malformées.
// 
// Créé: 2025-12-26 - Audit Système Site Factory

import { z } from 'zod';
import { DEFAULT_SETTINGS, type GlobalSettingsComplete } from './types/global-settings';

// ============================================
// SCHÉMA ZOD COMPLET
// ============================================

// Types énumérés
const VariantStyleSchema = z.enum(['Minimal', 'Corporate', 'Electric', 'Bold', 'AI', 'Custom']).nullable();
const AnimationStyleTypeSchema = z.enum(['Mick Electric', 'Mick-Electrique', 'Elegant Fade', 'Dynamic Slide', 'minimal', 'Minimal']).nullable();
const AnimationSpeedSchema = z.enum(['Slow', 'Normal', 'Fast', 'Instant']).nullable();
const ScrollEffectSchema = z.enum(['None', 'Fade', 'Slide', 'Zoom', 'Parallax']).nullable();
const HoverEffectSchema = z.enum(['None', 'Scale', 'Glow', 'Lift', 'Shake']).nullable();
const LoadingStyleSchema = z.enum(['None', 'Skeleton', 'Spinner', 'Progress']).nullable();
const ImageStyleSchema = z.enum(['Square', 'Rounded', 'Circle', 'Custom']).nullable();
const ImageFilterSchema = z.enum(['None', 'Grayscale', 'Sepia', 'Contrast', 'Blur']).nullable();
const CardStyleSchema = z.enum(['Flat', 'Shadow', 'Border', 'Glassmorphism']).nullable();
const BorderRadiusSchema = z.enum(['None', 'Small', 'Medium', 'Large', 'Full']).nullable();
const FontFamilySchema = z.enum(['Inter', 'Poppins', 'Space-Grotesk', 'Outfit', 'Montserrat', 'DM-Sans', 'Custom']).nullable();
const PatternBackgroundSchema = z.enum(['None', 'Grid', 'Dots', 'Circuit', 'Gradient', 'Custom']).nullable();
const LogoSizeSchema = z.enum(['Small', 'Medium', 'Large', 'XLarge']).nullable();
const HeroHeightSchema = z.enum(['Short', 'Medium', 'Tall', 'FullScreen']).nullable();
const SectionSpacingSchema = z.enum(['Compact', 'Normal', 'Spacious', 'Ultra']).nullable();
const AIModeSchema = z.enum(['Disabled', 'Placeholder', 'Live']).nullable();
const AIProviderSchema = z.enum(['OpenAI', 'Anthropic', 'n8n', 'Custom']).nullable();
const AIToneSchema = z.enum(['Professional', 'Friendly', 'Casual', 'Formal']).nullable();
const AIIndustrySchema = z.enum(['Tech', 'Finance', 'Health', 'Retail', 'Services', 'Other']).nullable();
const VoiceLanguageSchema = z.enum(['fr-FR', 'en-US', 'de-DE', 'it-IT']).nullable();
const GalleryColumnsSchema = z.enum(['2', '3', '4', 'Auto']).nullable();
const LogoAnimationSchema = z.enum([
  'none',
  'spin',
  'pulse', 
  'bounce',
  'electric',
  'lightning_circle',
  'rotate',
  'spin_glow',
  // Legacy values (backward compatibility)
  'Spin-Glow',
  'Pulse',
  'Bounce',
  'None'
]).nullable();
const LogoFrameStyleSchema = z.enum(['Square', 'Circle', 'ThickCircle', 'None']).nullable();
const TextAnimationSchema = z.enum(['Gradient', 'Typing', 'Fade', 'None']).nullable();
const GalleryAnimationSchema = z.enum(['Fade', 'Slide', 'Zoom', 'Flip', 'None']).nullable();
const ServicesVariantSchema = z.enum(['Grid', 'Accordion', 'Cards', 'Showcase']).nullable();
const GalleryVariantSchema = z.enum(['Grid', 'Slider', 'Masonry', 'AI']).nullable();
const TestimonialsVariantSchema = z.enum(['Minimal', 'Carousel', 'Cards', 'Video']).nullable();
const FAQVariantSchema = z.enum(['Minimal', 'Accordion', 'Tabs', 'Search']).nullable();
const ContactVariantSchema = z.enum(['Minimal', 'Form', 'Calendar', 'Chat']).nullable();
const AIAssistantStyleSchema = z.enum(['Chat', 'Voice', 'Banner', 'Hidden']).nullable();

// Schéma principal complet
export const GlobalSettingsSchema = z.object({
  id: z.number().default(0),

  // A. IDENTITÉ DU SITE
  nomSite: z.string().min(1).default(DEFAULT_SETTINGS.nomSite),
  slogan: z.string().default(DEFAULT_SETTINGS.slogan),
  initialesLogo: z.string().default(DEFAULT_SETTINGS.initialesLogo),

  // B. ASSETS VISUELS
  logoUrl: z.string().nullable().default(DEFAULT_SETTINGS.logoUrl),
  logoDarkUrl: z.string().nullable().default(null),
  logoSvgCode: z.string().nullable().default(null),
  faviconUrl: z.string().nullable().default(null),
  ogImageUrl: z.string().nullable().default(null),
  heroBackgroundUrl: z.string().nullable().default(null),
  heroVideoUrl: z.string().nullable().default(null),

  // C. SEO & MÉTA
  metaTitre: z.string().default(DEFAULT_SETTINGS.metaTitre),
  metaDescription: z.string().default(DEFAULT_SETTINGS.metaDescription),
  siteUrl: z.string().url().or(z.literal('')).default(DEFAULT_SETTINGS.siteUrl),
  motsCles: z.string().default(DEFAULT_SETTINGS.motsCles),
  langue: z.string().default(DEFAULT_SETTINGS.langue),
  locale: z.string().default(DEFAULT_SETTINGS.locale),
  robotsIndex: z.boolean().default(DEFAULT_SETTINGS.robotsIndex),
  sitemapPriority: z.number().min(0).max(1).nullable().default(DEFAULT_SETTINGS.sitemapPriority),

  // D. BRANDING / COULEURS
  couleurPrimaire: z.string().default(DEFAULT_SETTINGS.couleurPrimaire),
  couleurAccent: z.string().default(DEFAULT_SETTINGS.couleurAccent),
  couleurBackground: z.string().default(DEFAULT_SETTINGS.couleurBackground),
  couleurText: z.string().default(DEFAULT_SETTINGS.couleurText),
  fontPrimary: FontFamilySchema.default(DEFAULT_SETTINGS.fontPrimary),
  fontHeading: FontFamilySchema.default(DEFAULT_SETTINGS.fontHeading),
  fontCustomUrl: z.string().nullable().default(null),
  borderRadius: BorderRadiusSchema.default(DEFAULT_SETTINGS.borderRadius),
  patternBackground: PatternBackgroundSchema.default(DEFAULT_SETTINGS.patternBackground),

  // E. CONTACT
  email: z.string().email().or(z.literal('')).default(DEFAULT_SETTINGS.email),
  telephone: z.string().nullable().default(null),
  adresse: z.string().default(DEFAULT_SETTINGS.adresse),
  adresseCourte: z.string().nullable().default(null),
  lienLinkedin: z.string().default(DEFAULT_SETTINGS.lienLinkedin),
  lienInstagram: z.string().nullable().default(null),
  lienTwitter: z.string().nullable().default(null),
  lienYoutube: z.string().nullable().default(null),
  lienGithub: z.string().nullable().default(null),
  lienCalendly: z.string().nullable().default(null),
  lienWhatsapp: z.string().nullable().default(null),
  lienBoutonAppel: z.string().default(DEFAULT_SETTINGS.lienBoutonAppel),

  // F. SECTION HERO
  titreHero: z.string().default(DEFAULT_SETTINGS.titreHero),
  sousTitreHero: z.string().default(DEFAULT_SETTINGS.sousTitreHero),
  badgeHero: z.string().default(DEFAULT_SETTINGS.badgeHero),
  ctaPrincipal: z.string().default(DEFAULT_SETTINGS.ctaPrincipal),
  ctaPrincipalUrl: z.string().nullable().default(DEFAULT_SETTINGS.ctaPrincipalUrl),
  ctaSecondaire: z.string().default(DEFAULT_SETTINGS.ctaSecondaire),
  ctaSecondaireUrl: z.string().nullable().default(DEFAULT_SETTINGS.ctaSecondaireUrl),
  heroAiPrompt: z.string().nullable().default(null),

  // G. TRUST STATS
  trustStat1Value: z.string().default(DEFAULT_SETTINGS.trustStat1Value),
  trustStat1Label: z.string().default(DEFAULT_SETTINGS.trustStat1Label),
  trustStat2Value: z.string().default(DEFAULT_SETTINGS.trustStat2Value),
  trustStat2Label: z.string().default(DEFAULT_SETTINGS.trustStat2Label),
  trustStat3Value: z.string().default(DEFAULT_SETTINGS.trustStat3Value),
  trustStat3Label: z.string().default(DEFAULT_SETTINGS.trustStat3Label),

  // H. FOOTER
  copyrightTexte: z.string().default(DEFAULT_SETTINGS.copyrightTexte),
  paysHebergement: z.string().default(DEFAULT_SETTINGS.paysHebergement),
  showLegalLinks: z.boolean().default(DEFAULT_SETTINGS.showLegalLinks),
  customFooterText: z.string().nullable().default(null),
  footerCtaText: z.string().nullable().default(null),
  footerCtaUrl: z.string().nullable().default(null),
  footerLogoSize: z.number().min(20).max(800).nullable().default(DEFAULT_SETTINGS.footerLogoSize),
  footerLogoAnimation: LogoAnimationSchema.default(DEFAULT_SETTINGS.footerLogoAnimation),

  // I. ANALYTICS
  umamiSiteId: z.string().nullable().default(null),
  umamiScriptUrl: z.string().nullable().default(null),
  gaMeasurementId: z.string().nullable().default(null),
  gtmContainerId: z.string().nullable().default(null),
  hotjarSiteId: z.string().nullable().default(null),
  facebookPixelId: z.string().nullable().default(null),

  // J. MODULES - ACTIVATION
  showNavbar: z.boolean().default(DEFAULT_SETTINGS.showNavbar),
  showHero: z.boolean().default(DEFAULT_SETTINGS.showHero),
  showAdvantages: z.boolean().default(DEFAULT_SETTINGS.showAdvantages),
  showServices: z.boolean().default(DEFAULT_SETTINGS.showServices),
  showGallery: z.boolean().default(DEFAULT_SETTINGS.showGallery),
  showPortfolio: z.boolean().default(DEFAULT_SETTINGS.showPortfolio),
  showTestimonials: z.boolean().default(DEFAULT_SETTINGS.showTestimonials),
  showTrust: z.boolean().default(DEFAULT_SETTINGS.showTrust),
  showFaq: z.boolean().default(DEFAULT_SETTINGS.showFaq),
  showBlog: z.boolean().default(DEFAULT_SETTINGS.showBlog),
  showContact: z.boolean().default(DEFAULT_SETTINGS.showContact),
  showAiAssistant: z.boolean().default(DEFAULT_SETTINGS.showAiAssistant),
  showCookieBanner: z.boolean().default(DEFAULT_SETTINGS.showCookieBanner),
  showAnalytics: z.boolean().default(DEFAULT_SETTINGS.showAnalytics),

  // K. MODULES - VARIANTES
  themeGlobal: VariantStyleSchema.default(DEFAULT_SETTINGS.themeGlobal),
  heroVariant: VariantStyleSchema.default(DEFAULT_SETTINGS.heroVariant),
  navbarVariant: VariantStyleSchema.default(DEFAULT_SETTINGS.navbarVariant),
  servicesVariant: ServicesVariantSchema.default(DEFAULT_SETTINGS.servicesVariant),
  galleryVariant: GalleryVariantSchema.default(DEFAULT_SETTINGS.galleryVariant),
  testimonialsVariant: TestimonialsVariantSchema.default(DEFAULT_SETTINGS.testimonialsVariant),
  faqVariant: FAQVariantSchema.default(DEFAULT_SETTINGS.faqVariant),
  contactVariant: ContactVariantSchema.default(DEFAULT_SETTINGS.contactVariant),
  footerVariant: VariantStyleSchema.default(DEFAULT_SETTINGS.footerVariant),
  aiAssistantStyle: AIAssistantStyleSchema.default(DEFAULT_SETTINGS.aiAssistantStyle),

  // L. TAILLES & DIMENSIONS
  logoSize: LogoSizeSchema.default(DEFAULT_SETTINGS.logoSize),
  heroHeight: HeroHeightSchema.default(DEFAULT_SETTINGS.heroHeight),
  sectionSpacing: SectionSpacingSchema.default(DEFAULT_SETTINGS.sectionSpacing),
  cardStyle: CardStyleSchema.default(DEFAULT_SETTINGS.cardStyle),

  // M. ANIMATIONS & EFFETS
  enableAnimations: z.boolean().default(DEFAULT_SETTINGS.enableAnimations),
  animationStyle: AnimationStyleTypeSchema.default(DEFAULT_SETTINGS.animationStyle ?? 'Mick Electric'),
  animationSpeed: AnimationSpeedSchema.default(DEFAULT_SETTINGS.animationSpeed),
  scrollEffect: ScrollEffectSchema.default(DEFAULT_SETTINGS.scrollEffect),
  hoverEffect: HoverEffectSchema.default(DEFAULT_SETTINGS.hoverEffect),
  loadingStyle: LoadingStyleSchema.default(DEFAULT_SETTINGS.loadingStyle),
  logoAnimation: LogoAnimationSchema.default(DEFAULT_SETTINGS.logoAnimation),
  logoFrameStyle: LogoFrameStyleSchema.default(DEFAULT_SETTINGS.logoFrameStyle),
  textAnimation: TextAnimationSchema.default(DEFAULT_SETTINGS.textAnimation),
  galleryAnimation: GalleryAnimationSchema.default(DEFAULT_SETTINGS.galleryAnimation),
  headerLogoSize: z.number().min(20).max(800).nullable().default(DEFAULT_SETTINGS.headerLogoSize),
  headerLogoAnimation: LogoAnimationSchema.default(DEFAULT_SETTINGS.headerLogoAnimation),
  heroLogoAnimation: LogoAnimationSchema.default(DEFAULT_SETTINGS.heroLogoAnimation),
  heroLogoSize: z.number().min(100).max(2000).nullable().default(DEFAULT_SETTINGS.heroLogoSize),

  // N. PHOTOS & MÉDIAS
  imageStyle: ImageStyleSchema.default(DEFAULT_SETTINGS.imageStyle),
  imageFilter: ImageFilterSchema.default(DEFAULT_SETTINGS.imageFilter),
  galleryColumns: GalleryColumnsSchema.default(DEFAULT_SETTINGS.galleryColumns),
  galleryTitle: z.string().nullable().default(null),
  gallerySubtitle: z.string().nullable().default(null),
  videoAutoplay: z.boolean().default(DEFAULT_SETTINGS.videoAutoplay),
  lazyLoading: z.boolean().default(DEFAULT_SETTINGS.lazyLoading),

  // O. MODULE IA
  aiMode: AIModeSchema.default(DEFAULT_SETTINGS.aiMode),
  aiProvider: AIProviderSchema.default(DEFAULT_SETTINGS.aiProvider),
  aiApiKey: z.string().nullable().default(null),
  aiModel: z.string().nullable().default(DEFAULT_SETTINGS.aiModel),
  aiSystemPrompt: z.string().nullable().default(null),
  aiWebhookUrl: z.string().nullable().default(null),
  aiImageWebhook: z.string().nullable().default(null),
  aiMaxTokens: z.number().positive().nullable().default(DEFAULT_SETTINGS.aiMaxTokens),
  aiTemperature: z.number().min(0).max(2).nullable().default(DEFAULT_SETTINGS.aiTemperature),
  chatbotWelcomeMessage: z.string().nullable().default(DEFAULT_SETTINGS.chatbotWelcomeMessage),
  chatbotPlaceholder: z.string().nullable().default(DEFAULT_SETTINGS.chatbotPlaceholder),
  chatbotAvatarUrl: z.string().nullable().default(null),
  voiceEnabled: z.boolean().default(DEFAULT_SETTINGS.voiceEnabled),
  voiceLanguage: VoiceLanguageSchema.default(DEFAULT_SETTINGS.voiceLanguage),

  // P. MODULE IA AVANCÉ
  aiGenerateHero: z.boolean().default(DEFAULT_SETTINGS.aiGenerateHero),
  aiGenerateServices: z.boolean().default(DEFAULT_SETTINGS.aiGenerateServices),
  aiGenerateFaq: z.boolean().default(DEFAULT_SETTINGS.aiGenerateFaq),
  aiTone: AIToneSchema.default(DEFAULT_SETTINGS.aiTone),
  aiIndustry: AIIndustrySchema.default(DEFAULT_SETTINGS.aiIndustry),
  aiTargetAudience: z.string().nullable().default(null),
  aiKeywords: z.string().nullable().default(null),
  aiLastGeneration: z.string().nullable().default(null),

  // Q. INTÉGRATIONS EXTERNES
  n8nWebhookContact: z.string().nullable().default(null),
  n8nWebhookNewsletter: z.string().nullable().default(null),
  stripePublicKey: z.string().nullable().default(null),
  mailchimpListId: z.string().nullable().default(null),
  sendgridApiKey: z.string().nullable().default(null),
  notionDatabaseId: z.string().nullable().default(null),
  airtableBaseId: z.string().nullable().default(null),

  // R. PREMIUM
  isPremium: z.boolean().default(DEFAULT_SETTINGS.isPremium),
  premiumUntil: z.string().nullable().default(null),
  customDomain: z.string().nullable().default(null),
  customCss: z.string().nullable().default(null),
  customJs: z.string().nullable().default(null),
  featureFlags: z.array(z.string()).default(DEFAULT_SETTINGS.featureFlags),
  rateLimitApi: z.number().positive().nullable().default(DEFAULT_SETTINGS.rateLimitApi),

  // S. LAYOUT & ORDER
  sectionOrder: z.array(z.string()).nullable().default(null),
});

// Type inféré du schéma
export type SanitizedConfig = z.infer<typeof GlobalSettingsSchema>;

// ============================================
// FONCTION DE SANITISATION
// ============================================

/**
 * Sanitize et valide la configuration depuis la DB.
 * 
 * ⚠️ MODE SAUVETAGE ACTIVÉ ⚠️
 * La validation Zod est désactivée pour laisser passer TOUTES les données brutes.
 * Ceci est temporaire pour diagnostiquer pourquoi les données Baserow ne s'affichent pas.
 * 
 * @param config - Configuration brute depuis Baserow ou API
 * @returns Configuration mergée avec defaults (SANS validation Zod)
 */
export function sanitizeConfig(config: unknown): GlobalSettingsComplete {
  try {
    // Cas 1: Config null ou undefined
    if (config === null || config === undefined) {
      console.warn('[Sanitizer] Config null, utilisation des defaults');
      return { ...DEFAULT_SETTINGS };
    }

    // Cas 2: Config n'est pas un objet
    if (typeof config !== 'object') {
      console.warn('[Sanitizer] Config invalide (type:', typeof config, '), utilisation des defaults');
      return { ...DEFAULT_SETTINGS };
    }

    // ============================================
    // 🚨 MODE SAUVETAGE - BYPASS TOTAL ZOD 🚨
    // ============================================
    // On ne fait PLUS de validation Zod (.safeParse).
    // On merge simplement les données brutes avec les defaults.
    // Cela permet aux SVG longs, animations custom, etc. de passer.
    
    const rawConfig = config as Record<string, unknown>;
    
    // Log pour debug - voir exactement ce qu'on reçoit
    console.log('[Sanitizer] 🔓 MODE BYPASS - Données brutes reçues:', {
      logoSvgCode: rawConfig.logoSvgCode ? `${String(rawConfig.logoSvgCode).substring(0, 100)}...` : null,
      logoAnimation: rawConfig.logoAnimation,
      headerLogoAnimation: rawConfig.headerLogoAnimation,
      heroLogoAnimation: rawConfig.heroLogoAnimation,
      footerLogoAnimation: rawConfig.footerLogoAnimation,
      nomSite: rawConfig.nomSite,
    });

    // Merge simple : defaults + tout ce qui vient de rawConfig (prioritaire)
    const mergedConfig = { ...DEFAULT_SETTINGS };
    
    for (const key of Object.keys(rawConfig)) {
      const value = rawConfig[key];
      // On accepte TOUT sauf undefined
      if (value !== undefined) {
        (mergedConfig as Record<string, unknown>)[key] = value;
      }
    }

    console.log('[Sanitizer] ✅ Config finale (bypass):', {
      logoSvgCode: mergedConfig.logoSvgCode ? `${String(mergedConfig.logoSvgCode).substring(0, 100)}...` : null,
      logoAnimation: mergedConfig.logoAnimation,
      nomSite: mergedConfig.nomSite,
    });

    return mergedConfig;

  } catch (error) {
    // Cas d'erreur inattendue - Ne jamais crash
    console.error('[Sanitizer] Erreur critique, fallback complet:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * ANCIENNE VERSION avec Zod (désactivée pour sauvetage)
 * Garder pour réactiver plus tard après diagnostic.
 */
export function sanitizeConfigWithZod(config: unknown): GlobalSettingsComplete {
  try {
    if (config === null || config === undefined) {
      return { ...DEFAULT_SETTINGS };
    }
    if (typeof config !== 'object') {
      return { ...DEFAULT_SETTINGS };
    }

    const result = GlobalSettingsSchema.safeParse(config);
    if (result.success) {
      return result.data as GlobalSettingsComplete;
    }

    console.warn('[Sanitizer-Zod] Erreurs:', result.error.issues.map(i => ({
      path: i.path.join('.'),
      message: i.message,
    })));

    const safeConfig = { ...DEFAULT_SETTINGS };
    const rawConfig = config as Record<string, unknown>;
    const defaultsRecord = DEFAULT_SETTINGS as unknown as Record<string, unknown>;
    
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      const value = rawConfig[key];
      if (value !== undefined && value !== null) {
        const expectedType = typeof defaultsRecord[key];
        if (typeof value === expectedType) {
          (safeConfig as Record<string, unknown>)[key] = value;
        } else if (expectedType === 'object' && Array.isArray(defaultsRecord[key])) {
          if (Array.isArray(value)) {
            (safeConfig as Record<string, unknown>)[key] = value;
          }
        }
      }
    }
    return safeConfig;
  } catch (error) {
    console.error('[Sanitizer-Zod] Erreur critique:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Valide uniquement, sans sanitiser.
 * Utile pour le debug ou l'audit.
 * 
 * @returns Liste des erreurs ou null si valide
 */
export function validateConfig(config: unknown): { field: string; message: string }[] | null {
  const result = GlobalSettingsSchema.safeParse(config);
  
  if (result.success) {
    return null;
  }

  return result.error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Vérifie si un champ spécifique a une valeur valide.
 * Utile pour l'Admin UI.
 */
export function isFieldValid(config: unknown, fieldPath: string): boolean {
  if (!config || typeof config !== 'object') return false;
  
  const result = GlobalSettingsSchema.safeParse(config);
  if (result.success) return true;
  
  return !result.error.issues.some(issue => 
    issue.path.join('.') === fieldPath
  );
}

/**
 * Retourne les champs requis manquants ou invalides.
 */
export function getMissingRequiredFields(config: unknown): string[] {
  const errors = validateConfig(config);
  if (!errors) return [];
  
  const requiredFields = [
    'nomSite', 'email', 'titreHero', 'couleurPrimaire', 
    'couleurAccent', 'showNavbar', 'showHero'
  ];
  
  return errors
    .filter(e => requiredFields.includes(e.field))
    .map(e => e.field);
}

