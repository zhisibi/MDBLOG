import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';

export async function GET() {
  try {
    const posts = await getAllPosts();
    
    // 只返回必要的字段，避免内存问题
    const formattedPosts = posts.map(post => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt?.slice(0, 100) || '',
      status: post.status,
      published_at: post.published_at,
      category: post.category,
      tags: post.tags?.slice(0, 5) || [], // 限制标签数量
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ posts: [], error: 'Failed to fetch posts' }, { status: 500 });
  }
}
