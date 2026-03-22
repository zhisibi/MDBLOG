import { NextResponse } from 'next/server';
import { getBlogSettings, saveBlogSettings } from '@/lib/blog-settings';
import { isAuthenticated } from '@/lib/auth';
import { guardRateLimit } from '@/lib/rate-limit';

function sanitizePayload(payload: Record<string, unknown>) {
  const next: Record<string, string> = {};
  const fields = [
    'siteName',
    'heroTitle',
    'heroDescription',
    'heroTextColor',
    'heroBgColor',
    'heroBgGradient',
    'heroBadge',
    'backgroundImage',
    'globalBackgroundColor',
    'globalBackgroundImage',
    'defaultCoverImage',
  ] as const;

  for (const field of fields) {
    const value = payload[field];
    if (typeof value === 'string') {
      next[field] = value.slice(0, 1000);
    }
  }

  if (payload.postDisplayMode === 'list') {
    next.postDisplayMode = 'list';
  } else if (payload.postDisplayMode === 'card') {
    next.postDisplayMode = 'card';
  }

  return next;
}

export async function GET() {
  const settings = await getBlogSettings();
  return NextResponse.json({ settings }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const rateStatus = guardRateLimit(request, 'admin-blog-settings', 10, 60 * 1000);
  if (!rateStatus.allowed) {
    const retryAfter = Math.ceil((rateStatus.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: '请求太频繁，请稍后再试' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const sanitized = sanitizePayload(payload || {});
  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: '缺少有效的设置字段' }, { status: 400 });
  }

  try {
    const settings = await saveBlogSettings(sanitized);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Failed to save blog settings', error);
    return NextResponse.json({ error: '保存失败，请稍后再试' }, { status: 500 });
  }
}
