// ============================================
// API ROUTE - Update Section Effects & TextSettings
// ============================================
// Permet de mettre à jour les effects et textSettings d'une section
// en parsant/modifiant le JSON du champ Content de Baserow.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

interface UpdateEffectsRequest {
  sectionId: number;
  effects?: Record<string, unknown>;
  textSettings?: Record<string, unknown>;
}

/**
 * POST /api/admin/section-effects
 * Met à jour les effects et textSettings d'une section
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification admin
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parser le body
    const body = (await request.json()) as UpdateEffectsRequest;
    const { sectionId, effects, textSettings } = body;

    if (!sectionId) {
      return NextResponse.json({ error: 'Missing sectionId' }, { status: 400 });
    }

    // 3. Récupérer la section depuis Baserow (via config centralisée)
    const { BASEROW_API_URL, BASEROW_TOKEN, TABLE_IDS } = await import('@/lib/config');
    const SECTIONS_TABLE_ID = TABLE_IDS.SECTIONS;

    // Debug: vérifier les variables
    console.log('[Section Effects] BASEROW_API_URL:', BASEROW_API_URL);
    console.log('[Section Effects] SECTIONS_TABLE_ID:', SECTIONS_TABLE_ID);
    console.log('[Section Effects] BASEROW_TOKEN présent:', !!BASEROW_TOKEN, 'longueur:', BASEROW_TOKEN?.length);

    const getUrl = `${BASEROW_API_URL}/database/rows/table/${SECTIONS_TABLE_ID}/${sectionId}/?user_field_names=true`;
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error(`[Section Effects] Failed to fetch section ${sectionId}:`, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch section from Baserow' },
        { status: 500 }
      );
    }

    const section = (await getResponse.json()) as { Content: string; [key: string]: unknown };

    // 4. Parser le champ Content (JSON stringifié)
    let contentObj: Record<string, unknown>;
    try {
      contentObj = JSON.parse(section.Content);
    } catch (parseError) {
      console.error('[Section Effects] Failed to parse Content JSON:', parseError);
      return NextResponse.json({ error: 'Invalid Content JSON' }, { status: 500 });
    }

    // 5. Mettre à jour effects et/ou textSettings
    if (effects !== undefined) {
      contentObj.effects = effects;
    }
    if (textSettings !== undefined) {
      contentObj.textSettings = textSettings;
    }

    // 6. Stringifier le nouveau Content
    const newContent = JSON.stringify(contentObj);

    // 7. Mettre à jour la section dans Baserow
    const updateUrl = `${BASEROW_API_URL}/database/rows/table/${SECTIONS_TABLE_ID}/${sectionId}/?user_field_names=true`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Content: newContent,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`[Section Effects] Failed to update section ${sectionId}:`, errorText);
      return NextResponse.json(
        { error: 'Failed to update section in Baserow' },
        { status: 500 }
      );
    }

    const updatedSection = await updateResponse.json();

    return NextResponse.json({
      success: true,
      sectionId,
      content: JSON.parse((updatedSection as { Content: string }).Content),
    });
  } catch (error) {
    console.error('[Section Effects] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

