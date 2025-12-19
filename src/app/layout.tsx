import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mick Solutions | Automatisation sur-mesure pour PME Suisses",
  description: "Gagnez du temps et économisez de l'argent avec l'automatisation sur-mesure. Solutions sécurisées à Genève pour PME et indépendants suisses.",
  keywords: ["automatisation", "PME", "Suisse", "Genève", "productivité", "efficacité"],
  authors: [{ name: "Mick Solutions" }],
  openGraph: {
    title: "Mick Solutions | Automatisation sur-mesure pour PME Suisses",
    description: "Gagnez du temps et économisez de l'argent avec l'automatisation sur-mesure.",
    type: "website",
    locale: "fr_CH",
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
