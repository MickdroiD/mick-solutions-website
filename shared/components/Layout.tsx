// ============================================
// DYNAMIC LAYOUT - Factory V5
// Header/Footer chargés depuis SECTIONS DB
// ============================================

'use client';

import { useEffect, useState } from 'react';
import SectionRenderer from '@/features/sections/SectionRenderer';
import type { PrismaSection } from '@/features/sections/types';

interface HeaderFooterSections {
    header: PrismaSection | null;
    footer: PrismaSection | null;
}

// Hook pour charger Header/Footer depuis les sections
function useGlobalSections(tenantId: string) {
    const [sections, setSections] = useState<HeaderFooterSections>({ header: null, footer: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        // Charger les sections globales de type HEADER et FOOTER
        fetch(`/api/sections/global?tenantId=${tenantId}`)
            .then(res => res.json())
            .then((data: PrismaSection[]) => {
                const header = data.find(s => s.type === 'HEADER') || null;
                const footer = data.find(s => s.type === 'FOOTER') || null;
                setSections({ header, footer });
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load global sections:', err);
                setLoading(false);
            });
    }, [tenantId]);

    return { ...sections, loading };
}

interface HeaderProps {
    tenantId?: string;
}

export function Header({ tenantId = 'demo-tenant' }: HeaderProps) {
    const { header, loading } = useGlobalSections(tenantId);

    // Loading: return empty header to avoid flash
    if (loading) {
        return null;
    }

    // Pas de header configuré: pas d'affichage (l'utilisateur doit créer une section HEADER)
    if (!header) {
        return null;
    }

    // Render la section Header personnalisée
    return (
        <header style={{ position: 'sticky', top: 0, zIndex: 50 }}>
            <SectionRenderer section={header} />
        </header>
    );
}

interface FooterProps {
    tenantId?: string;
}

export function Footer({ tenantId = 'demo-tenant' }: FooterProps) {
    const { footer, loading } = useGlobalSections(tenantId);

    // Loading: return null to avoid flash
    if (loading) {
        return null;
    }

    // Pas de footer configuré: pas d'affichage
    if (!footer) {
        return null;
    }

    // Render la section Footer personnalisée
    return <SectionRenderer section={footer} />;
}
