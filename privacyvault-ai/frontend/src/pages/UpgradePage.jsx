import { useSelector } from 'react-redux';
import AppLayout from '../components/layout/AppLayout';
import UpgradePanel from '../components/dashboard/UpgradePanel';

export default function UpgradePage() {
  const vaultCount = useSelector((state) => state.vaults.items.length);

  return (
    <AppLayout title="Upgrade Plans" subtitle="Choose the right plan for your private AI workflows.">
      <UpgradePanel vaultCount={vaultCount} />
    </AppLayout>
  );
}
