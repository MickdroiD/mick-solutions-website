// ============================================
// FAVICON GENERATION API - Factory V5
// Generate favicon variants from uploaded logo
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/shared/lib/db';
import path from 'path';
import fs from 'fs/promises';

// Favicon sizes to generate
const FAVICON_SIZES = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'mstile-150x150.png', size: 150 },
];

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const tenantId = (session.user as any).tenantId;
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 400 });
        }

        // Get request body
        const body = await request.json();
        const { logoUrl } = body;

        if (!logoUrl) {
            return NextResponse.json({ error: 'URL du logo requise' }, { status: 400 });
        }

        // Fetch the logo image
        let imageBuffer: Buffer;

        if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
            // External URL - fetch it
            const response = await fetch(logoUrl);
            if (!response.ok) {
                return NextResponse.json({ error: 'Impossible de télécharger le logo' }, { status: 400 });
            }
            const arrayBuffer = await response.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        } else if (logoUrl.startsWith('/api/assets/')) {
            // Internal asset - get URL from database and fetch
            const assetId = logoUrl.replace('/api/assets/', '');
            const asset = await prisma.asset.findFirst({
                where: { id: assetId, tenantId }
            });
            if (!asset || !asset.url) {
                return NextResponse.json({ error: 'Asset non trouvé' }, { status: 404 });
            }
            // Fetch from the stored URL
            const assetResponse = await fetch(asset.url);
            if (!assetResponse.ok) {
                return NextResponse.json({ error: 'Impossible de télécharger l\'asset' }, { status: 400 });
            }
            const arrayBuffer = await assetResponse.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        } else {
            return NextResponse.json({ error: 'Format d\'URL non supporté' }, { status: 400 });
        }

        // Create output directory for this tenant
        const outputDir = path.join(process.cwd(), 'public', 'favicons', tenantId);
        await fs.mkdir(outputDir, { recursive: true });

        // Generate all favicon sizes
        const generated: string[] = [];

        for (const { name, size } of FAVICON_SIZES) {
            try {
                const outputPath = path.join(outputDir, name);
                await sharp(imageBuffer)
                    .resize(size, size, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toFile(outputPath);

                generated.push(name);
            } catch (err) {
                console.error(`Failed to generate ${name}:`, err);
            }
        }

        // Generate ICO file (16x16 and 32x32 combined)
        try {
            const ico16 = await sharp(imageBuffer)
                .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toBuffer();

            const ico32 = await sharp(imageBuffer)
                .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toBuffer();

            // For simplicity, save the 32x32 as favicon.ico (browsers can handle PNG in ICO wrapper)
            await fs.writeFile(path.join(outputDir, 'favicon.ico'), ico32);
            generated.push('favicon.ico');
        } catch (err) {
            console.error('Failed to generate favicon.ico:', err);
        }

        // Generate webmanifest
        const manifest = {
            name: tenantId,
            short_name: tenantId,
            icons: [
                { src: `/favicons/${tenantId}/android-chrome-192x192.png`, sizes: '192x192', type: 'image/png' },
                { src: `/favicons/${tenantId}/android-chrome-512x512.png`, sizes: '512x512', type: 'image/png' }
            ],
            theme_color: '#22d3ee',
            background_color: '#0a0a0f',
            display: 'standalone'
        };

        await fs.writeFile(
            path.join(outputDir, 'site.webmanifest'),
            JSON.stringify(manifest, null, 2)
        );
        generated.push('site.webmanifest');

        // Return success with paths
        return NextResponse.json({
            success: true,
            message: `${generated.length} fichiers générés`,
            files: generated,
            basePath: `/favicons/${tenantId}`,
            htmlTags: generateHtmlTags(tenantId)
        });

    } catch (error) {
        console.error('Favicon generation error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la génération des favicons' },
            { status: 500 }
        );
    }
}

// Generate HTML link tags for the head
function generateHtmlTags(tenantId: string): string {
    const base = `/favicons/${tenantId}`;
    return `
<link rel="icon" type="image/x-icon" href="${base}/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="${base}/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="${base}/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${base}/apple-touch-icon.png">
<link rel="manifest" href="${base}/site.webmanifest">
<meta name="msapplication-TileImage" content="${base}/mstile-150x150.png">
<meta name="theme-color" content="#22d3ee">
`.trim();
}
