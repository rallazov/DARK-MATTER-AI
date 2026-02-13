import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

export const fetchPrivateAnalytics = createAsyncThunk('progress/fetchAnalytics', async () => {
  return api.get('/api/analytics/me');
});

export const fetchPrivacyScore = createAsyncThunk('progress/fetchPrivacyScore', async () => {
  return api.get('/api/users/privacy-score');
});

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    insights: null,
    privacyScore: null,
    privacyFactors: [],
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
      })
      .addCase(fetchPrivacyScore.fulfilled, (state, action) => {
        state.privacyScore = action.payload.score;
        state.privacyFactors = action.payload.factors || [];
      });
  }
});

export default progressSlice.reducer;
