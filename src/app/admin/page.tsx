// ============================================
// ADMIN PAGE - Login Gate for V2
// ============================================
// Shows PIN entry form if not authenticated
// Redirects to /admin/v2 if session is valid

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-session';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminPage() {
  // Check if user is already authenticated
  const session = await getAdminSession();
  
  if (session) {
    // User is authenticated, redirect to V2 dashboard
    redirect('/admin/v2');
  }
  
  // Not authenticated - show login form
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Administration
          </h1>
          <p className="text-slate-400 text-sm">
            Entrez votre code PIN pour accéder au panneau d&apos;administration.
          </p>
        </div>

        {/* Login Form (Client Component) */}
        <AdminLoginForm />

        {/* Footer */}
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-slate-500 text-sm hover:text-slate-400 transition-colors"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </main>
  );
}
