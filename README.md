# MDBLOG

一个现代的个人博客系统，使用 **Next.js 15 + Tailwind CSS + Markdown** 构建，支持：

- ✅ Markdown 文章发布与自动渲染
- ✅ 分类与标签系统
- ✅ 响应式设计，移动端友好
- ✅ **暗黑模式** — 护眼夜间主题，自动跟随系统
- ✅ **代码语法高亮** — Shiki 高亮，支持 100+ 语言
- ✅ **文章目录 TOC** — 长文章侧边导航
- ✅ **SEO 优化** — Sitemap + RSS + Open Graph
- ✅ **阅读时间统计** — 自动估算文章阅读时长

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 15 | React 框架 (App Router) |
| Tailwind CSS | 原子化 CSS |
| Shiki | 代码语法高亮 |
| React Markdown | Markdown 渲染 |
| TypeScript | 类型安全 |

## 项目结构

```bash
MDBLOG/
├─ app/                 # Next.js App Router 页面
│  ├─ admin/            # 后台管理
│  ├─ categories/       # 分类页面
│  ├─ posts/            # 文章详情页
│  ├─ tags/             # 标签页面
│  ├─ sitemap.ts        # SEO 站点地图
│  ├─ robots.ts         # 爬虫规则
│  └─ rss.xml/          # RSS 订阅源
├─ components/          # 通用组件
│  ├─ theme-toggle.tsx  # 暗黑模式切换
│  ├─ toc.tsx           # 文章目录
│  └─ markdown-renderer.tsx
├─ content/posts/       # Markdown 文章存储
├─ lib/                 # 数据访问逻辑
└─ README.md
```

## 本地启动

### 安装依赖

```bash
npm install
```

### 运行开发环境

```bash
npm run dev
```

浏览器打开：<http://localhost:3000>

## 如何发布文章

在 `content/posts/` 目录下创建 `.md` 文件：

```markdown
---
title: 我的第一篇博客
slug: my-first-post
excerpt: 这是文章摘要
category: 技术
tags:
  - Next.js
  - 教程
status: published
published_at: 2026-03-21T10:00:00+08:00
cover_image: null
---

# 我的第一篇博客

正文内容支持 **Markdown** 语法。

## 代码高亮

\`\`\`typescript
const greeting = (name: string) => {
  console.log(`Hello, ${name}!`);
};
\`\`\`
```

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 首页，展示最新文章 |
| `/posts/[slug]` | 文章详情页 |
| `/categories` | 分类列表 |
| `/categories/[slug]` | 分类详情 |
| `/tags` | 标签列表 |
| `/tags/[slug]` | 标签详情 |
| `/admin` | 后台管理 |
| `/sitemap.xml` | SEO 站点地图 |
| `/rss.xml` | RSS 订阅源 |

## 环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_PASSWORD=your-admin-password
ADMIN_PASSWORD_HASH=your-hashed-password  # 可选，优先使用
```

## 部署

推荐部署到 **Vercel**：

1. 上传代码到 GitHub
2. 在 Vercel 导入仓库
3. 配置环境变量
4. 点击 Deploy

---

## 更新日志

### v0.2.0 (2026-03-21)

- ✨ 新增暗黑模式，支持跟随系统
- ✨ 新增 Shiki 代码语法高亮
- ✨ 新增文章目录 TOC 侧边导航
- ✨ 新增 SEO 优化 (Sitemap + RSS + Open Graph)
- ✨ 新增阅读时间统计
- 🎨 优化所有页面的暗黑模式适配

### v0.1.0

- 初始版本
- Markdown 渲染 + 分类标签
- 后台管理 (上传/编辑/删除)
