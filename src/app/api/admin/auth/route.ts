// ============================================
// API Route: /api/admin/auth
// ============================================
// Authentification par code PIN via Baserow
// Crée un token JWT sécurisé pour les sessions

import { NextRequest, NextResponse } from 'next/server';
import { verifyUserPin, type AuthResult } from '@/lib/auth';
import { createAdminToken } from '@/lib/admin-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { isAuthenticated: false, error: 'PIN requis' },
        { status: 400 }
      );
    }

    // Vérification du PIN via Baserow
    const result: AuthResult = await verifyUserPin(pin);

    if (result.isAuthenticated && result.user) {
      // Créer un token JWT pour la session
      const token = await createAdminToken({
        userId: result.user.id,
        userName: result.user.name,
        role: result.user.role,
        siteId: result.user.siteId,
      });

      // Créer la réponse avec le cookie sécurisé
      const response = NextResponse.json(result);
      
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 heures
        path: '/',
      });

      console.log(`✅ [Auth] Connexion réussie: ${result.user.name} (${result.user.role})`);
      return response;
    } else {
      // Échec
      console.log(`❌ [Auth] Échec connexion: ${result.error}`);
      return NextResponse.json(result, { status: 401 });
    }

  } catch (error) {
    console.error('[Auth API] Erreur:', error);
    return NextResponse.json(
      { isAuthenticated: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Endpoint pour la déconnexion
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Déconnecté' });
  
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

