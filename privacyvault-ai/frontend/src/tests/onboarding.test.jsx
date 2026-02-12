import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import OnboardingPage from '../pages/OnboardingPage';
import { renderWithProviders } from './testUtils';

vi.mock('../api/client', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ onboardingCompleted: true })
  }
}));

describe('Onboarding flow', () => {
  test('advances through 3 steps', async () => {
    renderWithProviders(<OnboardingPage />);

    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument();
  });
});
