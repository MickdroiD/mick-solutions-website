// ============================================
// API Route: /api/admin/upload
// ============================================
// Upload et conversion d'images avec MAGIC UPLOAD
// 🔐 SÉCURISÉ: Nécessite une session admin valide
// ✨ MAGIC: Logo principal → génère auto Favicon + OG Image

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { getAdminSession } from '@/lib/admin-session';
import { uploadFileToBaserow } from '@/lib/baserow-upload';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Couleur de fond par défaut pour l'OG Image
const OG_BACKGROUND_COLOR = { r: 15, g: 15, b: 20, alpha: 1 }; // #0f0f14

interface MagicUploadResult {
  success: true;
  isMagicUpload: true;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  message: string;
}

interface StandardUploadResult {
  success: true;
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  converted: boolean;
}

export async function POST(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'general';
    const fieldKey = (formData.get('fieldKey') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(svg|heic|avif|bmp|ico)$/i)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Formats acceptés: PNG, JPG, SVG, WebP, GIF, HEIC, AVIF, BMP, ICO' },
        { status: 400 }
      );
    }

    // Vérifier la taille
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10MB)' },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✨ MAGIC UPLOAD: Si c'est un logo principal, générer favicon + OG
    if (category === 'logos' && fieldKey === 'logoUrl') {
      return await handleMagicUpload(buffer, file.name, file.type);
    }

    // Upload standard
    return await handleStandardUpload(buffer, file.name, file.type, category);

  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}

// ============================================
// MAGIC UPLOAD - Logo → Favicon + OG Image
// ============================================

async function handleMagicUpload(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<NextResponse<MagicUploadResult | { error: string }>> {
  console.log('✨ [Magic Upload] Processing logo:', originalName);

  const timestamp = Date.now();
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const isSvg = mimeType === 'image/svg+xml' || originalName.toLowerCase().endsWith('.svg');

  let logoBuffer = buffer;
  let logoUrl = '';
  let faviconUrl = '';
  let ogImageUrl = '';

  try {
    // 1. Préparer le logo (convertir en WebP si ce n'est pas SVG)
    let logoFileName = `${baseName}_logo_${timestamp}`;
    
    if (!isSvg) {
      try {
        logoBuffer = await sharp(buffer)
          .webp({ quality: 90 })
          .toBuffer();
        logoFileName += '.webp';
      } catch {
        // Garder le format original si conversion échoue
        logoFileName += path.extname(originalName).toLowerCase();
        logoBuffer = buffer;
      }
    } else {
      logoFileName += '.svg';
    }

    // 2. Upload du logo principal vers Baserow
    console.log('📤 [Magic Upload] Uploading logo to Baserow...');
    logoUrl = await uploadFileToBaserow(logoBuffer, logoFileName);
    console.log('✅ [Magic Upload] Logo uploaded:', logoUrl);

  } catch (error) {
    console.error('❌ [Magic Upload] Logo upload failed:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload du logo' }, { status: 500 });
  }

  // 3. Générer le Favicon (32x32 PNG)
  try {
    console.log('🎨 [Magic Upload] Generating favicon...');
    
    let faviconBuffer: Buffer;
    
    if (isSvg) {
      // Pour SVG, on le convertit en PNG via sharp
      faviconBuffer = await sharp(buffer)
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    } else {
      faviconBuffer = await sharp(buffer)
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    }

    const faviconFileName = `${baseName}_favicon_${timestamp}.png`;
    faviconUrl = await uploadFileToBaserow(faviconBuffer, faviconFileName);
    console.log('✅ [Magic Upload] Favicon generated:', faviconUrl);

  } catch (error) {
    console.warn('⚠️ [Magic Upload] Favicon generation failed (non-blocking):', error);
    // Non-bloquant: on continue sans favicon
  }

  // 4. Générer l'OG Image (1200x630)
  try {
    console.log('🎨 [Magic Upload] Generating OG image...');

    // Créer le fond
    const ogWidth = 1200;
    const ogHeight = 630;
    const logoSize = 300; // Taille du logo au centre

    // Redimensionner le logo pour l'OG
    let resizedLogo: Buffer;
    
    if (isSvg) {
      resizedLogo = await sharp(buffer)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    } else {
      resizedLogo = await sharp(buffer)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    }

    // Créer l'image OG avec le logo centré
    const ogBuffer = await sharp({
      create: {
        width: ogWidth,
        height: ogHeight,
        channels: 4,
        background: OG_BACKGROUND_COLOR,
      }
    })
      .composite([
        {
          input: resizedLogo,
          gravity: 'center',
        }
      ])
      .png()
      .toBuffer();

    const ogFileName = `${baseName}_og_${timestamp}.png`;
    ogImageUrl = await uploadFileToBaserow(ogBuffer, ogFileName);
    console.log('✅ [Magic Upload] OG image generated:', ogImageUrl);

  } catch (error) {
    console.warn('⚠️ [Magic Upload] OG image generation failed (non-blocking):', error);
    // Non-bloquant: on continue sans OG
  }

  // 5. Sauvegarder aussi localement (backup/cache)
  try {
    const categoryDir = path.join(UPLOAD_DIR, 'logos');
    await mkdir(categoryDir, { recursive: true });
    const localFileName = `${baseName}_${timestamp}${isSvg ? '.svg' : '.webp'}`;
    await writeFile(path.join(categoryDir, localFileName), logoBuffer);
    console.log('💾 [Magic Upload] Local backup saved');
  } catch {
    console.warn('⚠️ [Magic Upload] Local backup failed (non-blocking)');
  }

  console.log('🎉 [Magic Upload] Complete!');

  return NextResponse.json({
    success: true,
    isMagicUpload: true,
    logoUrl,
    faviconUrl: faviconUrl || '',
    ogImageUrl: ogImageUrl || '',
    message: `Logo uploadé${faviconUrl ? ' + Favicon' : ''}${ogImageUrl ? ' + OG Image' : ''} générés !`,
  });
}

// ============================================
// STANDARD UPLOAD
// ============================================

async function handleStandardUpload(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  category: string
): Promise<NextResponse<StandardUploadResult | { error: string }>> {
  const timestamp = Date.now();
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const extension = path.extname(originalName).toLowerCase();
  const isSvg = mimeType === 'image/svg+xml' || extension === '.svg';
  const isIcon = mimeType.includes('icon') || extension === '.ico';

  let finalBuffer = buffer;
  let finalExtension = extension;
  let converted = false;

  // Convertir en WebP si ce n'est pas un SVG ou ICO
  if (!isSvg && !isIcon) {
    try {
      finalBuffer = await sharp(buffer)
        .webp({ quality: 85 })
        .toBuffer();
      finalExtension = '.webp';
      converted = true;
      console.log(`✅ [Upload] Image converted to WebP: ${originalName}`);
    } catch (sharpError) {
      console.warn(`⚠️ [Upload] Could not convert ${originalName} to WebP:`, sharpError);
    }
  }

  // Sauvegarder localement
  const categoryDir = path.join(UPLOAD_DIR, category);
  await mkdir(categoryDir, { recursive: true });
  const fileName = `${baseName}_${timestamp}${finalExtension}`;
  const filePath = path.join(categoryDir, fileName);
  await writeFile(filePath, finalBuffer);

  // Essayer d'uploader vers Baserow aussi
  let baserowUrl = '';
  try {
    baserowUrl = await uploadFileToBaserow(finalBuffer, fileName);
    console.log(`✅ [Upload] Also uploaded to Baserow: ${baserowUrl}`);
  } catch (error) {
    console.warn('⚠️ [Upload] Baserow upload failed, using local URL:', error);
  }

  // Préférer l'URL Baserow si disponible
  const publicUrl = baserowUrl || `/uploads/${category}/${fileName}`;

  console.log(`✅ [Upload] File saved: ${publicUrl}`);

  return NextResponse.json({
    success: true,
    url: publicUrl,
    fileName,
    originalName,
    size: finalBuffer.length,
    type: converted ? 'image/webp' : mimeType,
    converted,
  });
}
