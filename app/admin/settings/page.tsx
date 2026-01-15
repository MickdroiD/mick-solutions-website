import { getTenantId } from '@/shared/lib/tenant';
import { verifySession } from '@/features/admin/server/actions';
import { redirect } from 'next/navigation';
import SettingsClientPage from './SettingsClientPage';

export default async function SettingsPageWrapper() {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
        redirect('/admin/login');
    }

    const tenantId = await getTenantId();
    return <SettingsClientPage tenantId={tenantId} />;
}
