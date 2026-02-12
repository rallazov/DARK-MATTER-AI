import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import {
  fetchAdminMetrics,
  fetchAdminUsers,
  fetchFeatureFlags,
  runUserAction,
  updateFeatureFlag
} from '../slices/adminSlice';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminPage() {
  const dispatch = useDispatch();
  const { metrics, users, featureFlags } = useSelector((state) => state.admin);
  const [flagKey, setFlagKey] = useState('new-onboarding-flow');

  useEffect(() => {
    dispatch(fetchAdminMetrics());
    dispatch(fetchAdminUsers());
    dispatch(fetchFeatureFlags());
  }, [dispatch]);

  const chartData = {
    labels: ['Users', 'Premium', 'Tasks', 'MAU'],
    datasets: [
      {
        label: 'Anonymized Metrics',
        data: [metrics?.usersTotal || 0, metrics?.premiumUsers || 0, metrics?.tasksTotal || 0, metrics?.mauEstimate || 0],
        backgroundColor: ['#0d9488', '#f97316', '#14b8a6', '#0ea5e9']
      }
    ]
  };

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-6 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Founder Admin Panel</h1>
        <a className="btn-secondary" href="/app">
          Back to App
        </a>
      </header>

      <section className="card p-4">
        <h2 className="text-lg font-semibold">Platform Metrics</h2>
        <div className="mt-4">
          <Bar data={chartData} />
        </div>
        <p className="mt-3 text-sm text-slate-400">Churn rate estimate: {metrics?.churnRate || 0}%</p>
      </section>

      <section className="card p-4">
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th>Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-800">
                  <td className="py-2">{user.email}</td>
                  <td>{user.plan}</td>
                  <td>{user.status}</td>
                  <td>
                    <button
                      className="text-xs text-amber-300 hover:underline"
                      onClick={() => dispatch(runUserAction({ userId: user.id, action: 'suspend' }))}
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="text-lg font-semibold">Feature Flags / A/B</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            value={flagKey}
            onChange={(event) => setFlagKey(event.target.value)}
          />
          <button
            className="btn-primary"
            onClick={() =>
              dispatch(
                updateFeatureFlag({
                  key: flagKey,
                  enabled: true,
                  rolloutPercentage: 50,
                  variant: 'B',
                  description: 'Experiment variant B'
                })
              )
            }
          >
            Enable 50%
          </button>
        </div>

        <ul className="space-y-2 text-sm">
          {featureFlags.map((flag) => (
            <li key={flag._id || flag.key} className="rounded-lg border border-slate-700 p-2">
              {flag.key} | {flag.variant} | {flag.rolloutPercentage}% | {flag.enabled ? 'on' : 'off'}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
