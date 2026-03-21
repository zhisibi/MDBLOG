'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/' as const, label: '首页' },
  { href: '/categories' as const, label: '分类' },
  { href: '/tags' as const, label: '标签' },
];

export function SiteHeader() {
  const [siteName, setSiteName] = useState('MDBLOG');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('mdblog_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.siteName) {
          setSiteName(parsed.siteName);
        }
      }
    } catch (e) {
      console.error('Failed to read site name', e);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          {siteName || 'MDBLOG'}
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
