// ============================================
// FACTORY SCHEMAS - Block-Based Architecture v2
// ============================================
// Architecture modulaire avec tables relationnelles.
// Remplace l'ancienne approche "flat-table" à 140+ colonnes.
// @see src/lib/types/global-settings.ts (DEPRECATED)

import { z } from 'zod';

// ============================================
// 0. JSON TRANSFORM HELPERS
// ============================================
// Fonctions utilitaires pour parser les champs JSON stringifiés de Baserow
// avec fallback sur des valeurs par défaut en cas d'erreur.

/**
 * Crée un transformer Zod qui parse une string JSON en objet typé.
 * En cas d'échec (JSON invalide, null, undefined), retourne l'objet par défaut.
 * 
 * @param schema - Le schéma Zod à appliquer après parsing
 * @param defaultValue - Valeur par défaut si parsing échoue
 * @param fieldName - Nom du champ pour le logging (optionnel)
 */
function createJsonTransformer<T extends z.ZodTypeAny>(
  schema: T,
  defaultValue: z.infer<T>,
  fieldName?: string
) {
  return z.string().transform((val, ctx): z.infer<T> => {
    // Handle empty/null cases
    if (!val || val.trim() === '' || val === 'null' || val === 'undefined') {
      return defaultValue;
    }

    try {
      const parsed = JSON.parse(val);
      // Validate with schema, use defaults for missing fields
      const result = schema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      // Log validation errors in development
      if (process.env.NODE_ENV === 'development' && fieldName) {
        console.warn(`[Factory] ${fieldName} validation failed:`, result.error.issues);
      }
      // Try to merge with defaults for partial data (only if both are objects)
      if (typeof defaultValue === 'object' && defaultValue !== null && typeof parsed === 'object' && parsed !== null) {
        return { ...defaultValue, ...parsed } as z.infer<T>;
      }
      return defaultValue;
    } catch (e) {
      // JSON parse error - return default
      if (process.env.NODE_ENV === 'development' && fieldName) {
        console.warn(`[Factory] ${fieldName} JSON parse error:`, e);
      }
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid JSON in ${fieldName || 'field'}, using defaults`,
      });
      return defaultValue;
    }
  });
}

/**
 * Parse un champ JSON en objet générique (pour Content/Design dynamiques)
 * Retourne {} si parsing échoue.
 */
const JsonObjectTransformer = z.string().transform((val, ctx) => {
  if (!val || val.trim() === '' || val === 'null' || val === 'undefined') {
    return {};
  }
  try {
    return JSON.parse(val) as Record<string, unknown>;
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid JSON, using empty object',
    });
    return {};
  }
});

/**
 * Helper exporté pour parser manuellement un champ JSON avec fallback.
 * Utile pour les cas où on ne passe pas par le schéma Zod complet.
 * 
 * @example
 * const seo = safeJsonParseWithSchema(row.SEO_Metadata, SEOSchema, DEFAULT_SEO);
 */
export function safeJsonParseWithSchema<T extends z.ZodTypeAny>(
  jsonString: string | null | undefined,
  schema: T,
  defaultValue: z.infer<T>,
  fieldName?: string
): z.infer<T> {
  if (!jsonString || jsonString.trim() === '' || jsonString === 'null') {
    return defaultValue;
  }

  try {
    // Handle double-encoded JSON (when the whole string is wrapped in quotes)
    let cleaned = jsonString;
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      try {
        cleaned = JSON.parse(cleaned) as string;
      } catch {
        // Not double-encoded, continue with original
      }
    }

    // 🔧 FIX: Don't blindly replace \" with " - this breaks nested JSON strings!
    // JSON.parse will handle escaped quotes correctly.

    const parsed = JSON.parse(cleaned) as unknown;
    const result = schema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    if (process.env.NODE_ENV === 'development' && fieldName) {
      console.warn(`[Factory] ${fieldName} validation failed:`, result.error.issues);
    }
    // Merge with defaults for partial data (only if both are objects)
    if (typeof defaultValue === 'object' && defaultValue !== null && typeof parsed === 'object' && parsed !== null) {
      return { ...defaultValue, ...parsed } as z.infer<T>;
    }
    return defaultValue;
  } catch (e) {
    if (process.env.NODE_ENV === 'development' && fieldName) {
      console.warn(`[Factory] ${fieldName} JSON parse error:`, e);
    }
    return defaultValue;
  }
}

// ============================================
// 1. ENUMS RÉUTILISABLES
// ============================================
// Centralisés pour cohérence entre GlobalConfig et Sections.

export const VariantStyleEnum = z.enum([
  'Minimal',
  'Corporate',
  'Electric',
  'Bold',
  'AI',
  'Custom',
]);

export const AnimationStyleEnum = z.enum([
  'mick-electric',
  'elegant-fade',
  'dynamic-slide',
  'minimal',
  'none',
]);

export const AnimationSpeedEnum = z.enum(['Slow', 'Normal', 'Fast', 'Instant']);

export const ScrollEffectEnum = z.enum([
  'None',
  'Fade',
  'Slide',
  'Zoom',
  'Parallax',
]);

export const HoverEffectEnum = z.enum([
  'None',
  'Scale',
  'Glow',
  'Lift',
  'Shake',
]);

export const LoadingStyleEnum = z.enum([
  'None',
  'Skeleton',
  'Spinner',
  'Progress',
]);

export const ImageStyleEnum = z.enum([
  'Square',
  'Rounded',
  'Circle',
  'Custom',
]);

export const ImageFilterEnum = z.enum([
  'None',
  'Grayscale',
  'Sepia',
  'Contrast',
  'Blur',
]);

export const AspectRatioEnum = z.enum([
  '1:1',
  '4:3',
  '16:9',
  '3:4',
  'auto',
]);

export const CardStyleEnum = z.enum([
  'Flat',
  'Shadow',
  'Border',
  'Glassmorphism',
]);

export const LayoutEnum = z.enum([
  'Grid',
  'Masonry',
  'Carousel',
]);

export const BorderRadiusEnum = z.enum([
  'None',
  'Small',
  'Medium',
  'Large',
  'Full',
]);

export const FontFamilyEnum = z.enum([
  'Inter',
  'Poppins',
  'Space-Grotesk',
  'Outfit',
  'Montserrat',
  'DM-Sans',
  'Custom',
]);

export const PatternBackgroundEnum = z.enum([
  'None',
  'Grid',
  'Dots',
  'Circuit',
  'Gradient',
  'Custom',
]);

export const LogoAnimationEnum = z.enum([
  'none',
  'spin',
  'pulse',
  'bounce',
  'electric',
  'lightning-circle',
  'rotate',
  'spin-glow',
  // New direct effects
  'float',
  'swing',
  'flip-3d',
  'stretch',
  'morph',
]);

export const LogoFrameStyleEnum = z.enum([
  'Square',
  'Circle',
  'ThickCircle',
  'None',
]);

export const TextAnimationEnum = z.enum(['Gradient', 'Typing', 'Fade', 'None']);

export const GalleryAnimationEnum = z.enum([
  'Fade',
  'Slide',
  'Zoom',
  'Flip',
  'None',
]);

export const GalleryColumnsEnum = z.enum(['2', '3', '4', 'Auto']);

export const HeroHeightEnum = z.enum([
  'Short',
  'Medium',
  'Tall',
  'FullScreen',
]);

export const SectionSpacingEnum = z.enum([
  'Compact',
  'Normal',
  'Spacious',
  'Ultra',
]);

// Variantes spécifiques par module
export const ServicesVariantEnum = z.enum([
  'Grid',
  'Accordion',
  'Cards',
  'Showcase',
]);

export const GalleryVariantEnum = z.enum(['Grid', 'Slider', 'Masonry', 'AI']);

export const TestimonialsVariantEnum = z.enum([
  'Minimal',
  'Carousel',
  'Cards',
  'Video',
]);

export const FAQVariantEnum = z.enum(['Minimal', 'Accordion', 'Tabs', 'Search']);

export const ContactVariantEnum = z.enum([
  'Minimal',
  'Form',
  'Calendar',
  'Chat',
]);

export const AIAssistantStyleEnum = z.enum([
  'Chat',
  'Voice',
  'Banner',
  'Hidden',
]);

export const AIModeEnum = z.enum(['Disabled', 'Placeholder', 'Live']);

export const AIProviderEnum = z.enum(['OpenAI', 'Anthropic', 'n8n', 'Custom']);

export const AIToneEnum = z.enum([
  'Professional',
  'Friendly',
  'Casual',
  'Formal',
]);

export const AIIndustryEnum = z.enum([
  'Tech',
  'Finance',
  'Health',
  'Retail',
  'Services',
  'Other',
]);

export const VoiceLanguageEnum = z.enum(['fr-FR', 'en-US', 'de-DE', 'it-IT']);

// ============================================
// 2. SECTION TYPES
// ============================================

export const SectionTypeEnum = z.enum([
  'hero',
  'services',
  'advantages',
  'gallery',
  'portfolio',
  'testimonials',
  'trust',
  'faq',
  'contact',
  'blog',
  'ai-assistant',
  'infinite-zoom',
  'custom',
]);

export type SectionType = z.infer<typeof SectionTypeEnum>;

// ============================================
// 3. GLOBAL CONFIG SCHEMA
// ============================================
// Table Baserow: CONFIG_GLOBAL
// Structure JSON pour les sous-objets.

// 3.1 Identity Sub-Schema
export const IdentitySchema = z.object({
  nomSite: z.string().min(1).default('Mon Site'),
  slogan: z.string().default(''),
  initialesLogo: z.string().max(4).default('MS'),
});

// 3.2 SEO Sub-Schema
export const SEOSchema = z.object({
  metaTitre: z.string().default(''),
  metaDescription: z.string().max(160).default(''),
  siteUrl: z.string().url().default('https://example.com'),
  motsCles: z.string().default(''),
  langue: z.string().default('fr'),
  locale: z.string().default('fr_CH'),
  robotsIndex: z.boolean().default(true),
  sitemapPriority: z.number().min(0).max(1).default(0.8),
});

// 3.2.5 Effect Settings Sub-Schema (shared across sections)
// 🔧 Mis à jour avec toutes les nouvelles options de personnalisation (Janvier 2026)
export const EffectSettingsSchema = z.object({
  // ========== LEGACY Design options ==========
  height: z.enum(['Short', 'Medium', 'Tall', 'FullScreen']).optional(),
  logoSize: z.number().min(100).max(600).optional(),
  variant: z.string().optional(), // Legacy variant support

  // ========== LAYOUT OPTIONS (NEW) ==========
  heroLayout: z.enum(['text-left', 'text-right', 'centered', 'split']).optional(),
  columnGap: z.enum(['none', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', 'full']).optional(),
  paddingY: z.enum(['none', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),

  // ========== BUTTON OPTIONS (NEW) ==========
  buttonShape: z.enum(['rounded', 'pill', 'square']).optional(),
  buttonSize: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
  buttonStyle: z.enum(['solid', 'gradient', 'outline', 'ghost']).optional(),
  showButtonIcon: z.boolean().optional(),
  buttonHoverScale: z.number().optional(),

  // ========== LOGO ANIMATIONS & EFFECTS ==========
  logoUrl: z.string().nullable().optional(), // 🆕 Merged from Header Identity
  logoAnimation: LogoAnimationEnum.optional(),
  logoDirectEffect: z.string().optional(),
  logoIndirectEffect: z.string().optional(),
  logoFrameShape: z.string().optional(),
  logoFrameAnimation: z.string().optional(),
  logoFrameColorMode: z.string().optional(),
  logoFrameColor: z.string().optional(),
  logoFrameThickness: z.number().min(1).max(10).optional(),

  // ========== ANIMATION SETTINGS (NEW) ==========
  animationSpeed: z.enum(['slow', 'normal', 'fast']).optional(),
  animationIntensity: z.enum(['subtle', 'normal', 'strong', 'intense']).optional(),

  // ========== EFFECT CUSTOMIZATION ==========
  effectIntensity: z.enum(['subtle', 'normal', 'strong', 'intense']).optional(), // Legacy alias
  effectPrimaryColor: z.string().optional(),
  effectSecondaryColor: z.string().optional(),

  // ========== BACKGROUND EFFECTS ==========
  backgroundOpacity: z.number().min(0).max(100).optional(),
  backgroundBlur: z.number().min(0).max(30).optional(),
  backgroundUrl: z.string().nullable().optional(),

  // ========== OVERLAY OPTIONS (NEW) ==========
  overlayColor: z.enum(['black', 'white', 'primary', 'accent', 'slate']).optional(),
  overlayOpacity: z.number().min(0).max(90).optional(),

  // ========== BLOB OPTIONS (NEW) ==========
  showBlobs: z.boolean().optional(),
  blobSize: z.enum(['none', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
  blob1Color: z.string().optional(),
  blob2Color: z.string().optional(),

  // ========== ADVANCED OPTIONS (NEW) ==========
  showScrollIndicator: z.boolean().optional(),
  scrollIndicatorStyle: z.enum(['mouse', 'arrow', 'chevron', 'dot']).optional(),
  statsLayout: z.enum(['horizontal', 'vertical', 'grid-2', 'grid-3']).optional(),
}).passthrough(); // Allow additional properties for future extensibility

// Export type for EffectSettings
export type EffectSettings = z.infer<typeof EffectSettingsSchema>;

// 3.2.6 Text Settings Sub-Schema (shared across sections)
export const TextSettingsSchema = z.object({
  titleFontFamily: z.string().optional(),
  titleFontSize: z.string().optional(),
  titleFontWeight: z.string().optional(),
  titleColor: z.string().optional(),
  titleAlign: z.string().optional(),
  titleTransform: z.string().optional(),
  subtitleFontFamily: z.string().optional(),
  subtitleFontSize: z.string().optional(),
  subtitleFontWeight: z.string().optional(),
  subtitleColor: z.string().optional(),
  bodyFontFamily: z.string().optional(),
  bodyFontSize: z.string().optional(),
  bodyLineHeight: z.string().optional(),
  bodyColor: z.string().optional(),
}).optional();

// Export type for TextSettings
export type TextSettings = z.infer<typeof TextSettingsSchema>;

// 3.3 Branding Sub-Schema
export const BrandingSchema = z.object({
  couleurPrimaire: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#06b6d4'),
  couleurAccent: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#a855f7'),
  couleurBackground: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#0a0a0f'),
  couleurText: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#ffffff'),
  fontPrimary: FontFamilyEnum.nullable().default('Inter'),
  fontHeading: FontFamilyEnum.nullable().default('Inter'),
  fontCustomUrl: z.string().url().nullable().default(null),
  borderRadius: BorderRadiusEnum.default('Medium'),
  patternBackground: PatternBackgroundEnum.default('Grid'),
  themeGlobal: VariantStyleEnum.default('Electric'),
  // === NAVBAR / HEADER CONFIG ===
  navbarVariant: VariantStyleEnum.nullable().default(null), // Override themeGlobal pour navbar
  stickyHeader: z.boolean().default(true),
  // 🆕 Logo dédié header (peut être différent du logo principal)
  headerLogoUrl: z.string().nullable().default(null),
  headerLogoSvgCode: z.string().nullable().default(null),
  headerLogoSize: z.number().min(20).max(500).default(40),
  headerLogoAnimation: z.string().nullable().default('spin'),
  // 🆕 Style header personnalisé
  headerBgColor: z.string().nullable().default(null), // null = transparent ou auto
  headerTextColor: z.string().nullable().default(null), // null = inherit
  headerBorderColor: z.string().nullable().default(null),
  // 🆕 Effects & Text settings pour le header
  headerEffects: EffectSettingsSchema.optional(),
  headerTextSettings: TextSettingsSchema.optional(),
  // 🆕 Header Content (Menu, CTA, TopBar)
  headerSiteTitle: z.string().nullable().default(null), // Override du nom du site dans le header
  headerMenuLinks: z.string().nullable().default(null), // JSON stringified MenuLinkItem[]
  headerCtaText: z.string().nullable().default(null),
  headerCtaUrl: z.string().nullable().default(null),
  showHeaderCta: z.boolean().default(true),
  showTopBar: z.boolean().default(true),
});

// 3.4 Contact Sub-Schema
export const ContactInfoSchema = z.object({
  email: z.string().email().default('contact@example.com'),
  telephone: z.string().nullable().default(null),
  adresse: z.string().default(''),
  adresseCourte: z.string().nullable().default(null),
  lienLinkedin: z.string().url().nullable().default(null),
  lienInstagram: z.string().url().nullable().default(null),
  lienTwitter: z.string().url().nullable().default(null),
  lienYoutube: z.string().url().nullable().default(null),
  lienGithub: z.string().url().nullable().default(null),
  lienCalendly: z.string().url().nullable().default(null),
  lienWhatsapp: z.string().nullable().default(null),
  lienBoutonAppel: z.string().nullable().default(null),
  // === NAVBAR CTA CONFIG ===
  texteBoutonAppel: z.string().nullable().default(null), // Texte affiché sur le bouton appel navbar - Aucun fallback
  // CRM Lite: Webhook URL pour traitement des leads
  n8nWebhookUrl: z.string().url().nullable().default(null),
});

// 3.5 Integrations Sub-Schema
export const IntegrationsSchema = z.object({
  // Analytics
  umamiSiteId: z.string().nullable().default(null),
  umamiScriptUrl: z.string().url().nullable().default(null),
  gaMeasurementId: z.string().nullable().default(null),
  gtmContainerId: z.string().nullable().default(null),
  hotjarSiteId: z.string().nullable().default(null),
  facebookPixelId: z.string().nullable().default(null),
  // Webhooks
  n8nWebhookContact: z.string().url().nullable().default(null),
  n8nWebhookNewsletter: z.string().url().nullable().default(null),
  // Third-party
  stripePublicKey: z.string().nullable().default(null),
  mailchimpListId: z.string().nullable().default(null),
  sendgridApiKey: z.string().nullable().default(null),
  notionDatabaseId: z.string().nullable().default(null),
  airtableBaseId: z.string().nullable().default(null),
});

// 3.6 Assets Sub-Schema
// Helper to validate URL or relative path (starts with /)
const urlOrPathSchema = z.string().refine(
  (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Must be a valid URL or a path starting with /' }
).nullable().default(null);

export const AssetsSchema = z.object({
  logoUrl: urlOrPathSchema,
  logoDarkUrl: urlOrPathSchema,
  logoSvgCode: z.string().nullable().default(null),
  faviconUrl: urlOrPathSchema,
  ogImageUrl: urlOrPathSchema,
});

// 3.7 AI Config Sub-Schema
export const AIConfigSchema = z.object({
  aiMode: AIModeEnum.default('Disabled'),
  aiProvider: AIProviderEnum.default('OpenAI'),
  aiApiKey: z.string().nullable().default(null),
  aiModel: z.string().default('gpt-4o'),
  aiSystemPrompt: z.string().nullable().default(null),
  aiWebhookUrl: z.string().url().nullable().default(null),
  aiImageWebhook: z.string().url().nullable().default(null),
  aiMaxTokens: z.number().int().positive().default(1000),
  aiTemperature: z.number().min(0).max(2).default(0.7),
  aiTone: AIToneEnum.default('Professional'),
  aiIndustry: AIIndustryEnum.default('Services'),
  aiTargetAudience: z.string().nullable().default(null),
  aiKeywords: z.string().nullable().default(null),
});

// 3.8 Animations Sub-Schema
export const AnimationsConfigSchema = z.object({
  enableAnimations: z.boolean().default(true),
  animationStyle: AnimationStyleEnum.default('mick-electric'),
  animationSpeed: AnimationSpeedEnum.default('Normal'),
  scrollEffect: ScrollEffectEnum.default('Fade'),
  hoverEffect: HoverEffectEnum.default('Scale'),
  loadingStyle: LoadingStyleEnum.default('Skeleton'),
  textAnimation: TextAnimationEnum.default('Gradient'),
});

// 3.9 Premium Sub-Schema
export const PremiumSchema = z.object({
  isPremium: z.boolean().default(false),
  premiumUntil: z.string().datetime().nullable().default(null),
  customDomain: z.string().nullable().default(null),
  customCss: z.string().nullable().default(null),
  customJs: z.string().nullable().default(null),
  featureFlags: z.array(z.string()).default([]),
  rateLimitApi: z.number().int().positive().default(1000),
  // Maintenance Mode: When true, shows "Coming Soon" to non-admin users
  maintenanceMode: z.boolean().default(false),
});

// 3.10 Footer Sub-Schema
export const FooterConfigSchema = z.object({
  // 🚫 Pas de textes hardcodés - tout est configurable
  copyrightTexte: z.string().nullable().default(null), // Ex: "© {YEAR} {SITE}. Tous droits réservés."
  paysHebergement: z.string().nullable().default(null), // Ex: "Hébergé en Suisse"
  showLegalLinks: z.boolean().default(true),
  customFooterText: z.string().nullable().default(null),

  // 🆕 Titres des sections (configurables depuis l'admin)
  footerContactTitle: z.string().nullable().default(null), // Ex: "Contact"
  footerLegalTitle: z.string().nullable().default(null), // Ex: "Légal"
  footerNavigationTitle: z.string().nullable().default(null), // Ex: "Navigation"

  // 🆕 CTA Footer
  footerCtaText: z.string().nullable().default(null), // Texte du bouton CTA
  footerCtaUrl: z.string().nullable().default(null), // URL du CTA
  footerCtaHeading: z.string().nullable().default(null), // Titre CTA pour variante Bold (ex: "Travaillons Ensemble")

  // 🆕 Powered By (optionnel - White Label)
  footerPoweredByText: z.string().nullable().default(null), // Ex: "Propulsé par MonEntreprise"
  showFooterPoweredBy: z.boolean().default(false), // Masqué par défaut pour White Label

  footerLogoSize: z.number().int().positive().default(40),
  footerLogoAnimation: LogoAnimationEnum.default('none'),
  footerVariant: VariantStyleEnum.default('Electric'),
  // 🆕 Logo dédié footer (différent du logo principal si besoin)
  footerLogoUrl: z.string().nullable().default(null),
  footerLogoSvgCode: z.string().nullable().default(null),
  // 🆕 Style footer personnalisé  
  footerBgColor: z.string().nullable().default(null),
  footerTextColor: z.string().nullable().default(null),
  footerBorderColor: z.string().nullable().default(null),
  // 🆕 Effects & Text settings pour le footer
  footerEffects: EffectSettingsSchema.optional(),
  footerTextSettings: TextSettingsSchema.optional(),
});

// === GLOBAL CONFIG MASTER SCHEMA ===
export const GlobalConfigSchema = z.object({
  id: z.number().int().positive().optional(),
  identity: IdentitySchema,
  seo: SEOSchema,
  branding: BrandingSchema,
  contact: ContactInfoSchema,
  integrations: IntegrationsSchema,
  assets: AssetsSchema,
  ai: AIConfigSchema,
  animations: AnimationsConfigSchema,
  premium: PremiumSchema,
  footer: FooterConfigSchema,
  // Timestamp
  updatedAt: z.string().datetime().optional(),
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

// ============================================
// 4. SECTION SCHEMAS (Content + Design)
// ============================================
// Chaque section a un Content (textes/données) et un Design (style/animations)

// 4.1 HERO SECTION
export const HeroContentSchema = z.object({
  titre: z.string().default('Titre Principal'),
  sousTitre: z.string().default(''),
  badge: z.string().nullable().default(null),
  ctaPrincipal: z.object({
    text: z.string().default('Action'),
    url: z.string().default('#contact'),
  }),
  ctaSecondaire: z
    .object({
      text: z.string(),
      url: z.string(),
    })
    .nullable()
    .default(null),
  trustStats: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .default([]),
  backgroundUrl: z.string().url().nullable().default(null),
  videoUrl: z.string().url().nullable().default(null),
  aiPrompt: z.string().nullable().default(null),
});

export const HeroDesignSchema = z.object({
  variant: VariantStyleEnum.default('Electric'),
  height: HeroHeightEnum.default('Tall'),
  logoAnimation: LogoAnimationEnum.default('electric'),
  logoSize: z.number().int().positive().default(280),
  logoFrameStyle: LogoFrameStyleEnum.default('Square'),
  textAnimation: TextAnimationEnum.default('Gradient'),
});

export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
  page: z.string().default('home'),
  content: HeroContentSchema,
  design: HeroDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.2 SERVICES SECTION
export const ServiceItemSchema = z.object({
  id: z.string(),
  titre: z.string(),
  description: z.string(),
  icone: z.string().nullable().default(null),
  pointsCles: z.array(z.string()).default([]),
  // Support both field names for price
  tarif: z.string().nullable().default(null),
  prix: z.string().nullable().optional(),
  // Support both field names for link
  lien: z.string().nullable().optional(),
  // Type is optional for backward compatibility
  type: z.enum(['Prestation unique', 'Abonnement mensuel']).nullable().optional(),
});

export const ServicesContentSchema = z.object({
  titre: z.string().default('Nos Services'),
  sousTitre: z.string().nullable().default(null),
  services: z.array(ServiceItemSchema).default([]),
});

export const ServicesDesignSchema = z.object({
  variant: ServicesVariantEnum.default('Cards'),
  cardStyle: CardStyleEnum.default('Shadow'),
  hoverEffect: HoverEffectEnum.default('Scale'),
});

export const ServicesSectionSchema = z.object({
  type: z.literal('services'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(1),
  page: z.string().default('home'),
  content: ServicesContentSchema,
  design: ServicesDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.3 ADVANTAGES SECTION
export const AdvantageItemSchema = z.object({
  id: z.string(),
  titre: z.string(),
  description: z.string(),
  icone: z.string().nullable().default(null),
  badge: z.string().nullable().default(null),
});

export const AdvantagesContentSchema = z.object({
  titre: z.string().default('Pourquoi nous choisir'),
  sousTitre: z.string().nullable().default(null),
  avantages: z.array(AdvantageItemSchema).default([]),
});

export const AdvantagesDesignSchema = z.object({
  variant: VariantStyleEnum.default('Electric'),
  cardStyle: CardStyleEnum.default('Shadow'),
  hoverEffect: HoverEffectEnum.default('Glow'),
});

export const AdvantagesSectionSchema = z.object({
  type: z.literal('advantages'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(2),
  page: z.string().default('home'),
  content: AdvantagesContentSchema,
  design: AdvantagesDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.4 GALLERY SECTION
export const GalleryItemSchema = z.object({
  id: z.string(),
  titre: z.string().nullable().default(null),
  imageUrl: z.string().url(),
  type: z.enum(['Slider', 'Grille', 'Zoom']).default('Grille'),
});

export const GalleryContentSchema = z.object({
  titre: z.string().default('Galerie'),
  sousTitre: z.string().nullable().default(null),
  items: z.array(GalleryItemSchema).default([]),
});

export const GalleryDesignSchema = z.object({
  variant: GalleryVariantEnum.default('Grid'),
  columns: GalleryColumnsEnum.default('3'),
  animation: GalleryAnimationEnum.default('Fade'),
  imageStyle: ImageStyleEnum.default('Rounded'),
  imageFilter: ImageFilterEnum.default('None'),
  aspectRatio: AspectRatioEnum.default('16:9'),
});

export const GallerySectionSchema = z.object({
  type: z.literal('gallery'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(3),
  page: z.string().default('home'),
  content: GalleryContentSchema,
  design: GalleryDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.5 PORTFOLIO SECTION
export const PortfolioItemSchema = z.object({
  id: z.string(),
  // Support both field names (nom/titre)
  nom: z.string().optional(),
  titre: z.string().optional(),
  // Support both field names for description
  descriptionCourte: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().default(null), // Allow relative paths
  // Support both field names for link
  lienSite: z.string().nullable().optional(),
  lien: z.string().nullable().optional(),
  // Slug is optional for backward compatibility
  slug: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const PortfolioContentSchema = z.object({
  titre: z.string().default('Nos Projets'),
  sousTitre: z.string().nullable().default(null),
  projets: z.array(PortfolioItemSchema).default([]),
});

export const PortfolioDesignSchema = z.object({
  variant: VariantStyleEnum.default('Electric'),
  cardStyle: CardStyleEnum.default('Shadow'),
  hoverEffect: HoverEffectEnum.default('Scale'),
  layout: LayoutEnum.default('Grid'),
});

export const PortfolioSectionSchema = z.object({
  type: z.literal('portfolio'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(4),
  page: z.string().default('home'),
  content: PortfolioContentSchema,
  design: PortfolioDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.6 TESTIMONIALS SECTION
export const TestimonialItemSchema = z.object({
  id: z.string(),
  nom: z.string(),
  poste: z.string().nullable().default(null),
  message: z.string(),
  note: z.number().int().min(1).max(5).default(5),
  photoUrl: z.string().url().nullable().default(null),
});

export const TestimonialsContentSchema = z.object({
  titre: z.string().default('Témoignages'),
  sousTitre: z.string().nullable().default(null),
  temoignages: z.array(TestimonialItemSchema).default([]),
});

export const TestimonialsDesignSchema = z.object({
  variant: TestimonialsVariantEnum.default('Cards'),
  cardStyle: CardStyleEnum.default('Shadow'),
  hoverEffect: HoverEffectEnum.default('Scale'),
});

export const TestimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(5),
  page: z.string().default('home'),
  content: TestimonialsContentSchema,
  design: TestimonialsDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.7 TRUST SECTION
export const TrustPointSchema = z.object({
  id: z.string(),
  titre: z.string(),
  description: z.string().nullable().default(null),
  icone: z.string().nullable().default(null),
  badge: z.string().nullable().default(null),
});

export const TrustContentSchema = z.object({
  titre: z.string().default('Pourquoi nous faire confiance'),
  sousTitre: z.string().nullable().default(null),
  points: z.array(TrustPointSchema).default([]),
});

export const TrustDesignSchema = z.object({
  variant: VariantStyleEnum.default('Electric'),
  cardStyle: CardStyleEnum.default('Shadow'),
  hoverEffect: HoverEffectEnum.default('Scale'),
});

export const TrustSectionSchema = z.object({
  type: z.literal('trust'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(6),
  page: z.string().default('home'),
  content: TrustContentSchema,
  design: TrustDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.8 FAQ SECTION
export const FAQItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  reponse: z.string(),
  ordre: z.number().int().default(0),
});

export const FAQContentSchema = z.object({
  titre: z.string().default('Questions Fréquentes'),
  sousTitre: z.string().nullable().default(null),
  questions: z.array(FAQItemSchema).default([]),
});

export const FAQDesignSchema = z.object({
  variant: FAQVariantEnum.default('Accordion'),
  cardStyle: CardStyleEnum.default('Shadow'),
  hoverEffect: HoverEffectEnum.default('Scale'),
});

export const FAQSectionSchema = z.object({
  type: z.literal('faq'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(7),
  page: z.string().default('home'),
  content: FAQContentSchema,
  design: FAQDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.9 CONTACT SECTION
export const ContactContentSchema = z.object({
  titre: z.string().default('Contactez-nous'),
  sousTitre: z.string().nullable().default(null),
  formFields: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['text', 'email', 'textarea', 'select']),
        label: z.string(),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(),
      })
    )
    .default([]),
  submitText: z.string().default('Envoyer'),
  successMessage: z.string().default('Message envoyé avec succès !'),
});

export const ContactDesignSchema = z.object({
  variant: ContactVariantEnum.default('Form'),
  cardStyle: CardStyleEnum.default('Shadow'),
});

export const ContactSectionSchema = z.object({
  type: z.literal('contact'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(8),
  page: z.string().default('home'),
  content: ContactContentSchema,
  design: ContactDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.10 BLOG SECTION
export const BlogContentSchema = z.object({
  titre: z.string().default('Blog'),
  sousTitre: z.string().nullable().default(null),
  postsPerPage: z.number().int().positive().default(6),
  showCategories: z.boolean().default(true),
});

export const BlogDesignSchema = z.object({
  variant: VariantStyleEnum.default('Electric'),
  cardStyle: CardStyleEnum.default('Shadow'),
  hoverEffect: HoverEffectEnum.default('Scale'),
});

export const BlogSectionSchema = z.object({
  type: z.literal('blog'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(9),
  page: z.string().default('home'),
  content: BlogContentSchema,
  design: BlogDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.11 AI ASSISTANT SECTION
export const AIAssistantContentSchema = z.object({
  titre: z.string().default('Assistant Virtuel'),
  sousTitre: z.string().nullable().default(null),
  welcomeMessage: z.string().default('Bonjour ! Comment puis-je vous aider ?'),
  placeholder: z.string().default('Posez votre question...'),
  avatarUrl: z.string().url().nullable().default(null),
  voiceEnabled: z.boolean().default(false),
  voiceLanguage: VoiceLanguageEnum.default('fr-FR'),
  suggestedQuestions: z.array(z.string()).default([]),
});

export const AIAssistantDesignSchema = z.object({
  style: AIAssistantStyleEnum.default('Chat'),
  position: z.enum(['bottom-right', 'bottom-left']).default('bottom-right'),
});

export const AIAssistantSectionSchema = z.object({
  type: z.literal('ai-assistant'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(10),
  page: z.string().default('home'),
  content: AIAssistantContentSchema,
  design: AIAssistantDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.12 CUSTOM SECTION
export const CustomContentSchema = z.object({
  html: z.string().default(''),
  data: z.record(z.string(), z.unknown()).default({}),
});

export const CustomDesignSchema = z.object({
  variant: VariantStyleEnum.default('Custom'),
  customCss: z.string().nullable().default(null),
});

export const CustomSectionSchema = z.object({
  type: z.literal('custom'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(99),
  page: z.string().default('home'),
  content: CustomContentSchema,
  design: CustomDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});

// 4.13 INFINITE ZOOM SECTION
// Effet de zoom infini interactif où le visiteur navigue dans des images imbriquées
export const InfiniteZoomLayerSchema = z.object({
  id: z.string(),
  imageUrl: z.string().url(),
  title: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  // Position du point focal pour le zoom vers l'image suivante (en %)
  focalPointX: z.number().min(0).max(100).default(50),
  focalPointY: z.number().min(0).max(100).default(50),
});

export const InfiniteZoomContentSchema = z.object({
  titre: z.string().default('Explorez'),
  sousTitre: z.string().nullable().default(null),
  instructionText: z.string().default('Scrollez pour explorer'),
  layers: z.array(InfiniteZoomLayerSchema).default([]),
});

export const InfiniteZoomDesignSchema = z.object({
  variant: z.enum(['fullscreen', 'contained', 'hero']).default('fullscreen'),
  transitionDuration: z.number().int().min(200).max(2000).default(800),
  zoomIntensity: z.number().min(1).max(5).default(2.5),
  enableSound: z.boolean().default(false),
  showIndicators: z.boolean().default(true),
  showProgress: z.boolean().default(true),
});

export const InfiniteZoomSectionSchema = z.object({
  type: z.literal('infinite-zoom'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(11),
  page: z.string().default('home'),
  content: InfiniteZoomContentSchema,
  design: InfiniteZoomDesignSchema,
  effects: EffectSettingsSchema.optional(),
  textSettings: TextSettingsSchema.optional(),
});


// ============================================
// 5. MASTER SECTION SCHEMA (Discriminated Union)
// ============================================

export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  ServicesSectionSchema,
  AdvantagesSectionSchema,
  GallerySectionSchema,
  PortfolioSectionSchema,
  TestimonialsSectionSchema,
  TrustSectionSchema,
  FAQSectionSchema,
  ContactSectionSchema,
  BlogSectionSchema,
  AIAssistantSectionSchema,
  InfiniteZoomSectionSchema,
  CustomSectionSchema,
]);

export type Section = z.infer<typeof SectionSchema>;
export type HeroSection = z.infer<typeof HeroSectionSchema>;
export type ServicesSection = z.infer<typeof ServicesSectionSchema>;
export type AdvantagesSection = z.infer<typeof AdvantagesSectionSchema>;
export type GallerySection = z.infer<typeof GallerySectionSchema>;
export type PortfolioSection = z.infer<typeof PortfolioSectionSchema>;
export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>;
export type TrustSection = z.infer<typeof TrustSectionSchema>;
export type FAQSection = z.infer<typeof FAQSectionSchema>;
export type ContactSection = z.infer<typeof ContactSectionSchema>;
export type BlogSection = z.infer<typeof BlogSectionSchema>;
export type AIAssistantSection = z.infer<typeof AIAssistantSectionSchema>;
export type InfiniteZoomSection = z.infer<typeof InfiniteZoomSectionSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;

// ============================================
// 6. BASEROW ROW SCHEMAS (with JSON Auto-Parsing)
// ============================================
// Pour mapping direct vers les lignes Baserow.
// ⚠️ ALIGNÉ avec la structure Baserow réelle (Audit 29/12/2025)
// 🔧 JSON auto-parsé avec fallback sur valeurs par défaut

// --- Valeurs par défaut pour les champs JSON (exportées pour réutilisation) ---
export const DEFAULT_SEO = {
  metaTitre: '',
  metaDescription: '',
  siteUrl: 'https://example.com',
  motsCles: '',
  langue: 'fr',
  locale: 'fr_CH',
  robotsIndex: true,
  sitemapPriority: 0.8,
};

export const DEFAULT_BRANDING = {
  couleurPrimaire: '#06b6d4',
  couleurAccent: '#a855f7',
  couleurBackground: '#0a0a0f',
  couleurText: '#ffffff',
  fontPrimary: 'Inter' as const,
  fontHeading: 'Inter' as const,
  fontCustomUrl: null,
  borderRadius: 'Medium' as const,
  patternBackground: 'Grid' as const,
  themeGlobal: 'Electric' as const,
  // === NAVBAR / HEADER CONFIG ===
  navbarVariant: null,
  headerLogoSize: 40,
  headerLogoAnimation: 'spin' as const,
  stickyHeader: true,
  // 🆕 Logo dédié header
  headerLogoUrl: null,
  headerLogoSvgCode: null,
  // 🆕 Style header personnalisé
  headerBgColor: null,
  headerTextColor: null,
  headerBorderColor: null,
  // 🆕 Effects & Text settings pour le header
  headerEffects: {},
  headerTextSettings: {},
  // 🆕 Header Content (Menu, CTA, TopBar)
  headerSiteTitle: null,
  headerMenuLinks: null,
  headerCtaText: null,
  headerCtaUrl: null,
  showHeaderCta: true,
  showTopBar: true,
};

export const DEFAULT_CONTACT = {
  email: 'contact@example.com',
  telephone: null,
  adresse: '',
  adresseCourte: null,
  lienLinkedin: null,
  lienInstagram: null,
  lienTwitter: null,
  lienYoutube: null,
  lienGithub: null,
  lienCalendly: null,
  lienWhatsapp: null,
  lienBoutonAppel: null,
  // === NAVBAR CTA CONFIG ===
  texteBoutonAppel: null,
  n8nWebhookUrl: null,
};

export const DEFAULT_INTEGRATIONS = {
  umamiSiteId: null,
  umamiScriptUrl: null,
  gaMeasurementId: null,
  gtmContainerId: null,
  hotjarSiteId: null,
  facebookPixelId: null,
  n8nWebhookContact: null,
  n8nWebhookNewsletter: null,
  stripePublicKey: null,
  mailchimpListId: null,
  sendgridApiKey: null,
  notionDatabaseId: null,
  airtableBaseId: null,
};

export const DEFAULT_ASSETS = {
  logoUrl: null,
  logoDarkUrl: null,
  logoSvgCode: null,
  faviconUrl: null,
  ogImageUrl: null,
};

export const DEFAULT_AI_CONFIG = {
  aiMode: 'Disabled' as const,
  aiProvider: 'OpenAI' as const,
  aiApiKey: null,
  aiModel: 'gpt-4o',
  aiSystemPrompt: null,
  aiWebhookUrl: null,
  aiImageWebhook: null,
  aiMaxTokens: 1000,
  aiTemperature: 0.7,
  aiTone: 'Professional' as const,
  aiIndustry: 'Services' as const,
  aiTargetAudience: null,
  aiKeywords: null,
};

export const DEFAULT_ANIMATIONS = {
  enableAnimations: true,
  animationStyle: 'mick-electric' as const,
  animationSpeed: 'Normal' as const,
  scrollEffect: 'Fade' as const,
  hoverEffect: 'Scale' as const,
  loadingStyle: 'Skeleton' as const,
  textAnimation: 'Gradient' as const,
};

export const DEFAULT_PREMIUM = {
  isPremium: false,
  premiumUntil: null,
  customDomain: null,
  customCss: null,
  customJs: null,
  featureFlags: [] as string[],
  rateLimitApi: 1000,
  maintenanceMode: false,
};

export const DEFAULT_FOOTER = {
  // 🚫 Pas de valeurs par défaut hardcodées - tout doit être configuré depuis l'admin
  copyrightTexte: null,
  paysHebergement: null,
  showLegalLinks: true,
  customFooterText: null,
  // 🆕 Titres des sections (null = masqué)
  footerContactTitle: null,
  footerLegalTitle: null,
  footerNavigationTitle: null,
  // 🆕 CTA Footer
  footerCtaText: null,
  footerCtaUrl: null,
  footerCtaHeading: null,
  // 🆕 Powered By (masqué par défaut pour White Label)
  footerPoweredByText: null,
  showFooterPoweredBy: false,
  // Logo & Style
  footerLogoSize: 40,
  footerLogoAnimation: 'none' as const,
  footerVariant: 'Electric' as const,
  footerLogoUrl: null,
  footerLogoSvgCode: null,
  footerBgColor: null,
  footerTextColor: null,
  footerBorderColor: null,
};

// --- Schéma CONFIG_GLOBAL avec JSON auto-parsing ---
export const BaserowGlobalConfigRowSchema = z.object({
  id: z.number().int().positive(),
  // 🔧 FIX: Renommé Nom_Site → Nom (champ DB réel)
  Nom: z.string(),
  // Champs optionnels présents en DB mais pas toujours utilisés
  Notes: z.string().nullable().optional(),
  Actif: z.boolean().optional(),
  // 🔧 Champs JSON auto-parsés avec fallback sur valeurs par défaut
  SEO_Metadata: createJsonTransformer(SEOSchema, DEFAULT_SEO, 'SEO_Metadata'),
  Branding: createJsonTransformer(BrandingSchema, DEFAULT_BRANDING, 'Branding'),
  Contact: createJsonTransformer(ContactInfoSchema, DEFAULT_CONTACT, 'Contact'),
  Integrations: createJsonTransformer(IntegrationsSchema, DEFAULT_INTEGRATIONS, 'Integrations'),
  Assets: createJsonTransformer(AssetsSchema, DEFAULT_ASSETS, 'Assets'),
  AI_Config: createJsonTransformer(AIConfigSchema, DEFAULT_AI_CONFIG, 'AI_Config'),
  Animations: createJsonTransformer(AnimationsConfigSchema, DEFAULT_ANIMATIONS, 'Animations'),
  Premium: createJsonTransformer(PremiumSchema, DEFAULT_PREMIUM, 'Premium'),
  Footer: createJsonTransformer(FooterConfigSchema, DEFAULT_FOOTER, 'Footer'),
});

// Type inféré après transformation (objets parsés, pas strings)
export type BaserowGlobalConfigRowParsed = z.infer<typeof BaserowGlobalConfigRowSchema>;

// --- Schéma SECTIONS avec JSON auto-parsing ---
export const BaserowSectionRowSchema = z.object({
  id: z.number().int().positive(),
  // Champs optionnels présents en DB
  Nom: z.string().nullable().optional(),
  Notes: z.string().nullable().optional(),
  // 🔧 FIX: Baserow a "Actif" (booléen), le code utilisait "Is_Active"
  // On garde les deux pour rétrocompatibilité
  Actif: z.boolean().optional(),
  /** @deprecated Utiliser Actif à la place - gardé pour compatibilité */
  Is_Active: z.boolean().optional(),
  Type: z.object({
    id: z.number(),
    value: SectionTypeEnum,
    color: z.string(),
  }),
  // 🔧 FIX: Baserow renvoie "0" (string), on coerce en number
  Order: z.coerce.number(),
  // 🔧 Champs JSON auto-parsés (contenu dynamique selon le type de section)
  Content: JsonObjectTransformer,
  Design: JsonObjectTransformer,
  Page: z.string(),
});

// Type inféré après transformation
export type BaserowSectionRowParsed = z.infer<typeof BaserowSectionRowSchema>;

// ============================================
// 7. DEFAULTS
// ============================================

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  identity: {
    nomSite: 'Mon Site',
    slogan: 'Slogan par défaut',
    initialesLogo: 'MS',
  },
  seo: {
    metaTitre: 'Mon Site - Titre SEO',
    metaDescription: 'Description SEO par défaut',
    siteUrl: 'https://example.com',
    motsCles: '',
    langue: 'fr',
    locale: 'fr_CH',
    robotsIndex: true,
    sitemapPriority: 0.8,
  },
  branding: DEFAULT_BRANDING,
  contact: {
    email: 'contact@example.com',
    telephone: null,
    adresse: 'Adresse, Pays',
    adresseCourte: null,
    lienLinkedin: null,
    lienInstagram: null,
    lienTwitter: null,
    lienYoutube: null,
    lienGithub: null,
    lienCalendly: null,
    lienWhatsapp: null,
    lienBoutonAppel: null,
    // 🔧 Navbar CTA config
    texteBoutonAppel: 'Réserver un appel',
    n8nWebhookUrl: null,
  },
  integrations: {
    umamiSiteId: null,
    umamiScriptUrl: null,
    gaMeasurementId: null,
    gtmContainerId: null,
    hotjarSiteId: null,
    facebookPixelId: null,
    n8nWebhookContact: null,
    n8nWebhookNewsletter: null,
    stripePublicKey: null,
    mailchimpListId: null,
    sendgridApiKey: null,
    notionDatabaseId: null,
    airtableBaseId: null,
  },
  assets: {
    logoUrl: null,
    logoDarkUrl: null,
    logoSvgCode: null,
    faviconUrl: null,
    ogImageUrl: null,
  },
  ai: {
    aiMode: 'Disabled',
    aiProvider: 'OpenAI',
    aiApiKey: null,
    aiModel: 'gpt-4o',
    aiSystemPrompt: null,
    aiWebhookUrl: null,
    aiImageWebhook: null,
    aiMaxTokens: 1000,
    aiTemperature: 0.7,
    aiTone: 'Professional',
    aiIndustry: 'Services',
    aiTargetAudience: null,
    aiKeywords: null,
  },
  animations: {
    enableAnimations: true,
    animationStyle: 'mick-electric',
    animationSpeed: 'Normal',
    scrollEffect: 'Fade',
    hoverEffect: 'Scale',
    loadingStyle: 'Skeleton',
    textAnimation: 'Gradient',
  },
  premium: {
    isPremium: false,
    premiumUntil: null,
    customDomain: null,
    customCss: null,
    customJs: null,
    featureFlags: [],
    rateLimitApi: 1000,
    maintenanceMode: false,
  },
  footer: {
    // 🚫 Pas de valeurs par défaut hardcodées
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
    // Logo & Style
    footerLogoSize: 40,
    footerLogoAnimation: 'none',
    footerVariant: 'Electric',
    footerLogoUrl: null,
    footerLogoSvgCode: null,
    footerBgColor: null,
    footerTextColor: null,
    footerBorderColor: null,
  },
};

export const DEFAULT_HERO_SECTION: HeroSection = {
  type: 'hero',
  // 🔧 FIX: Disable default section to avoid "Ghost Hero" on config error
  isActive: false,
  order: 0,
  page: 'home',
  content: {
    titre: 'Titre Principal',
    sousTitre: 'Sous-titre descriptif de votre activité.',
    badge: 'Badge',
    ctaPrincipal: { text: 'Action Principale', url: '#contact' },
    ctaSecondaire: { text: 'En savoir plus', url: '#services' },
    trustStats: [
      { value: '100%', label: 'Satisfaction' },
      { value: '24/7', label: 'Support' },
    ],
    backgroundUrl: null,
    videoUrl: null,
    aiPrompt: null,
  },
  design: {
    variant: 'Electric',
    height: 'Tall',
    logoAnimation: 'electric',
    logoSize: 280,
    logoFrameStyle: 'Square',
    textAnimation: 'Gradient',
  },
};

// ============================================
// 8. UTILITY FUNCTIONS
// ============================================

/**
 * Parse une row Baserow CONFIG_GLOBAL vers GlobalConfig
 * 🔧 Les champs JSON sont déjà auto-parsés par le schéma Zod (plus de JSON.parse manuel)
 */
export function parseGlobalConfigRow(
  row: BaserowGlobalConfigRowParsed
): GlobalConfig {
  return {
    id: row.id,
    identity: {
      nomSite: row.Nom,
      slogan: '', // Sera mergé depuis d'autres champs si besoin
      initialesLogo: row.Nom?.substring(0, 2).toUpperCase() || 'MS',
    },
    // 🔧 Données déjà parsées par le transformer Zod
    seo: row.SEO_Metadata,
    branding: row.Branding,
    contact: row.Contact,
    integrations: row.Integrations,
    assets: row.Assets,
    ai: row.AI_Config,
    animations: row.Animations,
    premium: row.Premium,
    footer: row.Footer,
  };
}

/**
 * Valide et parse une section depuis Baserow
 * 🔧 Content/Design sont déjà auto-parsés par le schéma Zod
 */
export function parseSectionRow(
  row: BaserowSectionRowParsed
): Section {
  // Priorité: Actif (champ DB réel) > Is_Active (legacy) > true (default)
  const isActive = row.Actif ?? row.Is_Active ?? true;

  const sectionData = {
    type: row.Type.value,
    isActive,
    order: row.Order,
    page: row.Page,
    // 🔧 Déjà parsés par JsonObjectTransformer
    content: row.Content,
    design: row.Design,
  };

  return SectionSchema.parse(sectionData);
}

/**
 * Prépare une Section pour insertion Baserow
 * 🔧 FIX: Écrit vers Actif (champ DB réel) et Is_Active (compatibilité)
 */
export function serializeSectionForBaserow(section: Section): {
  Type: string;
  Actif: boolean;
  Is_Active: boolean; // Gardé pour compatibilité si le champ existe
  Order: number;
  Content: string;
  Design: string;
  Page: string;
} {
  return {
    Type: section.type,
    Actif: section.isActive,
    Is_Active: section.isActive, // Écriture dupliquée pour compatibilité
    Order: section.order,
    Content: JSON.stringify(section.content),
    Design: JSON.stringify(section.design),
    Page: section.page,
  };
}

// ============================================
// 5. PAGE SCHEMA
// ============================================

export const PageSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type FactoryPage = z.infer<typeof PageSchema>;
