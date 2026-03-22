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

### v1.0.0 (2026-03-22)

- 🎨 博客自定义弹窗可配置首页 Hero 背景图、默认封面等信息，并通过 `/api/blog-settings` 持久化到服务器端。
- 🔎 Hero 卡片内置全站搜索：实时匹配标题/摘要/正文，支持下拉预览与一键跳转。
- 🃏 首页文章卡片加入居中放大 + Hover 动画，移动端/桌面端都获得顺滑的视觉反馈。
- 🧹 清理临时示例文章与日志文件，保持 `content/posts/` 目录整洁。
- 🔐 默认后台密码重置为 `admin123`（通过 `.env.local` 中的 `ADMIN_PASSWORD_HASH` 管理），方便首次部署。

### v0.3.0 (2026-03-22)

- 🔐 加固后台管理：所有 API 统一走 `requireApiAuth`、文件上传/导入限制扩展名和大小、前端 fetch 强制 `credentials: 'same-origin'`。
- 🛡️ 增加 CSP/HSTS 等安全头、率限制和集中日志，详细分析写入 `docs/security-analysis.md`。
- 🧭 理顺 TOTP 并开通管理界面：QR 生成、启用/关闭、登录 OTP 验证、忘记密码可用 OTP 重置。
- 💾 密码机制统一落到 `.env.local` 的 `ADMIN_PASSWORD_HASH` 并记录日志，还新增 `lib/password-utils.ts` 供 API 重用。
- 🎛️ 后台设置面板改为按钮 + 弹窗，支持默认封面 URL，并让新建文章页自动填入本地配置。
- 🧱 首页文章列表加入背景容器 + 统一卡片风格，移动端换行和触控体验全面升级。
- 🕹️ 首页右上角新增归档筛选 + 布局开关，卡片/列表模式可即时切换并记忆到 `localStorage`。
- 📱 移动端列表样式优化：列表模式下自动换行、时间显示在标题下方，适配小屏幕。

### v0.1.0

- 初始版本
- Markdown 渲染 + 分类标签
- 后台管理 (上传/编辑/删除)
