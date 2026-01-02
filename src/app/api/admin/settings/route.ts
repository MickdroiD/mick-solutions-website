// ============================================
// API Route: /api/admin/settings
// ============================================
// Gestion des paramètres admin (changement de PIN via Baserow)
// 🔐 SÉCURISÉ: Nécessite une session admin valide

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

// ============================================
// CONFIGURATION (via lib/config.ts centralisé)
// ============================================

import { BASEROW_API_URL, BASEROW_TOKEN, TABLE_IDS } from '@/lib/config';
const GLOBAL_TABLE_ID = TABLE_IDS.CONFIG_GLOBAL;

// ============================================
// GET - Récupérer les paramètres actuels
// ============================================

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Pour l'instant, on retourne juste le statut
  // Le PIN actuel n'est PAS retourné pour des raisons de sécurité
  return NextResponse.json({
    success: true,
    message: 'Settings API active',
    canChangePin: !!BASEROW_TOKEN && !!GLOBAL_TABLE_ID,
  });
}

// ============================================
// POST - Changer le PIN admin
// ============================================

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!BASEROW_TOKEN || !GLOBAL_TABLE_ID) {
    return NextResponse.json(
      { error: 'Configuration Baserow manquante' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { currentPin, newPin } = body as { currentPin: string; newPin: string };

    // Validation des entrées
    if (!currentPin || !newPin) {
      return NextResponse.json(
        { error: 'PIN actuel et nouveau PIN requis' },
        { status: 400 }
      );
    }

    // Vérifier le format du nouveau PIN (6 chiffres)
    if (!/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { error: 'Le nouveau PIN doit contenir exactement 6 chiffres' },
        { status: 400 }
      );
    }

    // Vérifier que le PIN actuel est correct
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN;
    if (currentPin !== adminPassword) {
      return NextResponse.json(
        { error: 'PIN actuel incorrect' },
        { status: 403 }
      );
    }

    // Récupérer la première ligne de CONFIG_GLOBAL pour obtenir son ID
    const listResponse = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${GLOBAL_TABLE_ID}/?user_field_names=true&size=1`,
      {
        headers: { Authorization: `Token ${BASEROW_TOKEN}` },
        cache: 'no-store',
      }
    );

    if (!listResponse.ok) {
      console.error('Erreur Baserow list:', await listResponse.text());
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    const listData = await listResponse.json();
    if (!listData.results || listData.results.length === 0) {
      return NextResponse.json({ error: 'Configuration non trouvée' }, { status: 404 });
    }

    const rowId = listData.results[0].id;
    const currentData = listData.results[0];

    // Mettre à jour le champ Premium avec le nouveau PIN
    // On stocke le PIN dans le champ Premium.adminPin (override)
    let premium = {};
    try {
      premium = currentData.Premium ? JSON.parse(currentData.Premium) : {};
    } catch {
      premium = {};
    }

    const updatedPremium = {
      ...premium,
      adminPin: newPin,
      pinUpdatedAt: new Date().toISOString(),
    };

    const updateResponse = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${GLOBAL_TABLE_ID}/${rowId}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Premium: JSON.stringify(updatedPremium) }),
      }
    );

    if (!updateResponse.ok) {
      console.error('Erreur Baserow update:', await updateResponse.text());
      return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
    }

    console.log(`✅ [Settings] PIN admin modifié avec succès`);

    // Note: Redémarrage automatique nécessite docker.sock monté ou webhook externe
    // Pour l'instant, l'utilisateur devra redémarrer manuellement le conteneur
    // Commande: docker restart mick-web

    return NextResponse.json({
      success: true,
      message: 'PIN modifié avec succès. Veuillez redémarrer le conteneur pour appliquer les changements: docker restart mick-web',
      requiresRestart: true,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

