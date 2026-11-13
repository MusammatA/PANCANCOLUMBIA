import Link from 'next/link';
import { signOut } from '@/app/board-login/actions';
import type { Admin } from '@/lib/content';

export function AdminBar({ admin }: { admin: Admin }) {
  return (
    <div className="admin-bar" role="region" aria-label="Editing tools">
      <span className="admin-bar-mode">Editing mode</span>
      <span className="admin-bar-who">{admin.name || admin.email}</span>
      <Link href="/admin/">Admins</Link>
      <form action={signOut}>
        <button type="submit">Log out</button>
      </form>
    </div>
  );
}
