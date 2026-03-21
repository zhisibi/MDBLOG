# MDBLOG 部署与搭建说明

这份文档专门说明如何把 `MDBLOG` 从本地项目搭起来，并部署上线。

## 一、技术栈

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Markdown 内容渲染

## 二、本地开发环境要求

建议版本：

- Node.js 20+
- npm 10+

检查版本：

```bash
node -v
npm -v
```

## 三、项目初始化

进入项目目录：

```bash
cd C:\Users\Administrator\.openclaw\workspace\MDBLOG
```

安装依赖：

```bash
npm install
```

## 四、配置环境变量

复制模板文件：

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

### macOS / Linux

```bash
cp .env.example .env.local
```

然后编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

说明：

- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目地址
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：前台公开访问用 key
- `SUPABASE_SERVICE_ROLE_KEY`：后台管理功能会用到，不能泄露到前端

## 五、Supabase 数据库初始化

1. 登录 Supabase 控制台
2. 进入你的项目
3. 打开 **SQL Editor**
4. 执行文件：`supabase/schema.sql`

这个 SQL 会创建：

- `categories`
- `tags`
- `posts`
- `post_tags`
- 公开读取策略
- 示例分类 / 标签 / 文章

执行完后，首页应该就能看到示例文章。

## 六、本地启动

开发模式：

```bash
npm run dev
```

打开浏览器：

<http://localhost:3000>

生产构建测试：

```bash
npm run build
npm run start
```

## 七、部署到 Vercel

这是最省心的方案。

### 步骤 1：上传代码到 GitHub

在 `MDBLOG` 目录执行：

```bash
git init
git add .
git commit -m "init mdblog"
```

然后推送到你的 GitHub 仓库。

### 步骤 2：导入到 Vercel

1. 登录 Vercel
2. 点击 **Add New Project**
3. 选择 GitHub 仓库 `MDBLOG`
4. 导入项目

### 步骤 3：配置环境变量

在 Vercel 项目设置里添加：

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 步骤 4：部署

点击 Deploy 即可。

部署成功后，你会拿到线上地址，例如：

```text
https://your-project.vercel.app
```

## 八、部署到自己的服务器

如果你有自己的 Windows / Linux 服务器，也可以直接部署。

### 1）安装依赖并构建

```bash
npm install
npm run build
```

### 2）启动生产服务

```bash
npm run start
```

默认端口一般为：

```text
3000
```

### 3）反向代理

建议配一个反向代理：

- Nginx
- Caddy
- 宝塔面板反代

把域名转发到：

```text
http://127.0.0.1:3000
```

## 九、后台管理功能部署注意事项

你现在要求补的后台管理包括：

- 登录
- 修改密码
- 上传 `.md` 文件
- 删除文章
- 下载文章为 `.md`

这部分建议这样做：

- 使用 **Supabase Auth** 做管理员登录
- 使用 **Server Actions / Route Handlers** 处理上传与删除
- 服务端使用 `SUPABASE_SERVICE_ROLE_KEY`
- 前端绝不暴露 service role key

## 十、常见问题

### 1. 首页没有文章

原因一般有三个：

- `.env.local` 没配好
- `schema.sql` 没执行
- `posts.status` 不是 `published`

### 2. 页面能打开，但分类/标签为空

检查：

- `categories` / `tags` 表是否有数据
- `post_tags` 是否建立了关联

### 3. 生产环境报 Supabase 环境变量缺失

检查部署平台环境变量是否已经配置，并重新部署。

## 十一、推荐上线顺序

建议你按这个顺序来：

1. 完成本地开发
2. 执行 Supabase SQL
3. 本地验证首页/详情页/分类页/标签页
4. 补齐后台管理
5. 再部署到 Vercel
6. 最后绑定自定义域名

## 十二、当前状态

目前已经完成：

- 前台博客系统骨架
- Markdown 渲染
- 分类与标签展示
- 响应式页面
- Supabase schema
- README 基础说明

正在补：

- 后台登录管理
- 上传/删除/下载 MD
- 修改密码

如果你要，我下一步直接把 **/admin 管理后台** 整套页面和表单逻辑继续接上。