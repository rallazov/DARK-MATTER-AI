import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

export const fetchIntegrations = createAsyncThunk('integrations/fetch', async ({ vaultId } = {}) => {
  const q = vaultId ? `?vaultId=${vaultId}` : '';
  return api.get(`/api/integrations${q}`);
});

export const createIntegration = createAsyncThunk('integrations/create', async (body) => {
  return api.post('/api/integrations', body);
});

export const deleteIntegration = createAsyncThunk('integrations/delete', async (arg) => {
  const { id, provider } = typeof arg === 'object' ? arg : { provider: arg };
  if (id) {
    await api.delete(`/api/integrations/id/${id}`);
    return { byId: id };
  }
  await api.delete(`/api/integrations/${encodeURIComponent(provider)}`);
  return { byProvider: provider };
});

const integrationsSlice = createSlice({
  name: 'integrations',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.status = 'succeeded';
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message;
      })
      .addCase(createIntegration.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteIntegration.fulfilled, (state, action) => {
        const { byId, byProvider } = action.payload || {};
        if (byId) state.items = state.items.filter((i) => i.id !== byId);
        else if (byProvider) state.items = state.items.filter((i) => i.provider !== byProvider);
      });
  }
});

export default integrationsSlice.reducer;
