import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireApiAuth } from '@/lib/admin';
import { logSecurityEvent } from '@/lib/logger';
import { guardRateLimit, getClientIdentifier } from '@/lib/rate-limit';

function extractFrontmatterValue(source: string, key: string) {
  const match = source.match(new RegExp(`^${key}:\s*(.+)$`, 'm'));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
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
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth();
    const rateStatus = guardRateLimit(request, 'admin-export', 2, 60 * 1000);
    if (!rateStatus.allowed) {
      const retryAfter = Math.ceil((rateStatus.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: '操作太频繁，请稍后重试' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const files = await fs.readdir(postsDir);

    const posts = [];
    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const filePath = path.join(postsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const { frontmatter, body } = splitFrontmatter(content);
      const slug = file.replace('.md', '');

      posts.push({
        slug,
        title: extractFrontmatterValue(frontmatter, 'title') || slug,
        excerpt: extractFrontmatterValue(frontmatter, 'excerpt'),
        category: extractFrontmatterValue(frontmatter, 'category'),
        tags: extractTagsValue(frontmatter),
        status: extractFrontmatterValue(frontmatter, 'status') || 'draft',
        published_at: extractFrontmatterValue(frontmatter, 'published_at'),
        cover_image: extractFrontmatterValue(frontmatter, 'cover_image'),
        content: body.replace(/^\n+/, ''),
        _file: file,
      });
    }

    const json = JSON.stringify(posts, null, 2);
    await logSecurityEvent('export.posts', {
      total: posts.length,
      client: getClientIdentifier(request),
    });

    const blob = new Blob([json], { type: 'application/json' });

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mdblog-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    return NextResponse.json({ error: '导出失败' }, { status: 500 });
  }
}
