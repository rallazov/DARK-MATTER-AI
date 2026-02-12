import { useState } from 'react';
import { api } from '../api/client';

const avatars = ['shield', 'owl', 'fox', 'saturn'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [vaultName, setVaultName] = useState('My Private Vault');
  const [theme, setTheme] = useState('aurora');
  const [avatar, setAvatar] = useState('shield');
  const [preferences, setPreferences] = useState({ voiceEnabled: true, imageEnabled: true, videoEnabled: false });

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    await api.post('/api/onboarding/complete', { vaultName, theme, avatar, preferences });
    window.location.href = '/app';
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold">Welcome to your private AI sanctuary</h1>
      <p className="mt-2 text-slate-300">Step {step} of 3</p>

      {step === 1 ? (
        <section className="card mt-6 space-y-3 p-5">
          <h2 className="text-xl font-semibold">Customize your vault</h2>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            value={vaultName}
            onChange={(event) => setVaultName(event.target.value)}
          />
          <select
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="aurora">Aurora</option>
            <option value="slate">Slate</option>
            <option value="ember">Ember</option>
          </select>
          <div className="flex gap-2">
            {avatars.map((item) => (
              <button
                key={item}
                className={`rounded-lg border px-3 py-2 ${avatar === item ? 'border-teal-400' : 'border-slate-700'}`}
                onClick={() => setAvatar(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card mt-6 space-y-3 p-5">
          <h2 className="text-xl font-semibold">Choose multimodal preferences</h2>
          {['voiceEnabled', 'imageEnabled', 'videoEnabled'].map((key) => (
            <label key={key} className="flex items-center justify-between">
              <span>{key}</span>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={(event) => setPreferences((prev) => ({ ...prev, [key]: event.target.checked }))}
              />
            </label>
          ))}
        </section>
      ) : null}

      {step === 3 ? (
        <section className="card mt-6 p-5">
          <h2 className="text-xl font-semibold">Quick private demo</h2>
          <p className="mt-2 text-slate-300">Upload a photo and watch AI summarize it privately inside your own vault.</p>
          <div className="mt-4 rounded-lg border border-dashed border-teal-500/60 p-6 text-center">
            Interactive demo placeholder
          </div>
        </section>
      ) : null}

      <div className="mt-6 flex gap-3">
        {step > 1 ? (
          <button className="btn-secondary" onClick={back}>
            Back
          </button>
        ) : null}
        {step < 3 ? (
          <button className="btn-primary" onClick={next}>
            Continue
          </button>
        ) : (
          <button className="btn-primary" onClick={finish}>
            Finish Setup
          </button>
        )}
      </div>
    </main>
  );
}
