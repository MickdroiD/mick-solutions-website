// ============================================
// ADMIN PAGE - REDIRECT TO V2
// ============================================
// V1 admin has been deprecated. All admin functionality is now in V2.

import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/v2');
}
