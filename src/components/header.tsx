'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/lib/site';
import { ChapterLogo } from './chapter-logo';

export function Header({ siteName, isAdmin = false }: { siteName: string; isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label={`${siteName} home`}>
        <ChapterLogo />
        <span className="wordmark-slot">
          <span className="chapter-name brand-name">{siteName}</span>
        </span>
      </Link>
      <nav aria-label="Main navigation" className="main-nav">
        {navigation.map(({ href, label }) => {
          const active = pathname.replace(/\/$/, '') === href.replace(/\/$/, '');

          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className="nav-link">
              {label}
            </Link>
          );
        })}
      </nav>
      <Link href="/board-login/" className="site-action board-link">
        {isAdmin ? 'Admin' : 'Board Login'}
      </Link>
    </header>
  );
}
