// ============================================
// API Route: /api/admin/sync-files
// ============================================
// Synchronise les fichiers du dossier public/uploads avec la base de données
// Scanner récursivement et ajouter les fichiers manquants
// 🔐 SÉCURISÉ: Nécessite une session admin valide

import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/admin-session';
import { BASEROW_API_URL, BASEROW_TOKEN } from '@/lib/config';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const BASEROW_BASE_URL = `${BASEROW_API_URL}/database/rows/table`;

// Table ID pour la galerie (où on stocke les médias)
const GALLERY_TABLE_ID = 781;
// Table ID pour la média library globale
const MEDIA_LIBRARY_TABLE_ID = 805;

// Extensions supportées
const SUPPORTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', 
  '.heic', '.heif', '.avif', '.bmp', '.ico'
];

// Assets root à synchroniser spécifiquement
// NOTE: Les logos/favicons sont maintenant gérés dynamiquement via Baserow (White Label)
const ROOT_ASSETS: string[] = [];

interface FileInfo {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  extension: string;
  category: string;
}

interface GalleryRow {
  id: number;
  Titre: string;
  Image: { url: string; name: string }[];
}

/**
 * Scanner récursivement un dossier
 */
async function scanDirectory(dir: string, baseDir: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Récursion dans les sous-dossiers
        const subFiles = await scanDirectory(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath);
          const category = path.dirname(relativePath);
          const stats = await stat(fullPath);
          
          files.push({
            name: entry.name,
            path: fullPath,
            relativePath: `/uploads/${relativePath.replace(/\\/g, '/')}`,
            size: stats.size,
            extension: ext,
            category: category === '.' ? 'general' : category,
          });
        }
      }
    }
  } catch (error) {
    console.error(`[Sync] Erreur lors du scan de ${dir}:`, error);
  }
  
  return files;
}

/**
 * Récupérer tous les médias existants dans Baserow
 */
async function getExistingMedia(): Promise<Set<string>> {
  if (!BASEROW_TOKEN) {
    console.error('[Sync] Token Baserow manquant');
    return new Set();
  }
  
  try {
    const response = await fetch(
      `${BASEROW_BASE_URL}/${GALLERY_TABLE_ID}/?user_field_names=true&size=200`,
      {
        headers: { 'Authorization': `Token ${BASEROW_TOKEN}` },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Baserow returned ${response.status}`);
    }
    
    const data = await response.json();
    const existingPaths = new Set<string>();
    
    // Extraire toutes les URLs d'images existantes
    for (const row of data.results as GalleryRow[]) {
      if (row.Image && Array.isArray(row.Image)) {
        for (const img of row.Image) {
          if (img.url) {
            // Normaliser le chemin pour comparaison
            const normalizedUrl = img.url.replace(/^https?:\/\/[^/]+/, '');
            existingPaths.add(normalizedUrl);
          }
        }
      }
      // Aussi vérifier le titre qui pourrait contenir le chemin
      if (row.Titre) {
        existingPaths.add(row.Titre);
      }
    }
    
    return existingPaths;
  } catch (error) {
    console.error('[Sync] Erreur récupération médias existants:', error);
    return new Set();
  }
}

/**
 * Ajouter un fichier à la table Baserow Gallery
 */
async function addFileToBaserow(file: FileInfo): Promise<boolean> {
  if (!BASEROW_TOKEN) return false;
  
  try {
    const response = await fetch(
      `${BASEROW_BASE_URL}/${GALLERY_TABLE_ID}/?user_field_names=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'Titre': file.name,
          'Ordre': '999', // Mettre à la fin
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sync] Erreur ajout ${file.name}:`, errorText);
      return false;
    }
    
    console.log(`✅ [Sync] Ajouté: ${file.name}`);
    return true;
  } catch (error) {
    console.error(`[Sync] Erreur ajout ${file.name}:`, error);
    return false;
  }
}

/**
 * Scanner les assets root (favicon, logo, etc.)
 */
async function scanRootAssets(): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  
  for (const assetName of ROOT_ASSETS) {
    try {
      const fullPath = path.join(PUBLIC_DIR, assetName);
      const stats = await stat(fullPath);
      const ext = path.extname(assetName).toLowerCase();
      
      files.push({
        name: assetName,
        path: fullPath,
        relativePath: `/${assetName}`,
        size: stats.size,
        extension: ext,
        category: 'root-assets',
      });
    } catch {
      // Fichier non trouvé, ignorer
      console.log(`[Sync] Asset root non trouvé: ${assetName}`);
    }
  }
  
  return files;
}

/**
 * Ajouter un fichier à la table MEDIA_LIBRARY (table 805)
 */
async function addFileToMediaLibrary(file: FileInfo): Promise<boolean> {
  if (!BASEROW_TOKEN) return false;
  
  try {
    const response = await fetch(
      `${BASEROW_BASE_URL}/${MEDIA_LIBRARY_TABLE_ID}/?user_field_names=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'Nom': file.name,
          'Notes': `Path: ${file.relativePath} | Category: ${file.category} | Size: ${file.size} bytes`,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sync] Erreur ajout ${file.name} à MediaLibrary:`, errorText);
      return false;
    }
    
    console.log(`✅ [Sync] Ajouté à MediaLibrary: ${file.name}`);
    return true;
  } catch (error) {
    console.error(`[Sync] Erreur ajout ${file.name}:`, error);
    return false;
  }
}

export async function POST() {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    console.log('[Sync] Démarrage de la synchronisation...');
    
    // 1. Scanner le dossier uploads
    const uploadFiles = await scanDirectory(UPLOAD_DIR, UPLOAD_DIR);
    console.log(`[Sync] ${uploadFiles.length} fichiers trouvés dans uploads/`);
    
    // 2. Scanner les assets root
    const rootAssets = await scanRootAssets();
    console.log(`[Sync] ${rootAssets.length} assets root trouvés`);
    
    // Combiner tous les fichiers
    const localFiles = [...uploadFiles, ...rootAssets];
    console.log(`[Sync] Total: ${localFiles.length} fichiers sur le VPS`);
    
    // 3. Récupérer les médias existants dans Baserow
    const existingMedia = await getExistingMedia();
    console.log(`[Sync] ${existingMedia.size} entrées existantes dans la DB`);
    
    // 4. Filtrer les fichiers non présents dans la DB
    const newFiles = localFiles.filter(file => {
      // Vérifier par chemin relatif et par nom
      const isNew = !existingMedia.has(file.relativePath) && 
                    !existingMedia.has(file.name);
      return isNew;
    });
    
    console.log(`[Sync] ${newFiles.length} nouveaux fichiers à ajouter`);
    
    // 5. Ajouter les nouveaux fichiers à Baserow
    let addedCount = 0;
    const errors: string[] = [];
    
    for (const file of newFiles) {
      // Les root assets vont dans MediaLibrary, les autres dans Gallery
      const success = file.category === 'root-assets'
        ? await addFileToMediaLibrary(file)
        : await addFileToBaserow(file);
      
      if (success) {
        addedCount++;
      } else {
        errors.push(file.name);
      }
      // Petit délai pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`[Sync] Synchronisation terminée: ${addedCount} fichiers ajoutés`);
    
    return NextResponse.json({
      success: true,
      scanned: localFiles.length,
      uploadFiles: uploadFiles.length,
      rootAssets: rootAssets.length,
      existing: existingMedia.size,
      added: addedCount,
      skipped: localFiles.length - newFiles.length,
      errors: errors.length > 0 ? errors : undefined,
      files: newFiles.map(f => ({
        name: f.name,
        path: f.relativePath,
        category: f.category,
        size: f.size,
      })),
    });
  } catch (error) {
    console.error('[Sync] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}

// GET pour voir le statut sans synchroniser
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const localFiles = await scanDirectory(UPLOAD_DIR, UPLOAD_DIR);
    const existingMedia = await getExistingMedia();
    
    const newFiles = localFiles.filter(file => {
      return !existingMedia.has(file.relativePath) && 
             !existingMedia.has(file.name);
    });
    
    return NextResponse.json({
      scanned: localFiles.length,
      existing: existingMedia.size,
      toSync: newFiles.length,
      files: localFiles.map(f => ({
        name: f.name,
        path: f.relativePath,
        category: f.category,
        isNew: !existingMedia.has(f.relativePath) && !existingMedia.has(f.name),
      })),
    });
  } catch (error) {
    console.error('[Sync] Erreur statut:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

