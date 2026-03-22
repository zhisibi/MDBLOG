'use client';

import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';
import { slugify } from '@/lib/slugify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPostAction } from '@/lib/admin';
import { MarkdownEditor } from './markdown-editor';

const getCurrentLocalDateTime = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - tzOffset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

const defaultsTemplate = {
  defaultCoverImage: '',
};

export default function AdminNewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [defaults, setDefaults] = useState(() => {
    if (typeof window === 'undefined') return defaultsTemplate;
    try {
      const saved = window.localStorage.getItem('mdblog_settings');
      return saved ? { ...defaultsTemplate, ...JSON.parse(saved) } : defaultsTemplate;
    } catch {
      return defaultsTemplate;
    }
  });
  const [error, setError] = useState('');
  const slugInputRef = useRef<HTMLInputElement>(null);
  const defaultPublishedAt = getCurrentLocalDateTime();
  const defaultSlugValue = useMemo(() => Date.now().toString(), []);
  const rowClass = 'w-full';
  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900';
  const selectClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900';
  const textareaClass = inputClass + ' min-h-[80px] resize-none';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      try {
        const saved = window.localStorage.getItem('mdblog_settings');
        setDefaults(saved ? { ...defaultsTemplate, ...JSON.parse(saved) } : defaultsTemplate);
      } catch {
        setDefaults(defaultsTemplate);
      }
    };
    handler();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError('');

    const result = await createPostAction(formData);
    
    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else if (result.success && result.slug) {
      router.push(`/admin/edit/${result.slug}`);
    } else {
      setError('创建失败，请重试');
      setSaving(false);
    }
  };

  const handlePreviewClick = () => {
    const raw = slugInputRef.current?.value.trim() || defaultSlugValue;
    const slug = slugify(raw);
    if (typeof window !== 'undefined') {
      window.open(`${window.location.origin}/preview/${slug}`, '_blank');
    }
  };

  return (
    <>
      <Head>
        <title>新建文章 - 博客后台管理</title>
      </Head>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="px-2 text-xs text-slate-500 hover:text-slate-700">
            ← 返回
          </Link>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handlePreviewClick}
            className="px-2 text-xs text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
          >
            预览
          </button>
        </div>
        <button
          form="new-post-form"
          type="submit"
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-500 disabled:opacity-60"
        >
          {saving ? '保存中...' : '💾 保存'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <form id="new-post-form" action={handleSubmit} className="space-y-4">
        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
          <div className={rowClass}>
            <input
              name="title"
              placeholder="标题 - 输入文章标题"
              className={inputClass}
              required
            />
          </div>

          <div className={rowClass}>
            <input
              name="slug"
              placeholder="url-path（留空自动生成）"
              className={inputClass}
              defaultValue={defaultSlugValue}
              ref={slugInputRef}
            />
          </div>

          <div className={`${rowClass} md:col-span-2`}>
            <textarea
              name="excerpt"
              placeholder="摘要 - 显示在列表页"
              rows={2}
              className={textareaClass}
            />
          </div>

          <div className={rowClass}>
            <input
              name="category"
              placeholder="分类：如 技术、生活、随笔"
              className={inputClass}
            />
          </div>

          <div className={rowClass}>
            <input
              name="tags"
              placeholder="标签 - 多个标签用逗号分隔"
              className={inputClass}
            />
          </div>

          <div className={rowClass}>
            <select name="status" defaultValue="draft" className={selectClass}>
              <option value="draft">草稿 (draft)</option>
              <option value="published">已发布 (published)</option>
            </select>
          </div>

          <div className={rowClass}>
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={defaultPublishedAt}
              className={inputClass}
            />
          </div>

          <div className={`${rowClass} md:col-span-2`}>
            <input
              name="coverImage"
              placeholder="封面图片 URL（可选）"
              defaultValue={defaults.defaultCoverImage}
              className={inputClass}
            />
          </div>
        </div>

        {/* Markdown 编辑器 */}
        <MarkdownEditor initialValue="" />

        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? '保存中...' : '创建文章'}
          </button>
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            取消
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            提示：Ctrl+S 快速保存，Ctrl+B 加粗，Ctrl+I 斜体
          </p>
        </div>
      </form>
    </section>
    </>
  );
}
