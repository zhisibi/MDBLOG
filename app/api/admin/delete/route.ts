import { NextRequest, NextResponse } from 'next/server';
import { deletePostAction } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const slug = formData.get('slug') as string;
    
    if (!slug) {
      return NextResponse.json({ error: '缺少 slug' }, { status: 400 });
    }

    // 调用 server action 的逻辑
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const postsDirectory = path.join(process.cwd(), 'content', 'posts');
    const filePath = path.join(postsDirectory, `${slug}.md`);
    
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
