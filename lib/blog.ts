import { cache } from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import type { Category, PostRecord, Tag } from './types';
import { slugify } from './slugify';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

type Frontmatter = {
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  published_at?: string | null;
  cover_image?: string | null;
};

function normalizeField(value?: string | null) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return '';
  return trimmed;
}

function slugify(value: string) {
  if (value && value.trim()) {
    const slug = value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\p{L}\p{N}-]+/gu, '-')
      .replace(/^-+|-+$/g, '');
    if (slug) {
      return slug;
    }
  }
  return `post-${Date.now()}`;
}

function parseFrontmatter(source: string): { frontmatter: Frontmatter; content: string } {
  const normalized = source.replace(/^\uFEFF/, '');

  if (!normalized.startsWith('---\n')) {
    return { frontmatter: {}, content: normalized.trim() };
  }

  const endIndex = normalized.indexOf('\n---\n', 4);

  if (endIndex === -1) {
    return { frontmatter: {}, content: normalized.trim() };
  }

  const rawFrontmatter = normalized.slice(4, endIndex).trim();
  const content = normalized.slice(endIndex + 5).trim();
  const frontmatter: Frontmatter = {};
  let currentArrayKey: keyof Frontmatter | null = null;

  for (const rawLine of rawFrontmatter.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) continue;

    if (line.startsWith('- ') && currentArrayKey === 'tags') {
      frontmatter.tags ??= [];
      frontmatter.tags.push(line.slice(2).trim().replace(/^['\"]|['\"]$/g, ''));
      continue;
    }

    currentArrayKey = null;
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim() as keyof Frontmatter;
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (key === 'tags') {
      currentArrayKey = 'tags';
      if (!rawValue) {
        frontmatter.tags = [];
        continue;
      }

      frontmatter.tags = rawValue
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ''))
        .filter(Boolean);
      continue;
    }

    const cleanedValue = rawValue.replace(/^['\"]|['\"]$/g, '');

    if (key === 'published_at' && cleanedValue.toLowerCase() === 'null') {
      frontmatter.published_at = null;
      continue;
    }

    if (key === 'cover_image' && cleanedValue.toLowerCase() === 'null') {
      frontmatter.cover_image = null;
      continue;
    }

    if (key === 'status') {
      frontmatter.status = cleanedValue === 'draft' ? 'draft' : 'published';
      continue;
    }

    (frontmatter as Record<string, unknown>)[key] = cleanedValue;
  }

  return { frontmatter, content };
}

async function ensurePostsDirectory() {
  await fs.mkdir(postsDirectory, { recursive: true });
}

async function readPostFiles() {
  await ensurePostsDirectory();
  const entries = await fs.readdir(postsDirectory, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'));
}

function normalizePost(fileName: string, source: string): PostRecord {
  const { frontmatter, content } = parseFrontmatter(source);
  const fileSlug = fileName.replace(/\.md$/i, '');
  const title = normalizeField(frontmatter.title) || fileSlug;
  const slug = slugify(normalizeField(frontmatter.slug) || fileSlug);
  const categoryName = normalizeField(frontmatter.category) || '未分类';
  const categorySlug = slugify(categoryName);
  const tags = (frontmatter.tags ?? [])
    .map((tag) => normalizeField(tag))
    .filter(Boolean)
    .map((name) => ({
      id: slugify(name),
      name,
      slug: slugify(name),
    } as Tag));
  const publishedAt = normalizeField(frontmatter.published_at ?? undefined) || new Date().toISOString();
  const coverImage = normalizeField(frontmatter.cover_image);

  return {
    id: slug,
    title,
    slug,
    excerpt: normalizeField(frontmatter.excerpt) || content.slice(0, 120).replace(/\s+/g, ' ').trim(),
    content,
    cover_image: coverImage || null,
    status: frontmatter.status === 'draft' ? 'draft' : 'published',
    created_at: publishedAt,
    updated_at: publishedAt,
    published_at: publishedAt,
    category: categoryName
      ? {
          id: categorySlug,
          name: categoryName,
          slug: categorySlug,
        }
      : null,
    tags,
    fileName,
  };
}

export const getAllPosts = cache(async () => {
  const files = await readPostFiles();
  const posts = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(postsDirectory, file.name);
      const source = await fs.readFile(fullPath, 'utf8');
      return normalizePost(file.name, source);
    })
  );

  return posts.sort((a, b) => {
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    return bTime - aTime;
  });
});

export const getPublishedPosts = cache(async () => {
  const posts = await getAllPosts();
  return posts.filter((post) => post.status === 'published');
});

export const getPostBySlug = cache(async (slug: string) => {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});

export const getPostBySlugIncludeDrafts = cache(async (slug: string) => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});

export const getCategories = cache(async () => {
  const posts = await getPublishedPosts();
  const map = new Map<string, Category>();

  for (const post of posts) {
    if (!post.category) continue;
    map.set(post.category.slug, post.category);
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
});

export const getTags = cache(async () => {
  const posts = await getPublishedPosts();
  const map = new Map<string, Tag>();

  for (const post of posts) {
    for (const tag of post.tags) {
      map.set(tag.slug, tag);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
});

export const getPostsByCategory = cache(async (slug: string) => {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.category?.slug === slug);
});

export const getPostsByTag = cache(async (slug: string) => {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.tags.some((tag) => tag.slug === slug));
});
