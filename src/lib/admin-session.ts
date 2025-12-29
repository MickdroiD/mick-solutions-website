// ============================================
// ADMIN SESSION - White Label Factory V2 (2025)
// ============================================
// Gestion sécurisée des sessions admin
// Utilise un token JWT simple stocké dans les cookies
// 
// V2: Authentification simplifiée via ADMIN_PASSWORD (env var)

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

// JWT_SECRET: Utilise une clé dédiée, sinon fallback sur ADMIN_PASSWORD, puis Baserow token
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || process.env.BASEROW_API_TOKEN || 'factory-v2-default-secret-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface AdminSession {
  userId: number;
  userName: string;
  role: 'admin' | 'client';
  siteId: string | null;
}

/**
 * Crée un token JWT pour la session admin
 */
export async function createAdminToken(session: AdminSession): Promise<string> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

/**
 * Vérifie et décode un token JWT
 */
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as number,
      userName: payload.userName as string,
      role: payload.role as 'admin' | 'client',
      siteId: payload.siteId as string | null,
    };
  } catch {
    return null;
  }
}

/**
 * Récupère la session admin depuis les cookies
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyAdminToken(token);
}

/**
 * Vérifie si l'utilisateur a accès à un site spécifique
 * Les admins ont accès à tout, les clients uniquement à leur site
 */
export function hasAccessToSite(session: AdminSession, siteId?: string): boolean {
  if (session.role === 'admin') {
    return true;
  }
  
  if (!siteId) {
    return true; // Pas de restriction de site
  }
  
  return session.siteId === siteId;
}

