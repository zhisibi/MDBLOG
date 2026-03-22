'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogSettings {
  heroTitle: string;
  heroDescription: string;
  heroTextColor: string;
  heroBgColor: string;
  heroBgGradient: string;
  heroBadge: string;
  backgroundImage: string;
}

type SearchResult = {
  slug: string;
  title: string;
  snippet: string;
  published_at: string | null;
};

const defaultSettings: BlogSettings = {
  heroTitle: '一个简洁、现代、移动端友好的个人博客系统',
  heroDescription: '支持使用 Markdown 发布文章，自动渲染为完整网页，同时具备分类、标签、文章详情和归档浏览能力。',
  heroTextColor: '#ffffff',
  heroBgColor: '#0f172a',
  heroBgGradient: 'from-slate-900 via-slate-800 to-brand-900',
  heroBadge: 'Markdown · 响应式 · 暗黑模式',
  backgroundImage: '',
};

interface HeroSectionProps {
  postsCount: number;
  categoriesCount: number;
  tagsCount: number;
}

export function HeroSection({ postsCount, categoriesCount, tagsCount }: HeroSectionProps) {
  const [settings, setSettings] = useState<BlogSettings>(defaultSettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const applyLocal = () => {
      try {
        const saved = window.localStorage.getItem('mdblog_settings');
        if (saved) {
          setSettings({ ...defaultSettings, ...JSON.parse(saved) });
        }
      } catch (error) {
        console.error('Failed to parse local settings', error);
      }
    };

    applyLocal();

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/blog-settings', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const merged = { ...defaultSettings, ...(data?.settings ?? {}) };
        window.localStorage.setItem('mdblog_settings', JSON.stringify(merged));
        setSettings(merged);
      } catch (error) {
        console.error('Failed to fetch blog settings', error);
      }
    };

    fetchSettings();

    const handler = () => applyLocal();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || '搜索失败');
        }
        const data = await res.json();
        setSearchResults(data?.results ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        setSearchResults([]);
        setSearchError(error instanceof Error ? error.message : '搜索失败');
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const heroStyle = useMemo(() => {
    if (!settings.backgroundImage) {
      return {} as CSSProperties;
    }
    return {
      backgroundImage: `linear-gradient(135deg, rgba(7,15,42,0.92), rgba(6,14,43,0.75)), url(${settings.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } as CSSProperties;
  }, [settings.backgroundImage]);

  const navigateToSlug = (slug: string) => {
    router.push(`/posts/${slug}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchSubmit = () => {
    if (searchResults[0]) {
      navigateToSlug(searchResults[0].slug);
    }
  };

  return (
    <section
      style={heroStyle}
      className="relative grid min-h-[220px] md:min-h-[240px] md:grid-cols-[2fr_1fr] gap-6 rounded-[1.5rem] bg-gradient-to-br from-[#0f172a] via-[#0c1b43] to-[#07112a] px-5 py-5 shadow-[0_10px_40px_rgba(15,23,42,0.4)]"
    >
      <div className="flex flex-col justify-between">
        <div>
          <span className="inline-flex rounded-[999px] border border-white/30 bg-white/10 px-3 py-0.5 text-[11px] tracking-[0.3em] text-white/80">
            {settings.heroBadge}
          </span>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            {settings.heroDescription}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="#latest-posts"
            className="flex h-10 min-w-[140px] items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_20px_rgba(15,23,42,0.3)] transition hover:-translate-y-0.5"
          >
            查看最新文章
          </Link>
          <Link
            href="/categories"
            className="flex h-10 min-w-[140px] items-center justify-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white/90 transition hover:border-white hover:text-white"
          >
            浏览分类
          </Link>
        </div>
      </div>
      <ContentOverview
        postsCount={postsCount}
        categoriesCount={categoriesCount}
        tagsCount={tagsCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        searchResults={searchResults}
        searchLoading={searchLoading}
        searchError={searchError}
        onNavigate={navigateToSlug}
      />
    </section>
  );
}

function ContentOverview({
  postsCount,
  categoriesCount,
  tagsCount,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchResults,
  searchLoading,
  searchError,
  onNavigate,
}: {
  postsCount: number;
  categoriesCount: number;
  tagsCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchResults: SearchResult[];
  searchLoading: boolean;
  searchError: string;
  onNavigate: (slug: string) => void;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <div className="rounded-[1.25rem] bg-white/10 p-3 backdrop-blur flex flex-col justify-center gap-3">
      <dl className="grid grid-cols-2 gap-8 text-[11px] place-content-center">
        <div className="rounded-2xl bg-white/10 p-2 flex flex-col justify-between">
          <dt className="text-white/70 text-[10px]">文章</dt>
          <dd className="mt-1 text-lg font-black text-white">{postsCount}</dd>
        </div>
        <div className="rounded-2xl bg-white/10 p-2 flex flex-col justify-between">
          <dt className="text-white/70 text-[10px]">分类</dt>
          <dd className="mt-1 text-lg font-black text-white">{categoriesCount}</dd>
        </div>
        <div className="rounded-2xl bg-white/10 p-2 col-span-2 flex flex-col justify-between pt-3">
          <dt className="text-white/70 text-[10px]">标签</dt>
          <dd className="mt-1 text-lg font-black text-white">{tagsCount}</dd>
        </div>
      </dl>
      <form className="relative mt-4" onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="输入关键字，全站搜索"
          className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/60 shadow-[0_5px_15px_rgba(15,23,42,0.3)] focus:border-white focus:bg-white/20 focus:outline-none"
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="rounded-full px-2 py-1 text-xs text-white/60 transition hover:text-white"
            >
              清空
            </button>
          )}
          <button
            type="submit"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 text-sm font-semibold shadow"
          >
            ↵
          </button>
        </div>
        {searchQuery && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-white/20 bg-slate-950/70 p-3 text-xs text-white shadow-2xl backdrop-blur">
            {searchLoading ? (
              <p className="py-2 text-center text-white/70">搜索中...</p>
            ) : searchError ? (
              <p className="py-2 text-center text-rose-200">{searchError}</p>
            ) : searchResults.length === 0 ? (
              <p className="py-2 text-center text-white/60">暂无匹配结果</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <li key={result.slug}>
                    <button
                      type="button"
                      onClick={() => onNavigate(result.slug)}
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-left text-white transition hover:bg-white/10"
                    >
                      <p className="text-sm font-semibold text-white/90">{result.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] text-white/70">{result.snippet}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
