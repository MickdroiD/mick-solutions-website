'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

// ============================================
// ADMIN AUTHENTICATION - SERVER ACTIONS
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'factory-v5-secret-dev';
const ADMIN_PIN = process.env.ADMIN_PIN || '123456'; // Default Fallback, should be in .env

export interface AuthState {
    error?: string;
    success?: boolean;
}

export async function loginWithPin(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const pin = formData.get('pin') as string;

    // Simple Artificial Delay for "Security Feel" (and Brute Force mitigation)
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('[Auth] Login Attempt. PIN Length:', pin.length);
    console.log('[Auth] Expected PIN Length:', ADMIN_PIN.length);

    if (pin !== ADMIN_PIN) {
        console.log('[Auth] PIN Mismatch.');
        return { error: 'Code PIN incorrect' };
    }
    console.log('[Auth] PIN Matched!');

    // Create Session
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);

    // Set Cookie
    const cookieStore = await cookies();

    console.log('[Auth] Setting cookie...', token.substring(0, 10) + '...');

    cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: false, // process.env.NODE_ENV === 'production', // DEBUG: Disable secure temporarily to rule out proxy issues
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'lax',
    });

    console.log('[Auth] Cookie set. Redirecting to /admin...');
    redirect('/admin');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin');
}
export async function verifySession() {
    console.log('[Auth] verifySession called.');
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
        console.log('[Auth] Verify: No token found in cookies.');
        return false;
    }
    console.log('[Auth] Verify: Token found.');

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        console.log('[Auth] Verify: JWT Valid.');
        return true;
    } catch (err) {
        console.error('[Auth] Verify: JWT Invalid:', err);
        return false;
    }
}
