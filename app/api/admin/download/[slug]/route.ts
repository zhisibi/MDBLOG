import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { downloadPostContent } from '@/lib/admin';

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    const ok = await isAuthenticated();
    if (!ok) {
      return NextResponse.json({ message: '未登录' }, { status: 401 });
    }

    const file = await downloadPostContent(slug);
    return new NextResponse(file.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}"`,
      },
    });
  } catch {
    return NextResponse.json({ message: '下载失败' }, { status: 404 });
  }
}
