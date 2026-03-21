import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function extractFrontmatterValue(source: string, key: string) {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
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

export async function GET() {
  try {
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
    
    // 导出为 JSON 文件
    const json = JSON.stringify(posts, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mdblog-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: '导出失败' }, { status: 500 });
  }
}
