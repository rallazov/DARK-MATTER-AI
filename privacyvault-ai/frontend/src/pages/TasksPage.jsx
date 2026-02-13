import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../components/layout/AppLayout';
import TaskComposer from '../components/dashboard/TaskComposer';
import TaskTimeline from '../components/dashboard/TaskTimeline';
import TaskResponsePanel from '../components/dashboard/TaskResponsePanel';
import ConfettiBurst from '../components/common/ConfettiBurst';
import { deleteTask, fetchTasks } from '../slices/taskSlice';

export default function TasksPage() {
  const dispatch = useDispatch();
  const { items: vaults, selectedVaultId } = useSelector((state) => state.vaults);
  const { items: tasks } = useSelector((state) => state.tasks);

  const [vaultFilter, setVaultFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastCelebratedTaskId, setLastCelebratedTaskId] = useState(null);

  useEffect(() => {
    const vaultId = vaultFilter === 'all' ? undefined : vaultFilter;
    dispatch(fetchTasks({ vaultId, status: statusFilter, search }));
  }, [dispatch, vaultFilter, statusFilter, search]);

  useEffect(() => {
    const newest = tasks[0];
    if (!newest || newest._id === lastCelebratedTaskId || newest.status !== 'completed') return;

    const milestone = tasks.length === 1 || tasks.length % 5 === 0;
    if (milestone) {
      setShowConfetti(true);
      setLastCelebratedTaskId(newest._id);
      window.setTimeout(() => setShowConfetti(false), 1300);
    }
  }, [tasks, lastCelebratedTaskId]);

  const latestCompletedTask = useMemo(
    () => tasks.find((task) => task.status === 'completed') || null,
    [tasks]
  );

  return (
    <AppLayout title="Task Hub" subtitle="One-time tasks and private AI outputs across all vaults.">
      <ConfettiBurst active={showConfetti} />

      <div className="card p-4">
        <h3 className="font-semibold">Filters</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            value={vaultFilter}
            onChange={(event) => setVaultFilter(event.target.value)}
          >
            <option value="all">All Vaults</option>
            {vaults.map((vault) => (
              <option key={vault._id} value={vault._id}>
                {vault.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <input
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 md:col-span-2"
            placeholder="Search prompts or OCR text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {selectedVaultId ? <TaskComposer /> : <p className="text-sm text-slate-400">Select a vault to run private tasks.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TaskTimeline tasks={tasks} onDelete={(taskId) => dispatch(deleteTask(taskId))} />
        <TaskResponsePanel task={latestCompletedTask} />
      </div>
    </AppLayout>
  );
}
