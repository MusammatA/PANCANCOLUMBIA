'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { requestCode, verifyCode } from './actions';

function useSecondsLeft(expiresAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : 0;
}

export function LoginFlow() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const secondsLeft = useSecondsLeft(expiresAt);
  const expired = expiresAt !== null && secondsLeft === 0;

  const sendCode = () =>
    startTransition(async () => {
      setError('');
      setCode('');
      const result = await requestCode(name, email);
      if (!result.ok) return setError(result.error);
      setExpiresAt(result.expiresAt);
    });

  if (expiresAt === null) {
    return (
      <form
        className="login-card admin-form"
        onSubmit={e => {
          e.preventDefault();
          sendCode();
        }}
      >
        <h2>Board member login</h2>
        <p className="login-lead">Enter your name and board email. We’ll email you a one-time code.</p>
        <label className="field">
          <span className="field-label">Your name</span>
          <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required maxLength={80} />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="uni@columbia.edu" />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="admin-button wide" disabled={pending}>{pending ? 'Sending…' : 'Email me a code'}</button>
      </form>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <form
      className="login-card admin-form"
      onSubmit={e => {
        e.preventDefault();
        startTransition(async () => {
          setError('');
          const result = await verifyCode(code);
          if (!result.ok) {
            if (result.expired) setExpiresAt(Date.now());
            return setError(result.error);
          }
          router.push('/');
          router.refresh();
        });
      }}
    >
      <h2>Check your email</h2>
      <p className="login-lead">
        We sent a code to <strong>{email.trim().toLowerCase()}</strong>. Enter it within 2 minutes.
      </p>
      <label className="field">
        <span className="field-label">One-time code</span>
        <input
          className="code-input"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          disabled={expired}
        />
      </label>
      <p className={`countdown${expired ? ' expired' : secondsLeft <= 30 ? ' low' : ''}`} aria-live="polite">
        {expired ? 'This code has expired.' : `Code expires in ${minutes}:${seconds}`}
      </p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {expired ? (
        <button type="button" className="admin-button wide" onClick={sendCode} disabled={pending}>{pending ? 'Sending…' : 'Send a new code'}</button>
      ) : (
        <button type="submit" className="admin-button wide" disabled={pending || code.length < 6}>{pending ? 'Checking…' : 'Log in'}</button>
      )}
      <button
        type="button"
        className="text-button"
        onClick={() => {
          setExpiresAt(null);
          setError('');
        }}
      >
        Use a different email
      </button>
    </form>
  );
}
