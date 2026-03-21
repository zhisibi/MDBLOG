import { NextRequest, NextResponse } from 'next/server';
import { getEditablePost } from '@/lib/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getEditablePost(slug);
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }
}
