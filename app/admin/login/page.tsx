// ============================================
// ADMIN LOGIN PAGE - Dedicated Route
// ============================================

import AdminLoginForm from '@/features/admin/components/AdminLoginForm';

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0a0a0f' }}>
            <AdminLoginForm />
        </div>
    );
}
