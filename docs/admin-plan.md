# 后台管理模块规划

目标功能：

- 管理员登录
- 修改密码
- 上传 Markdown 文件并导入为文章
- 删除文章
- 下载文章为 Markdown 文件

建议实现：

## 1. 鉴权

- Supabase Auth
- 仅管理员账户可访问 `/admin`

## 2. 页面结构

- `/admin/login`
- `/admin`
- `/admin/posts`
- `/admin/settings`

## 3. 核心操作

- 上传 `.md`
  - 读取文件内容
  - 解析 frontmatter（后续可扩展）
  - 写入 `posts`
- 删除文章
  - 删除 `posts`
  - 自动级联清理 `post_tags`
- 下载 `.md`
  - 从数据库读取内容
  - 生成 markdown 文本下载
- 修改密码
  - Supabase Auth 更新用户密码

## 4. 后续增强

- 支持封面图上传
- 支持草稿/发布切换
- 支持编辑器预览
- 支持批量导入文章
