// ============================================
// LEGACY ADAPTER - Factory V2 → Legacy Format
// ============================================
// Transforme les données Factory V2 vers le format GlobalSettingsComplete
// attendu par les composants UI existants (HeroElectric, etc.)
//
// Permet une migration progressive sans réécrire tous les composants.

import type { GlobalConfig, Section, HeroSection } from '../schemas/factory';
import type { GlobalSettingsComplete } from '../types/global-settings';
import { DEFAULT_SETTINGS } from '../types/global-settings';

// ============================================
// GLOBAL CONFIG → LEGACY ADAPTER
// ============================================

/**
 * Convertit GlobalConfig (V2) vers GlobalSettingsComplete (Legacy)
 * Les composants UI existants attendent ce format.
 */
export function adaptGlobalConfigToLegacy(
  config: GlobalConfig,
  heroSection?: HeroSection
): GlobalSettingsComplete {
  // Extraire les données du Hero si disponible
  const heroContent = heroSection?.content;
  const heroDesign = heroSection?.design;

  return {
    // ID
    id: config.id || 0,

    // ========== A. IDENTITÉ DU SITE ==========
    nomSite: config.identity.nomSite,
    slogan: config.identity.slogan || '',
    initialesLogo: config.identity.initialesLogo || 'MS',

    // ========== B. ASSETS VISUELS ==========
    logoUrl: config.assets.logoUrl,
    logoDarkUrl: config.assets.logoDarkUrl,
    logoSvgCode: config.assets.logoSvgCode,
    faviconUrl: config.assets.faviconUrl,
    ogImageUrl: config.assets.ogImageUrl,
    heroBackgroundUrl: heroContent?.backgroundUrl || null,
    heroVideoUrl: heroContent?.videoUrl || null,

    // ========== C. SEO & MÉTA ==========
    metaTitre: config.seo.metaTitre,
    metaDescription: config.seo.metaDescription,
    siteUrl: config.seo.siteUrl,
    motsCles: config.seo.motsCles,
    langue: config.seo.langue,
    locale: config.seo.locale,
    robotsIndex: config.seo.robotsIndex,
    sitemapPriority: config.seo.sitemapPriority,

    // ========== D. BRANDING / COULEURS ==========
    couleurPrimaire: config.branding.couleurPrimaire,
    couleurAccent: config.branding.couleurAccent,
    couleurBackground: config.branding.couleurBackground,
    couleurText: config.branding.couleurText,
    fontPrimary: config.branding.fontPrimary,
    fontHeading: config.branding.fontHeading,
    fontCustomUrl: config.branding.fontCustomUrl,
    borderRadius: config.branding.borderRadius,
    patternBackground: config.branding.patternBackground,

    // ========== E. CONTACT ==========
    email: config.contact.email,
    telephone: config.contact.telephone,
    adresse: config.contact.adresse,
    adresseCourte: config.contact.adresseCourte,
    lienLinkedin: config.contact.lienLinkedin || '',
    lienInstagram: config.contact.lienInstagram,
    lienTwitter: config.contact.lienTwitter,
    lienYoutube: config.contact.lienYoutube,
    lienGithub: config.contact.lienGithub,
    lienCalendly: config.contact.lienCalendly,
    lienWhatsapp: config.contact.lienWhatsapp,
    lienBoutonAppel: config.contact.lienBoutonAppel || '',

    // ========== F. SECTION HERO (from heroSection or defaults) ==========
    titreHero: heroContent?.titre || 'Titre Principal',
    sousTitreHero: heroContent?.sousTitre || '',
    badgeHero: heroContent?.badge || '',
    ctaPrincipal: heroContent?.ctaPrincipal?.text || 'Action',
    ctaPrincipalUrl: heroContent?.ctaPrincipal?.url || '#contact',
    ctaSecondaire: heroContent?.ctaSecondaire?.text || '',
    ctaSecondaireUrl: heroContent?.ctaSecondaire?.url || null,
    heroAiPrompt: heroContent?.aiPrompt || null,

    // ========== G. TRUST STATS (from heroSection) ==========
    trustStat1Value: heroContent?.trustStats?.[0]?.value || '',
    trustStat1Label: heroContent?.trustStats?.[0]?.label || '',
    trustStat2Value: heroContent?.trustStats?.[1]?.value || '',
    trustStat2Label: heroContent?.trustStats?.[1]?.label || '',
    trustStat3Value: heroContent?.trustStats?.[2]?.value || '',
    trustStat3Label: heroContent?.trustStats?.[2]?.label || '',

    // ========== H. FOOTER ==========
    copyrightTexte: config.footer.copyrightTexte,
    paysHebergement: config.footer.paysHebergement,
    showLegalLinks: config.footer.showLegalLinks,
    customFooterText: config.footer.customFooterText,
    footerCtaText: config.footer.footerCtaText,
    footerCtaUrl: config.footer.footerCtaUrl,
    footerLogoSize: config.footer.footerLogoSize,
    footerLogoAnimation: config.footer.footerLogoAnimation as GlobalSettingsComplete['footerLogoAnimation'],

    // ========== I. ANALYTICS ==========
    umamiSiteId: config.integrations.umamiSiteId,
    umamiScriptUrl: config.integrations.umamiScriptUrl,
    gaMeasurementId: config.integrations.gaMeasurementId,
    gtmContainerId: config.integrations.gtmContainerId,
    hotjarSiteId: config.integrations.hotjarSiteId,
    facebookPixelId: config.integrations.facebookPixelId,

    // ========== J. MODULES - ACTIVATION ==========
    // Dans V2, cela est géré par section.isActive
    // On met des valeurs par défaut qui seront overrides par les sections
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
    showAiAssistant: config.ai.aiMode !== 'Disabled',
    showCookieBanner: true,
    showAnalytics: !!config.integrations.gaMeasurementId || !!config.integrations.umamiSiteId,

    // ========== K. MODULES - VARIANTES ==========
    themeGlobal: config.branding.themeGlobal as GlobalSettingsComplete['themeGlobal'],
    heroVariant: (heroDesign?.variant || config.branding.themeGlobal || 'Electric') as GlobalSettingsComplete['heroVariant'],
    navbarVariant: config.branding.themeGlobal as GlobalSettingsComplete['navbarVariant'],
    servicesVariant: 'Cards',
    galleryVariant: 'Grid',
    testimonialsVariant: 'Cards',
    faqVariant: 'Accordion',
    contactVariant: 'Form',
    footerVariant: config.footer.footerVariant as GlobalSettingsComplete['footerVariant'],
    aiAssistantStyle: 'Chat',

    // ========== L. TAILLES & DIMENSIONS ==========
    logoSize: 'Medium',
    heroHeight: (heroDesign?.height || 'Tall') as GlobalSettingsComplete['heroHeight'],
    sectionSpacing: 'Normal',
    cardStyle: 'Shadow',

    // ========== M. ANIMATIONS & EFFETS ==========
    enableAnimations: config.animations.enableAnimations,
    animationStyle: config.animations.animationStyle as GlobalSettingsComplete['animationStyle'],
    animationSpeed: config.animations.animationSpeed as GlobalSettingsComplete['animationSpeed'],
    scrollEffect: config.animations.scrollEffect as GlobalSettingsComplete['scrollEffect'],
    hoverEffect: config.animations.hoverEffect as GlobalSettingsComplete['hoverEffect'],
    loadingStyle: config.animations.loadingStyle as GlobalSettingsComplete['loadingStyle'],
    logoAnimation: (heroDesign?.logoAnimation || 'electric') as GlobalSettingsComplete['logoAnimation'],
    logoFrameStyle: heroDesign?.logoFrameStyle as GlobalSettingsComplete['logoFrameStyle'],
    textAnimation: (heroDesign?.textAnimation || config.animations.textAnimation) as GlobalSettingsComplete['textAnimation'],
    galleryAnimation: 'Fade',
    headerLogoSize: 40,
    headerLogoAnimation: 'spin' as GlobalSettingsComplete['headerLogoAnimation'],
    heroLogoAnimation: (heroDesign?.logoAnimation || 'electric') as GlobalSettingsComplete['heroLogoAnimation'],
    heroLogoSize: heroDesign?.logoSize || 280,

    // ========== N. PHOTOS & MÉDIAS ==========
    imageStyle: 'Rounded',
    imageFilter: 'None',
    galleryColumns: '3',
    galleryTitle: null,
    gallerySubtitle: null,
    videoAutoplay: false,
    lazyLoading: true,

    // ========== O. MODULE IA ==========
    aiMode: config.ai.aiMode as GlobalSettingsComplete['aiMode'],
    aiProvider: config.ai.aiProvider as GlobalSettingsComplete['aiProvider'],
    aiApiKey: config.ai.aiApiKey,
    aiModel: config.ai.aiModel,
    aiSystemPrompt: config.ai.aiSystemPrompt,
    aiWebhookUrl: config.ai.aiWebhookUrl,
    aiImageWebhook: config.ai.aiImageWebhook,
    aiMaxTokens: config.ai.aiMaxTokens,
    aiTemperature: config.ai.aiTemperature,
    chatbotWelcomeMessage: DEFAULT_SETTINGS.chatbotWelcomeMessage,
    chatbotPlaceholder: DEFAULT_SETTINGS.chatbotPlaceholder,
    chatbotAvatarUrl: null,
    voiceEnabled: false,
    voiceLanguage: 'fr-FR',

    // ========== P. MODULE IA AVANCÉ ==========
    aiGenerateHero: false,
    aiGenerateServices: false,
    aiGenerateFaq: false,
    aiTone: config.ai.aiTone as GlobalSettingsComplete['aiTone'],
    aiIndustry: config.ai.aiIndustry as GlobalSettingsComplete['aiIndustry'],
    aiTargetAudience: config.ai.aiTargetAudience,
    aiKeywords: config.ai.aiKeywords,
    aiLastGeneration: null,

    // ========== Q. INTÉGRATIONS EXTERNES ==========
    n8nWebhookContact: config.integrations.n8nWebhookContact,
    n8nWebhookNewsletter: config.integrations.n8nWebhookNewsletter,
    stripePublicKey: config.integrations.stripePublicKey,
    mailchimpListId: config.integrations.mailchimpListId,
    sendgridApiKey: config.integrations.sendgridApiKey,
    notionDatabaseId: config.integrations.notionDatabaseId,
    airtableBaseId: config.integrations.airtableBaseId,

    // ========== R. PREMIUM ==========
    isPremium: config.premium.isPremium,
    premiumUntil: config.premium.premiumUntil,
    customDomain: config.premium.customDomain,
    customCss: config.premium.customCss,
    customJs: config.premium.customJs,
    featureFlags: config.premium.featureFlags,
    rateLimitApi: config.premium.rateLimitApi,

    // ========== S. LAYOUT & ORDER ==========
    sectionOrder: null, // Géré par sections array maintenant

    // ========== T. GRID BLOCKS ==========
    heroBlocks: null,
  };
}

// ============================================
// SECTION → LEGACY PROPS ADAPTERS
// ============================================

/**
 * Adapte une HeroSection pour les composants legacy
 */
export function adaptHeroSectionToLegacy(
  section: HeroSection,
  globalConfig: GlobalConfig
): GlobalSettingsComplete {
  return adaptGlobalConfigToLegacy(globalConfig, section);
}

/**
 * Extrait les show* flags depuis les sections
 */
export function getSectionVisibilityFromSections(
  sections: Section[]
): Partial<GlobalSettingsComplete> {
  const flags: Partial<GlobalSettingsComplete> = {
    showHero: false,
    showAdvantages: false,
    showServices: false,
    showPortfolio: false,
    showGallery: false,
    showTestimonials: false,
    showTrust: false,
    showFaq: false,
    showContact: false,
    showBlog: false,
    showAiAssistant: false,
  };

  for (const section of sections) {
    if (!section.isActive) continue;

    switch (section.type) {
      case 'hero':
        flags.showHero = true;
        break;
      case 'advantages':
        flags.showAdvantages = true;
        break;
      case 'services':
        flags.showServices = true;
        break;
      case 'portfolio':
        flags.showPortfolio = true;
        break;
      case 'gallery':
        flags.showGallery = true;
        break;
      case 'testimonials':
        flags.showTestimonials = true;
        break;
      case 'trust':
        flags.showTrust = true;
        break;
      case 'faq':
        flags.showFaq = true;
        break;
      case 'contact':
        flags.showContact = true;
        break;
      case 'blog':
        flags.showBlog = true;
        break;
      case 'ai-assistant':
        flags.showAiAssistant = true;
        break;
    }
  }

  return flags;
}

/**
 * Crée un config legacy complet avec les flags de visibilité des sections
 */
export function createLegacyConfigFromFactory(
  globalConfig: GlobalConfig,
  sections: Section[]
): GlobalSettingsComplete {
  const heroSection = sections.find(s => s.type === 'hero' && s.isActive) as HeroSection | undefined;
  const baseConfig = adaptGlobalConfigToLegacy(globalConfig, heroSection);
  const visibilityFlags = getSectionVisibilityFromSections(sections);

  return {
    ...baseConfig,
    ...visibilityFlags,
  };
}

