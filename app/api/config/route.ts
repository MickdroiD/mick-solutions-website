// ============================================
// SITE CONFIG API - Factory V5
// GET/PATCH /api/config
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/shared/lib/db';

// GET - Récupérer la config d'un tenant
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId requis' },
                { status: 400 }
            );
        }

        // Chercher la config existante ou en créer une par défaut
        let config = await prisma.siteConfig.findUnique({
            where: { tenantId },
        });

        if (!config) {
            // Créer une config par défaut
            config = await prisma.siteConfig.create({
                data: {
                    tenantId,
                    nomSite: 'Mon Site',
                },
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Erreur GET config:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de la config' },
            { status: 500 }
        );
    }
}

// PATCH - Modifier la config
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const body = await request.json();

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId requis' },
                { status: 400 }
            );
        }

        // Vérifier que la config existe
        const existing = await prisma.siteConfig.findUnique({
            where: { tenantId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Config non trouvée' },
                { status: 404 }
            );
        }

        // Mise à jour partielle
        const updated = await prisma.siteConfig.update({
            where: { tenantId },
            data: {
                // Identity
                nomSite: body.nomSite ?? undefined,
                slogan: body.slogan ?? undefined,
                initialesLogo: body.initialesLogo ?? undefined,

                // Branding
                theme: body.theme ?? undefined,
                couleurPrimaire: body.couleurPrimaire ?? undefined,
                couleurAccent: body.couleurAccent ?? undefined,
                couleurBackground: body.couleurBackground ?? undefined,
                couleurText: body.couleurText ?? undefined,
                fontPrimary: body.fontPrimary ?? undefined,
                fontHeading: body.fontHeading ?? undefined,
                borderRadius: body.borderRadius ?? undefined,
                patternBackground: body.patternBackground ?? undefined,

                // SEO
                metaTitre: body.metaTitre ?? undefined,
                metaDescription: body.metaDescription ?? undefined,
                siteUrl: body.siteUrl ?? undefined,
                motsCles: body.motsCles ?? undefined,
                langue: body.langue ?? undefined,
                robotsIndex: body.robotsIndex ?? undefined,

                // Contact
                email: body.email ?? undefined,
                telephone: body.telephone ?? undefined,
                adresse: body.adresse ?? undefined,
                adresseCourte: body.adresseCourte ?? undefined,
                lienLinkedin: body.lienLinkedin ?? undefined,
                lienInstagram: body.lienInstagram ?? undefined,
                lienTwitter: body.lienTwitter ?? undefined,
                lienYoutube: body.lienYoutube ?? undefined,
                lienGithub: body.lienGithub ?? undefined,
                lienCalendly: body.lienCalendly ?? undefined,
                lienWhatsapp: body.lienWhatsapp ?? undefined,

                // Assets
                logoUrl: body.logoUrl ?? undefined,
                logoDarkUrl: body.logoDarkUrl ?? undefined,
                faviconUrl: body.faviconUrl ?? undefined,
                ogImageUrl: body.ogImageUrl ?? undefined,

                // Header
                stickyHeader: body.stickyHeader ?? undefined,
                headerLogoUrl: body.headerLogoUrl ?? undefined,
                headerLogoSize: body.headerLogoSize ?? undefined,
                headerLogoAnimation: body.headerLogoAnimation ?? undefined,
                headerBgColor: body.headerBgColor ?? undefined,
                headerTextColor: body.headerTextColor ?? undefined,
                headerSiteTitle: body.headerSiteTitle ?? undefined,
                headerMenuLinks: body.headerMenuLinks ?? undefined,
                headerCtaText: body.headerCtaText ?? undefined,
                headerCtaUrl: body.headerCtaUrl ?? undefined,
                showHeaderCta: body.showHeaderCta ?? undefined,
                showTopBar: body.showTopBar ?? undefined,

                // Footer
                footerVariant: body.footerVariant ?? undefined,
                copyrightTexte: body.copyrightTexte ?? undefined,
                showLegalLinks: body.showLegalLinks ?? undefined,
                customFooterText: body.customFooterText ?? undefined,
                footerContactTitle: body.footerContactTitle ?? undefined,
                footerNavigationTitle: body.footerNavigationTitle ?? undefined,
                footerCtaText: body.footerCtaText ?? undefined,
                footerCtaUrl: body.footerCtaUrl ?? undefined,
                footerBgColor: body.footerBgColor ?? undefined,
                footerTextColor: body.footerTextColor ?? undefined,
                showFooterPoweredBy: body.showFooterPoweredBy ?? undefined,

                // Animations
                enableAnimations: body.enableAnimations ?? undefined,
                animationStyle: body.animationStyle ?? undefined,
                animationSpeed: body.animationSpeed ?? undefined,
                scrollEffect: body.scrollEffect ?? undefined,
                hoverEffect: body.hoverEffect ?? undefined,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erreur PATCH config:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour de la config' },
            { status: 500 }
        );
    }
}
