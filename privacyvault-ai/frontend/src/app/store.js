import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import vaultReducer from '../slices/vaultSlice';
import taskReducer from '../slices/taskSlice';
import settingsReducer from '../slices/settingsSlice';
import progressReducer from '../slices/progressSlice';
import adminReducer from '../slices/adminSlice';
import botsReducer from '../slices/botsSlice';
import integrationsReducer from '../slices/integrationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vaults: vaultReducer,
    tasks: taskReducer,
    settings: settingsReducer,
    progress: progressReducer,
    admin: adminReducer,
    bots: botsReducer,
    integrations: integrationsReducer
  }
});
