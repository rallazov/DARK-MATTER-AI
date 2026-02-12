import { Link } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

function VaultAnimation() {
  return (
    <svg viewBox="0 0 240 140" className="mx-auto h-40 w-full max-w-md animate-pulseVault" role="img" aria-label="AI vault animation">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="200" height="100" rx="16" fill="url(#g1)" opacity="0.2" />
      <rect x="40" y="40" width="160" height="60" rx="10" fill="#0f172a" stroke="#14b8a6" />
      <circle cx="120" cy="70" r="14" fill="#14b8a6" />
      <path d="M118 62h4v16h-4z" fill="#0f172a" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-lg font-semibold">PrivacyVault AI</p>
        <ThemeToggle />
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-2 md:py-16">
        <div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">Your Private AI Sanctuary: Automate Life Without Leaks</h1>
          <p className="mt-4 text-lg text-slate-300">
            Secure personal vaults for text, images, voice, and video workflows. No training on your data. Instant delete when you want.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/login">
              Sign Up Free
            </Link>
            <a className="btn-secondary" href="#learn-more">
              Learn More
            </a>
          </div>
        </div>
        <VaultAnimation />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card p-4">
            <h2 className="font-semibold">Secure Task Bots</h2>
            <p className="mt-2 text-sm text-slate-300">Create private automations with cron or webhook triggers per vault.</p>
          </article>
          <article className="card p-4">
            <h2 className="font-semibold">Multimodal Input</h2>
            <p className="mt-2 text-sm text-slate-300">Photo-to-task conversion, OCR, and voice commands inside your isolated vault.</p>
          </article>
          <article className="card p-4">
            <h2 className="font-semibold">Data Sovereignty</h2>
            <p className="mt-2 text-sm text-slate-300">One-click export/reset and transparent audit logs.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-2xl font-semibold">Testimonials</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <blockquote className="card p-4 text-sm">"Feels like my data is mine again." - Remote PM, Portland</blockquote>
          <blockquote className="card p-4 text-sm">"Finally an AI workspace that doesn’t treat privacy as optional." - Indie Creator</blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="card p-5">
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="mt-2 text-slate-300">1 vault, core text features, private history.</p>
          </article>
          <article className="card border border-teal-500/50 p-5">
            <p className="text-xs uppercase tracking-widest text-amber-300">Limited early beta spots</p>
            <h3 className="mt-2 text-xl font-semibold">Premium - $9.99/mo</h3>
            <p className="mt-2 text-slate-300">Unlimited storage, MFA, collaboration, integrations, full multimodal tools.</p>
          </article>
        </div>
      </section>

      <section id="learn-more" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-semibold">How it Works</h2>
        <div className="card mt-4 aspect-video w-full overflow-hidden p-2">
          <iframe
            title="Explainer video"
            className="h-full w-full rounded-lg"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </section>
    </main>
  );
}
