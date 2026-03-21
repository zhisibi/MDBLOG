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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('mdblog_settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  // 构建背景样式
  const getBackgroundStyle = () => {
    const style: React.CSSProperties = {};
    
    if (settings.backgroundImage) {
      style.backgroundImage = `url(${settings.backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    
    return style;
  };

  // 构建渐变类名
  const getGradientClass = () => {
    if (settings.backgroundImage) return '';
    return settings.heroBgGradient || '';
  };

  if (!mounted) {
    return (
      <section className="grid gap-8 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 px-6 py-10 shadow-soft md:grid-cols-[2fr_1fr] md:px-10">
        <div>
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur">
            {defaultSettings.heroBadge}
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl text-white">
            {defaultSettings.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            {defaultSettings.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#latest-posts" className="rounded-full bg-white px-5 py-3 font-semibold text-slate-900">查看最新文章</Link>
            <Link href="/categories" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">浏览分类</Link>
          </div>
        </div>
        <ContentOverview postsCount={postsCount} categoriesCount={categoriesCount} tagsCount={tagsCount} />
      </section>
    );
  }

  return (
    <section
      className={`grid gap-8 rounded-[2rem] px-6 py-10 shadow-soft md:grid-cols-[2fr_1fr] md:px-10 ${getGradientClass()}`}
      style={{ 
        backgroundColor: settings.backgroundImage ? 'rgba(0,0,0,0.6)' : settings.heroBgColor,
        ...getBackgroundStyle()
      }}
    >
      <div>
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur">
          {settings.heroBadge}
        </span>
        <h1 
          className="mt-5 text-4xl font-black tracking-tight sm:text-5xl"
          style={{ color: settings.heroTextColor }}
        >
          {settings.heroTitle}
        </h1>
        <p 
          className="mt-5 max-w-2xl text-base leading-8 sm:text-lg"
          style={{ color: settings.heroTextColor === '#ffffff' ? '#e2e8f0' : settings.heroTextColor }}
        >
          {settings.heroDescription}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#latest-posts" className="rounded-full bg-white px-5 py-3 font-semibold text-slate-900">查看最新文章</Link>
          <Link href="/categories" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">浏览分类</Link>
        </div>
      </div>
      <ContentOverview postsCount={postsCount} categoriesCount={categoriesCount} tagsCount={tagsCount} />
    </section>
  );
}

function ContentOverview({ postsCount, categoriesCount, tagsCount }: { postsCount: number; categoriesCount: number; tagsCount: number }) {
  return (
    <div className="rounded-[1.5rem] bg-white/10 p-6 backdrop-blur">
      <h2 className="text-lg font-bold text-white">内容概览</h2>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl bg-white/10 p-4">
          <dt className="text-slate-300">文章</dt>
          <dd className="mt-2 text-3xl font-black text-white">{postsCount}</dd>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <dt className="text-slate-300">分类</dt>
          <dd className="mt-2 text-3xl font-black text-white">{categoriesCount}</dd>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 col-span-2">
          <dt className="text-slate-300">标签</dt>
          <dd className="mt-2 text-3xl font-black text-white">{tagsCount}</dd>
        </div>
      </dl>
    </div>
  );
}
