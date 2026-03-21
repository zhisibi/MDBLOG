'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPostAction } from '@/lib/admin';
import { MarkdownEditor } from './markdown-editor';

export default function AdminNewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">
            Admin Editor
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">新建文章</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            支持 Markdown 语法，左侧编辑右侧实时预览。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            返回后台
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">标题</span>
            <input
              name="title"
              placeholder="输入文章标题"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Slug</span>
            <input
              name="slug"
              placeholder="url-path（留空自动生成）"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
            />
          </label>

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">摘要</span>
            <textarea
              name="excerpt"
              placeholder="文章摘要，显示在列表页"
              rows={2}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">分类</span>
            <input
              name="category"
              placeholder="如：技术、生活、随笔"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">标签</span>
            <input
              name="tags"
              placeholder="多个标签用逗号分隔"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">状态</span>
            <select
              name="status"
              defaultValue="draft"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
            >
              <option value="draft">草稿 (draft)</option>
              <option value="published">已发布 (published)</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">发布时间</span>
            <input
              name="publishedAt"
              type="datetime-local"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
            />
          </label>
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
  );
}
