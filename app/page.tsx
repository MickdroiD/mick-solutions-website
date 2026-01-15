// ============================================
// HOME PAGE - Factory V5
// Charge la page "home" depuis la base de données
// Multi-tenant: résolution dynamique du tenant
// ============================================

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/shared/lib/db';
import SectionRenderer from '@/features/sections/SectionRenderer';
import { Header, Footer } from '@/shared/components/Layout';
import type { PrismaSection } from '@/features/sections/types';
import type { Metadata } from 'next';

// Resolve tenant from hostname
import { getTenantId } from '@/shared/lib/tenant';

// Legacy constant for backwards compatibility in metadata
const FALLBACK_TENANT_ID = 'demo-tenant';

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await getTenantId();
  const page = await prisma.page.findFirst({
    where: {
      tenantId,
      slug: 'home',
      isPublished: true,
    },
  });

  return {
    title: page?.seoTitle || page?.name || 'Factory V5',
    description: page?.seoDescription || 'Website powered by Factory V5',
  };
}

export default async function HomePage() {
  // Récupérer le tenant dynamiquement
  const tenantId = await getTenantId();

  // Récupérer la config du site pour les couleurs branding
  const siteConfig = await prisma.siteConfig.findUnique({
    where: { tenantId },
  });
  const bgColor = '#0a0a0f'; // Forced per user request (was siteConfig?.couleurBackground)
  const textColor = siteConfig?.couleurText || '#ffffff';

  // Récupérer la page "home" avec ses sections
  const page = await prisma.page.findFirst({
    where: {
      tenantId,
      slug: 'home',
      isPublished: true,
    },
    include: {
      sections: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  // Si pas de page home, afficher un message d'accueil
  if (!page) {
    return (
      <main style={{ minHeight: '100vh', background: bgColor, color: textColor }}>
        <Header tenantId={tenantId} />
        <section style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #22d3ee, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
          }}>
            Bienvenue
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.25rem' }}>
            Ce site est en cours de configuration.
          </p>
        </section>
        <Footer tenantId={tenantId} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: bgColor, color: textColor }}>
      <Header tenantId={tenantId} />
      {page.sections.length > 0 ? (
        page.sections
          .filter(s => s.type !== 'HEADER' && s.type !== 'FOOTER') // Filter out global sections to avoid duplication
          .map((section) => (
            <SectionRenderer
              key={section.id}
              section={section as PrismaSection}
            />
          ))
      ) : (
        <section style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
        }}>
          <p>Aucune section configurée.</p>
        </section>
      )}
      <Footer tenantId={tenantId} />
    </main>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
