import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getGlobalSettingsComplete } from "@/lib/baserow";
import { ThemeProvider } from "@/components/ThemeProvider";
import MaintenanceGuard from "@/components/MaintenanceGuard";

// Force le rendu dynamique (SSR) pour le mode multi-tenant
export const dynamic = 'force-dynamic';

// 🎯 VIEWPORT - Critical pour l'affichage mobile correct
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Empêche le zoom accidentel sur mobile
  themeColor: '#0a0a0a',
};

// ============================================
// GÉNÉRATION DYNAMIQUE DES MÉTADONNÉES (SEO)
// White Label - Toutes les données depuis Baserow
// ============================================
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettingsComplete();
  
  const keywords = settings.motsCles
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  // Favicon dynamique depuis Baserow (ou génération via API route)
  const faviconUrl = settings.faviconUrl || settings.logoUrl || null;
  
  return {
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: `${settings.nomSite} | ${settings.metaTitre}`,
      template: `%s | ${settings.nomSite}`,
    },
    description: settings.metaDescription,
    keywords,
    authors: [{ name: settings.nomSite, url: settings.siteUrl }],
    creator: settings.nomSite,
    publisher: settings.nomSite,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: `${settings.nomSite} | ${settings.metaTitre}`,
      description: settings.metaDescription,
      url: settings.siteUrl,
      siteName: settings.nomSite,
      locale: settings.locale,
      type: "website",
      // L'image OG sera générée dynamiquement par opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.nomSite} | ${settings.metaTitre}`,
      description: settings.metaDescription,
      // L'image Twitter sera générée dynamiquement par twitter-image.tsx
    },
    robots: {
      index: settings.robotsIndex,
      follow: settings.robotsIndex,
      googleBot: {
        index: settings.robotsIndex,
        follow: settings.robotsIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // Icons dynamiques depuis Baserow
    icons: faviconUrl ? {
      icon: [{ url: faviconUrl }],
      apple: [{ url: faviconUrl }],
      shortcut: faviconUrl,
    } : undefined,
    // Manifest dynamique via API route
    manifest: "/api/manifest",
    alternates: {
      canonical: settings.siteUrl,
    },
  };
}

// ============================================
// LAYOUT PRINCIPAL - WHITE LABEL
// ============================================
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getGlobalSettingsComplete();

  // Schema.org JSON-LD dynamique pour l'organisation
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.nomSite,
    url: settings.siteUrl,
    logo: settings.logoUrl?.startsWith('http') 
      ? settings.logoUrl 
      : settings.logoUrl 
        ? `${settings.siteUrl}${settings.logoUrl}`
        : undefined,
    image: settings.ogImageUrl || undefined,
    description: settings.metaDescription,
    address: settings.adresse ? {
      "@type": "PostalAddress",
      addressLocality: settings.adresse.split(',')[0]?.trim() || settings.adresse,
      addressCountry: "CH",
    } : undefined,
    contactPoint: settings.email ? {
      "@type": "ContactPoint",
      email: settings.email,
      contactType: "customer service",
      availableLanguage: ["French", "English"],
    } : undefined,
    sameAs: [
      settings.lienLinkedin,
      settings.lienInstagram,
      settings.lienTwitter,
      settings.lienYoutube,
      settings.lienGithub,
    ].filter(Boolean),
  };

  // Schema.org pour le site web
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.nomSite,
    url: settings.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${settings.siteUrl}/?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  // Schema.org LocalBusiness (optionnel si adresse présente)
  const localBusinessJsonLd = settings.adresse ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.nomSite,
    image: settings.logoUrl?.startsWith('http')
      ? settings.logoUrl
      : settings.logoUrl
        ? `${settings.siteUrl}${settings.logoUrl}`
        : undefined,
    url: settings.siteUrl,
    email: settings.email || undefined,
    telephone: settings.telephone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.adresse.split(',')[0]?.trim() || settings.adresse,
      addressCountry: "CH",
    },
    priceRange: "$$",
  } : null;

  return (
    <html lang={settings.langue} className="scroll-smooth">
      <head>
        {/* Theme Engine - Injection des CSS variables dynamiques */}
        <ThemeProvider settings={settings} />
        
        {/* Analytics Umami (si configuré) */}
        {settings.umamiScriptUrl && settings.umamiSiteId && (
          <script
            defer
            src={settings.umamiScriptUrl}
            data-website-id={settings.umamiSiteId}
          />
        )}
        
        {/* Google Analytics (si configuré) */}
        {settings.gaMeasurementId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaMeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.gaMeasurementId}');
                `,
              }}
            />
          </>
        )}
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {localBusinessJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
          />
        )}
        
        {/* Preconnect pour les fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <MaintenanceGuard config={settings}>
          {children}
        </MaintenanceGuard>
      </body>
    </html>
  );
}
