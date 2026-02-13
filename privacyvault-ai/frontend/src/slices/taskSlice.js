import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

const initialState = {
  items: [],
  status: 'idle',
  stream: {},
  error: null,
  createStatus: 'idle',
  createError: null,
  latestCompletedTaskId: null,
  filters: {
    search: '',
    status: ''
  }
};

export const fetchTasks = createAsyncThunk('tasks/fetch', async ({ vaultId, search = '', status = '' }) => {
  const params = new URLSearchParams();
  if (vaultId) params.set('vaultId', vaultId);
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const data = await api.get(`/api/tasks?${params.toString()}`);
  return data.items;
});

export const createTask = createAsyncThunk('tasks/create', async ({ vaultId, prompt, type, file }) => {
  const formData = new FormData();
  formData.append('vaultId', vaultId);
  formData.append('prompt', prompt);
  formData.append('type', type);
  if (file) formData.append('file', file);

  return api.postForm('/api/tasks', formData);
});

export const deleteTask = createAsyncThunk('tasks/delete', async (taskId) => {
  await api.delete(`/api/tasks/${taskId}`);
  return taskId;
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    appendStreamChunk(state, action) {
      const { taskId, chunk } = action.payload;
      state.stream[taskId] = `${state.stream[taskId] || ''}${chunk}`;
    },
    clearStream(state, action) {
      delete state.stream[action.payload];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createTask.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.createStatus = 'succeeded';
        if (action.payload?.status === 'completed') {
          state.latestCompletedTaskId = action.payload._id;
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.error?.message || 'Failed to run task';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task._id !== action.payload);
      });
  }
});

export const { setFilters, appendStreamChunk, clearStream } = taskSlice.actions;
export default taskSlice.reducer;
