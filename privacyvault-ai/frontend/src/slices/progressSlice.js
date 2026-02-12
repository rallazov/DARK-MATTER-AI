import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

export const fetchPrivateAnalytics = createAsyncThunk('progress/fetchAnalytics', async () => {
  return api.get('/api/analytics/me');
});

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    insights: null,
    status: 'idle'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrivateAnalytics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPrivateAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.insights = action.payload.privateInsights;
      })
      .addCase(fetchPrivateAnalytics.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export default progressSlice.reducer;
