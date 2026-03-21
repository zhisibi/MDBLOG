'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearSession, createSession, isAuthenticated, verifyPassword } from './auth';
import { getAllPosts } from './blog';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

function slugify(value: string) {
  // 如果有值，转换为 URL 友好的英文 slug
  if (value && value.trim()) {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return slug || `post-${Date.now()}`;
  }
  // 无值时使用时间戳
  return `post-${Date.now()}`;
}

function extractFrontmatterValue(source: string, key: string) {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim().replace(/^['\"]|['\"]$/g, '') ?? '';
}

function splitFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: '', body: source };
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function extractTagsValue(frontmatter: string) {
  const blockMatch = frontmatter.match(/^tags:\s*\r?\n((?:\s*-\s*.*\r?\n?)*)/m);
  if (blockMatch?.[1]?.trim()) {
    return blockMatch[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);
  }

  const inlineMatch = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (inlineMatch?.[1]) {
    return inlineMatch[1]
      .split(',')
      .map((tag) => tag.trim().replace(/^['\"]|['\"]$/g, ''))
      .filter(Boolean);
  }

  return [] as string[];
}

function toYamlValue(value: string) {
  if (!value || value === 'null') return 'null';
  if (/[:#\[\]\{\},&*!?|><='"%@`]/.test(value) || /\s{2,}/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function buildMarkdownDocument(fields: {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt: string;
  coverImage: string;
  body: string;
}) {
  const lines = [
    '---',
    `title: ${toYamlValue(fields.title)}`,
    `slug: ${toYamlValue(fields.slug)}`,
    `excerpt: ${toYamlValue(fields.excerpt)}`,
    `category: ${toYamlValue(fields.category || '未分类')}`,
    'tags:',
    ...(fields.tags.length ? fields.tags.map((tag) => `  - ${toYamlValue(tag)}`) : ['  - 默认标签']),
    `status: ${toYamlValue(fields.status || 'draft')}`,
    `published_at: ${toYamlValue(fields.publishedAt || new Date().toISOString())}`,
    `cover_image: ${fields.coverImage ? toYamlValue(fields.coverImage) : 'null'}`,
    '---',
    '',
    fields.body.replace(/^\uFEFF/, '').trimEnd(),
    '',
  ];

  return lines.join('\n');
}

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) {
    redirect('/admin/login');
  }
}

async function ensurePostsDirectory() {
  await fs.mkdir(postsDirectory, { recursive: true });
}

async function revalidateBlogPaths(slug?: string) {
  revalidatePath('/');
  revalidatePath('/categories');
  revalidatePath('/tags');
  revalidatePath('/admin');
  if (slug) {
    revalidatePath(`/posts/${slug}`);
  }
}

export async function loginAction(_: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get('password') || '');

  if (!verifyPassword(password)) {
    return { error: '密码不对。' };
  }

  await createSession();
  redirect('/admin');
}

export async function logoutAction() {
  await clearSession();
  redirect('/admin/login');
}

export async function uploadMarkdownAction(formData: FormData) {
  await requireAuth();
  await ensurePostsDirectory();

  const file = formData.get('file');
  if (!(file instanceof File) || !file.name.endsWith('.md')) {
    throw new Error('请上传 .md 文件');
  }

  const content = await file.text();
  const rawSlug = extractFrontmatterValue(content, 'slug');
  const rawTitle = extractFrontmatterValue(content, 'title');
  const fileName = `${slugify(rawSlug || rawTitle || file.name.replace(/\.md$/i, ''))}.md`;
  const targetPath = path.join(postsDirectory, fileName);

  await fs.writeFile(targetPath, content, 'utf8');
  await revalidateBlogPaths(fileName.replace(/\.md$/i, ''));
}

export async function deletePostAction(formData: FormData) {
  await requireAuth();
  const slug = String(formData.get('slug') || '');
  if (!slug) throw new Error('缺少 slug');

  const posts = await getAllPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) throw new Error('文章不存在');

  const filePath = path.join(postsDirectory, post.fileName);
  await fs.unlink(filePath);

  await revalidateBlogPaths(slug);
}

export async function listAdminPosts() {
  await requireAuth();
  return getAllPosts();
}

export async function downloadPostContent(slug: string) {
  await requireAuth();
  const posts = await getAllPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) throw new Error('文章不存在');
  const content = await fs.readFile(path.join(postsDirectory, post.fileName), 'utf8');
  return {
    filename: post.fileName,
    content,
  };
}

export async function getEditablePost(slug: string) {
  await requireAuth();
  const posts = await getAllPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) throw new Error('文章不存在');
  const content = await fs.readFile(path.join(postsDirectory, post.fileName), 'utf8');
  const { frontmatter, body } = splitFrontmatter(content);

  return {
    title: extractFrontmatterValue(frontmatter, 'title') || slug,
    slug: extractFrontmatterValue(frontmatter, 'slug') || slug,
    excerpt: extractFrontmatterValue(frontmatter, 'excerpt'),
    category: extractFrontmatterValue(frontmatter, 'category'),
    tags: extractTagsValue(frontmatter).join(', '),
    status: extractFrontmatterValue(frontmatter, 'status') || 'draft',
    publishedAt: extractFrontmatterValue(frontmatter, 'published_at'),
    coverImage: extractFrontmatterValue(frontmatter, 'cover_image'),
    body: body.replace(/^\n+/, ''),
  };
}

export async function updatePostAction(formData: FormData): Promise<{ success?: boolean; slug?: string; error?: string }> {
  try {
    await requireAuth();
    await ensurePostsDirectory();

    const originalSlug = String(formData.get('originalSlug') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const slugInput = String(formData.get('slug') || '').trim();
    const excerpt = String(formData.get('excerpt') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const tagsInput = String(formData.get('tags') || '').trim();
    const status = String(formData.get('status') || 'draft').trim();
    const publishedAt = String(formData.get('publishedAt') || '').trim();
    const coverImage = String(formData.get('coverImage') || '').trim();
    const body = String(formData.get('body') || '');

    if (!originalSlug) return { error: '缺少原始 slug' };
    if (!title) return { error: '标题不能为空' };
    if (!body.trim()) return { error: '正文不能为空' };

    const posts = await getAllPosts();
    const existingPost = posts.find((item) => item.slug === originalSlug);
    if (!existingPost) return { error: '文章不存在' };

    const nextSlug = slugify(slugInput || title);
    const tags = tagsInput
      .split(/[，,]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const markdown = buildMarkdownDocument({
      title,
      slug: nextSlug,
      excerpt,
      category,
      tags,
      status,
      publishedAt,
      coverImage,
      body,
    });

    const originalPath = path.join(postsDirectory, existingPost.fileName);
    const nextPath = path.join(postsDirectory, `${nextSlug}.md`);

    if (originalSlug !== nextSlug) {
      await fs.rm(nextPath, { force: true }).catch(() => undefined);
    }

    await fs.writeFile(nextPath, markdown, 'utf8');

    if (originalSlug !== nextSlug) {
      await fs.rm(originalPath, { force: true }).catch(() => undefined);
    }

    await revalidateBlogPaths(originalSlug);
    await revalidateBlogPaths(nextSlug);

    return { success: true, slug: nextSlug };
  } catch (e) {
    return { error: '保存失败' };
  }
}

export async function createPostAction(formData: FormData): Promise<{ success?: boolean; slug?: string; error?: string }> {
  try {
    await requireAuth();
    await ensurePostsDirectory();

    const title = String(formData.get('title') || '').trim();
    const slugInput = String(formData.get('slug') || '').trim();
    const excerpt = String(formData.get('excerpt') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const tagsInput = String(formData.get('tags') || '').trim();
    const status = String(formData.get('status') || 'draft').trim();
    const publishedAt = String(formData.get('publishedAt') || '').trim();
    const coverImage = String(formData.get('coverImage') || '').trim();
    const body = String(formData.get('body') || '');

    if (!title) return { error: '标题不能为空' };
    if (!body.trim()) return { error: '正文不能为空' };

    const nextSlug = slugify(slugInput || title);
    const tags = tagsInput
      .split(/[，,]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const markdown = buildMarkdownDocument({
      title,
      slug: nextSlug,
      excerpt,
      category,
      tags,
      status,
      publishedAt: publishedAt || new Date().toISOString(),
      coverImage,
      body,
    });

    const nextPath = path.join(postsDirectory, `${nextSlug}.md`);

    // 检查是否已存在
    const exists = await fs.stat(nextPath).catch(() => null);
    if (exists) {
      return { error: `文章 "${nextSlug}" 已存在，请更换标题或 slug` };
    }

    await fs.writeFile(nextPath, markdown, 'utf8');
    await revalidateBlogPaths(nextSlug);
    
    return { success: true, slug: nextSlug };
  } catch (e) {
    return { error: '创建失败' };
  }
}
