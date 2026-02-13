import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import AppSidebar from './AppSidebar';
import { fetchCurrentUser, logout } from '../../slices/authSlice';
import { fetchVaults } from '../../slices/vaultSlice';
import { fetchPrivateAnalytics, fetchPrivacyScore } from '../../slices/progressSlice';
import { fetchBots } from '../../slices/botsSlice';
import { fetchIntegrations } from '../../slices/integrationsSlice';
import { api } from '../../api/client';

export default function AppLayout({ title, subtitle, children, actions }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchVaults());
    dispatch(fetchPrivateAnalytics());
    dispatch(fetchPrivacyScore());
    dispatch(fetchBots());
    dispatch(fetchIntegrations());
    api.get('/api/auth/csrf-token').then((data) => localStorage.setItem('pvai_csrf_token', data.csrfToken));
  }, [dispatch]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-slate-300">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {user?.role === 'admin' ? (
            <a href="/admin" className="btn-secondary">
              Admin
            </a>
          ) : null}
          <ThemeToggle />
          <button className="btn-secondary" onClick={() => dispatch(logout()).then(() => (window.location.href = '/login'))}>
            Logout
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[240px,1fr]">
        <AppSidebar key={`sidebar-${location.pathname}`} />
        <section className="space-y-4">{children}</section>
      </div>
    </main>
  );
}
