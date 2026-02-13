import AppLayout from '../components/layout/AppLayout';
import IntegrationsPanel from '../components/dashboard/IntegrationsPanel';

export default function IntegrationsPage() {
  return (
    <AppLayout
      title="Integrations"
      subtitle="Connect external services through encrypted, vault-scoped credentials."
    >
      <IntegrationsPanel />
    </AppLayout>
  );
}
