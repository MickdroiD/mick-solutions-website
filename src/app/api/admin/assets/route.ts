// ============================================
// API Route: /api/admin/assets
// ============================================
// Liste et gère les assets uploadés
// 🔐 SÉCURISÉ: Nécessite une session admin valide

import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/admin-session';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

interface AssetItem {
  id: string;
  name: string;
  url: string;
  path: string;
  category: string;
  size: number;
  type: string;
  createdAt: string;
  thumbnail: string;
}

// ============================================
// GET - Liste tous les assets
// ============================================

export async function GET(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category'); // Filter by category
    const search = searchParams.get('search'); // Search term
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const assets: AssetItem[] = [];

    // Lire les catégories (sous-dossiers)
    let categories: string[];
    
    try {
      const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
      categories = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch {
      // Le dossier uploads n'existe peut-être pas encore
      return NextResponse.json({
        success: true,
        assets: [],
        total: 0,
        categories: [],
      });
    }

    // Si une catégorie est spécifiée, ne lire que celle-ci
    const categoriesToScan = category 
      ? categories.filter(c => c === category)
      : categories;

    // Scanner chaque catégorie
    for (const cat of categoriesToScan) {
      const categoryPath = path.join(UPLOAD_DIR, cat);
      
      try {
        const files = await readdir(categoryPath);
        
        for (const file of files) {
          // Ignorer les fichiers cachés
          if (file.startsWith('.')) continue;
          
          // Filtrer par recherche si spécifié
          if (search && !file.toLowerCase().includes(search.toLowerCase())) {
            continue;
          }

          const filePath = path.join(categoryPath, file);
          const fileStat = await stat(filePath);
          
          // Ignorer les dossiers
          if (fileStat.isDirectory()) continue;

          // Déterminer le type MIME
          const ext = path.extname(file).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.avif': 'image/avif',
            '.heic': 'image/heic',
          };
          
          const type = mimeTypes[ext] || 'application/octet-stream';
          
          // Ne garder que les images
          if (!type.startsWith('image/')) continue;

          const url = `/uploads/${cat}/${file}`;

          assets.push({
            id: `${cat}/${file}`,
            name: file,
            url,
            path: filePath,
            category: cat,
            size: fileStat.size,
            type,
            createdAt: fileStat.birthtime.toISOString(),
            thumbnail: url, // Pour les images, le thumbnail est l'image elle-même
          });
        }
      } catch (error) {
        console.warn(`[Assets] Could not read category ${cat}:`, error);
      }
    }

    // Trier par date de création (plus récent en premier)
    assets.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Appliquer pagination
    const total = assets.length;
    const paginatedAssets = assets.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      assets: paginatedAssets,
      total,
      categories,
      hasMore: offset + limit < total,
    });

  } catch (error) {
    console.error('[Assets] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la lecture des assets' }, { status: 500 });
  }
}

// ============================================
// DELETE - Supprimer un asset
// ============================================

export async function DELETE(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const { assetId } = await request.json();
    
    if (!assetId || typeof assetId !== 'string') {
      return NextResponse.json({ error: 'ID d\'asset invalide' }, { status: 400 });
    }

    // Sécurité: vérifier que le chemin est bien dans UPLOAD_DIR
    const assetPath = path.join(UPLOAD_DIR, assetId);
    const resolvedPath = path.resolve(assetPath);
    
    if (!resolvedPath.startsWith(path.resolve(UPLOAD_DIR))) {
      return NextResponse.json({ error: 'Chemin non autorisé' }, { status: 403 });
    }

    // Supprimer le fichier
    await unlink(resolvedPath);

    console.log(`[Assets] Deleted: ${assetId}`);

    return NextResponse.json({
      success: true,
      message: 'Asset supprimé',
    });

  } catch (error) {
    console.error('[Assets] Delete error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

