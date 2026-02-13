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
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    createStatus: 'idle',
    createError: null,
    runStatusById: {},
    runErrorById: {}
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBots.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBots.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.status = 'succeeded';
      })
      .addCase(fetchBots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message;
      })
      .addCase(createBot.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createBot.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.createStatus = 'succeeded';
      })
      .addCase(createBot.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.error?.message || 'Failed to create bot';
      })
      .addCase(updateBot.fulfilled, (state, action) => {
        const i = state.items.findIndex((b) => b._id === action.payload._id);
        if (i >= 0) state.items[i] = action.payload;
      })
      .addCase(deleteBot.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      })
      .addCase(runBot.pending, (state, action) => {
        const botId = action.meta.arg;
        state.runStatusById[botId] = 'loading';
        state.runErrorById[botId] = null;
      })
      .addCase(runBot.fulfilled, (state, action) => {
        const botId = action.meta.arg;
        state.runStatusById[botId] = 'succeeded';
        state.runErrorById[botId] = null;
      })
      .addCase(runBot.rejected, (state, action) => {
        const botId = action.meta.arg;
        state.runStatusById[botId] = 'failed';
        state.runErrorById[botId] = action.error?.message || 'Failed to run bot';
      });
  }
});

export default botsSlice.reducer;
