// ============================================
// NEXTAUTH CONFIGURATION - Factory V5
// Credentials provider avec email + PIN
// ============================================

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/shared/lib/db';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                pin: { label: "PIN (6 chiffres)", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.pin) {
                    return null;
                }

                // Chercher l'utilisateur
                const user = await prisma.tenantUser.findFirst({
                    where: { email: credentials.email },
                    include: { tenant: true }
                });

                if (!user || !user.pinHash) {
                    return null;
                }

                // Vérifier le PIN
                const validPin = await bcrypt.compare(credentials.pin, user.pinHash);
                if (!validPin) {
                    return null;
                }

                // Retourner l'utilisateur
                return {
                    id: user.id,
                    email: user.email,
                    name: user.email, // TenantUser n'a pas de champ name
                    tenantId: user.tenantId,
                    tenantName: user.tenant.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.tenantId = (user as any).tenantId;
                token.tenantName = (user as any).tenantName;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).tenantId = token.tenantId;
                (session.user as any).tenantName = token.tenantName;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/admin/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 48 * 60 * 60, // 48 heures (plus sécurisé pour admin)
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Runtime validation - throw only when actually handling requests
function validateSecret() {
    if (!process.env.NEXTAUTH_SECRET) {
        throw new Error('NEXTAUTH_SECRET environment variable is required');
    }
}

const handler = NextAuth(authOptions);

// Wrapper to validate secret at runtime
async function authHandler(req: Request, ctx: any) {
    validateSecret();
    return handler(req, ctx);
}

export { authHandler as GET, authHandler as POST };
