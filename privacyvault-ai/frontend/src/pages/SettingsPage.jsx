import AppLayout from '../components/layout/AppLayout';
import SettingsPanel from '../components/dashboard/SettingsPanel';

export default function SettingsPage() {
  return (
    <AppLayout
      title="Settings & Privacy"
      subtitle="Control data portability, MFA, audit transparency, and privacy posture."
    >
      <SettingsPanel />
    </AppLayout>
  );
}
