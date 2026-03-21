import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} MDBLOG. Powered by Next.js + Tailwind CSS.
          </p>
          <nav className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <Link href="/rss.xml" className="transition hover:text-slate-900 dark:hover:text-white">
              RSS
            </Link>
            <Link href="/sitemap.xml" className="transition hover:text-slate-900 dark:hover:text-white">
              Sitemap
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-slate-900 dark:hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
