import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireApiAuth } from '@/lib/admin';
import { logSecurityEvent } from '@/lib/logger';
import { guardRateLimit, getClientIdentifier } from '@/lib/rate-limit';

const postsDir = path.join(process.cwd(), 'content', 'posts');
const MAX_IMPORT_SIZE = 1 * 1024 * 1024;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
}

function buildMarkdownFromJson(post: any) {
  const lines = ['---'];
  if (post.title) lines.push(`title: ${post.title}`);
  if (post.slug) lines.push(`slug: ${post.slug}`);
  if (post.excerpt) lines.push(`excerpt: ${post.excerpt}`);
  if (post.category) lines.push(`category: ${post.category}`);
  if (post.tags && Array.isArray(post.tags) && post.tags.length) {
    lines.push('tags:');
    for (const tag of post.tags) {
      lines.push(`  - ${typeof tag === 'string' ? tag : tag.name || tag}`);
    }
  }
  if (post.status) lines.push(`status: ${post.status}`);
  if (post.published_at) lines.push(`published_at: ${post.published_at}`);
  if (post.cover_image) lines.push(`cover_image: ${post.cover_image}`);
  lines.push('---', '', post.content || post.body || '');
  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth();
    const rateStatus = guardRateLimit(request, 'admin-import', 3, 60 * 1000);
    if (!rateStatus.allowed) {
      const retryAfter = Math.ceil((rateStatus.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: '操作太频繁，请稍后重试' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '请选择一个文件' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      return NextResponse.json({ error: '仅支持 .json 格式' }, { status: 400 });
    }

    if (file.size > MAX_IMPORT_SIZE) {
      return NextResponse.json({ error: '文件过大，请上传 1MB 以内的导出文件' }, { status: 413 });
    }

    const content = await file.text();
    const posts = JSON.parse(content);

    await fs.mkdir(postsDir, { recursive: true });

    let importedCount = 0;
    for (const post of Array.isArray(posts) ? posts : []) {
      const slug = post.slug || slugify(post.title || 'untitled');
      const mdContent = buildMarkdownFromJson(post);
      await fs.writeFile(path.join(postsDir, `${slug}.md`), mdContent, 'utf8');
      importedCount++;
    }

    await logSecurityEvent('import.posts', {
      count: importedCount,
      client: getClientIdentifier(request),
    });

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: '导入失败，请检查文件格式' }, { status: 500 });
  }
}
