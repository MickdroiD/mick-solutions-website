import type { Metadata } from "next";
import "./globals.css";
import { getGlobalSettingsComplete } from "@/lib/baserow";
import { ThemeProvider } from "@/components/ThemeProvider";

// ============================================
// GÉNÉRATION DYNAMIQUE DES MÉTADONNÉES (SEO)
// ============================================
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettingsComplete();
  
  const keywords = settings.motsCles
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

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
      images: settings.ogImageUrl
        ? [{ url: settings.ogImageUrl, width: 1200, height: 630, alt: settings.nomSite }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: settings.nomSite }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.nomSite} | ${settings.metaTitre}`,
      description: settings.metaDescription,
      images: settings.ogImageUrl ? [settings.ogImageUrl] : ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: settings.faviconUrl
        ? [{ url: settings.faviconUrl }]
        : [
            { url: "/favicon.ico", sizes: "48x48" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
            { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
            { url: "/favicon-144x144.png", sizes: "144x144", type: "image/png" },
            { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
            { url: "/icon.svg", type: "image/svg+xml" },
          ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: settings.faviconUrl || "/favicon.ico",
    },
    manifest: "/manifest.json",
    alternates: {
      canonical: settings.siteUrl,
    },
  };
}

// ============================================
// LAYOUT PRINCIPAL
// ============================================
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Récupérer les settings pour le JSON-LD et les styles
  const settings = await getGlobalSettingsComplete();

  // Schema.org JSON-LD pour l'organisation
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.nomSite,
    url: settings.siteUrl,
    logo: settings.logoUrl.startsWith('http') 
      ? settings.logoUrl 
      : `${settings.siteUrl}${settings.logoUrl}`,
    image: settings.ogImageUrl || `${settings.siteUrl}/og-image.png`,
    description: settings.metaDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.adresse.split(',')[0]?.trim() || settings.adresse,
      addressCountry: "CH",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: settings.email,
      contactType: "customer service",
      availableLanguage: ["French", "English"],
    },
    sameAs: settings.lienLinkedin ? [settings.lienLinkedin] : [],
    areaServed: {
      "@type": "Country",
      name: "Switzerland",
    },
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

  // Schema.org LocalBusiness pour le SEO local
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.nomSite,
    image: settings.logoUrl.startsWith('http')
      ? settings.logoUrl
      : `${settings.siteUrl}${settings.logoUrl}`,
    url: settings.siteUrl,
    email: settings.email,
    telephone: settings.telephone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.adresse.split(',')[0]?.trim() || settings.adresse,
      addressRegion: settings.adresse.split(',')[0]?.trim() === 'Genève' ? 'GE' : undefined,
      addressCountry: "CH",
    },
    priceRange: "$$",
  };

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
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        
        {/* Preconnect pour les fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
