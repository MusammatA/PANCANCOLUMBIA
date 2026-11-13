import type { Metadata } from 'next';
import Link from 'next/link';
import { PageBanner } from '@/components/page-banner';
import { getSiteData } from '@/lib/content';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { signOut } from './actions';
import { LoginFlow } from './login-flow';

export const metadata: Metadata = { title: 'Board Login', robots: { index: false, follow: false } };

export default async function BoardLogin() {
  const { admin } = await getSiteData();

  return (
    <>
      <PageBanner k="login.title">Board Login</PageBanner>
      <section className="login-section">
        {!isSupabaseConfigured ? (
          <div className="login-card">
            <h2>Coming soon</h2>
            <p className="login-lead">Board login hasn’t been switched on yet.</p>
          </div>
        ) : admin ? (
          <div className="login-card">
            <h2>You’re logged in</h2>
            <p className="login-lead">
              Signed in as <strong>{admin.name || admin.email}</strong> ({admin.email}). Open any page and press ✎ next to text to change it, or use the
              buttons to add events and text boxes.
            </p>
            <div className="login-links">
              <Link className="admin-button" href="/">Start editing</Link>
              <Link className="admin-button ghost" href="/admin/">Manage who can log in</Link>
              <form action={signOut}>
                <button type="submit" className="admin-button ghost">Log out</button>
              </form>
            </div>
          </div>
        ) : (
          <LoginFlow />
        )}
      </section>
    </>
  );
}
