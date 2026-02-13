import AppLayout from '../components/layout/AppLayout';
import VaultCards from '../components/dashboard/VaultCards';

export default function VaultsPage() {
  return (
    <AppLayout
      title="Vault Management"
      subtitle="Create, share, reset, and manage private vaults with complete ownership controls."
    >
      <VaultCards />
    </AppLayout>
  );
}
