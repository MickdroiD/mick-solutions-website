import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mick-solutions.ch'),
  title: {
    default: "Mick Solutions | Automatisation sur-mesure pour PME Suisses",
    template: "%s | Mick Solutions",
  },
  description: "Expert DevOps et Automation en Suisse. Gain de temps, Zéro dette technique et Données sécurisées en Suisse. Solutions sur-mesure pour TPE/PME et indépendants à Genève.",
  keywords: ["DevOps", "Automation", "n8n", "Suisse", "Genève", "PME", "Infrastructure", "Docker", "automatisation", "productivité"],
  authors: [{ name: "Mick Solutions" }],
  creator: "Mick Solutions",
  openGraph: {
    title: "Mick Solutions | Automatisation & Infrastructure",
    description: "Optimisez votre PME avec des solutions robustes et hébergées en Suisse. Gain de temps et données sécurisées.",
    url: "https://www.mick-solutions.ch",
    siteName: "Mick Solutions",
    locale: "fr_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mick Solutions | Automatisation & Infrastructure",
    description: "Optimisez votre PME avec des solutions robustes et hébergées en Suisse.",
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
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
