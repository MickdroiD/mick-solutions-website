// ============================================
// BASEROW API CLIENT - White Label Factory 2025
// ============================================
// Client API complet pour l'architecture modulaire.
// 140+ champs configurables.

import { 
  GlobalSettingsComplete, 
  DEFAULT_SETTINGS,
  mergeWithDefaults,
  type VariantStyle,
  type ServicesVariant,
  type GalleryVariant,
  type TestimonialsVariant,
  type FAQVariant,
  type ContactVariant,
  type AIAssistantStyle,
  type FontFamily,
  type BorderRadius,
  type PatternBackground,
  type LogoSize,
  type HeroHeight,
  type SectionSpacing,
  type CardStyle,
  type AnimationSpeed,
  type ScrollEffect,
  type HoverEffect,
  type LoadingStyle,
  type ImageStyle,
  type ImageFilter,
  type GalleryColumns,
  type AIMode,
  type AIProvider,
  type AITone,
  type AIIndustry,
  type VoiceLanguage,
} from './types/global-settings';

const BASEROW_BASE_URL = 'https://baserow.mick-solutions.ch/api/database/rows/table';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;

if (typeof window === 'undefined') {
  console.log(`[Baserow] Token: ${BASEROW_TOKEN ? '✅' : '❌ MISSING'}`);
}

// Table IDs
const TABLE_IDS = {
  SERVICES: 748,
  PORTFOLIO: 749,
  REVIEWS: 750,
  GLOBAL: 751,
  FAQ: 752,
  LEGAL_DOCS: 753,
  ADVANTAGES: 757,
  TRUST_POINTS: 758,
  GALLERY: 781,
} as const;

// ============================================
// INTERFACES
// ============================================

export interface BaserowTag {
  id: number;
  value: string;
  color: string;
}

export interface BaserowSelectOption {
  id: number;
  value: string;
  color: string;
}

export interface Service {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Ordre: string | null;
  Tagline: string | null;
  tags: BaserowTag[];
  points_cle: string | null;
  type: BaserowSelectOption | null;
  tarif: string | null;
}

export interface Project {
  id: number;
  Nom: string;
  Slug: string;
  Tags: BaserowTag[];
  DescriptionCourte: string;
  ImageCouverture: { url: string; name: string }[];
  LienSite: string;
  Statut: BaserowSelectOption;
  Ordre: string | null;
}

export interface Review {
  id: number;
  NomClient: string;
  PosteEntreprise: string;
  Photo: { url: string; name: string }[];
  Message: string;
  Note: string;
  Afficher: boolean;
}

export interface FAQ {
  id: number;
  Question: string;
  Reponse: string;
  Ordre: string | null;
}

export interface Advantage {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Badge: string;
  Ordre: string | null;
}

export interface TrustPoint {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Badge: string;
  Ordre: string | null;
}

export interface LegalDoc {
  id: number;
  Titre: string;
  Slug: string;
  Contenu: string;
  DateMiseAJour: string | null;
  IsActive: boolean;
}

export interface GalleryItem {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
  Ordre: string | null;
  TypeAffichage: string | null;
}

// Réexporter les types
export type { GlobalSettingsComplete } from './types/global-settings';
export { DEFAULT_SETTINGS, isCompleteSettings } from './types/global-settings';

// ============================================
// RAW BASEROW TYPES
// ============================================

interface BaserowGlobalRowComplete {
  id: number;
  
  // Identité
  'Nom Site'?: string;
  'Slogan'?: string;
  'Initiales Logo'?: string;
  
  // Assets
  'Logo URL'?: string;
  'Logo Dark URL'?: string;
  'Favicon URL'?: string;
  'OG Image URL'?: string;
  'Hero_Background_URL'?: string;
  'Hero_Video_URL'?: string;
  
  // SEO
  'Meta Titre'?: string;
  'Meta Description'?: string;
  'Site URL'?: string;
  'Mots Cles'?: string;
  'Langue'?: string;
  'Locale'?: string;
  'Robots_Index'?: boolean;
  'Sitemap_Priority'?: number;
  
  // Branding
  'Couleur Primaire'?: string;
  'Couleur Accent'?: string;
  'Couleur_Background'?: string;
  'Couleur_Text'?: string;
  'Font_Primary'?: BaserowSelectOption | null;
  'Font_Heading'?: BaserowSelectOption | null;
  'Font_Custom_URL'?: string;
  'Border_Radius'?: BaserowSelectOption | null;
  'Pattern_Background'?: BaserowSelectOption | null;
  
  // Contact
  'Email': string;
  'Telephone'?: string;
  'Adresse'?: string;
  'Adresse_Courte'?: string;
  'Lien Linkedin'?: string;
  'Lien_Instagram'?: string;
  'Lien_Twitter'?: string;
  'Lien_Youtube'?: string;
  'Lien_Github'?: string;
  'Lien_Calendly'?: string;
  'Lien_Whatsapp'?: string;
  'Lien Bouton Appel'?: string;
  
  // Hero
  'Titre Hero'?: string;
  'Sous-titre Hero'?: string;
  'Badge Hero'?: string;
  'CTA Principal'?: string;
  'CTA_Principal_URL'?: string;
  'CTA Secondaire'?: string;
  'CTA_Secondaire_URL'?: string;
  'Hero_AI_Prompt'?: string;
  
  // Trust Stats
  'Trust Stat 1 Value'?: string;
  'Trust Stat 1 Label'?: string;
  'Trust_Stat_2_Value'?: string;
  'Trust_Stat_2_Label'?: string;
  'Trust_Stat_3_Value'?: string;
  'Trust_Stat_3_Label'?: string;
  
  // Footer
  'Copyright Texte'?: string;
  'Pays Hebergement'?: string;
  'Show_Legal_Links'?: boolean;
  'Custom_Footer_Text'?: string;
  'Footer_CTA_Text'?: string;
  'Footer_CTA_URL'?: string;
  
  // Analytics
  'Umami_Site_ID'?: string;
  'Umami_Script_URL'?: string;
  'GA_Measurement_ID'?: string;
  'GTM_Container_ID'?: string;
  'Hotjar_Site_ID'?: string;
  'Facebook_Pixel_ID'?: string;
  
  // Modules - Activation
  'Show_Navbar'?: boolean;
  'Show_Hero'?: boolean;
  'Show_Advantages'?: boolean;
  'Show_Services'?: boolean;
  'Show_Gallery'?: boolean;
  'Show_Portfolio'?: boolean;
  'Show_Testimonials'?: boolean;
  'Show_Trust'?: boolean;
  'Show_FAQ'?: boolean;
  'Show_Blog'?: boolean;
  'Show_Contact'?: boolean;
  'Show_AI_Assistant'?: boolean;
  'Show_Cookie_Banner'?: boolean;
  'Show_Analytics'?: boolean;
  
  // Modules - Variantes
  'Theme_Global'?: BaserowSelectOption | null;
  'Hero_Variant'?: BaserowSelectOption | null;
  'Navbar_Variant'?: BaserowSelectOption | null;
  'Services_Variant'?: BaserowSelectOption | null;
  'Gallery_Variant'?: BaserowSelectOption | null;
  'Testimonials_Variant'?: BaserowSelectOption | null;
  'FAQ_Variant'?: BaserowSelectOption | null;
  'Contact_Variant'?: BaserowSelectOption | null;
  'Footer_Variant'?: BaserowSelectOption | null;
  'AI_Assistant_Style'?: BaserowSelectOption | null;
  
  // Tailles
  'Logo_Size'?: BaserowSelectOption | null;
  'Hero_Height'?: BaserowSelectOption | null;
  'Section_Spacing'?: BaserowSelectOption | null;
  'Card_Style'?: BaserowSelectOption | null;
  
  // Animations
  'Enable_Animations'?: boolean;
  'Animation_Speed'?: BaserowSelectOption | null;
  'Scroll_Effect'?: BaserowSelectOption | null;
  'Hover_Effect'?: BaserowSelectOption | null;
  'Loading_Style'?: BaserowSelectOption | null;
  
  // Photos
  'Image_Style'?: BaserowSelectOption | null;
  'Image_Filter'?: BaserowSelectOption | null;
  'Gallery_Columns'?: BaserowSelectOption | null;
  'Video_Autoplay'?: boolean;
  'Lazy_Loading'?: boolean;
  
  // IA
  'AI_Mode'?: BaserowSelectOption | null;
  'AI_Provider'?: BaserowSelectOption | null;
  'AI_API_Key'?: string;
  'AI_Model'?: string;
  'AI_System_Prompt'?: string;
  'AI_Webhook_URL'?: string;
  'AI_Image_Webhook'?: string;
  'AI_Max_Tokens'?: number;
  'AI_Temperature'?: number;
  'Chatbot_Welcome_Message'?: string;
  'Chatbot_Placeholder'?: string;
  'Chatbot_Avatar_URL'?: string;
  'Voice_Enabled'?: boolean;
  'Voice_Language'?: BaserowSelectOption | null;
  
  // IA Avancé
  'AI_Generate_Hero'?: boolean;
  'AI_Generate_Services'?: boolean;
  'AI_Generate_FAQ'?: boolean;
  'AI_Tone'?: BaserowSelectOption | null;
  'AI_Industry'?: BaserowSelectOption | null;
  'AI_Target_Audience'?: string;
  'AI_Keywords'?: string;
  'AI_Last_Generation'?: string;
  
  // Intégrations
  'N8N_Webhook_Contact'?: string;
  'N8N_Webhook_Newsletter'?: string;
  'Stripe_Public_Key'?: string;
  'Mailchimp_List_ID'?: string;
  'Sendgrid_API_Key'?: string;
  'Notion_Database_ID'?: string;
  'Airtable_Base_ID'?: string;
  
  // Premium
  'Is_Premium'?: boolean;
  'Premium_Until'?: string;
  'Custom_Domain'?: string;
  'Custom_CSS'?: string;
  'Custom_JS'?: string;
  'Feature_Flags'?: BaserowTag[];
  'Rate_Limit_API'?: number;
}

// ============================================
// GENERIC FETCH
// ============================================

async function fetchBaserow<T>(
  tableId: number,
  options?: { filters?: string; orderBy?: string; size?: number }
): Promise<T[] | null> {
  if (!BASEROW_TOKEN) {
    console.error('❌ [Baserow] BASEROW_API_TOKEN manquant');
    return null;
  }

  try {
    const params = new URLSearchParams({ user_field_names: 'true' });
    if (options?.filters) params.append('filters', options.filters);
    if (options?.orderBy) params.append('order_by', options.orderBy);
    if (options?.size) params.append('size', options.size.toString());

    const response = await fetch(`${BASEROW_BASE_URL}/${tableId}/?${params}`, {
      headers: { 'Authorization': `Token ${BASEROW_TOKEN}` },
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.results as T[];
  } catch (error) {
    console.error(`❌ [Baserow] Table ${tableId}:`, error);
    return null;
  }
}

// ============================================
// HELPER: Extract select value
// ============================================

function getSelectValue<T extends string>(opt: BaserowSelectOption | null | undefined): T | null {
  return opt?.value as T || null;
}

// ============================================
// API FUNCTIONS
// ============================================

export async function getGlobalSettingsComplete(): Promise<GlobalSettingsComplete> {
  const rows = await fetchBaserow<BaserowGlobalRowComplete>(TABLE_IDS.GLOBAL, { size: 1 });
  
  if (!rows || rows.length === 0) {
    console.warn('[Baserow] Aucune donnée, utilisation des valeurs par défaut');
    return DEFAULT_SETTINGS;
  }

  const r = rows[0];
  
  const settings: Partial<GlobalSettingsComplete> = {
    id: r.id,

    // Identité
    nomSite: r['Nom Site'] || DEFAULT_SETTINGS.nomSite,
    slogan: r['Slogan'] || DEFAULT_SETTINGS.slogan,
    initialesLogo: r['Initiales Logo'] || DEFAULT_SETTINGS.initialesLogo,

    // Assets
    logoUrl: r['Logo URL'] || DEFAULT_SETTINGS.logoUrl,
    logoDarkUrl: r['Logo Dark URL'] || null,
    faviconUrl: r['Favicon URL'] || null,
    ogImageUrl: r['OG Image URL'] || null,
    heroBackgroundUrl: r['Hero_Background_URL'] || null,
    heroVideoUrl: r['Hero_Video_URL'] || null,

    // SEO
    metaTitre: r['Meta Titre'] || DEFAULT_SETTINGS.metaTitre,
    metaDescription: r['Meta Description'] || DEFAULT_SETTINGS.metaDescription,
    siteUrl: r['Site URL'] || DEFAULT_SETTINGS.siteUrl,
    motsCles: r['Mots Cles'] || DEFAULT_SETTINGS.motsCles,
    langue: r['Langue'] || DEFAULT_SETTINGS.langue,
    locale: r['Locale'] || DEFAULT_SETTINGS.locale,
    robotsIndex: r['Robots_Index'] ?? DEFAULT_SETTINGS.robotsIndex,
    sitemapPriority: r['Sitemap_Priority'] ?? DEFAULT_SETTINGS.sitemapPriority,

    // Branding
    couleurPrimaire: r['Couleur Primaire'] || DEFAULT_SETTINGS.couleurPrimaire,
    couleurAccent: r['Couleur Accent'] || DEFAULT_SETTINGS.couleurAccent,
    couleurBackground: r['Couleur_Background'] || DEFAULT_SETTINGS.couleurBackground,
    couleurText: r['Couleur_Text'] || DEFAULT_SETTINGS.couleurText,
    fontPrimary: getSelectValue<FontFamily>(r['Font_Primary']),
    fontHeading: getSelectValue<FontFamily>(r['Font_Heading']),
    fontCustomUrl: r['Font_Custom_URL'] || null,
    borderRadius: getSelectValue<BorderRadius>(r['Border_Radius']),
    patternBackground: getSelectValue<PatternBackground>(r['Pattern_Background']),

    // Contact
    email: r['Email'] || DEFAULT_SETTINGS.email,
    telephone: r['Telephone'] || null,
    adresse: r['Adresse'] || DEFAULT_SETTINGS.adresse,
    adresseCourte: r['Adresse_Courte'] || null,
    lienLinkedin: r['Lien Linkedin'] || DEFAULT_SETTINGS.lienLinkedin,
    lienInstagram: r['Lien_Instagram'] || null,
    lienTwitter: r['Lien_Twitter'] || null,
    lienYoutube: r['Lien_Youtube'] || null,
    lienGithub: r['Lien_Github'] || null,
    lienCalendly: r['Lien_Calendly'] || null,
    lienWhatsapp: r['Lien_Whatsapp'] || null,
    lienBoutonAppel: r['Lien Bouton Appel'] || DEFAULT_SETTINGS.lienBoutonAppel,

    // Hero
    titreHero: r['Titre Hero'] || DEFAULT_SETTINGS.titreHero,
    sousTitreHero: r['Sous-titre Hero'] || DEFAULT_SETTINGS.sousTitreHero,
    badgeHero: r['Badge Hero'] || DEFAULT_SETTINGS.badgeHero,
    ctaPrincipal: r['CTA Principal'] || DEFAULT_SETTINGS.ctaPrincipal,
    ctaPrincipalUrl: r['CTA_Principal_URL'] || DEFAULT_SETTINGS.ctaPrincipalUrl,
    ctaSecondaire: r['CTA Secondaire'] || DEFAULT_SETTINGS.ctaSecondaire,
    ctaSecondaireUrl: r['CTA_Secondaire_URL'] || DEFAULT_SETTINGS.ctaSecondaireUrl,
    heroAiPrompt: r['Hero_AI_Prompt'] || null,

    // Trust Stats
    trustStat1Value: r['Trust Stat 1 Value'] || DEFAULT_SETTINGS.trustStat1Value,
    trustStat1Label: r['Trust Stat 1 Label'] || DEFAULT_SETTINGS.trustStat1Label,
    trustStat2Value: r['Trust_Stat_2_Value'] || DEFAULT_SETTINGS.trustStat2Value,
    trustStat2Label: r['Trust_Stat_2_Label'] || DEFAULT_SETTINGS.trustStat2Label,
    trustStat3Value: r['Trust_Stat_3_Value'] || DEFAULT_SETTINGS.trustStat3Value,
    trustStat3Label: r['Trust_Stat_3_Label'] || DEFAULT_SETTINGS.trustStat3Label,

    // Footer
    copyrightTexte: r['Copyright Texte'] || DEFAULT_SETTINGS.copyrightTexte,
    paysHebergement: r['Pays Hebergement'] || DEFAULT_SETTINGS.paysHebergement,
    showLegalLinks: r['Show_Legal_Links'] ?? DEFAULT_SETTINGS.showLegalLinks,
    customFooterText: r['Custom_Footer_Text'] || null,
    footerCtaText: r['Footer_CTA_Text'] || null,
    footerCtaUrl: r['Footer_CTA_URL'] || null,

    // Analytics
    umamiSiteId: r['Umami_Site_ID'] || null,
    umamiScriptUrl: r['Umami_Script_URL'] || null,
    gaMeasurementId: r['GA_Measurement_ID'] || null,
    gtmContainerId: r['GTM_Container_ID'] || null,
    hotjarSiteId: r['Hotjar_Site_ID'] || null,
    facebookPixelId: r['Facebook_Pixel_ID'] || null,

    // Modules - Activation
    showNavbar: r['Show_Navbar'] ?? DEFAULT_SETTINGS.showNavbar,
    showHero: r['Show_Hero'] ?? DEFAULT_SETTINGS.showHero,
    showAdvantages: r['Show_Advantages'] ?? DEFAULT_SETTINGS.showAdvantages,
    showServices: r['Show_Services'] ?? DEFAULT_SETTINGS.showServices,
    showGallery: r['Show_Gallery'] ?? DEFAULT_SETTINGS.showGallery,
    showPortfolio: r['Show_Portfolio'] ?? DEFAULT_SETTINGS.showPortfolio,
    showTestimonials: r['Show_Testimonials'] ?? DEFAULT_SETTINGS.showTestimonials,
    showTrust: r['Show_Trust'] ?? DEFAULT_SETTINGS.showTrust,
    showFaq: r['Show_FAQ'] ?? DEFAULT_SETTINGS.showFaq,
    showBlog: r['Show_Blog'] ?? DEFAULT_SETTINGS.showBlog,
    showContact: r['Show_Contact'] ?? DEFAULT_SETTINGS.showContact,
    showAiAssistant: r['Show_AI_Assistant'] ?? DEFAULT_SETTINGS.showAiAssistant,
    showCookieBanner: r['Show_Cookie_Banner'] ?? DEFAULT_SETTINGS.showCookieBanner,
    showAnalytics: r['Show_Analytics'] ?? DEFAULT_SETTINGS.showAnalytics,

    // Modules - Variantes
    themeGlobal: getSelectValue<VariantStyle>(r['Theme_Global']),
    heroVariant: getSelectValue<VariantStyle>(r['Hero_Variant']),
    navbarVariant: getSelectValue<VariantStyle>(r['Navbar_Variant']),
    servicesVariant: getSelectValue<ServicesVariant>(r['Services_Variant']),
    galleryVariant: getSelectValue<GalleryVariant>(r['Gallery_Variant']),
    testimonialsVariant: getSelectValue<TestimonialsVariant>(r['Testimonials_Variant']),
    faqVariant: getSelectValue<FAQVariant>(r['FAQ_Variant']),
    contactVariant: getSelectValue<ContactVariant>(r['Contact_Variant']),
    footerVariant: getSelectValue<VariantStyle>(r['Footer_Variant']),
    aiAssistantStyle: getSelectValue<AIAssistantStyle>(r['AI_Assistant_Style']),

    // Tailles
    logoSize: getSelectValue<LogoSize>(r['Logo_Size']),
    heroHeight: getSelectValue<HeroHeight>(r['Hero_Height']),
    sectionSpacing: getSelectValue<SectionSpacing>(r['Section_Spacing']),
    cardStyle: getSelectValue<CardStyle>(r['Card_Style']),

    // Animations
    enableAnimations: r['Enable_Animations'] ?? DEFAULT_SETTINGS.enableAnimations,
    animationSpeed: getSelectValue<AnimationSpeed>(r['Animation_Speed']),
    scrollEffect: getSelectValue<ScrollEffect>(r['Scroll_Effect']),
    hoverEffect: getSelectValue<HoverEffect>(r['Hover_Effect']),
    loadingStyle: getSelectValue<LoadingStyle>(r['Loading_Style']),

    // Photos
    imageStyle: getSelectValue<ImageStyle>(r['Image_Style']),
    imageFilter: getSelectValue<ImageFilter>(r['Image_Filter']),
    galleryColumns: getSelectValue<GalleryColumns>(r['Gallery_Columns']),
    videoAutoplay: r['Video_Autoplay'] ?? DEFAULT_SETTINGS.videoAutoplay,
    lazyLoading: r['Lazy_Loading'] ?? DEFAULT_SETTINGS.lazyLoading,

    // IA
    aiMode: getSelectValue<AIMode>(r['AI_Mode']),
    aiProvider: getSelectValue<AIProvider>(r['AI_Provider']),
    aiApiKey: r['AI_API_Key'] || null,
    aiModel: r['AI_Model'] || DEFAULT_SETTINGS.aiModel,
    aiSystemPrompt: r['AI_System_Prompt'] || null,
    aiWebhookUrl: r['AI_Webhook_URL'] || null,
    aiImageWebhook: r['AI_Image_Webhook'] || null,
    aiMaxTokens: r['AI_Max_Tokens'] ?? DEFAULT_SETTINGS.aiMaxTokens,
    aiTemperature: r['AI_Temperature'] ?? DEFAULT_SETTINGS.aiTemperature,
    chatbotWelcomeMessage: r['Chatbot_Welcome_Message'] || DEFAULT_SETTINGS.chatbotWelcomeMessage,
    chatbotPlaceholder: r['Chatbot_Placeholder'] || DEFAULT_SETTINGS.chatbotPlaceholder,
    chatbotAvatarUrl: r['Chatbot_Avatar_URL'] || null,
    voiceEnabled: r['Voice_Enabled'] ?? DEFAULT_SETTINGS.voiceEnabled,
    voiceLanguage: getSelectValue<VoiceLanguage>(r['Voice_Language']),

    // IA Avancé
    aiGenerateHero: r['AI_Generate_Hero'] ?? DEFAULT_SETTINGS.aiGenerateHero,
    aiGenerateServices: r['AI_Generate_Services'] ?? DEFAULT_SETTINGS.aiGenerateServices,
    aiGenerateFaq: r['AI_Generate_FAQ'] ?? DEFAULT_SETTINGS.aiGenerateFaq,
    aiTone: getSelectValue<AITone>(r['AI_Tone']),
    aiIndustry: getSelectValue<AIIndustry>(r['AI_Industry']),
    aiTargetAudience: r['AI_Target_Audience'] || null,
    aiKeywords: r['AI_Keywords'] || null,
    aiLastGeneration: r['AI_Last_Generation'] || null,

    // Intégrations
    n8nWebhookContact: r['N8N_Webhook_Contact'] || null,
    n8nWebhookNewsletter: r['N8N_Webhook_Newsletter'] || null,
    stripePublicKey: r['Stripe_Public_Key'] || null,
    mailchimpListId: r['Mailchimp_List_ID'] || null,
    sendgridApiKey: r['Sendgrid_API_Key'] || null,
    notionDatabaseId: r['Notion_Database_ID'] || null,
    airtableBaseId: r['Airtable_Base_ID'] || null,

    // Premium
    isPremium: r['Is_Premium'] ?? DEFAULT_SETTINGS.isPremium,
    premiumUntil: r['Premium_Until'] || null,
    customDomain: r['Custom_Domain'] || null,
    customCss: r['Custom_CSS'] || null,
    customJs: r['Custom_JS'] || null,
    featureFlags: r['Feature_Flags']?.map(t => t.value) || [],
    rateLimitApi: r['Rate_Limit_API'] ?? DEFAULT_SETTINGS.rateLimitApi,
  };

  return mergeWithDefaults(settings);
}

// ============================================
// AUTRES FONCTIONS API
// ============================================

interface BaserowServiceRow {
  id: number;
  Titre: string;
  Description: string;
  Icone: string;
  Ordre: string | null;
  Tagline?: string;
  tags?: BaserowTag[];
  'Points Clés'?: string;
  'Type:'?: BaserowSelectOption;
  'Tarif (indicatif):'?: string;
}

export async function getServices(): Promise<Service[] | null> {
  const rows = await fetchBaserow<BaserowServiceRow>(TABLE_IDS.SERVICES, { orderBy: 'Ordre' });
  if (!rows) return null;
  return rows.map(r => ({
    id: r.id,
    Titre: r.Titre,
    Description: r.Description,
    Icone: r.Icone,
    Ordre: r.Ordre,
    Tagline: r.Tagline || null,
    tags: r.tags || [],
    points_cle: r['Points Clés'] || null,
    type: r['Type:'] || null,
    tarif: r['Tarif (indicatif):'] || null,
  }));
}

interface BaserowProjectRow {
  id: number;
  Nom: string;
  Slug: string;
  Tags: BaserowTag[];
  'Description courte': string;
  'Image de couverture': { url: string; name: string }[];
  'Lien du site': string;
  Statut: BaserowSelectOption;
  Ordre: string | null;
}

export async function getProjects(): Promise<Project[] | null> {
  const rows = await fetchBaserow<BaserowProjectRow>(TABLE_IDS.PORTFOLIO, {
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [{ type: 'single_select_equal', field: 'Statut', value: '3068' }],
    }),
    orderBy: 'Ordre',
  });
  if (!rows) return null;
  return rows.map(r => ({
    id: r.id,
    Nom: r.Nom,
    Slug: r.Slug,
    Tags: r.Tags,
    DescriptionCourte: r['Description courte'],
    ImageCouverture: r['Image de couverture'],
    LienSite: r['Lien du site'],
    Statut: r.Statut,
    Ordre: r.Ordre,
  }));
}

interface BaserowReviewRow {
  id: number;
  'Nom du client': string;
  'Poste / Entreprise': string;
  Photo: { url: string; name: string }[];
  Message: string;
  Note: string;
  Afficher: boolean;
}

export async function getReviews(): Promise<Review[] | null> {
  const rows = await fetchBaserow<BaserowReviewRow>(TABLE_IDS.REVIEWS, {
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [{ type: 'boolean', field: 'Afficher', value: 'true' }],
    }),
  });
  if (!rows) return null;
  return rows.map(r => ({
    id: r.id,
    NomClient: r['Nom du client'],
    PosteEntreprise: r['Poste / Entreprise'],
    Photo: r.Photo,
    Message: r.Message,
    Note: r.Note,
    Afficher: r.Afficher,
  }));
}

export async function getFAQ(): Promise<FAQ[] | null> {
  return fetchBaserow<FAQ>(TABLE_IDS.FAQ, { orderBy: 'Ordre' });
}

interface BaserowLegalDocRow {
  id: number;
  Titre: string;
  Slug: string;
  Contenu: string;
  Date_Mise_a_jour: string | null;
  Is_Active: boolean;
}

export async function getAllLegalDocs(): Promise<LegalDoc[] | null> {
  const rows = await fetchBaserow<BaserowLegalDocRow>(TABLE_IDS.LEGAL_DOCS);
  if (!rows) return null;
  return rows.filter(r => r.Is_Active).map(r => ({
    id: r.id,
    Titre: r.Titre,
    Slug: r.Slug,
    Contenu: r.Contenu,
    DateMiseAJour: r.Date_Mise_a_jour,
    IsActive: r.Is_Active,
  }));
}

export async function getLegalDocBySlug(slug: string): Promise<LegalDoc | null> {
  const docs = await getAllLegalDocs();
  return docs?.find(d => d.Slug === slug) || null;
}

// Valeurs par défaut
export const DEFAULT_ADVANTAGES: Advantage[] = [
  { id: 1, Titre: "Récupérez vos heures", Description: "Les tâches répétitives automatisées.", Icone: "clock", Badge: "10h+ économisées/semaine", Ordre: "1" },
  { id: 2, Titre: "Réduisez vos coûts", Description: "Un investissement unique pour des économies durables.", Icone: "trending-down", Badge: "Jusqu'à 70% d'économies", Ordre: "2" },
  { id: 3, Titre: "Zéro complexité", Description: "On s'occupe de tout, vous profitez des résultats.", Icone: "target", Badge: "Clé en main", Ordre: "3" },
  { id: 4, Titre: "Résultats immédiats", Description: "Vos processus tournent dès le premier jour.", Icone: "zap", Badge: "Opérationnel en 48h", Ordre: "4" },
];

export const DEFAULT_TRUST_POINTS: TrustPoint[] = [
  { id: 1, Titre: "100% hébergé en Suisse", Description: "Vos données ne quittent jamais le territoire suisse.", Icone: "map-pin", Badge: "Genève, CH", Ordre: "1" },
  { id: 2, Titre: "Sécurité bancaire", Description: "Chiffrement de bout en bout, sauvegardes quotidiennes.", Icone: "shield", Badge: "Certifié", Ordre: "2" },
  { id: 3, Titre: "Transparence totale", Description: "Accès complet aux logs et rapports en temps réel.", Icone: "eye", Badge: "Open Book", Ordre: "3" },
  { id: 4, Titre: "Pas de coûts cachés", Description: "Un prix fixe, tout compris.", Icone: "banknote", Badge: "Prix fixe", Ordre: "4" },
];

export async function getAdvantages(): Promise<Advantage[]> {
  const rows = await fetchBaserow<Advantage>(TABLE_IDS.ADVANTAGES, { orderBy: 'Ordre' });
  return rows && rows.length > 0 ? rows : DEFAULT_ADVANTAGES;
}

export async function getTrustPoints(): Promise<TrustPoint[]> {
  const rows = await fetchBaserow<TrustPoint>(TABLE_IDS.TRUST_POINTS, { orderBy: 'Ordre' });
  return rows && rows.length > 0 ? rows : DEFAULT_TRUST_POINTS;
}

interface BaserowGalleryRow {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
  Ordre: string | null;
  'Type Affichage'?: BaserowSelectOption | null;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const rows = await fetchBaserow<BaserowGalleryRow>(TABLE_IDS.GALLERY, { orderBy: 'Ordre' });
  if (!rows) return [];
  return rows.filter(r => r.Image?.length > 0).map(r => ({
    id: r.id,
    Titre: r.Titre,
    Image: r.Image,
    Ordre: r.Ordre,
    TypeAffichage: r['Type Affichage']?.value || null,
  }));
}
