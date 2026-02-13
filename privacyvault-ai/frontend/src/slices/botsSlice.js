import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

export const fetchBots = createAsyncThunk('bots/fetch', async ({ vaultId } = {}) => {
  const q = vaultId ? `?vaultId=${vaultId}` : '';
  return api.get(`/api/bots${q}`);
});

export const createBot = createAsyncThunk('bots/create', async (body) => {
  return api.post('/api/bots', body);
});

export const updateBot = createAsyncThunk('bots/update', async ({ botId, ...body }) => {
  return api.patch(`/api/bots/${botId}`, body);
});

export const deleteBot = createAsyncThunk('bots/delete', async (botId) => {
  await api.delete(`/api/bots/${botId}`);
  return botId;
});

export const runBot = createAsyncThunk('bots/run', async (botId) => {
  return api.post(`/api/bots/${botId}/run`);
});

const botsSlice = createSlice({
  name: 'bots',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBots.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.status = 'succeeded';
      })
      .addCase(fetchBots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message;
      })
      .addCase(createBot.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateBot.fulfilled, (state, action) => {
        const i = state.items.findIndex((b) => b._id === action.payload._id);
        if (i >= 0) state.items[i] = action.payload;
      })
      .addCase(deleteBot.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      });
  }
});

export default botsSlice.reducer;
