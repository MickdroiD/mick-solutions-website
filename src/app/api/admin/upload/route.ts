// ============================================
// API UPLOAD - White Label Factory 2025
// ============================================
// Endpoint pour uploader des images (logo, favicon, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Dossier de destination des uploads
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Types de fichiers autorisés
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];

// Taille max : 10MB
const MAX_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/admin/upload
 * Upload une image et retourne son URL
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez: PNG, JPG, SVG, WebP ou GIF' },
        { status: 400 }
      );
    }

    // Vérifier la taille
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 10MB.' },
        { status: 400 }
      );
    }

    // Créer le dossier si nécessaire
    const categoryDir = path.join(UPLOAD_DIR, category);
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = path.extname(originalName) || getExtensionFromType(file.type);
    const baseName = path.basename(originalName, extension);
    const fileName = `${baseName}_${timestamp}${extension}`;
    const filePath = path.join(categoryDir, fileName);

    // Convertir le fichier en buffer et écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL relative pour le site
    const publicUrl = `/uploads/${category}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/upload
 * Liste les fichiers uploadés (optionnel, pour une future galerie)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    
    const categoryDir = path.join(UPLOAD_DIR, category);
    
    if (!existsSync(categoryDir)) {
      return NextResponse.json({ files: [] });
    }

    const { readdir, stat } = await import('fs/promises');
    const files = await readdir(categoryDir);
    
    const fileInfos = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(categoryDir, fileName);
        const stats = await stat(filePath);
        return {
          name: fileName,
          url: `/uploads/${category}/${fileName}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
    );

    // Trier par date (plus récent en premier)
    fileInfos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ files: fileInfos });

  } catch (error) {
    console.error('List uploads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la lecture des fichiers' },
      { status: 500 }
    );
  }
}

function getExtensionFromType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/svg+xml': '.svg',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mimeType] || '.png';
}

