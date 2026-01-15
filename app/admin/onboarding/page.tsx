import { getTenantId } from '@/shared/lib/tenant';
import OnboardingClientPage from './OnboardingClientPage';

export default async function OnboardingPageWrapper() {
    const tenantId = await getTenantId();
    return <OnboardingClientPage tenantId={tenantId} />;
}
