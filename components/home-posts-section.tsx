'use client';

import { useMemo, useState } from 'react';
import { PostsDisplay } from './posts-display';
import type { PostRecord } from '@/lib/types';

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

  return (
    <section id="latest-posts" className="mt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            最新文章
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            支持 Markdown 自动渲染与结构化内容组织。
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <label htmlFor="archive-month" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            归档
          </label>
          <select
            id="archive-month"
            value={selectedArchive}
            onChange={(event) => setSelectedArchive(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="all">全部（{posts.length} 篇）</option>
            {archives.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredPosts.length ? (
        <PostsDisplay posts={filteredPosts} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 py-12 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
          暂无符合条件的文章
        </div>
      )}
    </section>
  );
}
