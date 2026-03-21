'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PostCard } from './post-card';
import type { PostRecord } from '@/lib/types';

const DISPLAY_MODE_KEY = 'mdblog_post_display_mode';

type DisplayMode = 'card' | 'list';

export function PostsDisplay({ posts }: { posts: PostRecord[] }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');

  useEffect(() => {
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
  }, []);

  if (displayMode === 'list') {
    return (
      <ul className="space-y-0 divide-y divide-dotted divide-slate-200 dark:divide-slate-800">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between px-4 py-3 text-sm text-slate-600 transition hover:text-brand-600 dark:text-slate-300"
          >
            <Link
              href={`/posts/${post.slug}`}
              className="truncate font-medium text-slate-900 dark:text-white"
            >
              {post.title}
            </Link>
            <span className="text-xs text-slate-400 dark:text-slate-500">
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
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
