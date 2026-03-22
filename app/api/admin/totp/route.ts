import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAuthenticated } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/logger';
import { guardRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import {
  disableTotp,
  enableTotp,
  generateTotpSecret,
  getSecuritySettings,
  getTotpOtpAuthUrl,
  verifyTotpToken,
} from '@/lib/security';

const LOG_PATH = path.join(process.cwd(), 'logs', 'totp.log');

async function appendLog(action: 'enabled' | 'disabled') {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  const entry = `${new Date().toISOString()} | totp ${action}\n`;
  await fs.appendFile(LOG_PATH, entry, 'utf8');
}

export async function GET() {
  const settings = await getSecuritySettings();
  return NextResponse.json({ enabled: settings.totpEnabled });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const rateStatus = guardRateLimit(request, 'admin-totp', 6, 60 * 1000);
  if (!rateStatus.allowed) {
    const retryAfter = Math.ceil((rateStatus.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: '操作过于频繁，请稍后再试' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const action = String(payload.action || '').trim();
  const settings = await getSecuritySettings();

  if (action === 'prepare') {
    const secret = generateTotpSecret();
    const otpauthUrl = getTotpOtpAuthUrl(secret);
    await logSecurityEvent('totp.prepare', { client: getClientIdentifier(request) });
    return NextResponse.json({ secret, otpauthUrl });
  }

  if (action === 'enable') {
    if (settings.totpEnabled) {
      return NextResponse.json({ error: '二步验证已启用' }, { status: 400 });
    }

    const secret = String(payload.secret || '').trim();
    const token = String(payload.token || '').trim();

    if (!secret) {
      return NextResponse.json({ error: '缺少秘钥' }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: '请输入验证码' }, { status: 400 });
    }

    if (!verifyTotpToken(secret, token)) {
      return NextResponse.json({ error: '验证码校验失败' }, { status: 403 });
    }

    await enableTotp(secret);
    await appendLog('enabled');
    await logSecurityEvent('totp.enable', {
      client: getClientIdentifier(request),
    });
    return NextResponse.json({ success: true, message: '二步验证已启用' });
  }

  if (action === 'disable') {
    if (!settings.totpEnabled || !settings.totpSecret) {
      return NextResponse.json({ error: '二步验证未开启' }, { status: 400 });
    }

    const token = String(payload.token || '').trim();
    if (!token) {
      return NextResponse.json({ error: '请输入验证码' }, { status: 400 });
    }

    if (!verifyTotpToken(settings.totpSecret, token)) {
      return NextResponse.json({ error: '验证码校验失败' }, { status: 403 });
    }

    await disableTotp();
    await appendLog('disabled');
    await logSecurityEvent('totp.disable', {
      client: getClientIdentifier(request),
    });
    return NextResponse.json({ success: true, message: '二步验证已关闭' });
  }

  return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
}
