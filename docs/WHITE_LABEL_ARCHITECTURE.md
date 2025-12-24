# 🏭 WHITE LABEL FACTORY - Architecture 2025

## Vue d'ensemble

Le site est entièrement configurable via **Baserow** avec **140 champs** organisés en 16 catégories.

---

## 📊 Structure Baserow (Table 751: SITEWEB Global_Infos)

### A. Identité du Site
- `Nom Site`, `Slogan`, `Initiales Logo`

### B. Assets Visuels
- `Logo URL`, `Logo Dark URL`, `Favicon URL`, `OG Image URL`
- `Hero_Background_URL`, `Hero_Video_URL`

### C. SEO & Métadonnées
- `Meta Titre`, `Meta Description`, `Site URL`, `Mots Cles`
- `Langue`, `Locale`, `Robots_Index`, `Sitemap_Priority`

### D. Branding / Couleurs
- `Couleur Primaire`, `Couleur Accent`, `Couleur_Background`, `Couleur_Text`
- `Font_Primary`, `Font_Heading`, `Font_Custom_URL`
- `Border_Radius`, `Pattern_Background`

### E. Contact & Social
- `Email`, `Telephone`, `Adresse`, `Adresse_Courte`
- `Lien Linkedin`, `Lien_Instagram`, `Lien_Twitter`, `Lien_Youtube`
- `Lien_Github`, `Lien_Calendly`, `Lien_Whatsapp`

### F. Section Hero
- `Titre Hero`, `Sous-titre Hero`, `Badge Hero`
- `CTA Principal`, `CTA_Principal_URL`, `CTA Secondaire`, `CTA_Secondaire_URL`
- `Hero_AI_Prompt`

### G. Trust Stats
- `Trust Stat 1-3 Value/Label`

### H. Footer
- `Copyright Texte`, `Pays Hebergement`, `Show_Legal_Links`
- `Custom_Footer_Text`, `Footer_CTA_Text`, `Footer_CTA_URL`

### I. Analytics
- `Umami_Site_ID`, `Umami_Script_URL`
- `GA_Measurement_ID`, `GTM_Container_ID`
- `Hotjar_Site_ID`, `Facebook_Pixel_ID`

---

## 🎛️ Modules - Activation (14 booléens)

| Champ | Description |
|-------|-------------|
| `Show_Navbar` | Barre de navigation |
| `Show_Hero` | Section principale |
| `Show_Advantages` | Avantages |
| `Show_Services` | Services |
| `Show_Gallery` | Galerie photos |
| `Show_Portfolio` | Projets/Portfolio |
| `Show_Testimonials` | Témoignages |
| `Show_Trust` | Points de confiance |
| `Show_FAQ` | Questions fréquentes |
| `Show_Blog` | Blog (à venir) |
| `Show_Contact` | Formulaire contact |
| `Show_AI_Assistant` | Chatbot IA |
| `Show_Cookie_Banner` | Banner cookies |
| `Show_Analytics` | Tracking |

---

## 🎨 Modules - Variantes (10 selects)

Chaque module a **4 styles + option IA** :

| Module | Options |
|--------|---------|
| `Theme_Global` | Minimal, Corporate, Electric, Bold, Custom |
| `Hero_Variant` | Minimal, Corporate, Electric, Bold, AI |
| `Navbar_Variant` | Minimal, Corporate, Electric, Bold |
| `Services_Variant` | Grid, Accordion, Cards, Showcase |
| `Gallery_Variant` | Grid, Slider, Masonry, AI |
| `Testimonials_Variant` | Minimal, Carousel, Cards, Video |
| `FAQ_Variant` | Minimal, Accordion, Tabs, Search |
| `Contact_Variant` | Minimal, Form, Calendar, Chat |
| `Footer_Variant` | Minimal, Corporate, Electric, Bold |
| `AI_Assistant_Style` | Chat, Voice, Banner, Hidden |

---

## 📐 Tailles & Dimensions

| Champ | Options |
|-------|---------|
| `Logo_Size` | Small, Medium, Large, XLarge |
| `Hero_Height` | Short, Medium, Tall, FullScreen |
| `Section_Spacing` | Compact, Normal, Spacious, Ultra |
| `Card_Style` | Flat, Shadow, Border, Glassmorphism |

---

## ✨ Animations & Effets

| Champ | Options |
|-------|---------|
| `Enable_Animations` | Boolean |
| `Animation_Speed` | Slow, Normal, Fast, Instant |
| `Scroll_Effect` | None, Fade, Slide, Zoom, Parallax |
| `Hover_Effect` | None, Scale, Glow, Lift, Shake |
| `Loading_Style` | None, Skeleton, Spinner, Progress |

---

## 📸 Photos & Médias

| Champ | Options |
|-------|---------|
| `Image_Style` | Square, Rounded, Circle, Custom |
| `Image_Filter` | None, Grayscale, Sepia, Contrast, Blur |
| `Gallery_Columns` | 2, 3, 4, Auto |
| `Video_Autoplay` | Boolean |
| `Lazy_Loading` | Boolean |

---

## 🤖 Module IA

### Configuration de base
- `AI_Mode`: Disabled, Placeholder, Live
- `AI_Provider`: OpenAI, Anthropic, n8n, Custom
- `AI_API_Key`, `AI_Model` (gpt-4o par défaut)
- `AI_System_Prompt`, `AI_Webhook_URL`, `AI_Image_Webhook`
- `AI_Max_Tokens`, `AI_Temperature`

### Chatbot
- `Chatbot_Welcome_Message`, `Chatbot_Placeholder`, `Chatbot_Avatar_URL`
- `Voice_Enabled`, `Voice_Language`

### Génération automatique
- `AI_Generate_Hero`, `AI_Generate_Services`, `AI_Generate_FAQ`
- `AI_Tone`: Professional, Friendly, Casual, Formal
- `AI_Industry`: Tech, Finance, Health, Retail, Services, Other
- `AI_Target_Audience`, `AI_Keywords`, `AI_Last_Generation`

---

## 🔌 Intégrations Externes

| Champ | Usage |
|-------|-------|
| `N8N_Webhook_Contact` | Formulaire contact → n8n |
| `N8N_Webhook_Newsletter` | Newsletter → n8n |
| `Stripe_Public_Key` | Paiements |
| `Mailchimp_List_ID` | Email marketing |
| `Sendgrid_API_Key` | Envoi d'emails |
| `Notion_Database_ID` | CMS externe |
| `Airtable_Base_ID` | CMS externe |

---

## ⭐ Section Premium

| Champ | Description |
|-------|-------------|
| `Is_Premium` | Client premium |
| `Premium_Until` | Date d'expiration |
| `Custom_Domain` | Domaine personnalisé |
| `Custom_CSS` | CSS personnalisé |
| `Custom_JS` | JavaScript personnalisé |
| `Feature_Flags` | Blog, Shop, Booking, Chat, Multi-lang, API, Analytics |
| `Rate_Limit_API` | Limite requêtes/jour |

---

## 🚀 Utilisation dans le code

```tsx
// page.tsx
const config = await getGlobalSettingsComplete();

// Rendu conditionnel
{config.showHero && <Hero variant={config.heroVariant} />}
{config.showServices && <Services variant={config.servicesVariant} />}
{config.showAiAssistant && <AIChatbot style={config.aiAssistantStyle} />}
```

---

## 📁 Structure des fichiers

```
src/
├── lib/
│   ├── baserow.ts              # Client API (140 champs)
│   └── types/
│       └── global-settings.ts  # Types TypeScript
├── components/
│   ├── modules/                # Architecture modulaire (à venir)
│   │   ├── Hero/
│   │   ├── Services/
│   │   └── ...
│   └── ...
```

---

## ✅ Checklist nouveau client

1. [ ] Dupliquer la database Baserow (52 → nouveau ID)
2. [ ] Configurer `NEXT_PUBLIC_BASEROW_DATABASE_ID`
3. [ ] Remplir les champs d'identité
4. [ ] Choisir les variantes de style
5. [ ] Activer/désactiver les modules
6. [ ] Configurer les intégrations (n8n, analytics)
7. [ ] Deploy !

