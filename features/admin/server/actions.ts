'use server';

import { cookies, headers } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import prisma from '@/shared/lib/db';

// ============================================
// ADMIN AUTHENTICATION - SERVER ACTIONS
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'factory-v5-secret-dev';

export interface AuthState {
    error?: string;
    success?: boolean;
}

export async function loginWithPin(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const pin = formData.get('pin') as string;

    // Simple Artificial Delay for "Security Feel" (and Brute Force mitigation)
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('[Auth] Login Attempt. PIN Length:', pin.length);

    // Resolve tenant from host header
    const headersList = await headers();
    const host = headersList.get('host') || '';
    console.log('[Auth] Resolving tenant from host:', host);

    // Find tenant by domain or subdomain slug
    const tenant = await prisma.tenant.findFirst({
        where: {
            OR: [
                { domain: host },
                { slug: host.split('.')[0] },
            ],
        },
        select: { id: true, name: true }
    });

    if (!tenant) {
        console.log('[Auth] No tenant found for host:', host);
        return { error: 'Client non trouvé' };
    }

    console.log('[Auth] Found tenant:', tenant.id, tenant.name);

    // Find any TenantUser for this tenant
    const user = await prisma.tenantUser.findFirst({
        where: { tenantId: tenant.id }
    });

    if (!user || !user.pinHash) {
        console.log('[Auth] No user or pinHash found for tenant:', tenant.id);
        return { error: 'Aucun utilisateur configuré pour ce site' };
    }

    // Compare PIN with bcrypt hash
    const validPin = await bcrypt.compare(pin, user.pinHash);
    if (!validPin) {
        console.log('[Auth] PIN Mismatch for user:', user.id);
        return { error: 'Code PIN incorrect' };
    }

    console.log('[Auth] PIN Matched for user:', user.id);

    // Update last login
    await prisma.tenantUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });

    // Create Session with tenant info
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
        role: 'admin',
        tenantId: tenant.id,
        userId: user.id
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);

    // Set Cookie
    const cookieStore = await cookies();

    console.log('[Auth] Setting cookie...', token.substring(0, 10) + '...');

    cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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
