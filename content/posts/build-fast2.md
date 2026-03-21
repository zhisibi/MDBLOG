---
title: 快速启动这套博客
slug: build-fast2
excerpt: 这篇文章用来验证首页、分类页、标签页和详情页都能正常渲染。
category: 使用说明
tags:
  - 教程
  - 快速开始
status: published
published_at: 2026-03-20T23:45:00+08:00
cover_image: http://cdn-hsyq-static.shanhutech.cn/bizhi/staticwp/202407/1ba2ea02f937db1ef2286497bf5991f2--4197277926.jpg
---

# 快速启动这套博客

把项目依赖装好后，直接运行：

```bash
npm install
npm run dev
```

然后访问 `http://localhost:3000`。

## 文章组织方式

每篇文章就是 `content/posts` 目录下的一个 `.md` 文件。

你可以在文件头写 frontmatter：

```yaml
---
title: 文章标题
slug: article-slug
excerpt: 一段摘要
category: 分类名
tags: [标签1, 标签2]
status: published
published_at: 2026-03-20T23:45:00+08:00
---
```

正文直接写 Markdown 就行。
