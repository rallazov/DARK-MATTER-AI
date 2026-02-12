import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('pvai_theme') || 'dark';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    theme: savedTheme,
    voiceEnabled: true,
    imageEnabled: true,
    videoEnabled: false,
    privacyScore: 82
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pvai_theme', state.theme);
      document.documentElement.classList.toggle('light', state.theme === 'light');
    },
    updateSettings(state, action) {
      Object.assign(state, action.payload);
    }
  }
});

export const { toggleTheme, updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
