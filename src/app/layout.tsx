import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mick-solutions.ch'),
  title: {
    default: "Mick Solutions | Automatisation sur-mesure pour PME Suisses",
    template: "%s | Mick Solutions",
  },
  description: "Expert DevOps et Automation en Suisse. Gain de temps, Zéro dette technique et Données sécurisées en Suisse. Solutions sur-mesure pour TPE/PME et indépendants à Genève.",
  keywords: [
    "DevOps", "Automation", "n8n", "Suisse", "Genève", "PME", 
    "Infrastructure", "Docker", "automatisation", "productivité",
    "automatisation Genève", "consultant DevOps Suisse", "n8n expert",
    "automatisation PME", "gain de temps entreprise", "solutions cloud Suisse"
  ],
  authors: [{ name: "Mick Solutions", url: "https://www.mick-solutions.ch" }],
  creator: "Mick Solutions",
  publisher: "Mick Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Mick Solutions | Automatisation & DevOps pour PME Suisses",
    description: "Optimisez votre PME avec des solutions d'automatisation robustes, hébergées en Suisse. Gain de temps garanti, données 100% sécurisées à Genève.",
    url: "https://www.mick-solutions.ch",
    siteName: "Mick Solutions",
    locale: "fr_CH",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mick Solutions - Automatisation sur-mesure pour PME Suisses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mick Solutions | Automatisation & DevOps",
    description: "Optimisez votre PME avec des solutions d'automatisation robustes, hébergées en Suisse.",
    images: ["/og-image.png"],
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
    // Favicon.ico en priorité pour Google (CRITIQUE)
    icon: [
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
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://www.mick-solutions.ch",
  },
  verification: {
    // Ajoute ici tes codes de vérification si tu en as
    // google: "ton-code-google-search-console",
  },
};

// Schema.org JSON-LD pour le logo dans Google Search
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mick Solutions",
  "url": "https://www.mick-solutions.ch",
  "logo": "https://www.mick-solutions.ch/logo.svg",
  "image": "https://www.mick-solutions.ch/og-image.png",
  "description": "Expert DevOps et Automation en Suisse. Solutions sur-mesure pour PME et indépendants à Genève.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Genève",
    "addressCountry": "CH"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@mick-solutions.ch",
    "contactType": "customer service",
    "availableLanguage": ["French", "English"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/mick-solutions"
  ],
  "areaServed": {
    "@type": "Country",
    "name": "Switzerland"
  },
  "serviceType": ["DevOps", "Automation", "n8n Integration", "Cloud Infrastructure"]
};

// Schema.org pour le site web
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Mick Solutions",
  "url": "https://www.mick-solutions.ch",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.mick-solutions.ch/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// Schema.org LocalBusiness pour le SEO local Genève
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Mick Solutions",
  "image": "https://www.mick-solutions.ch/logo.svg",
  "url": "https://www.mick-solutions.ch",
  "email": "contact@mick-solutions.ch",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Genève",
    "addressRegion": "GE",
    "addressCountry": "CH"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 46.2044,
    "longitude": 6.1432
  },
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Umami Analytics - GDPR/nLPD compliant */}
        <script
          defer
          src="https://umami.mick-solutions.ch/script.js"
          data-website-id="35753aec-b7a1-485d-a978-a066e64c1e0e"
        />
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
