import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireApiAuth } from '@/lib/admin';
import { logSecurityEvent } from '@/lib/logger';
import { guardRateLimit, getClientIdentifier } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 512 * 1024;
const postsDir = path.join(process.cwd(), 'content', 'posts');

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
}

function extractFrontmatterValue(source: string, key: string) {
  const match = source.match(new RegExp(`^${key}:\s*(.+)$`, 'm'));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth();
    const rateStatus = guardRateLimit(request, 'admin-upload', 6, 30 * 1000);
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

    if (!file.name.toLowerCase().endsWith('.md')) {
      return NextResponse.json({ error: '只允许上传 .md 文件' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '文件太大，请上传 512KB 以内的 Markdown' }, { status: 413 });
    }

    const content = await file.text();
    const rawSlug = extractFrontmatterValue(content, 'slug');
    const rawTitle = extractFrontmatterValue(content, 'title');

    const fileName = `${slugify(rawSlug || rawTitle || file.name.replace(/\.md$/i, ''))}.md`;
    const targetPath = path.join(postsDir, fileName);

    await fs.mkdir(postsDir, { recursive: true });
    await fs.writeFile(targetPath, content, 'utf8');
    await logSecurityEvent('upload.markdown', {
      slug: fileName.replace(/\.md$/i, ''),
      client: getClientIdentifier(request),
    });

    return NextResponse.json({ success: true, slug: fileName.replace('.md', '') });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
