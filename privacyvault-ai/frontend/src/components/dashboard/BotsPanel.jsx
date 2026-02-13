import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBot, deleteBot, fetchBots, runBot, updateBot } from '../../slices/botsSlice';
import Modal from '../common/Modal';

export default function BotsPanel() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.bots);
  const vaults = useSelector((state) => state.vaults.items);
  const selectedVaultId = useSelector((state) => state.vaults.selectedVaultId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [vaultId, setVaultId] = useState('');
  const [triggerType, setTriggerType] = useState('cron');
  const [cronExpression, setCronExpression] = useState('0 9 * * *'); // 9am daily

  useEffect(() => {
    dispatch(fetchBots());
  }, [dispatch]);

  useEffect(() => {
    setVaultId(selectedVaultId || vaults[0]?._id || '');
  }, [selectedVaultId, vaults]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createBot({ vaultId, name, triggerType, cronExpression: triggerType === 'cron' ? cronExpression : undefined }));
    setName('');
    setOpen(false);
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
      ) : status === 'succeeded' && items.length === 0 ? (
        <p className="text-sm text-slate-400">No bots yet. Create one to run workflows on a schedule or via webhook.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((bot) => (
            <li
              key={bot._id}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 p-3"
            >
              <div>
                <p className="font-medium">{bot.name}</p>
                <p className="text-xs text-slate-400">
                  {bot.triggerType === 'cron' ? bot.cronExpression : 'Webhook'} · {bot.workflowType}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary text-xs"
                  onClick={() => dispatch(runBot(bot._id))}
                  title="Run now"
                >
                  Run
                </button>
                <button
                  className="text-amber-300 text-xs hover:underline"
                  onClick={() =>
                    dispatch(updateBot({ botId: bot._id, enabled: !bot.enabled }))
                  }
                >
                  {bot.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  className="text-rose-300 text-xs hover:underline"
                  onClick={() => dispatch(deleteBot(bot._id))}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} title="Create Bot" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={handleCreate}>
          <label className="block text-sm">
            Vault
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
              required
            >
              {vaults.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Name
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily Reminder"
              required
            />
          </label>
          <label className="block text-sm">
            Trigger
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
            >
              <option value="cron">Cron</option>
              <option value="webhook">Webhook</option>
            </select>
          </label>
          {triggerType === 'cron' && (
            <label className="block text-sm">
              Cron
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="0 9 * * *"
              />
            </label>
          )}
          <button className="btn-primary" type="submit">
            Create
          </button>
        </form>
      </Modal>
    </div>
  );
}
