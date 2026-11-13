import type { Metadata } from 'next';
import Link from 'next/link';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import './globals.css';
import './blocks.css';
import './admin.css';
import { AdminBar } from '@/components/admin-bar';
import { Header } from '@/components/header';
import { getSiteData, getText } from '@/lib/content';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: 'A Columbia community coming together for pancreatic cancer awareness, advocacy, and action.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ admin }, siteName] = await Promise.all([getSiteData(), getText('site.name', site.name)]);

  return (
    <html lang="en">
      <body className={admin ? 'admin-mode' : undefined}>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header siteName={siteName} isAdmin={Boolean(admin)} />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <Link href="/" className="chapter-name footer-brand">{siteName}</Link>
        </footer>
        {admin && <AdminBar admin={admin} />}
      </body>
    </html>
  );
}
