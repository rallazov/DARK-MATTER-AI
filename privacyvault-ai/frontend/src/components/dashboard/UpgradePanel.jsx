import { useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../api/client';

const teamPrice = Number(import.meta.env.VITE_TEAM_PRICE || 29).toFixed(2);

const featureRows = [
  { label: 'Private vaults', free: '1', pro: 'Unlimited', team: 'Unlimited' },
  { label: 'Multimodal tasks', free: 'Basic', pro: 'Advanced', team: 'Advanced' },
  { label: 'MFA', free: 'No', pro: 'Yes', team: 'Yes' },
  { label: 'Collaboration', free: 'No', pro: 'Encrypted links', team: 'Team sharing' },
  { label: 'Priority support', free: 'No', pro: 'Standard', team: 'Priority' }
];

export default function UpgradePanel({ vaultCount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWaitlistLink, setShowWaitlistLink] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const handleStartPremium = async () => {
    setError('');
    setShowWaitlistLink(false);
    setLoading(true);
    try {
      const { url } = await api.post('/api/billing/checkout');
      if (url) window.location.href = url;
      else setError('Checkout not configured');
    } catch (err) {
      setError(err.message);
      const normalized = String(err.message || '').toLowerCase();
      if (normalized.includes('coming soon') || normalized.includes('not configured')) {
        setShowWaitlistLink(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.plan === 'premium') {
    return (
      <div className="card p-5">
        <h3 className="text-xl font-semibold">Premium</h3>
        <p className="mt-2 text-slate-300">You have full access to MFA, share links, and unlimited storage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <PricingCard title="Free" price="$0" summary="Core private AI workflows" />
        <PricingCard title="Pro" price="$9.99/mo" summary="For power users and creators" highlight />
        <PricingCard title="Team" price={`$${teamPrice}/mo`} summary="For small teams with shared vault operations" />
      </div>

      <div className="card p-4">
        <h3 className="font-semibold">Feature Comparison</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="py-2">Feature</th>
                <th className="py-2">Free</th>
                <th className="py-2">Pro</th>
                <th className="py-2">Team</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row) => (
                <tr key={row.label} className="border-t border-slate-800">
                  <td className="py-2">{row.label}</td>
                  <td className="py-2">{row.free}</td>
                  <td className="py-2">{row.pro}</td>
                  <td className="py-2">{row.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-xl font-semibold">Upgrade to Premium</h3>
        <p className="mt-2 text-slate-300">Vault count: {vaultCount}. Unlock encrypted collaboration, MFA, and advanced multimodal automation.</p>
        <button className="btn-primary mt-4" onClick={handleStartPremium} disabled={loading}>
          {loading ? 'Redirecting…' : 'Start Pro Checkout'}
        </button>
        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        {showWaitlistLink ? (
          <p className="mt-2 text-sm text-slate-300">
            Stripe checkout is not enabled yet. Join the premium waitlist:{' '}
            <a className="text-teal-300 underline" href="mailto:premium@privacyvault.ai?subject=PrivacyVault%20Premium%20Waitlist">
              premium@privacyvault.ai
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PricingCard({ title, price, summary, highlight = false }) {
  return (
    <article className={`card p-4 ${highlight ? 'border-teal-400/50' : ''}`}>
      <p className="text-sm uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold">{price}</p>
      <p className="mt-2 text-sm text-slate-300">{summary}</p>
    </article>
  );
}
