// ============================================
// API Route: /api/admin/upload-baserow
// ============================================
// Upload d'images directement vers Baserow File Fields
// 🔐 SÉCURISÉ: Nécessite une session admin valide

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { BASEROW_API_URL, BASEROW_TOKEN } from '@/lib/config';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
    const tableId = formData.get('tableId') as string;
    const rowId = formData.get('rowId') as string;
    const fieldName = formData.get('fieldName') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Formats acceptés: PNG, JPG, GIF, WebP, SVG' },
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

    // Étape 1: Upload le fichier vers Baserow User Files
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const uploadResponse = await fetch(
      `${BASEROW_API_URL}/user-files/upload-file/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
        },
        body: uploadFormData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Baserow upload error:', errorText);
      return NextResponse.json({ error: 'Erreur lors de l\'upload vers Baserow' }, { status: uploadResponse.status });
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ [Baserow Upload] File uploaded:', uploadResult.url);

    // Si tableId, rowId et fieldName sont fournis, mettre à jour la ligne
    if (tableId && rowId && fieldName) {
      const updateData: Record<string, unknown> = {};
      // Format attendu par Baserow pour un champ file
      updateData[fieldName] = [{ name: uploadResult.name }];

      const updateResponse = await fetch(
        `${BASEROW_API_URL}/database/rows/table/${tableId}/${rowId}/?user_field_names=true`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${BASEROW_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Baserow update error:', errorText);
        // On retourne quand même l'URL car l'upload a réussi
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      thumbnails: uploadResult.thumbnails,
      name: uploadResult.name,
      size: uploadResult.size,
      mimeType: uploadResult.mime_type,
    });
  } catch (error) {
    console.error('[Baserow Upload] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}

