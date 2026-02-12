import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createVault, deleteVault, fetchVaults, resetVault, setSelectedVault } from '../../slices/vaultSlice';
import Modal from '../common/Modal';

export default function VaultCards() {
  const dispatch = useDispatch();
  const { items, selectedVaultId } = useSelector((state) => state.vaults);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

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
            <div className="mt-3 flex gap-2 text-xs">
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
