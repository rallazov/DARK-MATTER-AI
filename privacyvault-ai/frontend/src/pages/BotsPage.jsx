import AppLayout from '../components/layout/AppLayout';
import BotsPanel from '../components/dashboard/BotsPanel';

export default function BotsPage() {
  return (
    <AppLayout
      title="Automated Bots"
      subtitle="Build recurring private workflows with schedule, trigger, and multimodal defaults."
    >
      <BotsPanel />
    </AppLayout>
  );
}
