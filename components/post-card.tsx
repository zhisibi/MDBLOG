import Link from 'next/link';
import type { PostRecord } from '@/lib/types';
import { formatDate, estimateReadTime } from '@/lib/utils';

export function PostCard({ post }: { post: PostRecord }) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{formatDate(post.published_at)}</span>
        <span>·</span>
        <span>{estimateReadTime(post.content)} 分钟</span>
        {post.category ? (
          <Link
            href={`/categories/${post.category.slug}`}
            className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-600 dark:bg-brand-950 dark:text-brand-400"
          >
            {post.category.name}
          </Link>
        ) : null}
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        <Link
          href={`/posts/${post.slug}`}
          className="transition group-hover:text-brand-600 dark:group-hover:text-brand-400"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{post.excerpt}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-brand-200 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-700 dark:hover:text-brand-400"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}
