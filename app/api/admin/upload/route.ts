import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
}

function extractFrontmatterValue(source: string, key: string) {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim().replace(/^['\"]|['\"]$/g, '') ?? '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file || !file.name.endsWith('.md')) {
      return NextResponse.json({ error: '请上传 .md 文件' }, { status: 400 });
    }

    const content = await file.text();
    const rawSlug = extractFrontmatterValue(content, 'slug');
    const rawTitle = extractFrontmatterValue(content, 'title');
    const fileName = `${slugify(rawSlug || rawTitle || file.name.replace(/\.md$/i, ''))}.md`;
    
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    await fs.mkdir(postsDir, { recursive: true });
    
    const targetPath = path.join(postsDir, fileName);
    await fs.writeFile(targetPath, content, 'utf8');
    
    return NextResponse.json({ success: true, slug: fileName.replace('.md', '') });
  } catch (error) {
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
