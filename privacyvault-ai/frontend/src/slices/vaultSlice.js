import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

const initialState = {
  items: [],
  selectedVaultId: null,
  status: 'idle',
  error: null
};

export const fetchVaults = createAsyncThunk('vaults/fetch', async () => {
  const data = await api.get('/api/vaults');
  return data.items;
});

export const createVault = createAsyncThunk('vaults/create', async (payload) => {
  return api.post('/api/vaults', payload);
});

export const resetVault = createAsyncThunk('vaults/reset', async (vaultId) => {
  return api.post(`/api/vaults/${vaultId}/reset`, {});
});

export const deleteVault = createAsyncThunk('vaults/delete', async (vaultId) => {
  await api.delete(`/api/vaults/${vaultId}`);
  return vaultId;
});

const vaultSlice = createSlice({
  name: 'vaults',
  initialState,
  reducers: {
    setSelectedVault(state, action) {
      state.selectedVaultId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVaults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVaults.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        if (!state.selectedVaultId && action.payload[0]) {
          state.selectedVaultId = action.payload[0]._id;
        }
      })
      .addCase(fetchVaults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createVault.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteVault.fulfilled, (state, action) => {
        state.items = state.items.filter((vault) => vault._id !== action.payload);
      });
  }
});

export const { setSelectedVault } = vaultSlice.actions;
export default vaultSlice.reducer;
