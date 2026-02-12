import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import authReducer from '../slices/authSlice';
import vaultReducer from '../slices/vaultSlice';
import taskReducer from '../slices/taskSlice';
import settingsReducer from '../slices/settingsSlice';
import progressReducer from '../slices/progressSlice';
import adminReducer from '../slices/adminSlice';

export function renderWithProviders(ui, { preloadedState = {} } = {}) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      vaults: vaultReducer,
      tasks: taskReducer,
      settings: settingsReducer,
      progress: progressReducer,
      admin: adminReducer
    },
    preloadedState
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    )
  };
}
