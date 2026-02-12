import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

export const fetchAdminMetrics = createAsyncThunk('admin/metrics', async () => api.get('/api/admin/metrics'));
export const fetchAdminUsers = createAsyncThunk('admin/users', async () => api.get('/api/admin/users'));
export const fetchFeatureFlags = createAsyncThunk('admin/flags', async () => api.get('/api/admin/feature-flags'));

export const updateFeatureFlag = createAsyncThunk('admin/updateFlag', async (payload) =>
  api.post('/api/admin/feature-flags', payload)
);

export const runUserAction = createAsyncThunk('admin/userAction', async ({ userId, action }) =>
  api.post(`/api/admin/users/${userId}/action`, { action })
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    metrics: null,
    users: [],
    featureFlags: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload.anonymizedMetrics;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload.items;
      })
      .addCase(fetchFeatureFlags.fulfilled, (state, action) => {
        state.featureFlags = action.payload.items;
      })
      .addCase(updateFeatureFlag.fulfilled, (state, action) => {
        const idx = state.featureFlags.findIndex((f) => f.key === action.payload.key);
        if (idx === -1) state.featureFlags.push(action.payload);
        else state.featureFlags[idx] = action.payload;
      });
  }
});

export default adminSlice.reducer;
