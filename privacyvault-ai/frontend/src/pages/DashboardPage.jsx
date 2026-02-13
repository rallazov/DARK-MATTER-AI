import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, getSocket } from '../api/socket';
import AppLayout from '../components/layout/AppLayout';
import MetricCard from '../components/common/MetricCard';
import VaultCards from '../components/dashboard/VaultCards';
import TaskComposer from '../components/dashboard/TaskComposer';
import TaskTimeline from '../components/dashboard/TaskTimeline';
import PrivacyScoreMeter from '../components/dashboard/PrivacyScoreMeter';
import NudgeBanner from '../components/dashboard/NudgeBanner';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ConfettiBurst from '../components/common/ConfettiBurst';
import { appendStreamChunk, clearStream, deleteTask, fetchTasks } from '../slices/taskSlice';
import { SOCKET_EVENTS } from '../utils/events';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [toast, setToast] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const { selectedVaultId } = useSelector((state) => state.vaults);
  const tasks = useSelector((state) => state.tasks.items);
  const insights = useSelector((state) => state.progress.insights);
  const privacyScore = useSelector((state) => state.progress.privacyScore);

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
  const productivity = insights?.productivityScore || 0;
  const level = Math.max(1, Math.floor(productivity / 20) + 1);

  const homeView = useMemo(
    () => (
      <div className="space-y-4">
        <NudgeBanner streak={streak} />
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Tasks Completed" value={insights?.tasksCompleted || 0} hint="Private, vault-scoped" />
          <MetricCard label="Time Saved" value={`${insights?.timeSavedHours || 0}h`} hint="This week" />
          <MetricCard label="Privacy Score" value={privacyScore !== null && privacyScore !== undefined ? `${privacyScore}%` : '—'} hint="Live secure posture" />
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Level Progress</h3>
            <span className="text-sm text-teal-300">Level {level}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-700">
            <div className="h-2 rounded-full bg-teal-500" style={{ width: `${Math.min((productivity % 20) * 5, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">Complete tasks and keep streaks to earn badges and level up.</p>
        </div>
      </div>
    ),
    [insights, streak, level, productivity, privacyScore]
  );

  useEffect(() => {
    const milestone = streak >= 7 ? 7 : streak >= 3 ? 3 : streak >= 1 ? 1 : 0;
    if (milestone > 0 && milestone !== lastMilestone) {
      setShowConfetti(true);
      setLastMilestone(milestone);
      window.setTimeout(() => setShowConfetti(false), 1200);
    }
  }, [streak, lastMilestone]);

  return (
    <AppLayout title={`Welcome back, ${user?.displayName || user?.email || 'Private User'}`} subtitle="Operate secure multimodal workflows inside isolated AI vaults.">
      <ConfettiBurst active={showConfetti} />
      {toast ? <div className="rounded-lg border border-teal-500/40 bg-teal-500/10 p-2 text-sm text-teal-100">{toast}</div> : null}

      {homeView}
      <VaultCards />
      {selectedVaultId ? (
        <TaskComposer />
      ) : (
        <p className="text-sm text-slate-400">Click a vault to start creating private tasks and automations.</p>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        <TaskTimeline tasks={tasks} onDelete={(taskId) => dispatch(deleteTask(taskId))} />
        <div className="space-y-4">
          <PrivacyScoreMeter />
          <ActivityFeed limit={10} />
        </div>
      </div>
    </AppLayout>
  );
}
