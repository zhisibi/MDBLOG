'use client';

import { useEffect, useMemo, useState } from 'react';
import { PostsDisplay, DisplayMode } from './posts-display';
import type { PostRecord } from '@/lib/types';

const DISPLAY_MODE_KEY = 'mdblog_post_display_mode';

export function HomePostsSection({ posts }: { posts: PostRecord[] }) {
  const archives = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((post) => {
      if (!post.published_at) return;
      const date = new Date(post.published_at);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [posts]);

  const [selectedArchive, setSelectedArchive] = useState('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(DISPLAY_MODE_KEY);
    if (stored === 'card' || stored === 'list') {
      setDisplayMode(stored);
    }
    const handler = (event: StorageEvent) => {
      if (event.key === DISPLAY_MODE_KEY && (event.newValue === 'card' || event.newValue === 'list')) {
        setDisplayMode(event.newValue as DisplayMode);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedArchive === 'all') return posts;
    return posts.filter((post) => {
      if (!post.published_at) return false;
      const date = new Date(post.published_at);
      if (Number.isNaN(date.getTime())) return false;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedArchive;
    });
  }, [posts, selectedArchive]);

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISPLAY_MODE_KEY, mode);
    }
  };

  return (
    <section id="latest-posts" className="mt-12">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-200 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="archive-month" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">归档</label>
            <select
              id="archive-month"
              value={selectedArchive}
              onChange={(event) => setSelectedArchive(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-brand-500 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">全部（{posts.length} 篇）</option>
              {archives.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">布局</span>
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {(['card', 'list'] as const).map((modeOption) => (
                <button
                  key={modeOption}
                  type="button"
                  onClick={() => handleDisplayModeChange(modeOption)}
                  aria-pressed={displayMode === modeOption}
                  className={`rounded-full px-3 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                    displayMode === modeOption ? 'bg-brand-600 text-white shadow' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {modeOption === 'card' ? '卡片' : '列表'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredPosts.length ? (
        <PostsDisplay posts={filteredPosts} mode={displayMode} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 py-12 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
          暂无符合条件的文章
        </div>
      )}
    </section>
  );
}
