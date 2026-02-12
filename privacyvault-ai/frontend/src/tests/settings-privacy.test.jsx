import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SettingsPanel } from '../pages/DashboardPage';
import { renderWithProviders } from './testUtils';

const postMock = vi.fn().mockResolvedValue({ success: true });

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ csrfToken: 'token' }),
    post: postMock
  }
}));

describe('Settings privacy actions', () => {
  test('triggers privacy reset action', async () => {
    renderWithProviders(<SettingsPanel />);

    fireEvent.click(screen.getByRole('button', { name: /reset vault data/i }));

    expect(postMock).toHaveBeenCalledWith('/api/privacy/reset', { confirmText: 'DELETE' });
  });
});
