import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBot, deleteBot, fetchBots, runBot, updateBot } from '../../slices/botsSlice';
import Modal from '../common/Modal';

const schedulePresets = [
  { value: 'daily', label: 'Daily (9:00)' },
  { value: 'weekly', label: 'Weekly (Mon 9:00)' },
  { value: 'custom', label: 'Custom cron' }
];

export default function BotsPanel() {
  const dispatch = useDispatch();
  const { items, status, error, createStatus, createError, runStatusById, runErrorById } = useSelector((state) => state.bots);
  const vaults = useSelector((state) => state.vaults.items);
  const selectedVaultId = useSelector((state) => state.vaults.selectedVaultId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vaultId, setVaultId] = useState('');
  const [triggerType, setTriggerType] = useState('cron');
  const [schedulePreset, setSchedulePreset] = useState('daily');
  const [cronExpression, setCronExpression] = useState('0 9 * * *');
  const [defaultTaskType, setDefaultTaskType] = useState('text');
  const [defaultPromptTemplate, setDefaultPromptTemplate] = useState('');
  const [runInfoById, setRunInfoById] = useState({});

  useEffect(() => {
    dispatch(fetchBots());
  }, [dispatch]);

  useEffect(() => {
    setVaultId(selectedVaultId || vaults[0]?._id || '');
  }, [selectedVaultId, vaults]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createBot({
          vaultId,
          name,
          description,
          triggerType,
          schedulePreset: triggerType === 'cron' ? schedulePreset : 'none',
          cronExpression: triggerType === 'cron' && schedulePreset === 'custom' ? cronExpression : undefined,
          defaultTaskType,
          defaultPromptTemplate
        })
      ).unwrap();
      setName('');
      setDescription('');
      setDefaultPromptTemplate('');
      setOpen(false);
    } catch {
      // Rendered from redux createError.
    }
  };

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Bot Automations</h3>
        <button className="btn-primary" onClick={() => setOpen(true)} disabled={!vaults.length}>
          New Bot
        </button>
      </div>

      {!vaults.length ? (
        <p className="text-sm text-slate-400">Create a vault first to add bots.</p>
      ) : status === 'failed' ? (
        <p className="text-sm text-rose-300">{error || 'Failed to load bots.'}</p>
      ) : status === 'succeeded' && items.length === 0 ? (
        <p className="text-sm text-slate-400">No bots yet. Create one to run workflows on a schedule or via webhook.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((bot) => (
            <li key={bot._id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{bot.name}</p>
                  <p className="text-xs text-slate-400">
                    Trigger: {bot.triggerType} {bot.triggerType === 'cron' ? `· ${bot.schedulePreset || 'custom'}` : ''}
                  </p>
                  {bot.description ? <p className="mt-1 text-xs text-slate-500">{bot.description}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary text-xs"
                    onClick={async () => {
                      try {
                        const result = await dispatch(runBot(bot._id)).unwrap();
                        setRunInfoById((prev) => ({
                          ...prev,
                          [bot._id]: result?.taskId ? `Queued task ${result.taskId}` : 'Bot run queued'
                        }));
                      } catch {
                        setRunInfoById((prev) => ({ ...prev, [bot._id]: '' }));
                      }
                    }}
                    title="Run now"
                    disabled={runStatusById[bot._id] === 'loading'}
                  >
                    {runStatusById[bot._id] === 'loading' ? 'Running…' : 'Run'}
                  </button>
                  <button className="text-amber-300 text-xs hover:underline" onClick={() => dispatch(updateBot({ botId: bot._id, enabled: !bot.enabled }))}>
                    {bot.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button className="text-rose-300 text-xs hover:underline" onClick={() => dispatch(deleteBot(bot._id))}>
                    Delete
                  </button>
                </div>
              </div>
              {runErrorById[bot._id] ? <p className="mt-2 text-xs text-rose-300">{runErrorById[bot._id]}</p> : null}
              {!runErrorById[bot._id] && runInfoById[bot._id] ? <p className="mt-2 text-xs text-emerald-300">{runInfoById[bot._id]}</p> : null}
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} title="Create New Bot" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={handleCreate}>
          <label className="block text-sm">
            Associated Vault
            <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={vaultId} onChange={(e) => setVaultId(e.target.value)} required>
              {vaults.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Task Name
            <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly receipt analyzer" required />
          </label>

          <label className="block text-sm">
            Description
            <textarea className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this bot should automate." />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              Trigger Type
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
                <option value="cron">Time-based</option>
                <option value="manual">Manual</option>
                <option value="webhook">Webhook</option>
              </select>
            </label>

            {triggerType === 'cron' ? (
              <label className="block text-sm">
                Schedule
                <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={schedulePreset} onChange={(e) => setSchedulePreset(e.target.value)}>
                  {schedulePresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {triggerType === 'cron' && schedulePreset === 'custom' ? (
            <label className="block text-sm">
              Custom Cron
              <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} placeholder="0 9 * * *" />
            </label>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              Multimodal Default
              <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={defaultTaskType} onChange={(e) => setDefaultTaskType(e.target.value)}>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="voice">Voice</option>
                <option value="video">Video</option>
              </select>
            </label>
            <label className="block text-sm">
              Prompt Template
              <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={defaultPromptTemplate} onChange={(e) => setDefaultPromptTemplate(e.target.value)} placeholder="Optional reusable prompt" />
            </label>
          </div>

          {createError ? <p className="text-sm text-rose-300">{createError}</p> : null}
          <button className="btn-primary" type="submit" disabled={createStatus === 'loading'}>
            {createStatus === 'loading' ? 'Creating…' : 'Create Bot'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
