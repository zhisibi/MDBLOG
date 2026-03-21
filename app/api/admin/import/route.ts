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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    const postsDir = path.join(process.cwd(), 'content', 'posts');
    await fs.mkdir(postsDir, { recursive: true });

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.json')) {
      // 导入 JSON 文件
      const content = await file.text();
      const posts = JSON.parse(content);
      
      let importedCount = 0;
      
      for (const post of posts) {
        const slug = post.slug || slugify(post.title || 'untitled');
        
        // 重新构建 Markdown 文件
        const mdContent = buildMarkdownFromJson(post);
        await fs.writeFile(path.join(postsDir, `${slug}.md`), mdContent, 'utf8');
        importedCount++;
      }
      
      return NextResponse.json({ success: true, count: importedCount });
    } else {
      return NextResponse.json({ error: '只支持 .json 文件导入' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '导入失败，请检查文件格式' }, { status: 500 });
  }
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
