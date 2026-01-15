import { getTenantId } from '@/shared/lib/tenant';
import { verifySession } from '@/features/admin/server/actions';
import { redirect } from 'next/navigation';
import LeadsClientPage from './LeadsClientPage';

export default async function LeadsPageWrapper() {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
        redirect('/admin/login');
    }

    const tenantId = await getTenantId();
    return <LeadsClientPage tenantId={tenantId} />;
}
