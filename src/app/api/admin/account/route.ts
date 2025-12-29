import { NextRequest, NextResponse } from 'next/server';

// ============================================
// BASEROW CONFIG
// ============================================

const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
const USERS_TABLE_ID = process.env.BASEROW_USERS_TABLE_ID || '756'; // Table SITEWEB Utilisateurs

// ============================================
// GET - Récupérer le profil utilisateur
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  }

  try {
    // Récupérer l'utilisateur depuis Baserow
    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${USERS_TABLE_ID}/${userId}/?user_field_names=true`,
      {
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      throw new Error(`Baserow error: ${response.status}`);
    }

    const data = await response.json();

    // Retourner les informations utilisateur (sans le PIN)
    return NextResponse.json({
      user: {
        id: data.id,
        name: data.Nom || '',
        role: data.Role?.value || 'client',
        siteId: data.Site_ID || null,
        isActive: data.Actif === true,
      },
    });
  } catch (error) {
    console.error('[API Account GET] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Mettre à jour le profil (nom)
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });
    }

    // Mettre à jour l'utilisateur dans Baserow
    const response = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${USERS_TABLE_ID}/${userId}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Nom: name.trim(),
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('[API Account PATCH] Baserow error:', errorData);
      throw new Error(`Baserow error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        name: data.Nom || '',
        role: data.Role?.value || 'client',
        siteId: data.Site_ID || null,
        isActive: data.Actif === true,
      },
    });
  } catch (error) {
    console.error('[API Account PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Changer le PIN
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPin, newPin } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    if (!currentPin || !/^\d{6}$/.test(currentPin)) {
      return NextResponse.json({ error: 'PIN actuel invalide (6 chiffres requis)' }, { status: 400 });
    }

    if (!newPin || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json({ error: 'Nouveau PIN invalide (6 chiffres requis)' }, { status: 400 });
    }

    // Récupérer l'utilisateur actuel pour vérifier le PIN
    const getResponse = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${USERS_TABLE_ID}/${userId}/?user_field_names=true`,
      {
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      throw new Error(`Baserow error: ${getResponse.status}`);
    }

    const userData = await getResponse.json();
    const storedPin = String(userData.Code_PIN || '');

    // Vérifier le PIN actuel
    if (storedPin !== currentPin) {
      return NextResponse.json({ error: 'PIN actuel incorrect' }, { status: 401 });
    }

    // Mettre à jour le PIN dans Baserow
    const updateResponse = await fetch(
      `${BASEROW_API_URL}/database/rows/table/${USERS_TABLE_ID}/${userId}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Code_PIN: newPin,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error('[API Account PUT] Baserow update error:', errorData);
      throw new Error(`Baserow error: ${updateResponse.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'PIN modifié avec succès',
    });
  } catch (error) {
    console.error('[API Account PUT] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de PIN' },
      { status: 500 }
    );
  }
}

