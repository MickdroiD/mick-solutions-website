// ============================================
// ADMIN V2 LAYOUT - Auth Guard
// ============================================
// Protects all /admin/v2/* routes
// Redirects to /admin login page if not authenticated

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-session';

export default async function AdminV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = await getAdminSession();
  
  if (!session) {
    // Not authenticated - redirect to login page
    redirect('/admin');
  }
  
  // Authenticated - render children
  return <>{children}</>;
}

