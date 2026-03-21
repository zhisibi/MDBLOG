'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/lib/admin';
import { DeleteButton } from './delete-button';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  status: string;
  published_at: string;
  category: { name: string } | null;
  tags: { name: string; slug: string }[];
}

// 博客设置
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

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<BlogSettings>(defaultSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
    
    const timer = setTimeout(() => {
      fetchPosts();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch('/api/admin/posts', { 
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error('Failed to fetch posts:', e);
      setPosts([]);
    }
    setLoading(false);
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('mdblog_settings');
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const saveSettings = () => {
    setSavingSettings(true);
    try {
      localStorage.setItem('mdblog_settings', JSON.stringify(settings));
      
      if (newPassword) {
        setMessage({ type: 'success', text: '设置已保存！密码修改需在服务器环境变量中设置 ADMIN_PASSWORD' });
      } else {
        setMessage({ type: 'success', text: '设置已保存！' });
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setSavingSettings(false);
    } catch (e) {
      setMessage({ type: 'error', text: '保存失败' });
      setSavingSettings(false);
    }
  };

  // 上传文件
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchPosts();
        setMessage({ type: 'success', text: '上传成功！' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '上传失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '上传失败' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 下载备份
  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) throw new Error('下载失败');
      const data = await res.blob();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mdblog-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: '导出成功！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: '导出失败' });
    }
  };

  // 导入恢复
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchPosts();
        setMessage({ type: 'success', text: '导入成功！' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '导入失败' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: '导入失败' });
    }
    e.target.value = '';
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8" style={{ fontSize: '125%' }}>
      {/* 提示信息 */}
      {message.text && (
        <div className={`mb-3 rounded-lg px-4 py-2 text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-600 dark:bg-green-900/30' 
            : 'bg-red-50 text-red-600 dark:bg-red-900/30'
        }`}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* 主要内容区：左侧文章列表 + 右侧设置 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 左侧：文章列表（占2栏） */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">📝 文章列表</h2>
              <span className="text-xs text-slate-400">{posts.length} 篇</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">加载中...</div>
            ) : posts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">暂无文章</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {posts.map((post) => (
                  <div
                    key={post.slug}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {/* 标题、分类、时间 - 可点击跳转编辑 */}
                    <Link href={`/admin/edit/${post.slug}`} className="min-w-0 flex-1 hover:opacity-80">
                      <div className="flex items-center gap-2">
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          }`}
                        >
                          {post.status === 'published' ? '已发布' : '草稿'}
                        </span>
                        <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                          {post.title}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <span>{post.category?.name ?? '未分类'}</span>
                        <span>·</span>
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN') : ''}</span>
                      </div>
                    </Link>

                    {/* 操作按钮 */}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <a
                        href={`/api/admin/download/${post.slug}`}
                        className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="下载"
                      >
                        ⬇
                      </a>
                      <Link
                        href={`/admin/edit/${post.slug}`}
                        className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="编辑"
                      >
                        ✏
                      </Link>
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="预览"
                      >
                        👁
                      </Link>
                      <DeleteButton slug={post.slug} onDeleted={() => fetchPosts()} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：后台管理 + 文件管理 + 博客设置 */}
        <div className="space-y-3">
          {/* 后台管理卡片 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-center text-base font-bold text-slate-900 dark:text-white">⚙️ 后台管理</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/admin/new"
                className="flex h-9 min-w-[100px] items-center justify-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                ✏️ 新建
              </Link>
              <Link
                href="/"
                className="flex h-9 min-w-[100px] items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                返回前台
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex h-9 min-w-[100px] items-center justify-center rounded-full bg-slate-800 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  退出登录
                </button>
              </form>
            </div>
          </div>

          {/* 文件管理卡片 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-center text-base font-bold text-slate-900 dark:text-white">📁 文件管理</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label className="flex h-9 min-w-[100px] cursor-pointer items-center justify-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500">
                ⬆ 上传
                <input ref={fileInputRef} type="file" accept=".md,text/markdown" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={handleDownloadBackup}
                className="flex h-9 min-w-[100px] items-center justify-center rounded-full border border-slate-200 bg-green-50 px-4 text-sm font-semibold text-green-600 transition hover:bg-green-100 dark:border-slate-700 dark:bg-green-900/30 dark:text-green-500"
              >
                📥 导出
              </button>
              <label className="flex h-9 min-w-[100px] cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-orange-50 px-4 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 dark:border-slate-700 dark:bg-orange-900/30 dark:text-orange-500">
                📤 导入
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* 博客设置卡片 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-center text-base font-bold text-slate-900 dark:text-white">🎨 博客设置</h2>

            <div className="space-y-3">
              {/* 修改密码 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">🔐 密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="新密码"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* 博客特色 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">🏷️ 特色</label>
                <input
                  type="text"
                  value={settings.heroBadge}
                  onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* 首页标题 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">📌 标题</label>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* 首页描述 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">📝 描述</label>
                <textarea
                  value={settings.heroDescription}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* 背景图片 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">🖼️ 背景图</label>
                <input
                  type="text"
                  value={settings.backgroundImage}
                  onChange={(e) => setSettings({ ...settings, backgroundImage: e.target.value })}
                  placeholder="图片 URL"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* 颜色设置 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">🎨 标题色</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={settings.heroTextColor}
                      onChange={(e) => setSettings({ ...settings, heroTextColor: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={settings.heroTextColor}
                      onChange={(e) => setSettings({ ...settings, heroTextColor: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">🎨 背景色</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={settings.heroBgColor}
                      onChange={(e) => setSettings({ ...settings, heroBgColor: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={settings.heroBgColor}
                      onChange={(e) => setSettings({ ...settings, heroBgColor: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 渐变风格 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">🌈 渐变</label>
                <select
                  value={settings.heroBgGradient}
                  onChange={(e) => setSettings({ ...settings, heroBgGradient: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="from-slate-900 via-slate-800 to-brand-900">深蓝渐变</option>
                  <option value="from-gray-900 via-gray-800 to-gray-900">纯灰渐变</option>
                  <option value="from-slate-900 via-purple-900 to-slate-900">紫色渐变</option>
                  <option value="from-slate-900 via-emerald-900 to-slate-900">绿色渐变</option>
                  <option value="from-slate-900 via-rose-900 to-slate-900">玫瑰渐变</option>
                  <option value="from-blue-900 via-indigo-900 to-purple-900">蓝色渐变</option>
                  <option value="">无渐变</option>
                </select>
              </div>

              {/* 保存按钮 */}
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="w-full rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
              >
                {savingSettings ? '保存中...' : '💾 保存设置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
