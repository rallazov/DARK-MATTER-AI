import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, getSocket } from '../api/socket';
import Sidebar from '../components/layout/Sidebar';
import ThemeToggle from '../components/common/ThemeToggle';
import MetricCard from '../components/common/MetricCard';
import VaultCards from '../components/dashboard/VaultCards';
import TaskComposer from '../components/dashboard/TaskComposer';
import TaskTimeline from '../components/dashboard/TaskTimeline';
import PrivacyScoreMeter from '../components/dashboard/PrivacyScoreMeter';
import NudgeBanner from '../components/dashboard/NudgeBanner';
import { fetchCurrentUser, logout } from '../slices/authSlice';
import { fetchVaults } from '../slices/vaultSlice';
import { appendStreamChunk, clearStream, deleteTask, fetchTasks } from '../slices/taskSlice';
import { fetchPrivateAnalytics } from '../slices/progressSlice';
import { SOCKET_EVENTS } from '../utils/events';
import { api } from '../api/client';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [active, setActive] = useState('Home');
  const [toast, setToast] = useState('');

  const { user } = useSelector((state) => state.auth);
  const { items: vaults, selectedVaultId } = useSelector((state) => state.vaults);
  const tasks = useSelector((state) => state.tasks.items);
  const insights = useSelector((state) => state.progress.insights);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchVaults());
    dispatch(fetchPrivateAnalytics());
    api.get('/api/auth/csrf-token').then((data) => localStorage.setItem('pvai_csrf_token', data.csrfToken));
  }, [dispatch]);

  useEffect(() => {
    if (selectedVaultId) {
      dispatch(fetchTasks({ vaultId: selectedVaultId }));
    }
  }, [dispatch, selectedVaultId]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    socket.on(SOCKET_EVENTS.TASK_STREAM_CHUNK, ({ taskId, chunk }) => {
      dispatch(appendStreamChunk({ taskId, chunk }));
    });

    socket.on(SOCKET_EVENTS.TASK_STREAM_END, ({ taskId }) => {
      dispatch(clearStream(taskId));
      if (selectedVaultId) dispatch(fetchTasks({ vaultId: selectedVaultId }));
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION, ({ message }) => {
      setToast(message);
      setTimeout(() => setToast(''), 2500);
    });

    return () => {
      const liveSocket = getSocket();
      liveSocket?.off(SOCKET_EVENTS.TASK_STREAM_CHUNK);
      liveSocket?.off(SOCKET_EVENTS.TASK_STREAM_END);
      liveSocket?.off(SOCKET_EVENTS.NOTIFICATION);
    };
  }, [dispatch, selectedVaultId]);

  useEffect(() => {
    const socket = getSocket();
    if (socket && selectedVaultId) {
      socket.emit('vault:join', { vaultId: selectedVaultId });
    }
  }, [selectedVaultId]);

  const streak = insights?.currentStreak || user?.progress?.currentStreak || 0;

  const homeView = useMemo(
    () => (
      <div className="space-y-4">
        <NudgeBanner streak={streak} />
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Tasks Completed" value={insights?.tasksCompleted || 0} hint="Private, vault-scoped" />
          <MetricCard label="Time Saved" value={`${insights?.timeSavedHours || 0}h`} hint="This week" />
          <MetricCard label="Multimodal Tasks" value={insights?.multimodalTasks || 0} hint="Image + voice + video" />
        </div>
      </div>
    ),
    [insights, streak]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.displayName || user?.email}</h1>
          <p className="text-sm text-slate-300">Run private multimodal workflows inside isolated vaults.</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' ? (
            <a href="/admin" className="btn-secondary">
              Admin
            </a>
          ) : null}
          <ThemeToggle />
          <button className="btn-secondary" onClick={() => dispatch(logout()).then(() => (window.location.href = '/login'))}>
            Logout
          </button>
        </div>
      </header>

      {toast ? <div className="mb-3 rounded-lg border border-teal-500/40 bg-teal-500/10 p-2 text-sm text-teal-100">{toast}</div> : null}

      <div className="grid gap-4 md:grid-cols-[240px,1fr]">
        <Sidebar active={active} setActive={setActive} />

        <section className="space-y-4">
          {active === 'Home' ? homeView : null}
          {active === 'Vaults' || active === 'Home' ? <VaultCards /> : null}
          {active === 'Tasks' || active === 'Home' ? <TaskComposer /> : null}
          {active === 'Tasks' || active === 'Home' ? (
            <TaskTimeline tasks={tasks} onDelete={(taskId) => dispatch(deleteTask(taskId))} />
          ) : null}
          {active === 'Settings' || active === 'Home' ? <SettingsPanel /> : null}
          {active === 'Upgrade' ? <UpgradePanel vaultCount={vaults.length} /> : null}
        </section>
      </div>
    </main>
  );
}

export function SettingsPanel() {
  const [exportFormat, setExportFormat] = useState('json');
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-4">
      <PrivacyScoreMeter />
      <div className="card space-y-3 p-4">
        <h3 className="font-semibold">Privacy Controls</h3>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/privacy/export?format=${exportFormat}`} className="btn-secondary">
            Export Data
          </a>
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            value={exportFormat}
            onChange={(event) => setExportFormat(event.target.value)}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          <button
            className="rounded-xl border border-rose-600/70 px-4 py-2 text-rose-200"
            onClick={async () => {
              await api.post('/api/privacy/reset', { confirmText: 'DELETE' });
              setMessage('Vault data wiped. This action is irreversible.');
            }}
          >
            Reset Vault Data
          </button>
        </div>
        {message ? <p className="text-sm text-amber-200">{message}</p> : null}
      </div>
    </div>
  );
}

export function UpgradePanel({ vaultCount }) {
  return (
    <div className="card p-5">
      <h3 className="text-xl font-semibold">Upgrade to Premium</h3>
      <p className="mt-2 text-slate-300">
        Unlock MFA, encrypted collaboration links, and unlimited multimodal storage for $9.99/month.
      </p>
      <p className="mt-2 text-sm text-amber-300">Limited founder-led onboarding slots this month.</p>
      <p className="mt-4 text-sm text-slate-400">Current vault count: {vaultCount}</p>
      <button className="btn-primary mt-4">Start Premium</button>
    </div>
  );
}
