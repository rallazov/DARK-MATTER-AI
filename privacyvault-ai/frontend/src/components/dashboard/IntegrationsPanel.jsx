import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createIntegration, deleteIntegration, fetchIntegrations } from '../../slices/integrationsSlice';
import Modal from '../common/Modal';

const PROVIDERS = ['google', 'notion', 'slack'];

export default function IntegrationsPanel() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.integrations);
  const vaults = useSelector((state) => state.vaults.items);
  const selectedVaultId = useSelector((state) => state.vaults.selectedVaultId);

  const [open, setOpen] = useState(false);
  const [vaultId, setVaultId] = useState('');
  const [provider, setProvider] = useState('google');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchIntegrations());
  }, [dispatch]);

  useEffect(() => {
    setVaultId(selectedVaultId || vaults[0]?._id || '');
  }, [selectedVaultId, vaults]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await dispatch(createIntegration({ vaultId, provider, apiKey, scopes: [] }));
      setApiKey('');
      setOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Integrations</h3>
        <button className="btn-primary" onClick={() => setOpen(true)} disabled={!vaults.length}>
          Add Integration
        </button>
      </div>

      {!vaults.length ? (
        <p className="text-sm text-slate-400">Create a vault first to add integrations.</p>
      ) : status === 'succeeded' && items.length === 0 ? (
        <p className="text-sm text-slate-400">No integrations yet. Connect Google, Notion, or Slack to vaults.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 p-3"
            >
              <div>
                <p className="font-medium capitalize">{i.provider}</p>
                <p className="text-xs text-slate-400">
                  Vault: {vaults.find((v) => v._id === i.vaultId)?.name || i.vaultId}
                </p>
              </div>
              <button
                className="text-rose-300 text-xs hover:underline"
                onClick={() => dispatch(deleteIntegration({ id: i.id }))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} title="Add Integration" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={handleAdd}>
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
            Provider
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            API Key
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Encrypted in vault"
              required
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button className="btn-primary" type="submit">
            Add
          </button>
        </form>
      </Modal>
    </div>
  );
}
