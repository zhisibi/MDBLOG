'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogSettings {
  heroTitle: string;
  heroDescription: string;
  heroTextColor: string;
  heroBgColor: string;
  heroBgGradient: string;
  heroBadge: string;
  backgroundImage: string;
}

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

  useEffect(() => {
    const saved = localStorage.getItem('mdblog_settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  return (
    <section
      className="grid min-h-[220px] md:min-h-[240px] md:grid-cols-[2fr_1fr] gap-6 rounded-[1.5rem] bg-gradient-to-br from-[#0f172a] via-[#0c1b43] to-[#07112a] px-5 py-5 shadow-[0_10px_40px_rgba(15,23,42,0.4)]"
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
      <ContentOverview postsCount={postsCount} categoriesCount={categoriesCount} tagsCount={tagsCount} />
    </section>
  );
}

function ContentOverview({ postsCount, categoriesCount, tagsCount }: { postsCount: number; categoriesCount: number; tagsCount: number }) {
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
      <div className="mt-4">
        <input
          type="text"
          placeholder="请输入关键字搜索"
          className="w-full rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs tracking-[0.2em] text-white placeholder-white/60 shadow-[0_5px_15px_rgba(15,23,42,0.3)] focus:border-white focus:bg-white/20 focus:outline-none"
        />
      </div>
    </div>
  );
}
