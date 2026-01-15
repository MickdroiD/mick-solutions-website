// ============================================
// ASSET UPLOAD API - Factory V5
// POST /api/assets/upload
// Secured with session validation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import prisma from '@/shared/lib/db';

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'factory-v5-secret-dev';

import { getTenantId as resolveTenantId } from '@/shared/lib/tenant';

// Helper to verify auth (Custom V5 Auth)
async function verifyAuth(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        return true;
    } catch (e) {
        return false;
    }
}

// Générer un nom de fichier unique
function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext)
        .replace(/[^a-zA-Z0-9]/g, '-')
        .substring(0, 50);
    return `${baseName}-${timestamp}-${random}${ext}`;
}

// ...

export async function POST(request: NextRequest) {
    try {
        // SECURITY: Validate session first
        const isAuth = await verifyAuth();
        if (!isAuth) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Resolve tenant dynamically
        const tenantId = await resolveTenantId();


        // Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File;

        // Validation
        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier' },
                { status: 400 }
            );
        }

        // Vérifier le type de fichier
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Type interdit' },
                { status: 400 }
            );
        }

        // Vérifier la taille
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Trop gros' },
                { status: 400 }
            );
        }

        // Créer le dossier tenant si nécessaire
        const tenantDir = path.join(UPLOAD_DIR, tenantId);
        if (!existsSync(tenantDir)) {
            await mkdir(tenantDir, { recursive: true });
        }

        // Générer nom et sauvegarder
        const fileName = generateFileName(file.name);
        const filePath = path.join(tenantDir, fileName);

        // Convertir File en Buffer et écrire
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // URL publique
        const publicUrl = `/uploads/${tenantId}/${fileName}`;

        // Enregistrer en base de données
        const asset = await prisma.asset.create({
            data: {
                tenantId,
                filename: fileName,
                mimeType: file.type,
                size: file.size,
                url: publicUrl,
                altText: file.name, // Utiliser le nom original comme alt text par défaut
            },
        });

        return NextResponse.json({
            success: true,
            asset: {
                id: asset.id,
                url: publicUrl,
                filename: fileName,
                mimeType: file.type,
                size: file.size,
            },
        });

    } catch (error) {
        console.error('Erreur upload:', error);
        return NextResponse.json(
            { error: 'Erreur upload' },
            { status: 500 }
        );
    }
}

// GET - Lister les assets d'un tenant (secured)
export async function GET(request: NextRequest) {
    try {
        // SECURITY: Validate session
        const isAuth = await verifyAuth();
        if (!isAuth) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const tenantId = await resolveTenantId();

        const assets = await prisma.asset.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error('Erreur liste assets:', error);
        return NextResponse.json(
            { error: 'Erreur fetch assets' },
            { status: 500 }
        );
    }
}
