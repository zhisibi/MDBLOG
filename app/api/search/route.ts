import { NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/blog';

const MAX_RESULTS = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q')?.trim();

  if (!rawQuery) {
    return NextResponse.json({ results: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const keyword = rawQuery.toLowerCase();
  const posts = await getPublishedPosts();
  const results = [] as Array<{ slug: string; title: string; snippet: string; published_at: string | null }>;

  for (const post of posts) {
    const sources: Array<{ text: string; weight: number }> = [
      { text: post.title || '', weight: 3 },
      { text: post.excerpt || '', weight: 2 },
      { text: post.content || '', weight: 1 },
    ];

    let snippet = '';
    let found = false;

    for (const source of sources) {
      const normalized = source.text.toLowerCase();
      const index = normalized.indexOf(keyword);
      if (index !== -1) {
        const start = Math.max(0, index - 40);
        const end = Math.min(source.text.length, index + rawQuery.length + 60);
        const rawSnippet = source.text.slice(start, end).replace(/\s+/g, ' ').trim();
        snippet = `${start > 0 ? '…' : ''}${rawSnippet}${end < source.text.length ? '…' : ''}`;
        found = true;
        break;
      }
    }

    if (found) {
      results.push({
        slug: post.slug,
        title: post.title,
        snippet,
        published_at: post.published_at,
      });
    }

    if (results.length >= MAX_RESULTS) break;
  }

  return NextResponse.json({ results }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
