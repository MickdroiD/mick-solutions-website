// ============================================
// FACTORY SCHEMAS - Block-Based Architecture v2
// ============================================
// Architecture modulaire avec tables relationnelles.
// Remplace l'ancienne approche "flat-table" à 140+ colonnes.
// @see src/lib/types/global-settings.ts (DEPRECATED)

import { z } from 'zod';

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

export const CardStyleEnum = z.enum([
  'Flat',
  'Shadow',
  'Border',
  'Glassmorphism',
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
export const AssetsSchema = z.object({
  logoUrl: z.string().url().nullable().default(null),
  logoDarkUrl: z.string().url().nullable().default(null),
  logoSvgCode: z.string().nullable().default(null),
  faviconUrl: z.string().url().nullable().default(null),
  ogImageUrl: z.string().url().nullable().default(null),
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
  copyrightTexte: z.string().default('© Mon Site. Tous droits réservés.'),
  paysHebergement: z.string().default('Hébergé en Suisse'),
  showLegalLinks: z.boolean().default(true),
  customFooterText: z.string().nullable().default(null),
  footerCtaText: z.string().nullable().default(null),
  footerCtaUrl: z.string().url().nullable().default(null),
  footerLogoSize: z.number().int().positive().default(40),
  footerLogoAnimation: LogoAnimationEnum.default('none'),
  footerVariant: VariantStyleEnum.default('Electric'),
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
});

// 4.2 SERVICES SECTION
export const ServiceItemSchema = z.object({
  id: z.string(),
  titre: z.string(),
  description: z.string(),
  icone: z.string().nullable().default(null),
  pointsCles: z.array(z.string()).default([]),
  tarif: z.string().nullable().default(null),
  type: z.enum(['Prestation unique', 'Abonnement mensuel']).nullable(),
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
});

export const AdvantagesSectionSchema = z.object({
  type: z.literal('advantages'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(2),
  page: z.string().default('home'),
  content: AdvantagesContentSchema,
  design: AdvantagesDesignSchema,
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
});

export const GallerySectionSchema = z.object({
  type: z.literal('gallery'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(3),
  page: z.string().default('home'),
  content: GalleryContentSchema,
  design: GalleryDesignSchema,
});

// 4.5 PORTFOLIO SECTION
export const PortfolioItemSchema = z.object({
  id: z.string(),
  nom: z.string(),
  descriptionCourte: z.string().nullable().default(null),
  imageUrl: z.string().url().nullable().default(null),
  lienSite: z.string().url().nullable().default(null),
  slug: z.string(),
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
});

export const PortfolioSectionSchema = z.object({
  type: z.literal('portfolio'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(4),
  page: z.string().default('home'),
  content: PortfolioContentSchema,
  design: PortfolioDesignSchema,
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
});

export const TestimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(5),
  page: z.string().default('home'),
  content: TestimonialsContentSchema,
  design: TestimonialsDesignSchema,
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
});

export const TrustSectionSchema = z.object({
  type: z.literal('trust'),
  isActive: z.boolean().default(true),
  order: z.number().int().default(6),
  page: z.string().default('home'),
  content: TrustContentSchema,
  design: TrustDesignSchema,
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
});

export const FAQSectionSchema = z.object({
  type: z.literal('faq'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(7),
  page: z.string().default('home'),
  content: FAQContentSchema,
  design: FAQDesignSchema,
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
});

export const BlogSectionSchema = z.object({
  type: z.literal('blog'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(9),
  page: z.string().default('home'),
  content: BlogContentSchema,
  design: BlogDesignSchema,
});

// 4.11 AI ASSISTANT SECTION
export const AIAssistantContentSchema = z.object({
  welcomeMessage: z.string().default('Bonjour ! Comment puis-je vous aider ?'),
  placeholder: z.string().default('Posez votre question...'),
  avatarUrl: z.string().url().nullable().default(null),
  voiceEnabled: z.boolean().default(false),
  voiceLanguage: VoiceLanguageEnum.default('fr-FR'),
});

export const AIAssistantDesignSchema = z.object({
  style: AIAssistantStyleEnum.default('Chat'),
});

export const AIAssistantSectionSchema = z.object({
  type: z.literal('ai-assistant'),
  isActive: z.boolean().default(false),
  order: z.number().int().default(10),
  page: z.string().default('home'),
  content: AIAssistantContentSchema,
  design: AIAssistantDesignSchema,
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
export type CustomSection = z.infer<typeof CustomSectionSchema>;

// ============================================
// 6. BASEROW ROW SCHEMAS
// ============================================
// Pour mapping direct vers les lignes Baserow.

export const BaserowGlobalConfigRowSchema = z.object({
  id: z.number().int().positive(),
  Nom_Site: z.string(),
  SEO_Metadata: z.string(), // JSON stringifié
  Branding: z.string(), // JSON stringifié
  Contact: z.string(), // JSON stringifié
  Integrations: z.string(), // JSON stringifié
  Assets: z.string(), // JSON stringifié
  AI_Config: z.string(), // JSON stringifié
  Animations: z.string(), // JSON stringifié
  Premium: z.string(), // JSON stringifié
  Footer: z.string(), // JSON stringifié
});

export const BaserowSectionRowSchema = z.object({
  id: z.number().int().positive(),
  Type: z.object({
    id: z.number(),
    value: SectionTypeEnum,
    color: z.string(),
  }),
  Is_Active: z.boolean(),
  Order: z.number(),
  Content: z.string(), // JSON stringifié
  Design: z.string(), // JSON stringifié
  Page: z.string(),
});

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
  branding: {
    couleurPrimaire: '#06b6d4',
    couleurAccent: '#a855f7',
    couleurBackground: '#0a0a0f',
    couleurText: '#ffffff',
    fontPrimary: 'Inter',
    fontHeading: 'Inter',
    fontCustomUrl: null,
    borderRadius: 'Medium',
    patternBackground: 'Grid',
    themeGlobal: 'Electric',
  },
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
    copyrightTexte: '© Mon Site. Tous droits réservés.',
    paysHebergement: 'Hébergé en Suisse',
    showLegalLinks: true,
    customFooterText: null,
    footerCtaText: null,
    footerCtaUrl: null,
    footerLogoSize: 40,
    footerLogoAnimation: 'none',
    footerVariant: 'Electric',
  },
};

export const DEFAULT_HERO_SECTION: HeroSection = {
  type: 'hero',
  isActive: true,
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
 */
export function parseGlobalConfigRow(
  row: z.infer<typeof BaserowGlobalConfigRowSchema>
): GlobalConfig {
  return {
    id: row.id,
    identity: { ...JSON.parse(row.Nom_Site || '{}'), nomSite: row.Nom_Site },
    seo: JSON.parse(row.SEO_Metadata || '{}'),
    branding: JSON.parse(row.Branding || '{}'),
    contact: JSON.parse(row.Contact || '{}'),
    integrations: JSON.parse(row.Integrations || '{}'),
    assets: JSON.parse(row.Assets || '{}'),
    ai: JSON.parse(row.AI_Config || '{}'),
    animations: JSON.parse(row.Animations || '{}'),
    premium: JSON.parse(row.Premium || '{}'),
    footer: JSON.parse(row.Footer || '{}'),
  };
}

/**
 * Valide et parse une section depuis Baserow
 */
export function parseSectionRow(
  row: z.infer<typeof BaserowSectionRowSchema>
): Section {
  const content = JSON.parse(row.Content || '{}');
  const design = JSON.parse(row.Design || '{}');

  const sectionData = {
    type: row.Type.value,
    isActive: row.Is_Active,
    order: row.Order,
    page: row.Page,
    content,
    design,
  };

  return SectionSchema.parse(sectionData);
}

/**
 * Prépare une Section pour insertion Baserow
 */
export function serializeSectionForBaserow(section: Section): {
  Type: string;
  Is_Active: boolean;
  Order: number;
  Content: string;
  Design: string;
  Page: string;
} {
  return {
    Type: section.type,
    Is_Active: section.isActive,
    Order: section.order,
    Content: JSON.stringify(section.content),
    Design: JSON.stringify(section.design),
    Page: section.page,
  };
}

