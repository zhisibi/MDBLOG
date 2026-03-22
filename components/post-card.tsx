import Link from 'next/link';
import type { PostRecord } from '@/lib/types';

export function PostCard({ post }: { post: PostRecord }) {
  const hasCover = Boolean(post.cover_image);

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-0 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="relative mb-4 h-56 overflow-hidden rounded-3xl border-b border-slate-200 bg-slate-900 dark:border-slate-800">
        {hasCover ? (
          <img
            src={post.cover_image || ''}
            alt={`${post.title} 封面`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-6">
          <Link
            href={`/posts/${post.slug}`}
            className="text-3xl font-black leading-tight text-white drop-shadow-lg transition group-hover:text-brand-200"
          >
            {post.title}
          </Link>
        </div>
      </div>

      <div className="px-6 pb-2.5">
        <div className="flex flex-wrap gap-1">
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
      </div>
    </article>
  );
}
