'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updatePostAction } from '@/lib/admin';
import { MarkdownEditor } from './markdown-editor';

type PostData = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string;
  status: string;
  publishedAt: string;
  coverImage: string;
  body: string;
};

export default function AdminEditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slug, setSlug] = useState('');
  const [post, setPost] = useState<PostData | null>(null);

  useEffect(() => {
    params.then(async (p) => {
      setSlug(p.slug);
      try {
        const res = await fetch(`/api/admin/post/${p.slug}`);
        const data = await res.json();
        setPost(data.post);
      } catch (e) {
        setError('加载文章失败');
      }
      setLoading(false);
    });
  }, [params]);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    const result = await updatePostAction(formData);
    
    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else if (result.success && result.slug) {
      setSuccess('✓ 保存成功！');
      if (result.slug !== slug) {
        router.push(`/admin/edit/${result.slug}`);
      } else {
        setTimeout(() => setSuccess(''), 2000);
      }
      setSaving(false);
    } else {
      setError('✗ 保存失败');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-red-500">文章不存在</div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
      {/* 提示信息 */}
      {success && (
        <div className="mb-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 dark:bg-green-900/30">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 dark:bg-red-900/30">
          {error}
        </div>
      )}

      {/* 紧凑顶部导航 */}
      <div className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="px-2 text-xs text-slate-500 hover:text-slate-700">← 返回</Link>
          <span className="text-slate-300">|</span>
          <Link href={`/posts/${slug}`} target="_blank" className="px-2 text-xs text-slate-500 hover:text-slate-700">预览</Link>
        </div>
        
        {/* 右侧醒目保存按钮 */}
        <button
          onClick={() => {
            const form = document.getElementById('edit-form') as HTMLFormElement;
            handleSubmit(new FormData(form));
          }}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-500 disabled:opacity-60"
        >
          {saving ? '保存中...' : '💾 保存'}
        </button>
      </div>

      {/* 紧凑表单 */}
      <form id="edit-form" className="space-y-2">
        <input type="hidden" name="originalSlug" value={slug} />

        <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
          <input
            name="title"
            defaultValue={post.title}
            placeholder="标题"
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            required
          />
          <input
            name="slug"
            defaultValue={post.slug}
            placeholder="slug"
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <textarea
            name="excerpt"
            defaultValue={post.excerpt}
            placeholder="摘要"
            rows={1}
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 md:col-span-2"
          />
          <input
            name="category"
            defaultValue={post.category}
            placeholder="分类"
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            name="tags"
            defaultValue={post.tags}
            placeholder="标签（逗号分隔）"
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <select
            name="status"
            defaultValue={post.status}
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
          <input
            name="publishedAt"
            defaultValue={post.publishedAt ? post.publishedAt.slice(0, 16) : new Date().toISOString().slice(0, 16)}
            type="datetime-local"
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            name="coverImage"
            defaultValue={post.coverImage}
            placeholder="封面图 URL"
            className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 md:col-span-2"
          />
        </div>

        {/* Markdown 编辑器 */}
        <MarkdownEditor initialValue={post.body} />
      </form>
    </section>
  );
}
