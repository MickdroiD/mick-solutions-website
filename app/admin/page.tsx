import { getTenantId } from '@/shared/lib/tenant';
import AdminClientPage from './AdminClientPage';

export default async function AdminPageWrapper() {
    const tenantId = await getTenantId();

    return <AdminClientPage tenantId={tenantId} />;
}
