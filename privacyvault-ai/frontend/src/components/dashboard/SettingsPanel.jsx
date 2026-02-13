import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../api/client';
import PrivacyScoreMeter from './PrivacyScoreMeter';

export default function SettingsPanel() {
  const [exportFormat, setExportFormat] = useState('json');
  const [message, setMessage] = useState('');
  const [exportError, setExportError] = useState('');
  const [auditItems, setAuditItems] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [security, setSecurity] = useState({ mfaEnabled: false, mfaConfigured: false, plan: 'free' });
  const [mfaSetup, setMfaSetup] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    setAuditLoading(true);
    setAuditError('');
    api
      .get('/api/audit?limit=20&page=1')
      .then((data) => setAuditItems(data.items || []))
      .catch((error) => setAuditError(error.message))
      .finally(() => setAuditLoading(false));

    api
      .get('/api/users/security-status')
      .then((data) => setSecurity(data))
      .catch(() => setSecurity({ mfaEnabled: false, mfaConfigured: false, plan: user?.plan || 'free' }));
  }, [user?.plan]);

  const handleExport = async () => {
    setExportError('');
    try {
      await api.download(`/api/privacy/export?format=${exportFormat}`, `privacy-export.${exportFormat}`);
    } catch (err) {
      setExportError(err.message);
    }
  };

  const startMfaSetup = async () => {
    setMfaError('');
    setMfaLoading(true);
    try {
      const setup = await api.post('/api/auth/mfa/setup', { label: 'PrivacyVault AI' });
      setMfaSetup(setup);
    } catch (error) {
      setMfaError(error.message);
    } finally {
      setMfaLoading(false);
    }
  };

  const verifyMfa = async () => {
    setMfaError('');
    setMfaLoading(true);
    try {
      await api.post('/api/auth/mfa/verify', { code: mfaCode, enable: true });
      setSecurity((prev) => ({ ...prev, mfaEnabled: true, mfaConfigured: true }));
      setMfaSetup(null);
      setMfaCode('');
      setMessage('MFA enabled successfully.');
    } catch (error) {
      setMfaError(error.message);
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMfa = async () => {
    setMfaError('');
    setMfaLoading(true);
    try {
      await api.post('/api/auth/mfa/disable', {});
      setSecurity((prev) => ({ ...prev, mfaEnabled: false }));
      setMessage('MFA disabled.');
    } catch (error) {
      setMfaError(error.message);
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PrivacyScoreMeter />

      <div className="card space-y-3 p-4">
        <h3 className="font-semibold">Privacy Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={handleExport}>
            Export Data
          </button>
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            value={exportFormat}
            onChange={(event) => setExportFormat(event.target.value)}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          <button
            className="rounded-xl border border-rose-600/70 px-4 py-2 text-rose-200"
            onClick={async () => {
              await api.post('/api/privacy/reset', { confirmText: 'DELETE' });
              setMessage('Vault data wiped. This action is irreversible.');
            }}
          >
            Reset Vault Data
          </button>
        </div>
        {message ? <p className="text-sm text-amber-200">{message}</p> : null}
        {exportError ? <p className="text-sm text-rose-300">{exportError}</p> : null}
      </div>

      <div className="card space-y-3 p-4">
        <h3 className="font-semibold">MFA Security</h3>
        <p className="text-sm text-slate-400">Plan: {security.plan} | MFA: {security.mfaEnabled ? 'Enabled' : 'Disabled'}</p>
        {security.plan !== 'premium' ? (
          <p className="text-sm text-amber-300">MFA is available on Premium.</p>
        ) : security.mfaEnabled ? (
          <button className="btn-secondary" onClick={disableMfa} disabled={mfaLoading}>
            {mfaLoading ? 'Updating…' : 'Disable MFA'}
          </button>
        ) : (
          <button className="btn-primary" onClick={startMfaSetup} disabled={mfaLoading}>
            {mfaLoading ? 'Preparing…' : 'Enable MFA'}
          </button>
        )}

        {mfaSetup ? (
          <div className="rounded-lg border border-slate-700 p-3 text-sm">
            <p className="text-slate-300">Secret: <span className="font-mono">{mfaSetup.secret}</span></p>
            <p className="mt-1 text-xs text-slate-400 break-all">OTPAuth: {mfaSetup.otpauth}</p>
            <div className="mt-2 flex gap-2">
              <input
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value)}
                placeholder="Enter 6-digit code"
              />
              <button className="btn-primary" onClick={verifyMfa} disabled={mfaLoading || !mfaCode}>
                Verify
              </button>
            </div>
          </div>
        ) : null}
        {mfaError ? <p className="text-sm text-rose-300">{mfaError}</p> : null}
      </div>

      <div className="card p-4">
        <h3 className="font-semibold">Audit Log</h3>
        {auditLoading ? <p className="mt-2 text-sm text-slate-400">Loading audit events…</p> : null}
        {auditError ? <p className="mt-2 text-sm text-rose-300">{auditError}</p> : null}
        {!auditLoading && !auditError ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-2">Action</th>
                  <th className="py-2">When</th>
                  <th className="py-2">Vault</th>
                </tr>
              </thead>
              <tbody>
                {auditItems.map((item) => (
                  <tr key={item._id} className="border-t border-slate-800">
                    <td className="py-2">{item.action}</td>
                    <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-2">{item.vaultId || 'n/a'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
