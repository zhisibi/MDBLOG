import { NextResponse } from 'next/server';
import { guardRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/logger';
import { hashPassword } from '@/lib/auth';
import { persistPasswordHash, appendPasswordLog } from '@/lib/password-utils';
import { getSecuritySettings, verifyTotpToken } from '@/lib/security';

export async function POST(request: Request) {
  const rateStatus = guardRateLimit(request, 'admin-forgot-password', 3, 60 * 1000);
  if (!rateStatus.allowed) {
    const retryAfter = Math.ceil((rateStatus.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let body: { token?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { token, newPassword, confirmPassword } = body || {};

  if (!token || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: '请输入验证码与新密码' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: '两次输入的新密码不一致' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: '新密码需要至少 8 位' }, { status: 400 });
  }

  const settings = await getSecuritySettings();
  if (!settings.totpEnabled || !settings.totpSecret) {
    return NextResponse.json({ error: '二步验证尚未启用，无法重置密码' }, { status: 400 });
  }

  if (!verifyTotpToken(settings.totpSecret, token)) {
    return NextResponse.json({ error: '验证码校验失败' }, { status: 403 });
  }

  const hashedValue = hashPassword(newPassword);

  try {
    await persistPasswordHash(hashedValue);
    await appendPasswordLog('forgot');
    await logSecurityEvent('password.reset', {
      client: getClientIdentifier(request),
    });
    return NextResponse.json({ success: true, message: '密码已重置，请使用新密码登录' });
  } catch (error) {
    console.error('Forgot password failed:', error);
    return NextResponse.json({ error: '无法重置密码' }, { status: 500 });
  }
}
