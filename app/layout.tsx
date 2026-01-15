import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/shared/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// import type { Metadata } from 'next'; // Already imported at top
import { getTenantId } from '@/shared/lib/tenant';
import prisma from '@/shared/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await getTenantId();
  const config = await prisma.siteConfig.findUnique({
    where: { tenantId },
    select: {
      faviconUrl: true,
      nomSite: true,
      metaDescription: true
    },
  });

  return {
    title: {
      template: `%s | ${config?.nomSite || 'Factory V5'}`,
      default: config?.nomSite || 'Factory V5',
    },
    description: config?.metaDescription || "Plateforme Web",
    icons: {
      icon: config?.faviconUrl || '/favicon.ico',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

