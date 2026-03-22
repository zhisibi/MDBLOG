import { NextResponse } from 'next/server';
import { hashPassword, isAuthenticated, verifyPassword } from '@/lib/auth';
import { guardRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/logger';
import { appendPasswordLog, persistPasswordHash } from '@/lib/password-utils';

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const rateStatus = guardRateLimit(request, 'admin-password', 4, 60 * 1000);
  if (!rateStatus.allowed) {
    const retryAfter = Math.ceil((rateStatus.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: '必须填写旧密码、新密码与确认密码' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: '两次输入的新密码不一致' }, { status: 400 });
  }

  if (!verifyPassword(currentPassword)) {
    return NextResponse.json({ error: '旧密码校验失败' }, { status: 403 });
  }

  const hashedValue = hashPassword(newPassword);

  try {
    await persistPasswordHash(hashedValue);
    await appendPasswordLog('api');
    await logSecurityEvent('password.update', {
      client: getClientIdentifier(request),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password update failed:', error);
    return NextResponse.json({ error: '无法更新密码' }, { status: 500 });
  }
}
