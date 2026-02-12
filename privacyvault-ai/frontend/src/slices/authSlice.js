import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { disconnectSocket } from '../api/socket';

const initialState = {
  user: null,
  status: 'idle',
  error: null,
  csrfToken: localStorage.getItem('pvai_csrf_token') || null
};

export const fetchCsrfToken = createAsyncThunk('auth/fetchCsrf', async () => {
  const data = await api.get('/api/auth/csrf-token');
  localStorage.setItem('pvai_csrf_token', data.csrfToken);
  return data.csrfToken;
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async () => {
  return api.get('/api/users/me');
});

export const requestMagicLink = createAsyncThunk('auth/requestMagic', async (email) => {
  return api.post('/api/auth/magic-link/request', { email });
});

export const verifyMagicLink = createAsyncThunk('auth/verifyMagic', async (token) => {
  const data = await api.post('/api/auth/magic-link/verify', { token });
  localStorage.setItem('pvai_access_token', data.accessToken);
  return data.user;
});

export const refreshSession = createAsyncThunk('auth/refresh', async () => {
  const data = await api.post('/api/auth/refresh', {});
  localStorage.setItem('pvai_access_token', data.accessToken);
  return data.user;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/api/auth/logout', {});
  localStorage.removeItem('pvai_access_token');
  disconnectSocket();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action) {
      localStorage.setItem('pvai_access_token', action.payload);
    },
    clearAuth(state) {
      state.user = null;
      localStorage.removeItem('pvai_access_token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(verifyMagicLink.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCsrfToken.fulfilled, (state, action) => {
        state.csrfToken = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  }
});

export const { setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
