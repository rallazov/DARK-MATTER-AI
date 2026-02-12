import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TaskComposer from '../components/dashboard/TaskComposer';
import { renderWithProviders } from './testUtils';

vi.mock('../api/client', () => ({
  api: {
    postForm: vi.fn().mockResolvedValue({
      _id: 't1',
      status: 'completed',
      output: { text: 'done' }
    })
  }
}));

describe('Dashboard task creation', () => {
  test('renders composer and submits task', async () => {
    const { store } = renderWithProviders(<TaskComposer />, {
      preloadedState: {
        vaults: { items: [{ _id: 'v1', name: 'Vault' }], selectedVaultId: 'v1', status: 'succeeded', error: null },
        tasks: { items: [], status: 'idle', stream: {}, error: null, filters: { search: '', status: '' } }
      }
    });

    fireEvent.change(screen.getByPlaceholderText(/upload a photo and summarize/i), {
      target: { value: 'Create social post from meeting notes' }
    });

    fireEvent.click(screen.getByRole('button', { name: /run private task/i }));

    expect(store.getState().vaults.selectedVaultId).toBe('v1');
  });
});
