// ============================================
// API Route: /api/admin/config
// ============================================
// Gestion de la configuration globale du site
// 🔐 SÉCURISÉ: Nécessite une session admin valide
//
// FACTORY V2 ONLY:
// - GET: Retourne { global, sections } depuis FACTORY_V2
// - PUT: Accepte { type: 'global' | 'section', data, sectionId? }
// - POST: Création de section
// - DELETE: Suppression de section

// 🚫 CACHE KILLER - Force Next.js à toujours refetch les données
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/admin-session';
import {
  isFactoryV2Configured,
  getFactoryDataForAdmin,
  updateGlobalConfig,
  updateSection,
  createSection,
  deleteSection,
} from '@/lib/factory-client';
import type { GlobalConfig, Section } from '@/lib/schemas/factory';

// ============================================
// GET HANDLER
// ============================================

export async function GET() {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // ========== CHECK V2 CONFIG ==========
  if (!isFactoryV2Configured()) {
    return NextResponse.json({
      error: 'Factory V2 non configuré',
      message: 'Variables requises: BASEROW_FACTORY_GLOBAL_ID, BASEROW_FACTORY_SECTIONS_ID',
    }, { status: 503 });
  }

  console.log('🏭 [Config API] GET - Factory V2 architecture');

  try {
    const factoryData = await getFactoryDataForAdmin();

    return NextResponse.json({
      version: 'v2',
      global: factoryData.global,
      sections: factoryData.sections,
      allSections: factoryData.allSections,
    });
  } catch (error) {
    console.error('Factory V2 GET error:', error);
    return NextResponse.json({ error: 'Erreur Factory V2' }, { status: 500 });
  }
}

// ============================================
// PUT HANDLER
// ============================================

export async function PUT(request: NextRequest) {
  // 🔐 Vérification de la session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // ========== CHECK V2 CONFIG ==========
  if (!isFactoryV2Configured()) {
    return NextResponse.json({
      error: 'Factory V2 non configuré',
      message: 'Variables requises: BASEROW_FACTORY_GLOBAL_ID, BASEROW_FACTORY_SECTIONS_ID',
    }, { status: 503 });
  }

  try {
    const body = await request.json();

    console.log('🏭 [Config API] PUT - Factory V2');

    const { type, data, sectionId, action } = body as {
      type: 'global' | 'section';
      data?: Partial<GlobalConfig> | Partial<Section>;
      sectionId?: number;
      action?: 'create' | 'update' | 'delete';
    };

    if (!type) {
      return NextResponse.json(
        { error: 'type requis (global | section)' },
        { status: 400 }
      );
    }

    // === GLOBAL CONFIG UPDATE ===
    if (type === 'global') {
      if (!data) {
        return NextResponse.json({ error: 'data requis pour global' }, { status: 400 });
      }

      const result = await updateGlobalConfig(data as Partial<GlobalConfig>);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      // Revalidation
      try {
        revalidatePath('/', 'layout');
        revalidatePath('/admin');
      } catch (e) {
        console.warn('Revalidate error', e);
      }

      return NextResponse.json({ success: true, message: 'Global config mise à jour' });
    }

    // === SECTION CRUD ===
    if (type === 'section') {
      // DELETE
      if (action === 'delete') {
        if (!sectionId) {
          return NextResponse.json({ error: 'sectionId requis pour delete' }, { status: 400 });
        }

        const result = await deleteSection(sectionId);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true, message: 'Section supprimée' });
      }

      // CREATE
      if (action === 'create') {
        if (!data) {
          return NextResponse.json({ error: 'data requis pour create' }, { status: 400 });
        }

        const result = await createSection(data as Omit<Section, 'id'>);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({
          success: true,
          message: 'Section créée',
          id: result.id,
        });
      }

      // UPDATE (default)
      if (!sectionId) {
        return NextResponse.json({ error: 'sectionId requis pour update' }, { status: 400 });
      }

      if (!data) {
        return NextResponse.json({ error: 'data requis pour update' }, { status: 400 });
      }

      const sectionData = data as Partial<Section> & {
        isActive?: boolean;
        order?: number;
        content?: Record<string, unknown>;
        design?: Record<string, unknown>;
      };

      const result = await updateSection(sectionId, {
        isActive: sectionData.isActive,
        order: sectionData.order,
        content: sectionData.content as Record<string, unknown>,
        design: sectionData.design as Record<string, unknown>,
        page: sectionData.page,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      // Revalidation
      try {
        revalidatePath('/', 'layout');
        revalidatePath('/admin');
      } catch (e) {
        console.warn('Revalidate error', e);
      }

      return NextResponse.json({ success: true, message: 'Section mise à jour' });
    }

    return NextResponse.json({ error: 'type invalide' }, { status: 400 });
  } catch (error) {
    console.error('Config PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ============================================
// POST HANDLER (Create section)
// ============================================

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!isFactoryV2Configured()) {
    return NextResponse.json({
      error: 'Factory V2 non configuré',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (type !== 'section') {
      return NextResponse.json(
        { error: 'POST only supports type: section' },
        { status: 400 }
      );
    }

    const result = await createSection(data as Omit<Section, 'id'>);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      message: 'Section créée',
      id: result.id,
    });
  } catch (error) {
    console.error('Config POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ============================================
// DELETE HANDLER
// ============================================

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!isFactoryV2Configured()) {
    return NextResponse.json({
      error: 'Factory V2 non configuré',
    }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId requis' }, { status: 400 });
    }

    const result = await deleteSection(parseInt(sectionId, 10));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin');

    return NextResponse.json({ success: true, message: 'Section supprimée' });
  } catch (error) {
    console.error('Config DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
