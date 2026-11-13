'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { addAdmin, removeAdmin } from './actions';

export function AdminList({ admins, me }: { admins: { email: string; name: string }[]; me: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <div className="admin-panel">
      <ul className="admin-people">
        {admins.map(admin => (
          <li key={admin.email}>
            <span>
              <strong>{admin.name || '—'}</strong>
              <small>{admin.email}</small>
            </span>
            {admin.email === me ? (
              <em>You</em>
            ) : (
              <button
                type="button"
                className="admin-button ghost small"
                disabled={pending}
                onClick={() =>
                  confirm(`Remove ${admin.email}? They won’t be able to log in anymore.`) &&
                  startTransition(async () => {
                    const result = await removeAdmin(admin.email);
                    if (!result.ok) setError(result.error);
                    router.refresh();
                  })
                }
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      <form
        className="admin-form add-person"
        onSubmit={e => {
          e.preventDefault();
          startTransition(async () => {
            setError('');
            const result = await addAdmin(name, email);
            if (!result.ok) return setError(result.error);
            setName('');
            setEmail('');
            router.refresh();
          });
        }}
      >
        <h3>Add a board member</h3>
        <div className="field-row">
          <label className="field">
            <span className="field-label">Name</span>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={80} />
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="admin-button" disabled={pending}>{pending ? 'Saving…' : 'Add'}</button>
        </div>
      </form>
    </div>
  );
}
