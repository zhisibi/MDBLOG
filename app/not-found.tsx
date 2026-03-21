import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">404</p>
      <h1 className="mt-4 text-4xl font-black text-slate-900 dark:text-white">页面不存在</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">可能文章还没发布，或者链接已经变了。</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        返回首页
      </Link>
    </div>
  );
}
