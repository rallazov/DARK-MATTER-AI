import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { fetchCsrfToken, requestMagicLink, verifyMagicLink } from '../slices/authSlice';

const schema = z.object({
  email: z.string().email('Valid email required')
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(fetchCsrfToken());

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const urlError = params.get('error');
    if (urlError) {
      const messages = {
        oauth_not_configured: 'Google and GitHub sign-in require real OAuth credentials. Use the magic link below instead.',
        oauth_failed: 'OAuth sign-in failed. Please try the magic link instead.'
      };
      setError(messages[urlError] || urlError);
    }
    if (token) {
      dispatch(verifyMagicLink(token))
        .unwrap()
        .then(() => {
          window.location.href = '/onboarding';
        })
        .catch((err) => setError(err.message));
    }
  }, [dispatch]);

  const onSubmit = (data) => {
    setMessage('');
    setError('');
    setDevLink(null);
    dispatch(requestMagicLink(data.email))
      .unwrap()
      .then((res) => {
        setMessage('Magic link sent. Check your inbox.');
        if (res.devMagicLink) {
          setDevLink(res.devMagicLink);
        }
      })
      .catch((err) => setError(`Oops, let's try that again. ${err.message}`));
  };

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold">Secure Sign In</h1>
      <p className="mt-2 text-slate-300">Choose OAuth for speed, or use magic link fallback.</p>

      <div className="mt-6 grid gap-3">
        <a className="btn-primary text-center" href="/api/auth/oauth/google">
          Continue with Google
        </a>
        <a className="btn-secondary text-center" href="/api/auth/oauth/github">
          Continue with GitHub
        </a>
      </div>

      <div className="my-6 text-center text-sm text-slate-400">or magic link</div>

      <form className="card space-y-3 p-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            {...register('email')}
            type="email"
            placeholder="you@company.com"
          />
        </label>
        {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {devLink ? (
          <p className="text-sm text-slate-400">
            Dev mode: <a className="text-cyan-400 underline" href={devLink}>Click here to sign in</a>
          </p>
        ) : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button className="btn-primary" type="submit">
          Send Magic Link
        </button>
      </form>
    </main>
  );
}
