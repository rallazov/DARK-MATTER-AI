import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import { renderWithProviders } from './testUtils';

const mocks = vi.hoisted(() => ({
  post: vi.fn().mockResolvedValue({ success: true }),
  get: vi.fn((path) => {
    if (path.startsWith('/api/audit')) return Promise.resolve({ items: [] });
    if (path === '/api/users/security-status') return Promise.resolve({ plan: 'premium', mfaEnabled: false, mfaConfigured: false });
    return Promise.resolve({});
  }),
  download: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../api/client', () => ({
  api: {
    get: mocks.get,
    post: mocks.post,
    download: mocks.download
  }
}));

describe('Settings privacy actions', () => {
  test('triggers privacy reset action', async () => {
    renderWithProviders(<SettingsPanel />);

    fireEvent.click(screen.getByRole('button', { name: /reset vault data/i }));

    expect(mocks.post).toHaveBeenCalledWith('/api/privacy/reset', { confirmText: 'DELETE' });
  });
});
