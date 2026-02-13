import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createVault, deleteVault, fetchVaults, resetVault, setSelectedVault } from '../../slices/vaultSlice';
import Modal from '../common/Modal';
import { api } from '../../api/client';

export default function VaultCards() {
  const dispatch = useDispatch();
  const { items, selectedVaultId } = useSelector((state) => state.vaults);
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareVaultId, setShareVaultId] = useState(null);
  const [shareLoading, setShareLoading] = useState(null);

  const handleCreate = async (event) => {
    event.preventDefault();
    await dispatch(createVault({ name, theme: 'aurora', avatar: 'owl' }));
    setName('');
    setOpen(false);
  };

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Your Vaults</h3>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          New Vault
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((vault) => (
          <article
            key={vault._id}
            className={`rounded-xl border p-3 ${
              selectedVaultId === vault._id ? 'border-teal-500 bg-teal-500/10' : 'border-slate-700'
            }`}
          >
            <button className="w-full text-left" onClick={() => dispatch(setSelectedVault(vault._id))}>
              <p className="font-medium">{vault.name}</p>
              <p className="text-sm text-slate-400">Theme: {vault.theme}</p>
            </button>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {user?.plan === 'premium' ? (
                <button
                  className="text-teal-300 hover:underline"
                  onClick={async () => {
                    setShareLoading(vault._id);
                    setShareLink('');
                    setShareVaultId(null);
                    try {
                      const { link } = await api.post(`/api/vaults/${vault._id}/share-link`);
                      setShareLink(link);
                      setShareVaultId(vault._id);
                    } catch {
                      setShareLink('Failed to create link');
                      setShareVaultId(vault._id);
                    } finally {
                      setShareLoading(null);
                    }
                  }}
                  disabled={shareLoading === vault._id}
                >
                  {shareLoading === vault._id ? '…' : 'Share'}
                </button>
              ) : null}
              <button
                className="text-amber-300 hover:underline"
                onClick={async () => {
                  await dispatch(resetVault(vault._id));
                  dispatch(fetchVaults());
                }}
              >
                Reset
              </button>
              <button
                className="text-rose-300 hover:underline"
                onClick={async () => {
                  await dispatch(deleteVault(vault._id));
                  dispatch(fetchVaults());
                }}
              >
                Delete
              </button>
            </div>
            {shareLink && shareVaultId === vault._id ? (
              <div className="mt-2 rounded border border-teal-500/40 bg-teal-500/10 p-2 text-xs">
                <p className="text-slate-300">Share link:</p>
                <a href={shareLink} className="break-all text-teal-300 hover:underline" target="_blank" rel="noopener noreferrer">
                  {shareLink}
                </a>
                <button
                  className="mt-1 block text-amber-300 hover:underline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                  }}
                >
                  Copy
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <Modal open={open} title="Create Vault" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={handleCreate}>
          <label className="block text-sm">
            Vault Name
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <button className="btn-primary" type="submit">
            Create
          </button>
        </form>
      </Modal>
    </div>
  );
}
