import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageBanner } from '@/components/page-banner';
import { getSiteData } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import { AdminList } from './admin-list';

export const metadata: Metadata = { title: 'Manage Admins', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const { admin } = await getSiteData();
  if (!admin) redirect('/board-login/');

  const supabase = await createClient();
  const { data } = await supabase.from('admins').select('email, name').order('name');

  return (
    <>
      <PageBanner>Who Can Log In</PageBanner>
      <section className="login-section">
        <p className="admin-intro">Only these emails can get a login code. Anyone on this list can edit the website.</p>
        <AdminList admins={data ?? []} me={admin.email.toLowerCase()} />
      </section>
    </>
  );
}
