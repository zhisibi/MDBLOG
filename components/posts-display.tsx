'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PostCard } from './post-card';
import type { PostRecord } from '@/lib/types';

const DISPLAY_MODE_KEY = 'mdblog_post_display_mode';

export type DisplayMode = 'card' | 'list';

export function PostsDisplay({ posts, mode }: { posts: PostRecord[]; mode?: DisplayMode }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(mode ?? 'card');

  useEffect(() => {
    if (mode) {
      setDisplayMode(mode);
      return;
    }
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(DISPLAY_MODE_KEY);
    if (stored === 'card' || stored === 'list') {
      setDisplayMode(stored);
    }
    const handler = (event: StorageEvent) => {
      if (event.key === DISPLAY_MODE_KEY && (event.newValue === 'card' || event.newValue === 'list')) {
        setDisplayMode(event.newValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [mode]);

  if (displayMode === 'list') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
        <ul className="space-y-0 divide-y divide-dotted divide-slate-200 dark:divide-slate-800">
          {posts.map((post) => (
            <li key={post.slug}>
              <div className="flex flex-col gap-1.5 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/posts/${post.slug}`}
                  className="font-medium text-slate-900 dark:text-white leading-6 break-words sm:max-w-[70%] sm:truncate"
                >
                  {post.title}
                </Link>
                <span className="text-xs text-slate-400 dark:text-slate-500 sm:ml-4 sm:text-right">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '待定'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
